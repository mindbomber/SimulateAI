/**
 * Scenario Modal Component
 * Displays individual ethical scenarios with radar chart visualization
 * Dynamically loads scenario data for all categories
 */

import logger from '../utils/logger.js';
import RadarChart from './radar-chart.js';
import scenarioDataManager from '../data/scenario-data-manager.js';
import { getAllCategories } from '../../data/categories.js';

// Constants
const ANIMATION_DURATION = 300;
const RADAR_CHART_MAX_SCORE = 5;
const RADAR_CHART_NEUTRAL_SCORE = 3;

class ScenarioModal {
    constructor() {
        this.modal = null;
        this.backdrop = null;
        this.radarChart = null;
        this.currentScenario = null;
        this.selectedOption = null;
        this.currentCategoryId = null;
        this.currentScenarioId = null;
        
        // Cache for categories and scenarios
        this.categories = getAllCategories();
        this.scenarioData = null;
    }

    /**
     * Open the modal with a specific scenario
     * @param {string} scenarioId - The scenario ID to display
     * @param {string} categoryId - The category ID (optional, will be detected if not provided)
     */
    async open(scenarioId, categoryId = null) {
        try {
            // Find the category if not provided
            if (!categoryId) {
                categoryId = this.findCategoryForScenario(scenarioId);
                if (!categoryId) {
                    throw new Error(`Could not find category for scenario: ${scenarioId}`);
                }
            }

            // Load scenario data
            this.currentCategoryId = categoryId;
            this.currentScenarioId = scenarioId;
            this.scenarioData = await scenarioDataManager.getScenario(categoryId, scenarioId);
            
            if (!this.scenarioData) {
                throw new Error(`Could not load scenario data for: ${categoryId}:${scenarioId}`);
            }

            this.currentScenario = this.scenarioData;
            
            // Create and show modal
            await this.createModal();
            await this.show();
            
            // Initialize radar chart after modal is visible
            await this.initializeRadarChart();
            
            logger.info(`Opened scenario modal for: ${categoryId}:${scenarioId}`);
            
        } catch (error) {
            logger.error('Failed to open scenario modal:', error);
            alert(`Failed to load scenario: ${scenarioId}. Please try again.`);
        }
    }

    /**
     * Find which category contains a specific scenario
     */
    findCategoryForScenario(scenarioId) {
        for (const category of this.categories) {
            if (category.scenarios && category.scenarios.some(s => s.id === scenarioId)) {
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

        logger.info('Creating scenario modal DOM structure');
        logger.info('Current scenario data:', this.currentScenario ? 'LOADED' : 'NULL');

        // Create modal elements
        this.backdrop = document.createElement('div');
        this.backdrop.className = 'scenario-modal-backdrop';
        
        this.modal = document.createElement('div');
        this.modal.className = 'scenario-modal';
        this.modal.innerHTML = this.getModalHTML();

        // Add to DOM
        document.body.appendChild(this.backdrop);
        document.body.appendChild(this.modal);

        logger.info('Scenario modal DOM structure created and appended to body');
        logger.info('Modal HTML contains radar chart container:', this.modal.innerHTML.includes('scenario-radar-chart'));

        // Attach event listeners
        this.attachEventListeners();
    }

    /**
     * Generate modal HTML content
     */
    getModalHTML() {
        logger.info('getModalHTML called - currentScenario status:', this.currentScenario ? 'LOADED' : 'NULL');
        
        if (!this.currentScenario) {
            logger.warn('No current scenario data - returning loading message');
            return '<div class="scenario-content"><p>Loading scenario...</p></div>';
        }

        const categoryInfo = this.categories.find(c => c.id === this.currentCategoryId);
        const categoryTitle = categoryInfo ? categoryInfo.title : 'Unknown Category';

        logger.info(`Generating HTML for scenario: ${this.currentScenario.title} in category: ${categoryTitle}`);

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

                <div class="scenario-content">
                    <div class="scenario-main">
                        <div class="scenario-description">
                            <div class="dilemma-section">
                                <h3>The Dilemma</h3>
                                <p class="dilemma-text">${this.currentScenario.dilemma}</p>
                            </div>

                            <div class="ethical-question-section">
                                <h3>Ethical Question</h3>
                                <p class="ethical-question">${this.currentScenario.ethicalQuestion}</p>
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
                        <div class="radar-chart-container">
                            <h3>Ethical Impact Analysis</h3>
                            <div id="scenario-radar-chart" style="min-height: 380px; position: relative;"></div>
                            <div class="chart-legend">
                                <p>This chart shows how your choice affects different ethical dimensions. Select an option to see its impact.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="scenario-modal-footer">
                    <button class="btn btn-secondary" id="cancel-scenario">
                        Cancel
                    </button>
                    <button class="btn btn-primary" id="confirm-choice" disabled>
                        Confirm Choice
                    </button>
                </div>
            </div>
        `;

        logger.info('Generated scenario modal HTML, checking for radar chart container...');
        logger.info('HTML contains scenario-radar-chart:', html.includes('scenario-radar-chart'));
        
        return html;
    }

    /**
     * Render option buttons
     */
    renderOptions() {
        if (!this.currentScenario.options) {
            return '<p>No options available</p>';
        }

        return this.currentScenario.options.map(option => `
            <div class="option-card" data-option-id="${option.id}">
                <div class="option-header">
                    <h4 class="option-title">${option.text}</h4>
                </div>
                <div class="option-description">
                    <p>${option.description}</p>
                </div>
                <div class="option-details" style="display: none;">
                    ${option.pros ? `
                        <div class="pros-section">
                            <h5>Pros</h5>
                            <ul>${option.pros.map(pro => `<li>${pro}</li>`).join('')}</ul>
                        </div>
                    ` : ''}
                    ${option.cons ? `
                        <div class="cons-section">
                            <h5>Cons</h5>
                            <ul>${option.cons.map(con => `<li>${con}</li>`).join('')}</ul>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    /**
     * Initialize radar chart
     */
    async initializeRadarChart() {
        try {
            const chartContainer = document.getElementById('scenario-radar-chart');
            logger.info(`Radar chart initialization: container found = ${!!chartContainer}`);
            
            if (!chartContainer) {
                logger.error('Radar chart container not found even after modal is visible');
                return;
            }
            
            // Clear any existing content to prevent "null" display
            chartContainer.innerHTML = '';
            chartContainer.textContent = '';
            
            logger.info(`Container cleared, initializing radar chart`);
            
            // Pass the container ID (string), not the element itself
            this.radarChart = new RadarChart('scenario-radar-chart', {
                width: 380,
                height: 380,
                showLabels: true,
                showLegend: false,
                animated: true,
                realTime: true,
                title: null // Disable chart title to avoid duplication with h3
            });

            // Wait for the RadarChart to be fully initialized
            await this.radarChart.initializationPromise;
            logger.info('Radar chart async initialization completed');

            // Set initial neutral scores (using the correct method)
            const neutralScores = {
                fairness: RADAR_CHART_NEUTRAL_SCORE,
                sustainability: RADAR_CHART_NEUTRAL_SCORE,
                autonomy: RADAR_CHART_NEUTRAL_SCORE,
                beneficence: RADAR_CHART_NEUTRAL_SCORE,
                transparency: RADAR_CHART_NEUTRAL_SCORE,
                accountability: RADAR_CHART_NEUTRAL_SCORE,
                privacy: RADAR_CHART_NEUTRAL_SCORE,
                proportionality: RADAR_CHART_NEUTRAL_SCORE
            };

            this.radarChart.setScores(neutralScores);
            logger.info('Radar chart initialized successfully with neutral scores');
            
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
        this.escapeHandler = (e) => {
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
        logger.info('Option selection started');
        
        // Remove previous selection
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
        const optionId = card.getAttribute('data-option-id');
        this.selectedOption = this.currentScenario.options.find(opt => opt.id === optionId);

        logger.info('Option selected:', {
            optionId,
            hasSelectedOption: !!this.selectedOption,
            hasImpact: !!this.selectedOption?.impact,
            impact: this.selectedOption?.impact
        });

        // Update radar chart
        this.updateRadarChart();

        // Enable confirm button
        const confirmButton = this.modal.querySelector('#confirm-choice');
        if (confirmButton) {
            confirmButton.disabled = false;
        }

        logger.info('Option selection completed');
    }

    /**
     * Update radar chart with selected option impact
     */
    updateRadarChart() {
        if (!this.radarChart || !this.selectedOption || !this.selectedOption.impact) {
            logger.warn('Cannot update radar chart - missing components:', {
                hasRadarChart: !!this.radarChart,
                hasSelectedOption: !!this.selectedOption,
                hasImpact: !!this.selectedOption?.impact
            });
            return;
        }

        try {
            // Check if radar chart is initialized
            if (!this.radarChart.isInitialized) {
                logger.warn('Radar chart not yet initialized, skipping update');
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
                impactScores[axis] = Math.max(0, Math.min(RADAR_CHART_MAX_SCORE, impactScores[axis]));
            });

            logger.info('Updating radar chart with converted scores:', impactScores);
            this.radarChart.setScores(impactScores);
            logger.info('Radar chart updated successfully');
            
        } catch (error) {
            logger.error('Failed to update radar chart:', error);
        }
    }

    /**
     * Confirm the selected choice
     */
    confirmChoice() {
        if (!this.selectedOption) {
            logger.warn('No option selected for confirmation');
            return;
        }

        // Dispatch scenario completion event
        const event = new CustomEvent('scenario-completed', {
            detail: {
                categoryId: this.currentCategoryId,
                scenarioId: this.currentScenarioId,
                selectedOption: this.selectedOption,
                option: this.selectedOption // Legacy compatibility
            }
        });
        document.dispatchEvent(event);

        logger.info('Scenario completed:', {
            categoryId: this.currentCategoryId,
            scenarioId: this.currentScenarioId,
            selectedOption: this.selectedOption.id
        });

        // Close modal with delay to show completion
        setTimeout(() => {
            this.close();
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
        await new Promise((resolve) => {
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
    }

    /**
     * Close the modal and wait for it to be fully removed
     */
    async closeAndWait() {
        if (this.modal || this.backdrop) {
            this.close();
            // Wait for the animation to complete plus small buffer
            const CLOSE_BUFFER = 50; // ms
            await new Promise(resolve => setTimeout(resolve, ANIMATION_DURATION + CLOSE_BUFFER));
        }
    }

    /**
     * Close the modal
     */
    close() {
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

        // Reset state
        this.currentScenario = null;
        this.selectedOption = null;
        this.currentCategoryId = null;
        this.currentScenarioId = null;
        this.scenarioData = null;
        this.radarChart = null;

        logger.info('Scenario modal closed');
    }
}

export default ScenarioModal;
