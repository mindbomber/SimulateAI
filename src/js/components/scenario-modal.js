/**
 * Scenario Modal Component
 * Displays individual ethical scenarios with radar chart visualization
 * Dynamically loads scenario data for all categories
 */

import logger from '../utils/logger.js';
import RadarChart from './radar-chart.js';
import scenarioDataManager from '../data/scenario-data-manager.js';
import { getAllCategories } from '../../data/categories.js';
import { typewriterSequence } from '../utils/typewriter.js';

// Constants
const ANIMATION_DURATION = 300;
const RADAR_CHART_MAX_SCORE = 5;
const RADAR_CHART_NEUTRAL_SCORE = 3;

class ScenarioModal {
  constructor(options = {}) {
    logger.info('ScenarioModal', 'Constructor called with options:', options);
    this.modal = null;
    this.backdrop = null;
    this.radarChart = null;
    this.currentScenario = null;
    this.selectedOption = null;
    this.currentCategoryId = null;
    this.currentScenarioId = null;
    this.isOpening = false; // Flag to prevent duplicate openings
    this.wasCompleted = false; // Flag to track if scenario was completed
    this.isTestMode = options.isTestMode || false; // Flag for test scenarios

    // Cache for categories and scenarios
    this.categories = getAllCategories();
    this.scenarioData = null;
  }

  /**
   * Open the modal with a specific scenario
   * @param {string} scenarioId - The scenario ID to display
   * @param {string} categoryId - The category ID (optional, will be detected if not provided)
   * @param {boolean} isTestMode - Whether this is a test scenario (optional, defaults to false)
   */
  async open(scenarioId, categoryId = null, isTestMode = false) {
    try {
      // Prevent duplicate openings
      if (this.isOpening || this.modal) {
        logger.warn(
          'Modal is already opening or open, ignoring duplicate request'
        );
        return;
      }

      this.isOpening = true;
      this.wasCompleted = false; // Reset completion flag for new scenario
      this.isTestMode = isTestMode; // Set test mode for this session

      // Find the category if not provided
      if (!categoryId) {
        categoryId = this.findCategoryForScenario(scenarioId);
        if (!categoryId) {
          throw new Error(
            `Could not find category for scenario: ${scenarioId}`
          );
        }
      }

      // Load scenario data
      this.currentCategoryId = categoryId;
      this.currentScenarioId = scenarioId;
      this.scenarioData = await scenarioDataManager.getScenario(
        categoryId,
        scenarioId
      );

      if (!this.scenarioData) {
        throw new Error(
          `Could not load scenario data for: ${categoryId}:${scenarioId}`
        );
      }

      this.currentScenario = this.scenarioData;

      // Create and show modal
      await this.createModal();
      await this.show();

      logger.info(
        'ScenarioModal',
        `Opened scenario modal for: ${categoryId}:${scenarioId}${isTestMode ? ' (TEST MODE)' : ''}`
      );
    } catch (error) {
      logger.error('Failed to open scenario modal:', error);
      alert(`Failed to load scenario: ${scenarioId}. Please try again.`);

      // Ensure cleanup on error to prevent modal from being stuck
      this.cleanup();
    } finally {
      // Reset the opening flag
      this.isOpening = false;
    }
  }

  /**
   * Clean up modal state in case of errors
   */
  cleanup() {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
    if (this.backdrop) {
      this.backdrop.remove();
      this.backdrop = null;
    }

    // Reset all state flags
    this.isOpening = false;
    this.isClosing = false;
    this.currentScenario = null;
    this.selectedOption = null;
    this.currentCategoryId = null;
    this.currentScenarioId = null;
    this.scenarioData = null;
    this.radarChart = null;

    // Restore body scrolling
    document.body.style.overflow = '';

    // Remove event listeners
    if (this.escapeHandler) {
      document.removeEventListener('keydown', this.escapeHandler);
      this.escapeHandler = null;
    }
  }

  /**
   * Find which category contains a specific scenario
   */
  findCategoryForScenario(scenarioId) {
    for (const category of this.categories) {
      if (
        category.scenarios &&
        category.scenarios.some(s => s.id === scenarioId)
      ) {
        return category.id;
      }
    }
    return null;
  }

  /**
   * Create modal DOM structure
   */
  async createModal() {
    // Remove existing modal if present and wait for it to be fully closed
    await this.closeAndWait();

    // Clean up any orphaned modals or radar chart containers from previous instances
    const existingModals = document.querySelectorAll(
      '.scenario-modal, .scenario-modal-backdrop'
    );
    existingModals.forEach(modal => {
      logger.info('ScenarioModal', 'Removing orphaned modal element');
      modal.remove();
    });

    // Clean up any orphaned radar chart containers with Chart.js instances
    const orphanedChartContainers = document.querySelectorAll(
      '#scenario-radar-chart'
    );
    orphanedChartContainers.forEach(container => {
      const canvases = container.querySelectorAll('canvas');
      canvases.forEach(canvas => {
        if (window.Chart && window.Chart.getChart) {
          const chartInstance = window.Chart.getChart(canvas);
          if (chartInstance) {
            logger.info(
              'ScenarioModal',
              'Destroying orphaned Chart.js instance'
            );
            chartInstance.destroy();
          }
        }
      });
      container.remove();
    });

    logger.info('ScenarioModal', 'Creating scenario modal DOM structure');
    logger.info(
      'Current scenario data:',
      this.currentScenario ? 'LOADED' : 'NULL'
    );

    // Create modal elements
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'scenario-modal-backdrop';

    this.modal = document.createElement('div');
    this.modal.className = 'scenario-modal';
    this.modal.innerHTML = this.getModalHTML();

    // Add to DOM
    document.body.appendChild(this.backdrop);
    document.body.appendChild(this.modal);

    logger.info(
      'ScenarioModal',
      'Scenario modal DOM structure created and appended to body'
    );
    logger.info(
      'Modal HTML contains radar chart container:',
      this.modal.innerHTML.includes('scenario-radar-chart')
    );

    // Attach event listeners
    this.attachEventListeners();
  }

  /**
   * Generate modal HTML content
   */
  getModalHTML() {
    logger.info(
      'getModalHTML called - currentScenario status:',
      this.currentScenario ? 'LOADED' : 'NULL'
    );

    if (!this.currentScenario) {
      logger.warn('No current scenario data - returning loading message');
      return '<div class="scenario-content"><p>Loading scenario...</p></div>';
    }

    const categoryInfo = this.categories.find(
      c => c.id === this.currentCategoryId
    );
    const categoryTitle = categoryInfo
      ? categoryInfo.title
      : 'Unknown Category';

    logger.info(
      'ScenarioModal',
      `Generating HTML for scenario: ${this.currentScenario.title} in category: ${categoryTitle}`
    );

    const html = `
            <div class="scenario-modal-dialog">
                <div class="scenario-modal-header">
                    <div class="scenario-title-section">
                        <span class="scenario-category">${categoryTitle}</span>
                        <h1 class="scenario-title">${this.currentScenario.title}</h1>
                    </div>
                    <button class="close-button" aria-label="Close modal">
                        <span class="close-icon">×</span>
                    </button>
                </div>

                <div class="scenario-content typewriter-ready">
                    <div class="scenario-main">
                        <div class="scenario-description">
                            <div class="dilemma-section">
                                <h3>The Dilemma</h3>
                                <p class="dilemma-text"></p>
                            </div>

                            <div class="ethical-question-section">
                                <h3>Ethical Question</h3>
                                <p class="ethical-question"></p>
                            </div>
                        </div>

                        <div class="options-section">
                            <h3>Choose Your Approach</h3>
                            <div class="options-container">
                                ${this.renderOptions()}
                            </div>
                        </div>
                    </div>

                    <div class="scenario-sidebar">
                        <div id="scenario-radar-chart" style="min-height: 380px; position: relative;"></div>
                        <div class="chart-legend">
                            <p>This chart shows how your choice affects different ethical dimensions. Select an option to see its impact.</p>
                        </div>
                    </div>
                </div>

                <div class="scenario-modal-footer">
                    ${this.isTestMode ? '<div class="test-mode-indicator">🧪 Test Mode - Choices not tracked</div>' : ''}
                    <button class="btn btn-secondary" id="cancel-scenario">
                        Cancel
                    </button>
                    <button class="btn btn-primary" id="confirm-choice" disabled>
                        ${this.isTestMode ? 'Close Test' : 'Confirm Choice'}
                    </button>
                </div>
            </div>
        `;

    logger.info(
      'ScenarioModal',
      'Generated scenario modal HTML, checking for radar chart container...'
    );
    logger.info('ScenarioModal', 'HTML contains scenario-radar-chart:', {
      hasRadarChart: html.includes('scenario-radar-chart'),
    });

    return html;
  }

  /**
   * Render option buttons
   */
  renderOptions() {
    if (!this.currentScenario.options) {
      return '<p>No options available</p>';
    }

    return this.currentScenario.options
      .map(
        option => `
            <div class="option-card" data-option-id="${option.id}">
                <div class="option-header">
                    <h4 class="option-title">${option.text}</h4>
                </div>
                <div class="option-description">
                    <p>${option.description}</p>
                </div>
                <div class="option-details" style="display: none;">
                    ${
                      option.pros
                        ? `
                        <div class="pros-section">
                            <h5>Pros</h5>
                            <ul>${option.pros.map(pro => `<li>${pro}</li>`).join('')}</ul>
                        </div>
                    `
                        : ''
                    }
                    ${
                      option.cons
                        ? `
                        <div class="cons-section">
                            <h5>Cons</h5>
                            <ul>${option.cons.map(con => `<li>${con}</li>`).join('')}</ul>
                        </div>
                    `
                        : ''
                    }
                </div>
            </div>
        `
      )
      .join('');
  }

  /**
   * Initialize radar chart
   */
  async initializeRadarChart() {
    try {
      logger.info('RadarChart', 'Starting radar chart initialization...');

      // Enhanced checks for modal state - WITH DETAILED DEBUGGING
      logger.debug('Modal state debug:', {
        isClosing: this.isClosing,
        hasModal: !!this.modal,
        modalInDOM: this.modal ? document.body.contains(this.modal) : false,
        modalDisplay: this.modal ? this.modal.style.display : 'no modal',
        modalAriaHidden: this.modal
          ? this.modal.getAttribute('aria-hidden')
          : 'no modal',
        modalHasAriaHidden: this.modal
          ? this.modal.hasAttribute('aria-hidden')
          : false,
      });

      if (this.isClosing) {
        logger.debug(
          'RadarChart',
          'Modal is closing, skipping radar chart initialization'
        );
        logger.debug('Exit: Modal is closing');
        return;
      }

      if (!this.modal || !document.body.contains(this.modal)) {
        logger.debug(
          'RadarChart',
          'Modal not in DOM, skipping radar chart initialization'
        );
        logger.debug('Exit: Modal not in DOM');
        return;
      }

      // Check if modal is visible - FIXED LOGIC
      const isVisible =
        this.modal.style.display !== 'none' &&
        !this.modal.hasAttribute('aria-hidden') &&
        this.modal.getAttribute('aria-hidden') !== 'true';

      logger.debug('Visibility check:', {
        displayNotNone: this.modal.style.display !== 'none',
        noAriaHiddenAttr: !this.modal.hasAttribute('aria-hidden'),
        ariaHiddenNotTrue: this.modal.getAttribute('aria-hidden') !== 'true',
        finalIsVisible: isVisible,
      });

      if (!isVisible) {
        logger.debug(
          'RadarChart',
          'Modal not visible, skipping radar chart initialization'
        );
        logger.debug('Exit: Modal not visible');
        return;
      }

      logger.debug('All modal state checks passed!');

      // Check if RadarChart class is available
      if (!RadarChart) {
        logger.error(
          'RadarChart',
          'RadarChart class not available - import failed'
        );
        return;
      }

      // Check if Chart.js is available
      if (!window.Chart) {
        logger.error(
          'RadarChart',
          'Chart.js not loaded - radar chart cannot be initialized'
        );
        return;
      }

      logger.debug(
        'All prerequisites met, proceeding with radar chart initialization'
      );
      logger.info(
        'RadarChart',
        'Prerequisites check passed - Chart.js and RadarChart class available'
      );

      // IMMEDIATE TEST: Skip complex container search and try direct creation
      const directContainer = document.getElementById('scenario-radar-chart');
      if (directContainer) {
        logger.debug(
          'Direct container found, attempting immediate chart creation'
        );
        try {
          directContainer.innerHTML =
            '<div style="background: yellow; padding: 10px;">🔄 Creating radar chart...</div>';

          // Try direct radar chart creation
          this.radarChart = new RadarChart('scenario-radar-chart', {
            width: 380,
            height: 380,
            showLabels: true,
            showLegend: false,
            animated: true,
            realTime: true,
            title: null,
          });

          // Set initial neutral scores
          const neutralScores = {
            fairness: RADAR_CHART_NEUTRAL_SCORE,
            sustainability: RADAR_CHART_NEUTRAL_SCORE,
            autonomy: RADAR_CHART_NEUTRAL_SCORE,
            beneficence: RADAR_CHART_NEUTRAL_SCORE,
            transparency: RADAR_CHART_NEUTRAL_SCORE,
            accountability: RADAR_CHART_NEUTRAL_SCORE,
            privacy: RADAR_CHART_NEUTRAL_SCORE,
            proportionality: RADAR_CHART_NEUTRAL_SCORE,
          };

          if (this.radarChart.initializationPromise) {
            await this.radarChart.initializationPromise;
          }

          this.radarChart.setScores(neutralScores);
          logger.debug('Direct radar chart creation successful!');
          logger.info('RadarChart', 'Direct radar chart creation successful');
          return; // Exit early on success
        } catch (error) {
          logger.error('Direct radar chart creation failed:', error);
          logger.error('RadarChart', 'Direct creation failed:', error);
          // Continue to complex search below
        }
      } else {
        logger.debug(
          'Direct container not found, proceeding with complex search'
        );
      }

      // Clean up any existing radar chart instance
      if (this.radarChart) {
        try {
          this.radarChart.destroy();
        } catch (e) {
          logger.warn(
            'RadarChart',
            'Failed to destroy existing radar chart',
            e
          );
        }
        this.radarChart = null;
      }

      // More robust container search with additional checks
      let chartContainer = null;
      let attempts = 0;
      const maxAttempts = 20; // Increased attempts
      const retryDelay = 150; // ms - delay between attempts

      while (!chartContainer && attempts < maxAttempts) {
        // Check if modal is closing before each attempt
        if (
          this.isClosing ||
          !this.modal ||
          !document.body.contains(this.modal)
        ) {
          logger.info(
            'RadarChart',
            'Modal closing during container search, aborting'
          );
          return;
        }

        // Check if modal has been properly rendered
        if (this.modal.style.display === 'none') {
          logger.debug(
            'RadarChart',
            `Modal not visible yet (attempt ${attempts + 1}/${maxAttempts})`
          );
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          attempts++;
          continue;
        }

        // Double-check that modal contains the expected HTML
        if (!this.modal.innerHTML.includes('scenario-radar-chart')) {
          logger.debug(
            'RadarChart',
            `Modal HTML incomplete (attempt ${attempts + 1}/${maxAttempts})`
          );
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          attempts++;
          continue;
        }

        chartContainer = document.getElementById('scenario-radar-chart');
        if (!chartContainer) {
          logger.debug(
            'RadarChart',
            `Container not found in DOM (attempt ${attempts + 1}/${maxAttempts})`
          );
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          attempts++;
        }
      }

      logger.info('RadarChart', `Container search completed`, {
        found: !!chartContainer,
        attempts: attempts + 1,
        modalVisible: this.modal?.style.display !== 'none',
        modalInDOM: document.body.contains(this.modal),
        modalHasHTML: this.modal?.innerHTML.includes('scenario-radar-chart'),
      });

      if (!chartContainer) {
        // If we still can't find the container, this might not be an error but normal behavior
        // (e.g., user closed modal quickly)
        if (this.isClosing || !document.body.contains(this.modal)) {
          logger.info(
            'RadarChart',
            'Modal was closed during initialization, this is normal'
          );
        } else {
          logger.error('RadarChart', 'Container not found after all attempts', {
            modalVisible: this.modal?.style.display !== 'none',
            modalHTML: this.modal?.innerHTML ? 'present' : 'missing',
            modalInDOM: document.body.contains(this.modal),
            containerInHTML: this.modal?.innerHTML.includes(
              'scenario-radar-chart'
            ),
          });
        }
        return;
      }

      // Clean up any existing Chart.js instances in the container
      const existingCanvases = chartContainer.querySelectorAll('canvas');
      existingCanvases.forEach(canvas => {
        // Check if there's a Chart.js instance attached to this canvas
        if (window.Chart && window.Chart.getChart) {
          const chartInstance = window.Chart.getChart(canvas);
          if (chartInstance) {
            logger.info(
              'RadarChart',
              'Destroying existing Chart.js instance before creating new one'
            );
            chartInstance.destroy();
          }
        }
        canvas.remove();
      });

      // Clear any existing content to prevent "null" display
      chartContainer.innerHTML = '';
      chartContainer.textContent = '';

      logger.info('RadarChart', 'Container cleared, initializing radar chart');

      try {
        // Pass the container ID (string), not the element itself
        logger.info('RadarChart', 'Creating new RadarChart instance...');
        this.radarChart = new RadarChart('scenario-radar-chart', {
          width: 380,
          height: 380,
          showLabels: true,
          showLegend: false,
          animated: true,
          realTime: true,
          title: null, // Disable chart title to avoid duplication with h3
        });
        logger.info('RadarChart', 'RadarChart constructor completed');

        // Wait for the RadarChart to be fully initialized
        logger.info(
          'RadarChart',
          'Waiting for radar chart initialization promise...'
        );
        if (this.radarChart.initializationPromise) {
          await this.radarChart.initializationPromise;
          logger.info(
            'RadarChart',
            'Radar chart async initialization completed'
          );
        } else {
          logger.warn(
            'RadarChart',
            'No initialization promise found on radar chart instance'
          );
        }

        // Verify the chart was created successfully
        if (!this.radarChart) {
          logger.error(
            'RadarChart',
            'Radar chart instance is null after initialization'
          );
          return;
        }

        // Set initial neutral scores (using the correct method)
        const neutralScores = {
          fairness: RADAR_CHART_NEUTRAL_SCORE,
          sustainability: RADAR_CHART_NEUTRAL_SCORE,
          autonomy: RADAR_CHART_NEUTRAL_SCORE,
          beneficence: RADAR_CHART_NEUTRAL_SCORE,
          transparency: RADAR_CHART_NEUTRAL_SCORE,
          accountability: RADAR_CHART_NEUTRAL_SCORE,
          privacy: RADAR_CHART_NEUTRAL_SCORE,
          proportionality: RADAR_CHART_NEUTRAL_SCORE,
        };

        logger.info(
          'RadarChart',
          'Setting initial neutral scores...',
          neutralScores
        );
        this.radarChart.setScores(neutralScores);
        logger.info(
          'RadarChart',
          'Radar chart initialized successfully with neutral scores'
        );

        // Verify chart is visible in DOM
        const chartCanvas = chartContainer.querySelector('canvas');
        if (chartCanvas) {
          logger.info(
            'RadarChart',
            'Canvas element created successfully in container'
          );
        } else {
          logger.warn(
            'RadarChart',
            'No canvas element found in container after initialization'
          );
        }
      } catch (error) {
        logger.error('RadarChart', 'Error during radar chart creation:', error);
        this.radarChart = null;
        return;
      }

      // Process any pending radar chart updates
      if (this.pendingRadarUpdate && this.selectedOption) {
        logger.info('ScenarioModal', 'Processing pending radar chart update');
        this.updateRadarChart();
        this.pendingRadarUpdate = false;
      }
    } catch (error) {
      logger.error('Radar chart initialization failed:', error);

      // Clear container and show fallback message instead of null
      const chartContainer = document.getElementById('scenario-radar-chart');
      if (chartContainer) {
        chartContainer.innerHTML = `
                    <div style="
                        display: flex; 
                        align-items: center; 
                        justify-content: center; 
                        min-height: 300px; 
                        color: #6b7280; 
                        font-size: 0.9rem;
                        text-align: center;
                        background: rgba(248, 250, 252, 0.5);
                        border-radius: 8px;
                        border: 1px solid rgba(229, 231, 235, 0.6);
                    ">
                        <div>
                            <p style="margin: 0 0 0.5rem 0;">Chart Loading...</p>
                            <small style="color: #9ca3af;">Ethical impact visualization will appear here</small>
                        </div>
                    </div>
                `;
      }
    }
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Close button
    const closeButton = this.modal.querySelector('.close-button');
    if (closeButton) {
      closeButton.addEventListener('click', () => this.close());
    }

    // Backdrop click to close
    if (this.backdrop) {
      this.backdrop.addEventListener('click', () => this.close());
    }

    // Option selection
    const optionCards = this.modal.querySelectorAll('.option-card');
    optionCards.forEach(card => {
      card.addEventListener('click', () => this.selectOption(card));
    });

    // Cancel button
    const cancelButton = this.modal.querySelector('#cancel-scenario');
    if (cancelButton) {
      cancelButton.addEventListener('click', () => this.close());
    }

    // Confirm button
    const confirmButton = this.modal.querySelector('#confirm-choice');
    if (confirmButton) {
      confirmButton.addEventListener('click', () => this.confirmChoice());
    }

    // Escape key to close
    this.escapeHandler = e => {
      if (e.key === 'Escape') {
        this.close();
      }
    };
    document.addEventListener('keydown', this.escapeHandler);
  }

  /**
   * Select an option
   */
  selectOption(card) {
    logger.info('ScenarioModal', 'Option selection started');

    const optionId = card.getAttribute('data-option-id');
    const isCurrentlySelected = card.classList.contains('selected');

    // If the clicked option is already selected, deselect it
    if (isCurrentlySelected) {
      logger.info('ScenarioModal', 'Deselecting currently selected option:', {
        optionId,
      });

      // Remove selection
      card.classList.remove('selected');
      const details = card.querySelector('.option-details');
      if (details) details.style.display = 'none';

      // Clear selected option
      this.selectedOption = null;

      // Reset radar chart to neutral state
      if (this.radarChart && this.radarChart.isInitialized) {
        this.radarChart.resetScores();
        logger.info('RadarChart', 'Radar chart reset to neutral state');
      }

      // Disable confirm button
      const confirmButton = this.modal.querySelector('#confirm-choice');
      if (confirmButton) {
        confirmButton.disabled = true;
      }

      return;
    }

    // Remove previous selection from all cards
    this.modal.querySelectorAll('.option-card').forEach(c => {
      c.classList.remove('selected');
      const details = c.querySelector('.option-details');
      if (details) details.style.display = 'none';
    });

    // Select new option
    card.classList.add('selected');
    const details = card.querySelector('.option-details');
    if (details) details.style.display = 'block';

    // Store selected option
    this.selectedOption = this.currentScenario.options.find(
      opt => opt.id === optionId
    );

    logger.info('Option selected:', {
      optionId,
      hasSelectedOption: !!this.selectedOption,
      hasImpact: !!this.selectedOption?.impact,
      impact: this.selectedOption?.impact,
    });

    // Queue radar chart update if chart isn't ready yet
    if (this.radarChart && this.radarChart.isInitialized) {
      this.updateRadarChart();
    } else {
      // Store the update request for when chart is ready
      this.pendingRadarUpdate = true;
      logger.info('ScenarioModal', 'Radar chart not ready, queuing update');
    }

    // Enable confirm button
    const confirmButton = this.modal.querySelector('#confirm-choice');
    if (confirmButton) {
      confirmButton.disabled = false;
    }

    logger.info('ScenarioModal', 'Option selection completed');
  }

  /**
   * Update radar chart with selected option impact
   */
  updateRadarChart() {
    if (
      !this.radarChart ||
      !this.selectedOption ||
      !this.selectedOption.impact
    ) {
      logger.warn(
        'RadarChart',
        'Cannot update radar chart - missing components',
        {
          hasRadarChart: !!this.radarChart,
          hasSelectedOption: !!this.selectedOption,
          hasImpact: !!this.selectedOption?.impact,
        }
      );
      return;
    }

    try {
      // Check if radar chart is initialized
      if (!this.radarChart.isInitialized) {
        logger.warn(
          'RadarChart',
          'Radar chart not yet initialized, skipping update'
        );
        return;
      }

      // Convert impact data from (-2 to +2) to radar chart scale (0 to 5)
      // -2 becomes 1, -1 becomes 2, 0 becomes 3, +1 becomes 4, +2 becomes 5
      const impactScores = {};
      const neutralScore = RADAR_CHART_NEUTRAL_SCORE; // Middle of 0-5 scale

      Object.keys(this.selectedOption.impact).forEach(axis => {
        const impactValue = this.selectedOption.impact[axis] || 0;
        impactScores[axis] = neutralScore + impactValue;

        // Clamp to valid range (0-5)
        impactScores[axis] = Math.max(
          0,
          Math.min(RADAR_CHART_MAX_SCORE, impactScores[axis])
        );
      });

      logger.info(
        'RadarChart',
        'Updating radar chart with converted scores:',
        impactScores
      );
      this.radarChart.setScores(impactScores);
      logger.info('RadarChart', 'Radar chart updated successfully');
    } catch (error) {
      logger.error('Failed to update radar chart:', error);
    }
  }

  /**
   * Confirm the selected choice
   */
  async confirmChoice() {
    if (!this.selectedOption) {
      logger.warn('No option selected for confirmation');
      return;
    }

    // If this is a test scenario, just close the modal without tracking
    if (this.isTestMode) {
      logger.info('Test scenario completed, closing modal without tracking:', {
        categoryId: this.currentCategoryId,
        scenarioId: this.currentScenarioId,
        selectedOption: this.selectedOption?.id || 'unknown',
        testMode: true,
      });

      // Simply close the modal without any tracking or events
      this.close();
      return;
    }

    // Mark as completed for proper close event handling
    this.wasCompleted = true;

    // Store completion data for after modal closes
    const completionData = {
      categoryId: this.currentCategoryId,
      scenarioId: this.currentScenarioId,
      selectedOption: this.selectedOption,
      option: this.selectedOption, // Legacy compatibility
      completed: true, // Mark as completed
    };

    // Dispatch initial scenario completion event (for immediate progress tracking)
    const event = new CustomEvent('scenario-completed', {
      detail: completionData,
    });
    document.dispatchEvent(event);

    logger.info('Scenario completed:', {
      categoryId: this.currentCategoryId,
      scenarioId: this.currentScenarioId,
      selectedOption: this.selectedOption?.id || 'unknown',
    });

    // Close modal with delay to show completion, then dispatch final event
    setTimeout(async () => {
      await this.closeAndWait();

      // Dispatch event after modal is fully closed (for badge display)
      const closedEvent = new CustomEvent('scenario-modal-closed', {
        detail: completionData,
      });
      document.dispatchEvent(closedEvent);

      logger.info(
        'ScenarioModal',
        'Scenario modal fully closed, badges can now be displayed'
      );
    }, 1000);
  }

  /**
   * Show the modal
   */
  async show() {
    if (!this.modal || !this.backdrop) {
      logger.error('Modal elements not created');
      return;
    }

    // Focus management
    this.previousFocusedElement = document.activeElement;

    // Prevent body scrolling
    document.body.style.overflow = 'hidden';

    // Add show class for animation and wait for it to complete
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        this.backdrop.classList.add('show');
        this.modal.classList.add('show');

        // Wait for CSS transition to complete
        setTimeout(() => {
          // Focus close button after animation
          const closeButton = this.modal.querySelector('.close-button');
          if (closeButton) {
            closeButton.focus();
          }
          resolve();
        }, ANIMATION_DURATION);
      });
    });

    // Start typewriter effect for the dilemma and ethical question
    // Initialize radar chart first, before typewriter effect - with additional delay
    logger.debug('About to initialize radar chart');
    logger.debug('DOM ready state:', document.readyState);
    logger.debug('Chart.js available:', !!window.Chart);
    logger.debug(
      'Container exists:',
      !!document.getElementById('scenario-radar-chart')
    );

    // Add a small delay to ensure DOM is fully settled
    const DOM_SETTLE_DELAY = 200; // ms
    await new Promise(resolve => setTimeout(resolve, DOM_SETTLE_DELAY));

    await this.initializeRadarChart();

    // Then start typewriter effect
    await this.startTypewriterEffect();
  }

  /**
   * Close the modal and wait for it to be fully removed
   */
  async closeAndWait() {
    if (this.modal || this.backdrop) {
      this.close();
      // Wait for the animation to complete plus small buffer
      const CLOSE_BUFFER = 50; // ms
      await new Promise(resolve =>
        setTimeout(resolve, ANIMATION_DURATION + CLOSE_BUFFER)
      );
    }
  }

  /**
   * Close the modal
   */
  close() {
    // Set closing flag to prevent radar chart initialization
    this.isClosing = true;

    if (this.modal) {
      this.modal.classList.add('closing');
      setTimeout(() => {
        if (this.modal) {
          this.modal.remove();
          this.modal = null;
        }
      }, ANIMATION_DURATION);
    }

    if (this.backdrop) {
      this.backdrop.classList.add('closing');
      setTimeout(() => {
        if (this.backdrop) {
          this.backdrop.remove();
          this.backdrop = null;
        }
      }, ANIMATION_DURATION);
    }

    // Restore focus
    if (this.previousFocusedElement) {
      this.previousFocusedElement.focus();
    }

    // Restore body scrolling
    document.body.style.overflow = '';

    // Remove event listeners
    if (this.escapeHandler) {
      document.removeEventListener('keydown', this.escapeHandler);
      this.escapeHandler = null;
    }

    // CRITICAL FIX: Only dispatch uncompleted event if scenario wasn't actually completed
    // This prevents overriding the completion event from confirmChoice
    if (!this.wasCompleted) {
      const modalClosedEvent = new CustomEvent('scenario-modal-closed', {
        detail: {
          categoryId: this.currentCategoryId,
          scenarioId: this.currentScenarioId,
          completed: false, // Indicate this was closed without completion
        },
      });

      // Dispatch after a short delay to ensure modal cleanup is complete
      const CLOSE_EVENT_DELAY = 50; // ms - small buffer after animation
      setTimeout(() => {
        document.dispatchEvent(modalClosedEvent);
        logger.info(
          'ScenarioModal',
          'Modal closed event dispatched (without completion)'
        );
      }, ANIMATION_DURATION + CLOSE_EVENT_DELAY);
    }

    // Reset state
    this.currentScenario = null;
    this.selectedOption = null;
    this.currentCategoryId = null;
    this.currentScenarioId = null;
    this.scenarioData = null;
    this.radarChart = null;
    this.isOpening = false; // Reset opening flag
    this.isClosing = false; // Reset closing flag to allow reopening

    logger.info('ScenarioModal', 'Scenario modal closed');
  }

  /**
   * Start typewriter effect for dilemma and ethical question text
   */
  async startTypewriterEffect() {
    try {
      const dilemmaElement = this.modal.querySelector('.dilemma-text');
      const ethicalQuestionElement =
        this.modal.querySelector('.ethical-question');
      const scenarioContent = this.modal.querySelector('.scenario-content');

      if (!dilemmaElement || !ethicalQuestionElement) {
        logger.warn('Could not find text elements for typewriter effect');
        return;
      }

      // Add active class to start typewriter styling
      if (scenarioContent) {
        scenarioContent.classList.add('typewriter-active');
      }

      // Get the original text content
      const dilemmaText = this.currentScenario.dilemma;
      const ethicalQuestionText = this.currentScenario.ethicalQuestion;

      // Apply typewriter effect sequentially
      await typewriterSequence([
        {
          element: dilemmaElement,
          text: dilemmaText,
          options: {
            speed: 15, // Faster typing
            delay: 200, // Small delay before starting
            cursor: true,
          },
        },
        {
          element: ethicalQuestionElement,
          text: ethicalQuestionText,
          options: {
            speed: 20, // Faster typing for emphasis
            delay: 200, // Shorter delay after first text completes
            cursor: true,
          },
        },
      ]);

      logger.info('ScenarioModal', 'Typewriter effect completed');
    } catch (error) {
      logger.error('Failed to apply typewriter effect:', error);

      // Fallback - show text immediately if typewriter fails
      const dilemmaElement = this.modal.querySelector('.dilemma-text');
      const ethicalQuestionElement =
        this.modal.querySelector('.ethical-question');

      if (dilemmaElement) {
        dilemmaElement.textContent = this.currentScenario.dilemma;
      }
      if (ethicalQuestionElement) {
        ethicalQuestionElement.textContent =
          this.currentScenario.ethicalQuestion;
      }
    }
  }
}

export default ScenarioModal;
