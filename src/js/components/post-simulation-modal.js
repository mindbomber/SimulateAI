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
 * PostSimulationModal - Phase 3 Implementation
 *
 * A comprehensive post-simulation reflection modal that provides structured
 * reflection, learning reinforcement, and progress tracking after simulation completion.
 *
 * Features:
 * - Guided reflection questionnaire system
 * - Progress visualization and decision journey
 * - Learning reinforcement and concept connections
 * - Personalized recommendations and next steps
 * - Export and sharing capabilities
 *
 * @author SimulateAI Development Team
 * @version 3.0.0
 */

import ModalUtility from './modal-utility.js';
import { simulationInfo } from '../data/simulation-info.js';
import { userProgress } from '../utils/simple-storage.js';
import { simpleAnalytics } from '../utils/simple-analytics.js';
import Helpers from '../utils/helpers.js';
import { PERFORMANCE } from '../utils/constants.js';

// Reflection step constants
const REFLECTION_STEPS = {
  SUMMARY: 0,
  FEELINGS: 1,
  INSIGHTS: 2,
  LEARNING: 3,
  NEXT_STEPS: 4,
};

export class PostSimulationModal {
  constructor(options = {}) {
    this.options = {
      simulationId: options.simulationId || 'bias-fairness',
      simulationData: options.simulationData || {},
      sessionData: options.sessionData || {},
      onComplete: options.onComplete || (() => {}),
      onSkip: options.onSkip || (() => {}),
      onRetry: options.onRetry || (() => {}),
      showExpertMode: options.showExpertMode || false,
      ...options,
    };

    this.simulationInfo =
      simulationInfo[this.options.simulationId] ||
      simulationInfo['bias-fairness'];
    this.sessionData = this.options.sessionData;
    this.reflectionData = {};
    this.currentStep = 0;
    this.totalSteps = 5;
    this.modal = null;

    // Initialize and show the modal
    this.init();
  }

  /**
   * Initialize the post-simulation modal
   */
  init() {
    // Track analytics
    simpleAnalytics.trackEvent('post_simulation_modal', 'opened', {
      simulation_id: this.options.simulationId,
      session_duration: this.sessionData.duration || 0,
      decisions_made: this.sessionData.decisions?.length || 0,
    });

    // Generate modal content
    const content = this.generateModalContent();
    const footer = this.generateModalFooter();

    // Create modal
    this.modal = new ModalUtility({
      title: this.generateModalTitle(),
      content,
      footer,
      onClose: this.handleClose.bind(this),
      closeOnBackdrop: false,
      closeOnEscape: false,
      size: 'large',
      className: 'post-simulation-modal',
    });

    this.modal.open();
    this.setupEventHandlers();
    this.initializeReflectionSystem();
  }

  /**
   * Generate dynamic modal title based on simulation and performance
   */
  generateModalTitle() {
    const performance = this.calculatePerformance();
    const titles = {
      excellent: `🎉 Excellent Work: ${this.simulationInfo.title} Complete`,
      good: `✅ Well Done: ${this.simulationInfo.title} Complete`,
      average: `📋 Simulation Complete: ${this.simulationInfo.title}`,
      needs_improvement: `🔄 Learning Opportunity: ${this.simulationInfo.title}`,
    };

    return titles[performance] || titles.average;
  }

  /**
   * Calculate performance level based on session data
   */
  calculatePerformance() {
    if (!this.sessionData.decisions) return 'average';

    const { decisions } = this.sessionData;
    const ethicalChoices = decisions.filter(
      d => d.ethicalScore > PERFORMANCE.ETHICAL_GOOD
    ).length;
    const totalChoices = decisions.length;
    const ratio = ethicalChoices / totalChoices;

    if (ratio >= PERFORMANCE.ETHICAL_EXCELLENT) return 'excellent';
    if (ratio >= PERFORMANCE.ETHICAL_GOOD) return 'good';
    if (ratio >= PERFORMANCE.ETHICAL_AVERAGE) return 'average';
    return 'needs_improvement';
  }

  /**
   * Generate the main modal content with reflection steps
   */
  generateModalContent() {
    return `
            <div class="post-simulation-modal-content">
                <!-- Progress Indicator -->
                <div class="reflection-progress">
                    <div class="progress-bar" role="progressbar" 
                         aria-valuenow="${this.currentStep}" 
                         aria-valuemin="0" 
                         aria-valuemax="${this.totalSteps}">
                        <div class="progress-fill" style="width: ${(this.currentStep / this.totalSteps) * 100}%"></div>
                    </div>
                    <div class="progress-steps">
                        ${this.generateProgressSteps()}
                    </div>
                </div>

                <!-- Main Content Area -->
                <div class="reflection-content">
                    ${this.generateStepContent(this.currentStep)}
                </div>

                <!-- Session Summary Sidebar -->
                <div class="session-summary">
                    ${this.generateSessionSummary()}
                </div>
            </div>
        `;
  }

  /**
   * Generate progress steps visualization
   */
  generateProgressSteps() {
    const steps = [
      { id: 0, title: 'Summary', icon: '📊' },
      { id: 1, title: 'Reflection', icon: '🤔' },
      { id: 2, title: 'Analysis', icon: '🔍' },
      { id: 3, title: 'Learning', icon: '💡' },
      { id: 4, title: 'Next Steps', icon: '🚀' },
    ];

    return steps
      .map(
        step => `
            <div class="progress-step ${step.id <= this.currentStep ? 'completed' : ''} ${step.id === this.currentStep ? 'active' : ''}"
                 data-step="${step.id}">
                <div class="step-icon">${step.icon}</div>
                <div class="step-title">${step.title}</div>
            </div>
        `
      )
      .join('');
  }

  /**
   * Generate content for each reflection step
   */
  generateStepContent(step) {
    switch (step) {
      case REFLECTION_STEPS.SUMMARY:
        return this.generateSummaryStep();
      case REFLECTION_STEPS.FEELINGS:
        return this.generateReflectionStep();
      case REFLECTION_STEPS.INSIGHTS:
        return this.generateAnalysisStep();
      case REFLECTION_STEPS.LEARNING:
        return this.generateLearningStep();
      case REFLECTION_STEPS.NEXT_STEPS:
        return this.generateNextStepsStep();
      default:
        return this.generateSummaryStep();
    }
  }

  /**
   * Step 0: Session Summary and Overview
   */
  generateSummaryStep() {
    const performance = this.calculatePerformance();
    const duration = this.sessionData.duration || 0;
    const decisions = this.sessionData.decisions || [];

    return `
            <div class="step-content summary-step">
                <h3>🎯 Your Simulation Journey</h3>
                
                <div class="summary-cards">
                    <div class="summary-card">
                        <div class="card-icon">⏱️</div>
                        <div class="card-content">
                            <div class="card-value">${Helpers.formatDuration(duration)}</div>
                            <div class="card-label">Time Invested</div>
                        </div>
                    </div>
                    
                    <div class="summary-card">
                        <div class="card-icon">🔄</div>
                        <div class="card-content">
                            <div class="card-value">${decisions.length}</div>
                            <div class="card-label">Decisions Made</div>
                        </div>
                    </div>
                    
                    <div class="summary-card">
                        <div class="card-icon">⚖️</div>
                        <div class="card-content">
                            <div class="card-value">${this.calculateEthicalScore()}</div>
                            <div class="card-label">Ethical Score</div>
                        </div>
                    </div>
                    
                    <div class="summary-card">
                        <div class="card-icon">📈</div>
                        <div class="card-content">
                            <div class="card-value">${performance.toUpperCase()}</div>
                            <div class="card-label">Performance</div>
                        </div>
                    </div>
                </div>

                <div class="decision-journey">
                    <h4>📍 Your Decision Journey</h4>
                    <div class="journey-visualization">
                        ${this.generateDecisionJourney()}
                    </div>
                </div>

                <div class="key-moments">
                    <h4>✨ Key Moments</h4>
                    ${this.generateKeyMoments()}
                </div>
            </div>
        `;
  }

  /**
   * Step 1: Guided Reflection Questions
   */
  generateReflectionStep() {
    return `
            <div class="step-content reflection-step">
                <h3>🤔 Reflection Time</h3>
                <p class="step-description">
                    Let's explore your experience and thinking process during the simulation.
                </p>

                <div class="reflection-questions">
                    ${this.generateReflectionQuestions()}
                </div>
            </div>
        `;
  }

  /**
   * Step 2: Analysis and Patterns
   */
  generateAnalysisStep() {
    return `
            <div class="step-content analysis-step">
                <h3>🔍 Pattern Analysis</h3>
                <p class="step-description">
                    Understanding your decision-making patterns and ethical considerations.
                </p>

                <div class="analysis-sections">
                    ${this.generateDecisionPatterns()}
                    ${this.generateEthicalFrameworks()}
                    ${this.generateBiasRecognition()}
                </div>
            </div>
        `;
  }

  /**
   * Step 3: Learning Connections
   */
  generateLearningStep() {
    return `
            <div class="step-content learning-step">
                <h3>💡 Connect the Dots</h3>
                <p class="step-description">
                    Connecting your experience to broader AI ethics concepts.
                </p>

                <div class="learning-sections">
                    ${this.generateConceptConnections()}
                    ${this.generateAlternativeScenarios()}
                    ${this.generateExpertInsights()}
                </div>
            </div>
        `;
  }

  /**
   * Step 4: Next Steps and Recommendations
   */
  generateNextStepsStep() {
    return `
            <div class="step-content next-steps-step">
                <h3>🚀 Your Learning Journey Continues</h3>
                <p class="step-description">
                    Personalized recommendations for continued growth in AI ethics.
                </p>

                <div class="recommendations-grid">
                    ${this.generatePersonalizedRecommendations()}
                    ${this.generateSkillDevelopment()}
                    ${this.generateResourceSuggestions()}
                </div>

                <div class="goal-setting">
                    <h4>🎯 Set Your Learning Goals</h4>
                    ${this.generateGoalSetting()}
                </div>
            </div>
        `;
  }

  /**
   * Generate session summary sidebar
   */
  generateSessionSummary() {
    return `
            <div class="summary-panel">
                <h4>📋 Session Overview</h4>
                
                <div class="summary-item">
                    <span class="summary-label">Simulation:</span>
                    <span class="summary-value">${this.simulationInfo.title}</span>
                </div>
                
                <div class="summary-item">
                    <span class="summary-label">Started:</span>
                    <span class="summary-value">${new Date(this.sessionData.startTime).toLocaleString()}</span>
                </div>
                
                <div class="summary-item">
                    <span class="summary-label">Duration:</span>
                    <span class="summary-value">${Helpers.formatDuration(this.sessionData.duration)}</span>
                </div>

                <div class="ethics-meters-summary">
                    <h5>⚖️ Ethics Tracking</h5>
                    ${this.generateEthicsMetersSummary()}
                </div>

                <div class="quick-actions">
                    <button class="action-btn secondary" data-action="save-reflection">
                        💾 Save Reflection
                    </button>
                    <button class="action-btn secondary" data-action="share-insights">
                        🔗 Share Insights
                    </button>
                    <button class="action-btn secondary" data-action="print-summary">
                        🖨️ Print Summary
                    </button>
                </div>
            </div>
        `;
  }

  /**
   * Generate modal footer with navigation controls
   */
  generateModalFooter() {
    return `
            <div class="modal-footer-content">
                <div class="footer-left">
                    <button class="btn btn-outline" data-action="skip-reflection">
                        Skip Reflection
                    </button>
                </div>
                
                <div class="footer-center">
                    <span class="step-indicator">
                        Step ${this.currentStep + 1} of ${this.totalSteps}
                    </span>
                </div>
                
                <div class="footer-right">
                    <button class="btn btn-secondary" data-action="previous" 
                            ${this.currentStep === 0 ? 'disabled' : ''}>
                        ← Previous
                    </button>
                    <button class="btn btn-primary" data-action="next">
                        ${this.currentStep === this.totalSteps - 1 ? 'Complete' : 'Next →'}
                    </button>
                </div>
            </div>
        `;
  }

  /**
   * Generate reflection questions based on simulation and performance
   */
  generateReflectionQuestions() {
    const questions = this.getReflectionQuestions();

    return questions
      .map(
        question => `
            <div class="reflection-question" data-question-id="${question.id}">
                <div class="question-header">
                    <span class="question-number">${question.id}</span>
                    <span class="question-type">${question.type}</span>
                </div>
                
                <div class="question-content">
                    <h4>${question.question}</h4>
                    ${question.context ? `<p class="question-context">${question.context}</p>` : ''}
                    
                    <div class="question-input">
                        ${this.generateQuestionInput(question)}
                    </div>
                </div>
            </div>
        `
      )
      .join('');
  }

  /**
   * Get reflection questions based on simulation type and performance
   */
  getReflectionQuestions() {
    const baseQuestions = [
      {
        id: 1,
        type: 'open-ended',
        question:
          'What was the most challenging decision you faced during the simulation?',
        context: 'Think about moments when you felt uncertain or conflicted.',
        inputType: 'textarea',
      },
      {
        id: 2,
        type: 'multiple-choice',
        question: 'Which ethical principle most influenced your decisions?',
        options: [
          'Fairness',
          'Transparency',
          'Accountability',
          'Privacy',
          'Beneficence',
        ],
        inputType: 'radio',
      },
      {
        id: 3,
        type: 'scale',
        question:
          'How confident are you in the ethical soundness of your decisions?',
        scale: { min: 1, max: 5, labels: ['Not confident', 'Very confident'] },
        inputType: 'range',
      },
      {
        id: 4,
        type: 'open-ended',
        question: 'If you could go back, what would you do differently?',
        context: 'Consider both specific decisions and your overall approach.',
        inputType: 'textarea',
      },
      {
        id: 5,
        type: 'ranking',
        question:
          'Rank these factors by how much they influenced your decisions:',
        options: [
          'Personal values',
          'Potential consequences',
          'Stakeholder impact',
          'Technical feasibility',
          'Organizational policy',
        ],
        inputType: 'ranking',
      },
    ];

    // Add simulation-specific questions
    if (this.options.simulationId === 'bias-fairness') {
      baseQuestions.push({
        id: 6,
        type: 'open-ended',
        question:
          'What biases did you notice in yourself during the simulation?',
        context:
          'Bias recognition is a crucial step in developing ethical AI systems.',
        inputType: 'textarea',
      });
    }

    return baseQuestions;
  }

  /**
   * Generate input elements for different question types
   */
  generateQuestionInput(question) {
    switch (question.inputType) {
      case 'textarea':
        return `
                    <textarea id="question-${question.id}"
                              name="question-${question.id}"
                              class="form-control" 
                              rows="4" 
                              placeholder="Share your thoughts..."
                              data-question="${question.id}"
                              autocomplete="off"></textarea>
                `;

      case 'radio':
        return question.options
          .map(
            option => `
                    <label class="radio-option">
                        <input type="radio" name="question_${question.id}" value="${option}">
                        <span class="radio-label">${option}</span>
                    </label>
                `
          )
          .join('');

      case 'range':
        return `
                    <div class="range-input">
                        <input type="range" 
                               id="question-${question.id}"
                               name="question-${question.id}"
                               min="${question.scale.min}" 
                               max="${question.scale.max}" 
                               value="${Math.ceil((question.scale.min + question.scale.max) / 2)}"
                               class="form-range"
                               data-question="${question.id}"
                               aria-describedby="range-labels-${question.id}">
                        <div class="range-labels" id="range-labels-${question.id}">
                            <span>${question.scale.labels[0]}</span>
                            <span>${question.scale.labels[1]}</span>
                        </div>
                    </div>
                `;

      case 'ranking':
        return `
                    <div class="ranking-container" data-question="${question.id}">
                        <div class="ranking-items">
                            ${question.options
                              .map(
                                (option, index) => `
                                <div class="ranking-item" draggable="true" data-value="${option}">
                                    <span class="rank-number">${index + 1}</span>
                                    <span class="rank-text">${option}</span>
                                    <span class="drag-handle">⋮⋮</span>
                                </div>
                            `
                              )
                              .join('')}
                        </div>
                        <p class="ranking-instruction">Drag items to reorder by importance</p>
                    </div>
                `;

      default:
        return `<input type="text" 
                       id="question-${question.id}" 
                       name="question-${question.id}"
                       class="form-control" 
                       data-question="${question.id}"
                       autocomplete="off">`;
    }
  }

  /**
   * Setup event handlers for modal interactions
   */
  setupEventHandlers() {
    if (!this.modal?.modalElement) return;

    const { modalElement } = this.modal;

    // Navigation buttons
    modalElement.addEventListener('click', e => {
      if (e.target.matches('[data-action="next"]')) {
        this.handleNext();
      } else if (e.target.matches('[data-action="previous"]')) {
        this.handlePrevious();
      } else if (e.target.matches('[data-action="skip-reflection"]')) {
        this.handleSkip();
      } else if (e.target.matches('[data-action="save-reflection"]')) {
        this.handleSaveReflection();
      } else if (e.target.matches('[data-action="share-insights"]')) {
        this.handleShareInsights();
      } else if (e.target.matches('[data-action="print-summary"]')) {
        this.handlePrintSummary();
      }
    });

    // Form inputs
    modalElement.addEventListener('input', e => {
      if (e.target.matches('[data-question]')) {
        this.handleInputChange(e);
      }
    });

    // Drag and drop for ranking questions
    this.setupRankingHandlers(modalElement);
  }

  /**
   * Handle navigation to next step
   */
  handleNext() {
    if (this.currentStep < this.totalSteps - 1) {
      // Validate current step if needed
      if (this.validateCurrentStep()) {
        this.currentStep++;
        this.updateModalContent();
        this.trackStepCompletion();
      }
    } else {
      // Complete reflection
      this.handleComplete();
    }
  }

  /**
   * Handle navigation to previous step
   */
  handlePrevious() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.updateModalContent();
    }
  }

  /**
   * Update modal content for current step
   */
  updateModalContent() {
    if (!this.modal?.modalElement) return;

    const contentElement = this.modal.modalElement.querySelector(
      '.reflection-content'
    );
    const footerElement = this.modal.modalElement.querySelector(
      '.modal-footer-content'
    );
    const progressElement = this.modal.modalElement.querySelector(
      '.reflection-progress'
    );

    if (contentElement) {
      contentElement.innerHTML = this.generateStepContent(this.currentStep);
    }

    if (footerElement) {
      footerElement.innerHTML = this.generateModalFooter();
    }

    if (progressElement) {
      // Update progress bar
      const progressBar = progressElement.querySelector('.progress-fill');
      const progressSteps = progressElement.querySelector('.progress-steps');

      if (progressBar) {
        progressBar.style.width = `${(this.currentStep / this.totalSteps) * 100}%`;
      }

      if (progressSteps) {
        progressSteps.innerHTML = this.generateProgressSteps();
      }
    }

    // Re-setup event handlers for new content
    this.setupEventHandlers();
  }

  /**
   * Calculate ethical score from session data
   */
  calculateEthicalScore() {
    if (!this.sessionData.decisions) return 'N/A';

    const { decisions } = this.sessionData;
    const totalScore = decisions.reduce(
      (sum, decision) => sum + (decision.ethicalScore || 0),
      0
    );
    const averageScore = totalScore / decisions.length;

    return `${Math.round(averageScore * 100)}%`;
  }

  /**
   * Generate decision journey visualization
   */
  generateDecisionJourney() {
    if (!this.sessionData.decisions)
      return '<p>No decision data available.</p>';

    const { decisions } = this.sessionData;

    return `
            <div class="journey-timeline">
                ${decisions
                  .map(
                    (decision, index) => `
                    <div class="journey-point ${this.getDecisionClass(decision)}">
                        <div class="point-marker">${index + 1}</div>
                        <div class="point-content">
                            <div class="point-title">${decision.title || `Decision ${index + 1}`}</div>
                            <div class="point-score">Score: ${Math.round((decision.ethicalScore || 0) * 100)}%</div>
                        </div>
                    </div>
                `
                  )
                  .join('')}
            </div>
        `;
  }

  /**
   * Get CSS class for decision based on ethical score
   */
  getDecisionClass(decision) {
    const score = decision.ethicalScore || 0;
    if (score >= PERFORMANCE.SCORE_EXCELLENT) return 'excellent';
    if (score >= PERFORMANCE.SCORE_GOOD) return 'good';
    if (score >= PERFORMANCE.SCORE_AVERAGE) return 'average';
    return 'needs-improvement';
  }

  /**
   * Initialize reflection system
   */
  initializeReflectionSystem() {
    // Initialize any complex components like charts or interactive elements
    // This would be called after modal is fully rendered
    setTimeout(() => {
      this.initializeCharts();
      this.setupRankingDragAndDrop();
    }, 100);
  }

  /**
   * Initialize charts and visualizations
   */
  initializeCharts() {
    // Placeholder for chart initialization
    // Would integrate with a charting library like Chart.js or D3.js
  }

  /**
   * Validate current step completion
   */
  validateCurrentStep() {
    // Add validation logic for each step
    return true; // For now, allow all steps to proceed
  }

  /**
   * Handle modal close
   */
  handleClose() {
    this.options.onComplete(this.reflectionData);
  }

  /**
   * Handle skip reflection
   */
  handleSkip() {
    if (
      confirm(
        'Are you sure you want to skip the reflection? This is valuable for your learning.'
      )
    ) {
      this.options.onSkip();
      this.modal.close();
    }
  }

  /**
   * Handle complete reflection
   */
  handleComplete() {
    // Save reflection data
    this.saveReflectionData();

    // Track completion
    simpleAnalytics.trackEvent('post_simulation_reflection', 'completed', {
      simulation_id: this.options.simulationId,
      steps_completed: this.currentStep + 1,
      reflection_depth: this.calculateReflectionDepth(),
    });

    // Close modal and trigger completion callback
    this.options.onComplete(this.reflectionData);
    this.modal.close();
  }

  /**
   * Save reflection data to storage
   */
  saveReflectionData() {
    const reflectionRecord = {
      simulationId: this.options.simulationId,
      timestamp: new Date().toISOString(),
      sessionData: this.sessionData,
      reflectionData: this.reflectionData,
      performance: this.calculatePerformance(),
      completionRate: (this.currentStep + 1) / this.totalSteps,
    };

    userProgress.addReflection(reflectionRecord);
  }

  /**
   * Calculate reflection depth based on responses
   */
  calculateReflectionDepth() {
    // Analyze reflection responses to determine depth
    // This could look at text length, thoughtfulness, etc.
    return (
      Object.keys(this.reflectionData).length /
      this.getReflectionQuestions().length
    );
  }

  // Placeholder methods for additional functionality
  generateKeyMoments() {
    return '<p>Key moments analysis coming soon...</p>';
  }
  generateDecisionPatterns() {
    return '<p>Decision pattern analysis coming soon...</p>';
  }
  generateEthicalFrameworks() {
    return '<p>Ethical frameworks analysis coming soon...</p>';
  }
  generateBiasRecognition() {
    return '<p>Bias recognition insights coming soon...</p>';
  }
  generateConceptConnections() {
    return '<p>Concept connections coming soon...</p>';
  }
  generateAlternativeScenarios() {
    return '<p>Alternative scenarios coming soon...</p>';
  }
  generateExpertInsights() {
    return '<p>Expert insights coming soon...</p>';
  }
  generatePersonalizedRecommendations() {
    return '<p>Personalized recommendations coming soon...</p>';
  }
  generateSkillDevelopment() {
    return '<p>Skill development suggestions coming soon...</p>';
  }
  generateResourceSuggestions() {
    return '<p>Resource suggestions coming soon...</p>';
  }
  generateGoalSetting() {
    return '<p>Goal setting tools coming soon...</p>';
  }
  generateEthicsMetersSummary() {
    return '<p>Ethics meters summary coming soon...</p>';
  }

  setupRankingHandlers() {
    /* Ranking drag-and-drop setup */
  }
  setupRankingDragAndDrop() {
    /* Additional ranking setup */
  }
  handleInputChange() {
    /* Input change handling */
  }
  handleSaveReflection() {
    /* Save reflection handling */
  }
  handleShareInsights() {
    /* Share insights handling */
  }
  handlePrintSummary() {
    /* Print summary handling */
  }
  trackStepCompletion() {
    /* Step completion tracking */
  }
}
