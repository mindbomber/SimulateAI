/**
 * Pre-Launch Information Modal
 * Educational context and preparation before simulation launch
 */

import { getSimulationInfo } from '../data/simulation-info.js';
import ModalUtility from './modal-utility.js';
import { userPreferences } from '../utils/simple-storage.js';
import { simpleAnalytics } from '../utils/simple-analytics.js';
import logger from '../utils/logger.js';

export class PreLaunchModal {
    constructor(simulationId, options = {}) {
        this.simulationId = simulationId;
        this.simulationInfo = getSimulationInfo(simulationId);
        this.options = {
            onLaunch: options.onLaunch || (() => {}),
            onCancel: options.onCancel || (() => {}),
            showEducatorResources: options.showEducatorResources || false,
            ...options
        };
        
        if (!this.simulationInfo) {
            throw new Error(`Simulation info not found for: ${simulationId}`);
        }
        
        this.modal = null;
        this.currentTab = 'overview';
    }
    
    /**
     * Shows the pre-launch modal
     */
    show() {
        const content = this.generateModalContent();
        const footer = this.generateModalFooter();
        
        this.modal = new ModalUtility({
            title: `Prepare to Explore: ${this.simulationInfo.title}`,
            content,
            footer,
            onClose: this.options.onCancel,
            closeOnBackdrop: false,
            closeOnEscape: true
        });
        
        this.modal.open();
        this.setupEventListeners();
        this.trackAnalytics('pre_launch_viewed');
    }
    
    /**
     * Closes the modal
     */
    close() {
        if (this.modal) {
            this.modal.close();
            this.modal = null;
        }
    }
    
    /**
     * Generates the main modal content with tabs
     */
    generateModalContent() {
        // Generate the tabbed content for the pre-launch modal
        return `
            <div class="pre-launch-modal">
                <!-- Tab Navigation -->
                <nav class="pre-launch-tabs" role="tablist" aria-label="Pre-launch information tabs">
                    <button class="tab-button active" data-tab="overview" role="tab" aria-selected="true" aria-controls="tab-overview">
                        <span class="tab-icon">🎯</span>
                        Overview
                    </button>
                    <button class="tab-button" data-tab="objectives" role="tab" aria-selected="false" aria-controls="tab-objectives">
                        <span class="tab-icon">📚</span>
                        Learning Goals
                    </button>
                    <button class="tab-button" data-tab="preparation" role="tab" aria-selected="false" aria-controls="tab-preparation">
                        <span class="tab-icon">🚀</span>
                        Get Ready
                    </button>
                    <button class="tab-button" data-tab="resources" role="tab" aria-selected="false" aria-controls="tab-resources">
                        <span class="tab-icon">📖</span>
                        Resources
                    </button>
                    ${this.options.showEducatorResources ? `
                        <button class="tab-button" data-tab="educator" role="tab" aria-selected="false" aria-controls="tab-educator">
                            <span class="tab-icon">👨‍🏫</span>
                            For Educators
                        </button>
                    ` : ''}
                </nav>
                
                <!-- Tab Content -->
                <div class="pre-launch-content">
                    ${this.generateOverviewTab()}
                    ${this.generateObjectivesTab()}
                    ${this.generatePreparationTab()}
                    ${this.generateResourcesTab()}
                    ${this.options.showEducatorResources ? this.generateEducatorTab() : ''}
                </div>
            </div>
        `;
    }
    
    /**
     * Generates the overview tab content
     */
    generateOverviewTab() {
        const info = this.simulationInfo;
        
        return `
            <div class="tab-content active" id="tab-overview" role="tabpanel" aria-labelledby="tab-overview">
                <div class="simulation-overview">
                    <div class="overview-header">
                        <h3>${info.title}</h3>
                        <p class="subtitle">${info.subtitle}</p>
                    </div>
                    
                    <div class="overview-meta">
                        <div class="meta-item">
                            <span class="meta-label">Duration:</span>
                            <span class="meta-value">${info.duration}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Difficulty:</span>
                            <span class="meta-value difficulty-${info.difficulty}">${this.capitalizeFirst(info.difficulty)}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Recommended Age:</span>
                            <span class="meta-value">${info.recommendedAge}</span>
                        </div>
                    </div>
                    
                    <div class="overview-description">
                        <h4>What You'll Explore</h4>
                        <div class="briefing-text">
                            ${this.formatText(info.beforeYouStart.briefing)}
                        </div>
                    </div>
                    
                    <div class="scenario-overview">
                        <h4>Scenario Overview</h4>
                        <p>${info.beforeYouStart.scenarioOverview}</p>
                    </div>
                    
                    ${info.contentNotes.length > 0 ? `
                        <div class="content-notes">
                            <h4>Content Notes</h4>
                            <ul class="notes-list">
                                ${info.contentNotes.map(note => `<li>${note}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    /**
     * Generates the learning objectives tab
     */
    generateObjectivesTab() {
        const info = this.simulationInfo;
        
        return `
            <div class="tab-content" id="tab-objectives" role="tabpanel" aria-labelledby="tab-objectives">
                <div class="learning-objectives">
                    <div class="objectives-section">
                        <h4>Learning Objectives</h4>
                        <p class="section-description">By the end of this exploration, you will be able to:</p>
                        <ul class="objectives-list">
                            ${info.learningObjectives.map(objective => `
                                <li class="objective-item">
                                    <span class="objective-icon">🎯</span>
                                    ${objective}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    
                    <div class="standards-section">
                        <h4>ISTE Standards Alignment</h4>
                        <p class="section-description">This simulation supports these ISTE Standards for Students:</p>
                        <ul class="standards-list">
                            ${info.isteCriteria.map(standard => `
                                <li class="standard-item">
                                    <span class="standard-icon">📋</span>
                                    ${standard}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    
                    ${info.prerequisites.length > 0 ? `
                        <div class="prerequisites-section">
                            <h4>Prerequisites</h4>
                            <p class="section-description">For the best experience, you should have:</p>
                            <ul class="prerequisites-list">
                                ${info.prerequisites.map(prereq => `
                                    <li class="prerequisite-item">
                                        <span class="prereq-icon">📚</span>
                                        ${prereq}
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    /**
     * Generates the preparation tab
     */
    generatePreparationTab() {
        const info = this.simulationInfo;
        
        return `
            <div class="tab-content" id="tab-preparation" role="tabpanel" aria-labelledby="tab-preparation">
                <div class="preparation-content">
                    <div class="preparation-tips">
                        <h4>Preparation Tips</h4>
                        <p class="section-description">Before you start exploring, consider these suggestions:</p>
                        <ul class="tips-list">
                            ${info.beforeYouStart.preparationTips.map(tip => `
                                <li class="tip-item">
                                    <span class="tip-icon">💡</span>
                                    ${tip}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    
                    <div class="vocabulary-section">
                        <h4>Key Vocabulary</h4>
                        <p class="section-description">Important terms you'll encounter:</p>
                        <div class="vocabulary-grid">
                            ${info.beforeYouStart.vocabulary.map(item => `
                                <div class="vocabulary-card">
                                    <h5 class="vocab-term">${item.term}</h5>
                                    <p class="vocab-definition">${item.definition}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Generates the resources tab
     */
    generateResourcesTab() {
        const info = this.simulationInfo;
        
        return `
            <div class="tab-content" id="tab-resources" role="tabpanel" aria-labelledby="tab-resources">
                <div class="resources-content">
                    <div class="resources-intro">
                        <h4>Related Resources</h4>
                        <p class="section-description">Explore these resources to deepen your understanding:</p>
                    </div>
                    
                    <div class="resources-grid">
                        ${info.relatedResources.map(resource => `
                            <div class="resource-card" data-audience="${resource.audience}">
                                <div class="resource-header">
                                    <span class="resource-type resource-type-${resource.type}">${this.getResourceTypeIcon(resource.type)}</span>
                                    <span class="resource-audience">${this.capitalizeFirst(resource.audience)}</span>
                                </div>
                                <h5 class="resource-title">${resource.title}</h5>
                                <p class="resource-description">${resource.description}</p>
                                <a href="${resource.url}" target="_blank" rel="noopener noreferrer" class="resource-link">
                                    View Resource <span class="external-icon">↗</span>
                                </a>
                            </div>
                        `).join('')}
                    </div>
                    
                    ${info.connectedSimulations.length > 0 ? `
                        <div class="connected-simulations">
                            <h4>Related Simulations</h4>
                            <p class="section-description">Continue your learning journey with these connected explorations:</p>
                            <div class="connected-list">
                                ${info.connectedSimulations.map(simId => `
                                    <button class="connected-sim-button" data-simulation="${simId}">
                                        Explore: ${this.getSimulationTitle(simId)}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    /**
     * Generates the educator resources tab
     */
    generateEducatorTab() {
        const info = this.simulationInfo;
        const resources = info.educatorResources;
        
        return `
            <div class="tab-content" id="tab-educator" role="tabpanel" aria-labelledby="tab-educator">
                <div class="educator-content">
                    <div class="educator-intro">
                        <h4>Educator Resources</h4>
                        <p class="section-description">Tools and guidance for classroom implementation:</p>
                    </div>
                    
                    <div class="educator-sections">
                        <div class="educator-section">
                            <h5>Discussion Questions</h5>
                            <ul class="discussion-questions">
                                ${resources.discussionQuestions.map(question => `
                                    <li class="discussion-item">${question}</li>
                                `).join('')}
                            </ul>
                        </div>
                        
                        <div class="educator-section">
                            <h5>Extension Activities</h5>
                            <ul class="extension-activities">
                                ${resources.extensionActivities.map(activity => `
                                    <li class="activity-item">${activity}</li>
                                `).join('')}
                            </ul>
                        </div>
                        
                        <div class="educator-section">
                            <h5>Classroom Tips</h5>
                            <ul class="classroom-tips">
                                ${resources.classroomTips.map(tip => `
                                    <li class="tip-item">${tip}</li>
                                `).join('')}
                            </ul>
                        </div>
                        
                        <div class="educator-section">
                            <h5>Standards Alignment</h5>
                            <ul class="standards-alignment">
                                ${resources.relatedStandards.map(standard => `
                                    <li class="standard-item">${standard}</li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Generates modal footer with action buttons
     */
    generateModalFooter() {
        return `
            <div class="pre-launch-footer">
                <div class="skip-options">
                    <label class="skip-option">
                        <input type="checkbox" id="skip-for-this-sim" class="skip-checkbox">
                        Don't show this for "${this.simulationInfo.title}" again
                    </label>
                    <label class="skip-option">
                        <input type="checkbox" id="skip-all-prelaunches" class="skip-checkbox">
                        Don't show pre-launch info for any simulation
                    </label>
                </div>
                <div class="action-buttons">
                    <button type="button" class="btn btn-secondary" id="cancel-launch">
                        Maybe Later
                    </button>
                    <button type="button" class="btn btn-primary" id="start-exploration">
                        <span class="button-icon">🚀</span>
                        Start Exploration
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Sets up event listeners for modal interactions
     */
    setupEventListeners() {
        // Ensure modal container exists and has the expected structure
        if (!this.modal) {
            logger.error('Modal instance not available for event listener setup');
            return;
        }
        
        if (!this.modal.element) {
            logger.error('Modal element not available. Modal structure:', this.modal);
            return;
        }
        
        if (typeof this.modal.element.querySelectorAll !== 'function') {
            logger.error('Modal element does not have querySelectorAll method. Element type:', typeof this.modal.element, this.modal.element);
            return;
        }

        try {
            // Tab switching (scoped to this modal)
            const tabButtons = this.modal.element.querySelectorAll('.tab-button');
            tabButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const tabId = e.target.dataset.tab || e.currentTarget.dataset.tab;
                    if (tabId) {
                        this.switchTab(tabId);
                    } else {
                        logger.warn('Tab button clicked but no data-tab attribute found', e.target);
                    }
                });
            });
        
            // Action buttons (scoped to this modal)
            const startButton = this.modal.element.querySelector('#start-exploration');
            const cancelButton = this.modal.element.querySelector('#cancel-launch');
            
            if (startButton) {
                startButton.addEventListener('click', () => {
                    // Check skip preferences before launching
                    this.handleSkipPreferences();
                    
                    this.trackAnalytics('simulation_launched');
                    this.close();
                    this.options.onLaunch(this.simulationId);
                });
            }
            
            if (cancelButton) {
                cancelButton.addEventListener('click', () => {
                    // Check skip preferences even when cancelling
                    this.handleSkipPreferences();
                    
                    this.trackAnalytics('launch_cancelled');
                    this.close();
                    this.options.onCancel();
                });
            }
            
            // Connected simulation buttons
            const connectedButtons = document.querySelectorAll('.connected-sim-button');
            connectedButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const targetSimId = e.target.dataset.simulation;
                    this.trackAnalytics('connected_simulation_clicked', { target: targetSimId });
                    // Could trigger loading of connected simulation
                });
            });
            
            // Resource link tracking
            const resourceLinks = document.querySelectorAll('.resource-link');
            resourceLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    this.trackAnalytics('resource_accessed', { 
                        url: e.target.href,
                        type: e.target.closest('.resource-card').querySelector('.resource-type').textContent
                    });
                });
            });
        } catch (error) {
            logger.error('Error setting up PreLaunchModal event listeners:', error);
        }
    }
    
    /**
     * Switches to a different tab
     */
    switchTab(tabId) {
        if (!tabId) {
            logger.warn('switchTab called with null or undefined tabId');
            return;
        }

        try {
            // Find the modal container to scope our searches
            const modalContainer = (this.modal && this.modal.element) || document.querySelector('.pre-launch-modal');
            if (!modalContainer) {
                logger.warn('Pre-launch modal container not found');
                return;
            }

            // Update buttons (scoped to the modal)
            const allTabButtons = modalContainer.querySelectorAll('.tab-button');
            allTabButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });
            
            const targetButton = modalContainer.querySelector(`[data-tab="${tabId}"]`);
            if (targetButton) {
                targetButton.classList.add('active');
                targetButton.setAttribute('aria-selected', 'true');
            } else {
                logger.warn(`Tab button with data-tab="${tabId}" not found in modal`);
            }
            
            // Update content (scoped to the modal)
            const allTabContent = modalContainer.querySelectorAll('.tab-content');
            allTabContent.forEach(content => {
                content.classList.remove('active');
            });
            
            const targetContent = modalContainer.querySelector(`#tab-${tabId}`);
            if (targetContent) {
                targetContent.classList.add('active');
            } else {
                logger.warn(`Tab content with id="tab-${tabId}" not found in modal`);
            }
            
            this.currentTab = tabId;
            this.trackAnalytics('tab_switched', { tab: tabId });
        } catch (error) {
            logger.error('Error in switchTab:', error);
        }
    }
    
    /**
     * Handles skip preference checkboxes
     */
    handleSkipPreferences() {
        const skipForThis = document.getElementById('skip-for-this-sim');
        const skipAll = document.getElementById('skip-all-prelaunches');
        
        if (skipForThis && skipForThis.checked) {
            userPreferences.setSkipPreLaunchFor(this.simulationId, true);
            this.trackAnalytics('skip_prelaunch_for_simulation', { simulationId: this.simulationId });
        }
        
        if (skipAll && skipAll.checked) {
            userPreferences.setSkipPreLaunchGlobally(true);
            this.trackAnalytics('skip_prelaunch_globally');
        }
    }

    // Helper methods
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    formatText(text) {
        return text.split('\n\n').map(paragraph => `<p>${paragraph.trim()}</p>`).join('');
    }
    
    getResourceTypeIcon(type) {
        const icons = {
            'article': '📄',
            'video': '🎥',
            'research': '🔬',
            'interactive': '🖥️',
            'book': '📚',
            'website': '🌐'
        };
        return icons[type] || '📎';
    }
    
    getSimulationTitle(simId) {
        const simInfo = getSimulationInfo(simId);
        return simInfo ? simInfo.title : simId;
    }
    
    trackAnalytics(event, data = {}) {
        if (simpleAnalytics) {
            simpleAnalytics.trackEvent('pre_launch', {
                event,
                simulation: this.simulationId,
                tab: this.currentTab,
                ...data
            });
        }
    }
}

export default PreLaunchModal;
