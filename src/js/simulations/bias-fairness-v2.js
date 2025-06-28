/**
 * AI Ethics Simulation: Bias and Fairness Explorer
 * An open-ended exploration of AI bias in real-world scenarios
 * Educational tool for all ages with no "correct" answers
 */

import EthicsSimulation from '../core/simulation.js';
import logger from '../utils/logger.js';
import { TIMING } from '../utils/constants.js';

// Gamification constants
const GAME_CONSTANTS = {
  CONFETTI_COUNT: 20,
  CELEBRATION_CONFETTI_COUNT: 50,
  CONFETTI_ANIMATION_DURATION: 3000,
  CELEBRATION_ANIMATION_DURATION: 4000,
  LEVEL_UP_NOTIFICATION_DURATION: 3000,
  CONFETTI_DELAY: 100,
  CELEBRATION_CONFETTI_DELAY: 50,
  MIN_CONFETTI_SIZE: 5,
  MAX_CONFETTI_SIZE: 15,
  PROGRESS_STATS_COUNT: 3
};

class BiasExplorerSimulation extends EthicsSimulation {
  constructor(id) {
    super(id, {
      title: 'AI Ethics Explorer: Bias and Fairness',
      description: 'Explore how AI systems can impact different groups in society through real-world scenarios',
      learningObjectives: [
        'Understand how AI decisions affect different groups',
        'Explore the complexity of fairness in AI systems',
        'Recognize bias in everyday AI applications',
        'Consider multiple perspectives on AI ethics'
      ],
      difficulty: 'beginner',
      estimatedTime: 20,
      openEnded: true
    });

    // Real-world scenarios for exploration - reduced to 4 focused scenarios
    this.scenarios = [
      {
        id: 'hiring',
        title: 'AI Hiring Assistant',
        icon: '💼',
        difficulty: 'beginner',
        context: 'A company uses AI to screen job applications',
        description: 'Help TechCorp design their AI hiring system. Your choices will affect who gets interviewed.',
        setting: 'Corporate recruiting department',
        stakeholders: ['Job applicants', 'HR managers', 'Company shareholders', 'Society'],
        gameElements: {
          challenge: 'Balance fairness with efficiency',
          reward: 'Unlock insights about hiring bias',
          progress: 0
        }
      },
      {
        id: 'lending',
        title: 'Smart Loan Approval',
        icon: '🏦',
        difficulty: 'intermediate',
        context: 'A bank uses AI to approve or deny loans',
        description: 'Design an AI system for CommunityBank that decides who gets loans for homes and businesses.',
        setting: 'Community bank serving diverse neighborhoods',
        stakeholders: ['Loan applicants', 'Bank customers', 'Local community', 'Bank investors'],
        gameElements: {
          challenge: 'Ensure fair access to financial services',
          reward: 'Discover financial inclusion strategies',
          progress: 0
        }
      },
      {
        id: 'healthcare',
        title: 'Medical AI Assistant',
        icon: '🏥',
        difficulty: 'intermediate',
        context: 'An AI helps doctors prioritize patient care',
        description: 'Create an AI system that helps doctors decide which patients need immediate attention.',
        setting: 'Busy urban hospital emergency room',
        stakeholders: ['Patients', 'Medical staff', 'Hospital administration', 'Insurance companies'],
        gameElements: {
          challenge: 'Save lives while ensuring equity',
          reward: 'Learn about healthcare disparities',
          progress: 0
        }
      },
      {
        id: 'education',
        title: 'Personalized Learning AI',
        icon: '🎓',
        difficulty: 'beginner',
        context: 'An AI system personalizes education for students',
        description: 'Design an AI tutor that adapts to different learning styles and backgrounds.',
        setting: 'Public school with diverse student population',
        stakeholders: ['Students', 'Teachers', 'Parents', 'School administrators'],
        gameElements: {
          challenge: 'Help every student succeed',
          reward: 'Unlock personalized learning secrets',
          progress: 0
        }
      }
    ];

    // Ensure all scenarios have proper gameElements structure
    this.scenarios.forEach(scenario => {
      if (!scenario.gameElements) {
        scenario.gameElements = {
          challenge: 'Explore AI ethics concepts',
          reward: 'Gain insights about fairness',
          progress: 0
        };
      }
      // Ensure progress is always a number
      if (typeof scenario.gameElements.progress !== 'number') {
        scenario.gameElements.progress = 0;
      }
    });

    // Current exploration state
    this.currentScenario = null;
    this.explorationHistory = [];
    this.currentChoices = {};
    this.consequences = [];
    
    // Game elements
    this.gameState = {
      totalScenarios: 4,
      completedScenarios: 0,
      totalChoices: 0,
      insightsUnlocked: 0,
      badges: [],
      level: 1
    };
    
    // UI elements
    this.ui = null;
    this.container = null;
  }

  init(engineInstance) {
    logger.debug('BiasExplorerSimulation.init() called');
    
    this.engine = engineInstance;
    this.container = this.engine?.container || document.querySelector('.simulation-container');
    
    if (!this.container) {
      logger.error('No container found for simulation');
      return;
    }

    // Initialize educational features with connected modules
    this.initializeEducationalFeatures();

    this.setupUI();
    this.emit('simulation:initialized');
    
    logger.debug('BiasExplorerSimulation initialization complete');
  }

  setupUI() {
    logger.debug('BiasExplorerSimulation.setupUI() called');
    logger.debug('Container:', this.container);
    logger.debug('Container classes before:', this.container?.className);
    
    // Clear container
    this.container.innerHTML = '';
    this.container.className = 'simulation-container ethics-explorer';
    
    logger.debug('Container classes after:', this.container?.className);
    logger.debug('Container bounding rect:', this.container?.getBoundingClientRect());
    
    // Create main layout
    const layout = this.createMainLayout();
    logger.debug('Created layout element:', layout);
    
    this.container.appendChild(layout);
    logger.debug('Appended layout to container');
    logger.debug('Container innerHTML length after setup:', this.container.innerHTML.length);
    
    // Force modal body to scroll to top and ensure visibility
    setTimeout(() => {
      const modal = document.getElementById('simulation-modal');
      const modalBody = modal?.querySelector('.modal-body');
      if (modalBody) {
        modalBody.scrollTop = 0;
        modalBody.style.overflow = 'visible';
        modalBody.style.height = 'auto';
        modalBody.style.maxHeight = 'none';
      }
    }, TIMING.DOM_READY_DELAY);
    
    // Debug: Check if our elements are visible
    setTimeout(() => {
      logger.debug('=== POST-APPEND DEBUG ===');
      logger.debug('Container computed style display:', getComputedStyle(this.container).display);
      logger.debug('Container computed style visibility:', getComputedStyle(this.container).visibility);
      logger.debug('Container computed style opacity:', getComputedStyle(this.container).opacity);
      logger.debug('Container computed style height:', getComputedStyle(this.container).height);
      logger.debug('Container computed style maxHeight:', getComputedStyle(this.container).maxHeight);
      logger.debug('Container computed style overflow:', getComputedStyle(this.container).overflow);
      logger.debug('Container computed style position:', getComputedStyle(this.container).position);
      logger.debug('Container computed style zIndex:', getComputedStyle(this.container).zIndex);
      
      const layoutEl = this.container.querySelector('.ethics-explorer-layout');
      if (layoutEl) {
        logger.debug('Layout element found');
        logger.debug('Layout computed style display:', getComputedStyle(layoutEl).display);
        logger.debug('Layout computed style visibility:', getComputedStyle(layoutEl).visibility);
        logger.debug('Layout computed style opacity:', getComputedStyle(layoutEl).opacity);
        logger.debug('Layout computed style height:', getComputedStyle(layoutEl).height);
        logger.debug('Layout bounding rect:', layoutEl.getBoundingClientRect());
        
        // Check modal context
        const modal = document.getElementById('simulation-modal');
        const modalBody = modal?.querySelector('.modal-body');
        if (modal) {
          logger.debug('=== MODAL DEBUG ===');
          logger.debug('Modal display:', getComputedStyle(modal).display);
          logger.debug('Modal visibility:', getComputedStyle(modal).visibility);
          logger.debug('Modal bounding rect:', modal.getBoundingClientRect());
        }
        if (modalBody) {
          logger.debug('=== MODAL BODY DEBUG ===');
          logger.debug('Modal body display:', getComputedStyle(modalBody).display);
          logger.debug('Modal body height:', getComputedStyle(modalBody).height);
          logger.debug('Modal body maxHeight:', getComputedStyle(modalBody).maxHeight);
          logger.debug('Modal body overflow:', getComputedStyle(modalBody).overflow);
          logger.debug('Modal body bounding rect:', modalBody.getBoundingClientRect());
          logger.debug('Modal body scroll height:', modalBody.scrollHeight);
          logger.debug('Modal body scroll top:', modalBody.scrollTop);
        }
      } else {
        logger.debug('Layout element NOT found!');
      }
    }, 100);
    
    // Show scenario selection initially
    this.showScenarioSelection();
  }

  createMainLayout() {
    logger.debug('Creating main layout...');
    
    const layout = document.createElement('div');
    layout.className = 'ethics-explorer-layout';
    layout.innerHTML = `
      <header class="explorer-header">
        <div class="header-content">
          <h1>🎯 AI Ethics Explorer</h1>
          <p class="explorer-subtitle">Explore real-world AI scenarios and see the impact of your choices</p>
        </div>
        <div class="game-progress">
          <div class="progress-stats">
            <div class="stat-item">
              <span class="stat-value">${this.gameState.completedScenarios}</span>
              <span class="stat-label">Scenarios</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${this.gameState.insightsUnlocked}</span>
              <span class="stat-label">Insights</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">Level ${this.gameState.level}</span>
              <span class="stat-label">Explorer</span>
            </div>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${(this.gameState.completedScenarios / this.gameState.totalScenarios) * 100}%"></div>
          </div>
        </div>
      </header>
      
      <main class="explorer-main">
        <div class="scenario-area" id="scenario-area">
          <!-- Scenario content will be loaded here -->
        </div>
        
        <aside class="explorer-sidebar">
          <div class="achievements-panel">
            <h3>🏆 Your Progress</h3>
            <div class="badges-container" id="badges-container">
              <div class="badge-placeholder">Complete scenarios to earn badges!</div>
            </div>
          </div>
          
          <div class="exploration-history" id="exploration-history">
            <h3>🔍 Your Journey</h3>
            <div class="history-content">
              <p>Your exploration path will appear here as you make choices.</p>
            </div>
          </div>
          
          <div class="educator-panel">
            <h3>🎓 For Educators</h3>
            <div class="educator-resources">
              <button class="resource-btn" onclick="window.currentSimulation.showGuide('discussion')">
                💬 Discussion Guide
              </button>
              <button class="resource-btn" onclick="window.currentSimulation.showGuide('classroom')">
                📚 Activities
              </button>
            </div>
          </div>
        </aside>
      </main>
    `;
    
    logger.debug('Main layout HTML created, innerHTML length:', layout.innerHTML.length);
    logger.debug('Layout element:', layout);
    logger.debug('Layout classes:', layout.className);
    
    return layout;
  }

  showScenarioSelection() {
    const scenarioArea = document.getElementById('scenario-area');
    
    scenarioArea.innerHTML = `
      <div class="scenario-selection">
        <div class="selection-header">
          <h2>🚀 Choose Your AI Ethics Challenge</h2>
          <p class="selection-subtitle">Each scenario teaches you about real AI bias issues. Complete all 4 to become an Ethics Expert!</p>
        </div>
        
        <div class="scenarios-grid">
          ${this.scenarios.map(scenario => {
            // Ensure gameElements exists with default values
            if (!scenario.gameElements) {
              scenario.gameElements = {
                challenge: 'Explore AI ethics concepts',
                reward: 'Gain insights about fairness',
                progress: 0
              };
            }
            
            const isCompleted = scenario.gameElements.progress >= 100;
            const difficultyColor = scenario.difficulty === 'beginner' ? '#10b981' : '#f59e0b';
            
            return `
              <div class="scenario-card ${isCompleted ? 'completed' : ''}" 
                   onclick="window.currentSimulation.selectScenario('${scenario.id}')">
                <div class="card-header">
                  <div class="scenario-icon">${scenario.icon}</div>
                  <div class="difficulty-badge" style="background-color: ${difficultyColor}">
                    ${scenario.difficulty}
                  </div>
                  ${isCompleted ? '<div class="completion-badge">✅</div>' : ''}
                </div>
                
                <div class="card-content">
                  <h3>${scenario.title}</h3>
                  <p class="scenario-description">${scenario.description}</p>
                  <p class="scenario-context">${scenario.context}</p>
                  
                  <div class="challenge-info">
                    <div class="challenge-text">
                      <span class="challenge-label">🎯 Challenge:</span>
                      <span>${scenario.gameElements.challenge}</span>
                    </div>
                    <div class="reward-text">
                      <span class="reward-label">🎁 Reward:</span>
                      <span>${scenario.gameElements.reward}</span>
                    </div>
                  </div>
                  
                  <div class="scenario-progress">
                    <div class="progress-bar-small">
                      <div class="progress-fill-small" style="width: ${scenario.gameElements.progress}%"></div>
                    </div>
                    <span class="progress-text">${Math.round(scenario.gameElements.progress)}% Complete</span>
                  </div>
                </div>
                
                <div class="scenario-meta">
                  <span class="setting">📍 ${scenario.setting}</span>
                  <span class="stakeholders">👥 ${scenario.stakeholders.length} groups affected</span>
                </div>
                
                <div class="card-action">
                  <span class="action-text">${isCompleted ? '🔄 Explore Again' : '▶️ Start Challenge'}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        
        <div class="exploration-tips">
          <div class="tips-header">
            <h3>💡 How to Excel</h3>
          </div>
          <div class="tips-grid">
            <div class="tip-item">
              <span class="tip-icon">🎯</span>
              <div class="tip-content">
                <strong>Choose Thoughtfully</strong>
                <p>Each decision affects real people</p>
              </div>
            </div>
            <div class="tip-item">
              <span class="tip-icon">⚖️</span>
              <div class="tip-content">
                <strong>Consider Trade-offs</strong>
                <p>Perfect solutions rarely exist</p>
              </div>
            </div>
            <div class="tip-item">
              <span class="tip-icon">👥</span>
              <div class="tip-content">
                <strong>Think About Impact</strong>
                <p>Who benefits? Who might be harmed?</p>
              </div>
            </div>
            <div class="tip-item">
              <span class="tip-icon">🔄</span>
              <div class="tip-content">
                <strong>Try Different Approaches</strong>
                <p>Experiment with various solutions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Make simulation globally accessible for onclick handlers
    window.currentSimulation = this;
    
    // Update progress display
    this.updateProgressDisplay();
  }

  selectScenario(scenarioId) {
    this.currentScenario = this.scenarios.find(s => s.id === scenarioId);
    if (!this.currentScenario) return;
    
    logger.info(`Selected scenario: ${this.currentScenario.title}`);
    this.showScenarioExploration();
    this.updateEducatorResources();
  }

  showScenarioExploration() {
    const scenarioArea = document.getElementById('scenario-area');
    const scenario = this.currentScenario;
    
    // Calculate scenario progress
    const totalSteps = 4; // Context, Stakeholders, Choices, Consequences
    let currentStep = 1;
    if (Object.keys(this.currentChoices).length > 0) currentStep = 3;
    if (this.consequences.length > 0) currentStep = 4;
    
    scenarioArea.innerHTML = `
      <div class="scenario-exploration">
        <div class="scenario-header">
          <button class="back-btn" onclick="window.currentSimulation.showScenarioSelection()">← Back to Scenarios</button>
          <div class="scenario-title-section">
            <h2>${scenario.icon} ${scenario.title}</h2>
            <p class="scenario-setting">📍 ${scenario.setting}</p>
          </div>
          <div class="scenario-progress-indicator">
            <div class="progress-steps">
              <div class="step ${currentStep >= 1 ? 'completed' : ''}">
                <span class="step-number">1</span>
                <span class="step-label">Context</span>
              </div>
              <div class="step ${currentStep >= 2 ? 'completed' : ''}">
                <span class="step-number">2</span>
                <span class="step-label">Stakeholders</span>
              </div>
              <div class="step ${currentStep >= 3 ? 'completed' : ''} ${currentStep === 3 ? 'active' : ''}">
                <span class="step-number">3</span>
                <span class="step-label">Choices</span>
              </div>
              <div class="step ${currentStep >= 4 ? 'completed' : ''} ${currentStep === 4 ? 'active' : ''}">
                <span class="step-number">4</span>
                <span class="step-label">Results</span>
              </div>
            </div>
            <div class="progress-bar-header">
              <div class="progress-fill-header" style="width: ${(currentStep / totalSteps) * 100}%"></div>
            </div>
          </div>
        </div>
        
        <div class="scenario-context">
          <h3>📋 The Situation</h3>
          <p>${scenario.description}</p>
          <div class="context-metadata">
            <span class="difficulty-indicator ${scenario.difficulty}">
              ${scenario.difficulty === 'beginner' ? '🟢 Beginner' : '🟡 Intermediate'}
            </span>
            <span class="challenge-indicator">
              🎯 ${scenario.gameElements.challenge}
            </span>
          </div>
        </div>
        
        <div class="stakeholders-overview">
          <h3>👥 Who's Affected?</h3>
          <div class="stakeholders-list">
            ${scenario.stakeholders.map((stakeholder, index) => `
              <span class="stakeholder-tag" style="animation-delay: ${index * 0.1}s">
                ${stakeholder}
              </span>
            `).join('')}
          </div>
          <div class="stakeholder-count">
            <strong>${scenario.stakeholders.length}</strong> different groups will be impacted by your decisions
          </div>
        </div>
        
        <div class="choice-section" id="choice-section">
          ${this.generateChoiceSection()}
        </div>
        
        <div class="consequences-area" id="consequences-area">
          <!-- Consequences will appear here as choices are made -->
        </div>
        
        <div class="exploration-actions">
          <button class="action-btn primary" onclick="window.currentSimulation.exploreConsequences()" ${Object.keys(this.currentChoices).length === 0 ? 'disabled' : ''}>
            🔍 See What Happens
          </button>
          <button class="action-btn secondary" onclick="window.currentSimulation.resetChoices()">
            🔄 Try Different Choices
          </button>
          <button class="action-btn tertiary" onclick="window.currentSimulation.compareApproaches()">
            📊 Compare Approaches
          </button>
        </div>
      </div>
    `;
  }

  generateChoiceSection() {
    const choices = this.getScenarioChoices(this.currentScenario.id);
    
    return `
      <h3>Design Your AI System</h3>
      <p class="choice-instruction">Make choices about how this AI system should work. Consider the trade-offs carefully.</p>
      
      <div class="choices-container">
        ${choices.map((choice, index) => `
          <div class="choice-group">
            <h4>${choice.category}</h4>
            <p class="choice-explanation">${choice.explanation}</p>
            <div class="choice-options">
              ${choice.options.map((option, optionIndex) => `
                <label class="choice-option">
                  <input type="radio" name="choice-${index}" value="${optionIndex}" 
                         onchange="window.currentSimulation.recordChoice('${choice.category}', '${option.value}', '${option.label}')">
                  <div class="option-content">
                    <strong>${option.label}</strong>
                    <p>${option.description}</p>
                    <div class="option-implications">
                      <span class="pros">✓ ${option.pros}</span>
                      <span class="cons">⚠ ${option.cons}</span>
                    </div>
                  </div>
                </label>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  getScenarioChoices(scenarioId) {
    const choicesByScenario = {
      hiring: [
        {
          category: 'Training Data',
          explanation: 'What data should the AI learn from?',
          options: [
            {
              value: 'historical',
              label: 'Use Historical Hiring Data',
              description: 'Train the AI on past hiring decisions from the company',
              pros: 'Reflects company culture and proven success patterns',
              cons: 'May perpetuate past biases and discrimination'
            },
            {
              value: 'diverse',
              label: 'Use Diverse Industry Data',
              description: 'Train on data from multiple companies emphasizing diversity',
              pros: 'More inclusive and representative of broader talent pool',
              cons: 'May not align with specific company needs and culture'
            },
            {
              value: 'skills',
              label: 'Focus on Skills Data Only',
              description: 'Train primarily on technical skills and qualifications',
              pros: 'Reduces bias from personal characteristics',
              cons: 'May miss important soft skills and cultural fit'
            }
          ]
        },
        {
          category: 'Evaluation Criteria',
          explanation: 'What should the AI prioritize when evaluating candidates?',
          options: [
            {
              value: 'experience',
              label: 'Prioritize Experience',
              description: 'Focus heavily on years of experience and past roles',
              pros: 'Emphasizes proven track record and expertise',
              cons: 'May disadvantage career changers and younger candidates'
            },
            {
              value: 'potential',
              label: 'Prioritize Potential',
              description: 'Focus on learning ability and growth indicators',
              pros: 'More inclusive of diverse backgrounds and career paths',
              cons: 'Harder to measure and may be less predictive'
            },
            {
              value: 'balanced',
              label: 'Balanced Approach',
              description: 'Weight experience and potential equally',
              pros: 'Attempts to balance different candidate strengths',
              cons: 'May not excel at identifying any particular type of talent'
            }
          ]
        }
      ],
      lending: [
        {
          category: 'Risk Assessment',
          explanation: 'How should the AI assess loan default risk?',
          options: [
            {
              value: 'credit_score',
              label: 'Traditional Credit Score Focus',
              description: 'Heavily weight traditional credit scores and history',
              pros: 'Uses established financial indicators',
              cons: 'May exclude those with limited credit history'
            },
            {
              value: 'alternative',
              label: 'Alternative Data Sources',
              description: 'Include rent payments, utility bills, and banking patterns',
              pros: 'More inclusive of underbanked populations',
              cons: 'Less proven predictive power'
            },
            {
              value: 'income_focused',
              label: 'Income Stability Focus',
              description: 'Prioritize steady income over credit history',
              pros: 'Emphasizes ability to repay rather than past mistakes',
              cons: 'May miss important risk indicators'
            }
          ]
        }
      ],
      healthcare: [
        {
          category: 'Triage Priority',
          explanation: 'How should the AI prioritize patient care?',
          options: [
            {
              value: 'severity',
              label: 'Medical Severity Only',
              description: 'Focus purely on medical urgency and severity',
              pros: 'Most medically objective approach',
              cons: 'May not account for social determinants of health'
            },
            {
              value: 'equity',
              label: 'Health Equity Focused',
              description: 'Consider social factors and historical healthcare access',
              pros: 'Addresses healthcare disparities',
              cons: 'May complicate medical decision-making'
            },
            {
              value: 'predictive',
              label: 'Outcome Prediction',
              description: 'Prioritize based on predicted treatment success',
              pros: 'Maximizes overall positive outcomes',
              cons: 'May discriminate against sicker or older patients'
            }
          ]
        }
      ],
      education: [
        {
          category: 'Learning Personalization',
          explanation: 'How should the AI adapt to different students?',
          options: [
            {
              value: 'performance',
              label: 'Academic Performance Based',
              description: 'Adapt based on test scores and grades',
              pros: 'Clear metrics for academic progress',
              cons: 'May reinforce existing achievement gaps'
            },
            {
              value: 'style',
              label: 'Learning Style Focused',
              description: 'Adapt to different learning preferences and styles',
              pros: 'Recognizes diverse ways of learning',
              cons: 'Learning styles research has mixed scientific support'
            },
            {
              value: 'holistic',
              label: 'Holistic Student Profile',
              description: 'Consider academic, social, and emotional factors',
              pros: 'Supports whole student development',
              cons: 'Complex to implement and may raise privacy concerns'
            }
          ]
        }
      ]
    };
    
    return choicesByScenario[scenarioId] || [];
  }

  recordChoice(category, value, label) {
    this.currentChoices[category] = { value, label };
    logger.debug(`Choice recorded: ${category} = ${label}`);
    
    // Enable the "See What Happens" button when choices are made
    const exploreBtn = document.querySelector('.action-btn.primary');
    if (exploreBtn && Object.keys(this.currentChoices).length > 0) {
      exploreBtn.disabled = false;
      exploreBtn.style.opacity = '1';
    }
  }

  exploreConsequences() {
    if (Object.keys(this.currentChoices).length === 0) {
      alert('Please make some choices first!');
      return;
    }
    
    const consequences = this.generateConsequences();
    this.consequences = consequences;
    this.displayConsequences(consequences);
    this.updateExplorationHistory();
    this.updatePerspectives();
  }

  generateConsequences() {
    const scenario = this.currentScenario;
    const choices = this.currentChoices;
    
    // Generate realistic consequences based on choices
    const consequences = {
      immediate: [],
      longTerm: [],
      unintended: [],
      stakeholderImpacts: {}
    };
    
    // Initialize stakeholder impacts
    scenario.stakeholders.forEach(stakeholder => {
      consequences.stakeholderImpacts[stakeholder] = {
        positive: [],
        negative: [],
        neutral: []
      };
    });
    
    // Generate consequences based on scenario and choices
    if (scenario.id === 'hiring') {
      if (choices['Training Data']?.value === 'historical') {
        consequences.immediate.push('The AI quickly learns company preferences and processes applications efficiently');
        consequences.longTerm.push('Hiring patterns remain similar to past practices');
        consequences.unintended.push('Qualified candidates from underrepresented groups may be overlooked');
        
        consequences.stakeholderImpacts['Job applicants'].negative.push('Some groups may face systemic disadvantages');
        consequences.stakeholderImpacts['Company shareholders'].positive.push('Consistent hiring patterns and reduced training costs');
      }
      
      if (choices['Evaluation Criteria']?.value === 'experience') {
        consequences.immediate.push('Senior candidates are prioritized in the selection process');
        consequences.longTerm.push('Company builds deep expertise but may lack fresh perspectives');
        consequences.unintended.push('Career changers and recent graduates face barriers');
        
        consequences.stakeholderImpacts['Job applicants'].negative.push('Younger and career-changing candidates disadvantaged');
        consequences.stakeholderImpacts['HR managers'].positive.push('Easier to justify hiring decisions based on clear experience metrics');
      }
    }
    
    // Add more scenario-specific consequences...
    
    return consequences;
  }

  displayConsequences(consequences) {
    const consequencesArea = document.getElementById('consequences-area');
    
    consequencesArea.innerHTML = `
      <div class="consequences-display">
        <h3>🔍 What Happens: Consequences of Your Choices</h3>
        
        <div class="consequences-timeline">
          <div class="consequence-category">
            <h4>⚡ Immediate Effects</h4>
            <ul>
              ${consequences.immediate.map(effect => `<li>${effect}</li>`).join('')}
            </ul>
          </div>
          
          <div class="consequence-category">
            <h4>📈 Long-term Impacts</h4>
            <ul>
              ${consequences.longTerm.map(impact => `<li>${impact}</li>`).join('')}
            </ul>
          </div>
          
          <div class="consequence-category">
            <h4>⚠️ Unintended Consequences</h4>
            <ul>
              ${consequences.unintended.map(consequence => `<li>${consequence}</li>`).join('')}
            </ul>
          </div>
        </div>
        
        <div class="stakeholder-impacts">
          <h4>👥 Impact on Different Groups</h4>
          <div class="stakeholder-grid">
            ${Object.entries(consequences.stakeholderImpacts).map(([stakeholder, impacts]) => `
              <div class="stakeholder-impact">
                <h5>${stakeholder}</h5>
                ${impacts.positive.length > 0 ? `
                  <div class="impact-positive">
                    <strong>Positive:</strong>
                    <ul>${impacts.positive.map(p => `<li>${p}</li>`).join('')}</ul>
                  </div>
                ` : ''}
                ${impacts.negative.length > 0 ? `
                  <div class="impact-negative">
                    <strong>Challenges:</strong>
                    <ul>${impacts.negative.map(n => `<li>${n}</li>`).join('')}</ul>
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="reflection-prompts">
          <h4>🤔 Think About It</h4>
          <div class="prompts-list">
            <p>• How might these outcomes affect different communities?</p>
            <p>• What trade-offs did your choices create?</p>
            <p>• How could the system be improved?</p>
            <p>• What would you do differently and why?</p>
          </div>
        </div>
        
        <div class="scenario-completion">
          <button class="action-btn success" onclick="window.currentSimulation.completeScenario()">
            ✨ Complete This Challenge
          </button>
        </div>
      </div>
    `;
  }

  updateExplorationHistory() {
    const historyElement = document.querySelector('#exploration-history .history-content');
    const entry = {
      scenario: this.currentScenario.title,
      choices: { ...this.currentChoices },
      consequences: this.consequences,
      timestamp: new Date().toLocaleTimeString()
    };
    
    this.explorationHistory.push(entry);
    
    historyElement.innerHTML = `
      <div class="history-entries">
        ${this.explorationHistory.map((entry, _index) => `
          <div class="history-entry">
            <div class="entry-header">
              <strong>${entry.scenario}</strong>
              <span class="timestamp">${entry.timestamp}</span>
            </div>
            <div class="entry-summary">
              ${Object.entries(entry.choices).map(([category, choice]) => `
                <span class="choice-tag">${category}: ${choice.label}</span>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  updatePerspectives() {
    const perspectivesElement = document.querySelector('#perspective-panel .perspectives-content');
    
    perspectivesElement.innerHTML = `
      <div class="perspectives-content">
        <p>Consider these different viewpoints on your AI system:</p>
        
        <div class="perspective-cards">
          <div class="perspective-card">
            <h5>🔍 Ethicist's View</h5>
            <p>Focus on fairness, transparency, and avoiding harm to vulnerable groups.</p>
          </div>
          
          <div class="perspective-card">
            <h5>💼 Business View</h5>
            <p>Consider efficiency, cost-effectiveness, and legal compliance.</p>
          </div>
          
          <div class="perspective-card">
            <h5>👥 Community View</h5>
            <p>Think about social impact and whether the system serves everyone fairly.</p>
          </div>
          
          <div class="perspective-card">
            <h5>⚖️ Legal View</h5>
            <p>Ensure compliance with anti-discrimination laws and regulations.</p>
          </div>
        </div>
      </div>
    `;
  }

  resetChoices() {
    this.currentChoices = {};
    this.consequences = [];
    
    // Reset the choice section
    const choiceSection = document.getElementById('choice-section');
    choiceSection.innerHTML = this.generateChoiceSection();
    
    // Clear consequences
    const consequencesArea = document.getElementById('consequences-area');
    consequencesArea.innerHTML = '';
    
    // Disable explore button
    const exploreBtn = document.querySelector('.action-btn.primary');
    if (exploreBtn) {
      exploreBtn.disabled = true;
      exploreBtn.style.opacity = '0.6';
    }
  }

  compareApproaches() {
    // Show a comparison interface for different approaches
    const scenarioArea = document.getElementById('scenario-area');
    
    scenarioArea.innerHTML = `
      <div class="comparison-view">
        <div class="comparison-header">
          <button class="back-btn" onclick="window.currentSimulation.showScenarioExploration()">← Back to Exploration</button>
          <h2>Compare Different Approaches</h2>
          <p>See how different choices lead to different outcomes</p>
        </div>
        
        <div class="comparison-content">
          <p>This feature allows you to compare multiple approaches side-by-side.</p>
          <p>Try different combinations of choices and see how they affect various stakeholders.</p>
          
          <div class="comparison-tips">
            <h4>💡 Comparison Ideas</h4>
            <ul>
              <li>Compare bias-focused vs. efficiency-focused approaches</li>
              <li>See how different data sources affect outcomes</li>
              <li>Examine trade-offs between different stakeholder groups</li>
              <li>Explore the tension between individual and group fairness</li>
            </ul>
          </div>
          
          <button class="action-btn primary" onclick="window.currentSimulation.showScenarioExploration()">
            Continue Exploring
          </button>
        </div>
      </div>
    `;
  }

  updateEducatorResources() {
    // This would be expanded with actual educator resources
    logger.debug('Educator resources updated for scenario:', this.currentScenario?.title);
  }

  showGuide(guideType) {
    // Show educator guides
    const guides = {
      discussion: {
        title: 'Discussion Guide',
        content: `
          <h4>Discussion Questions</h4>
          <ul>
            <li>What values should guide AI decision-making?</li>
            <li>How do we balance fairness for individuals vs. groups?</li>
            <li>What role should humans play in AI systems?</li>
            <li>How can we make AI systems more transparent?</li>
          </ul>
        `
      },
      classroom: {
        title: 'Classroom Activities',
        content: `
          <h4>Activity Ideas</h4>
          <ul>
            <li>Role-play different stakeholder perspectives</li>
            <li>Design alternative AI systems in small groups</li>
            <li>Research real-world AI bias cases</li>
            <li>Create ethical guidelines for AI development</li>
          </ul>
        `
      },
      assessment: {
        title: 'Assessment Ideas',
        content: `
          <h4>Assessment Approaches</h4>
          <ul>
            <li>Reflection essays on ethical dilemmas</li>
            <li>Group presentations on stakeholder impacts</li>
            <li>Design proposals for ethical AI systems</li>
            <li>Peer discussions and evaluations</li>
          </ul>
        `
      }
    };
    
    const guide = guides[guideType];
    if (!guide) return;
    
    // Create modal for guide
    const modal = document.createElement('div');
    modal.className = 'educator-modal';
    modal.innerHTML = `
      <div class="modal-overlay" onclick="document.body.removeChild(this.parentElement)"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>${guide.title}</h3>
          <button class="modal-close" onclick="document.body.removeChild(this.parentElement)">&times;</button>
        </div>
        <div class="modal-body">
          ${guide.content}
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  // Integration with educational modules
  get supportsGeneratedScenarios() {
    return true; // This simulation can use generated scenarios
  }

  /**
   * Initialize with connected educational modules
   */
  initializeEducationalFeatures() {
    // Use scenario generator if available
    if (this.scenarioGenerator) {
      try {
        const generatedScenarios = this.scenarioGenerator.generateScenarios('ethics', 'beginner', 2);
        if (generatedScenarios && generatedScenarios.length > 0) {
          // Ensure generated scenarios have proper gameElements structure
          generatedScenarios.forEach(scenario => {
            if (!scenario.gameElements) {
              scenario.gameElements = {
                challenge: scenario.challenge || 'Explore AI ethics concepts',
                reward: scenario.reward || 'Gain insights about fairness',
                progress: 0
              };
            }
            // Add missing properties for consistency
            if (!scenario.icon) scenario.icon = '🤖';
            if (!scenario.difficulty) scenario.difficulty = 'beginner';
          });
          
          // Add generated scenarios to existing ones
          this.scenarios.push(...generatedScenarios);
          logger.info('Added generated scenarios:', generatedScenarios.length);
        }
      } catch (error) {
        logger.error('Error generating scenarios:', error);
      }
    }

    // Setup educator resources if toolkit is available
    if (this.educatorToolkit) {
      this.setupEducatorIntegration();
    }

    // Setup lab station integration if available
    if (this.digitalScienceLab) {
      this.setupLabStationIntegration();
    }
  }

  /**
   * Setup educator toolkit integration
   */
  setupEducatorIntegration() {
    if (!this.educatorToolkit) return;

    // Add educator resources to the UI
    this.educatorResources = {
      curriculumAlignment: this.curriculumAlignment || [],
      assessmentTools: this.assessmentTools || [],
      lessonPlans: this.educatorToolkit.generateLessonPlan({
        scenario: 'bias-fairness',
        gradeLevel: '6-12',
        duration: 50
      })
    };

    logger.info('Educator toolkit integrated with simulation');
  }

  /**
   * Complete the current scenario and update game progress
   */
  completeScenario() {
    if (!this.currentScenario) return;
    
    const scenario = this.currentScenario;
    
    // Mark scenario as completed
    scenario.gameElements.progress = 100;
    
    // Update game state
    const wasCompleted = this.gameState.completedScenarios;
    const uniqueCompletedScenarios = new Set(this.scenarios.filter(s => s.gameElements.progress >= 100).map(s => s.id));
    this.gameState.completedScenarios = uniqueCompletedScenarios.size;
    this.gameState.totalChoices += Object.keys(this.currentChoices).length;
    this.gameState.insightsUnlocked += 1;
    
    // Award badge for completing scenario
    const badge = this.createBadge(scenario);
    if (badge && !this.gameState.badges.find(b => b.id === badge.id)) {
      this.gameState.badges.push(badge);
    }
    
    // Level up logic
    if (this.gameState.completedScenarios > wasCompleted) {
      this.checkLevelUp();
    }
    
    // Show completion feedback with visual effects
    this.showCompletionFeedback(scenario, badge);
    
    // Update progress display
    this.updateProgressDisplay();
    
    logger.info(`Scenario completed: ${scenario.title}`, {
      gameState: this.gameState,
      badge
    });
  }

  /**
   * Create a badge for completing a scenario
   */
  createBadge(scenario) {
    const badges = {
      'hiring': {
        id: 'hiring-explorer',
        title: 'Hiring Expert',
        icon: '🎯',
        description: 'Explored the complexities of fair AI hiring practices',
        color: '#10b981'
      },
      'lending': {
        id: 'lending-explorer',
        title: 'Financial Fairness Advocate',
        icon: '⚖️',
        description: 'Examined bias in AI lending decisions',
        color: '#3b82f6'
      },
      'healthcare': {
        id: 'healthcare-explorer',
        title: 'Healthcare Equity Champion',
        icon: '🏥',
        description: 'Investigated fairness in medical AI systems',
        color: '#ef4444'
      },
      'education': {
        id: 'education-explorer',
        title: 'Learning Advocate',
        icon: '🎓',
        description: 'Explored personalized AI in education',
        color: '#8b5cf6'
      }
    };
    
    return badges[scenario.id] || null;
  }

  /**
   * Check if the user should level up
   */
  checkLevelUp() {
    const newLevel = Math.floor(this.gameState.completedScenarios / 2) + 1;
    if (newLevel > this.gameState.level) {
      this.gameState.level = newLevel;
      this.showLevelUpFeedback(newLevel);
    }
  }

  /**
   * Show visual feedback for scenario completion
   */
  showCompletionFeedback(scenario, badge) {
    const feedbackHtml = `
      <div class="completion-feedback" id="completion-feedback">
        <div class="feedback-content">
          <div class="feedback-header">
            <h2>🎉 Challenge Complete!</h2>
            <div class="scenario-icon-large">${scenario.icon}</div>
          </div>
          
          <div class="feedback-body">
            <h3>${scenario.title}</h3>
            <p class="completion-message">You've successfully explored this AI ethics scenario!</p>
            
            ${badge ? `
              <div class="badge-earned">
                <div class="badge-display">
                  <span class="badge-icon" style="background-color: ${badge.color}">${badge.icon}</span>
                  <div class="badge-info">
                    <strong>${badge.title}</strong>
                    <p>${badge.description}</p>
                  </div>
                </div>
              </div>
            ` : ''}
            
            <div class="progress-summary">
              <div class="progress-stat">
                <span class="stat-number">${this.gameState.completedScenarios}</span>
                <span class="stat-label">of ${this.gameState.totalScenarios} scenarios</span>
              </div>
              <div class="progress-stat">
                <span class="stat-number">${this.gameState.insightsUnlocked}</span>
                <span class="stat-label">insights unlocked</span>
              </div>
            </div>
          </div>
          
          <div class="feedback-actions">
            ${this.gameState.completedScenarios < this.gameState.totalScenarios ? `
              <button class="action-btn primary" onclick="window.currentSimulation.dismissFeedback(); window.currentSimulation.showScenarioSelection();">
                🚀 Next Challenge
              </button>
            ` : `
              <button class="action-btn success" onclick="window.currentSimulation.showFinalCelebration();">
                🏆 View Final Results
              </button>
            `}
            <button class="action-btn secondary" onclick="window.currentSimulation.dismissFeedback();">
              📊 View Progress
            </button>
          </div>
        </div>
      </div>
    `;
    
    // Add feedback to the page
    const { body } = document;
    const feedbackElement = document.createElement('div');
    feedbackElement.innerHTML = feedbackHtml;
    body.appendChild(feedbackElement.firstElementChild);
    
    // Add visual effects
    this.addCompletionEffects();
  }

  /**
   * Show level up feedback
   */
  showLevelUpFeedback(newLevel) {
    const levelTitles = {
      1: 'Ethics Beginner',
      2: 'Bias Detective',
      3: 'Fairness Expert',
      4: 'Ethics Master'
    };
    
    const levelFeedback = `
      <div class="level-up-notification" id="level-up-notification">
        <div class="level-up-content">
          <h3>🎊 Level Up!</h3>
          <div class="level-display">
            <span class="level-number">Level ${newLevel}</span>
            <span class="level-title">${levelTitles[newLevel] || 'Ethics Expert'}</span>
          </div>
        </div>
      </div>
    `;
    
    const { body } = document;
    const levelElement = document.createElement('div');
    levelElement.innerHTML = levelFeedback;
    body.appendChild(levelElement.firstElementChild);
    
    // Auto-remove after animation
    setTimeout(() => {
      const notification = document.getElementById('level-up-notification');
      if (notification) {
        notification.remove();
      }
    }, GAME_CONSTANTS.LEVEL_UP_NOTIFICATION_DURATION);
  }

  /**
   * Add visual effects for completion
   */
  addCompletionEffects() {
    // Simple confetti-like effect
    const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'];
    
    for (let i = 0; i < GAME_CONSTANTS.CONFETTI_COUNT; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.cssText = `
          position: fixed;
          width: 10px;
          height: 10px;
          background-color: ${colors[Math.floor(Math.random() * colors.length)]};
          left: ${Math.random() * window.innerWidth}px;
          top: -10px;
          z-index: 10000;
          pointer-events: none;
          animation: confetti-fall ${GAME_CONSTANTS.CONFETTI_ANIMATION_DURATION}ms ease-out forwards;
        `;
        
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), GAME_CONSTANTS.CONFETTI_ANIMATION_DURATION);
      }, i * GAME_CONSTANTS.CONFETTI_DELAY);
    }
    
    // Add confetti CSS if not already present
    if (!document.getElementById('confetti-styles')) {
      const style = document.createElement('style');
      style.id = 'confetti-styles';
      style.textContent = `
        @keyframes confetti-fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        .completion-feedback {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: feedback-appear 0.3s ease-out;
        }
        
        @keyframes feedback-appear {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .feedback-content {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          max-width: 500px;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        
        .scenario-icon-large {
          font-size: 4rem;
          margin: 1rem 0;
        }
        
        .badge-earned {
          margin: 1.5rem 0;
          padding: 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 15px;
          color: white;
        }
        
        .badge-display {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .badge-icon {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
        }
        
        .progress-summary {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin: 1.5rem 0;
        }
        
        .progress-stat {
          text-align: center;
        }
        
        .stat-number {
          display: block;
          font-size: 2rem;
          font-weight: bold;
          color: #667eea;
        }
        
        .feedback-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 2rem;
        }
        
        .level-up-notification {
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #ffd700, #ffed4e);
          color: #333;
          padding: 1rem 2rem;
          border-radius: 15px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          z-index: 10001;
          animation: level-up-slide 0.5s ease-out;
        }
        
        @keyframes level-up-slide {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        .level-display {
          text-align: center;
        }
        
        .level-number {
          display: block;
          font-size: 1.5rem;
          font-weight: bold;
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Dismiss completion feedback
   */
  dismissFeedback() {
    const feedback = document.getElementById('completion-feedback');
    if (feedback) {
      feedback.remove();
    }
  }

  /**
   * Show final celebration when all scenarios are complete
   */
  showFinalCelebration() {
    this.dismissFeedback();
    
    const scenarioArea = document.getElementById('scenario-area');
    scenarioArea.innerHTML = `
      <div class="final-celebration">
        <div class="celebration-header">
          <h1>🏆 Congratulations, Ethics Expert!</h1>
          <p class="celebration-subtitle">You've completed all AI Ethics Explorer challenges!</p>
        </div>
        
        <div class="achievement-summary">
          <div class="achievement-stats">
            <div class="big-stat">
              <span class="big-number">${this.gameState.totalScenarios}</span>
              <span class="big-label">Scenarios Mastered</span>
            </div>
            <div class="big-stat">
              <span class="big-number">${this.gameState.badges.length}</span>
              <span class="big-label">Badges Earned</span>
            </div>
            <div class="big-stat">
              <span class="big-number">Level ${this.gameState.level}</span>
              <span class="big-label">Expert Level</span>
            </div>
          </div>
          
          <div class="badges-showcase">
            <h3>Your Badges</h3>
            <div class="badges-grid">
              ${this.gameState.badges.map(badge => `
                <div class="badge-showcase">
                  <div class="badge-icon-large" style="background-color: ${badge.color}">
                    ${badge.icon}
                  </div>
                  <h4>${badge.title}</h4>
                  <p>${badge.description}</p>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="next-steps">
            <h3>What's Next?</h3>
            <div class="next-actions">
              <button class="action-btn primary" onclick="window.currentSimulation.showScenarioSelection()">
                🔄 Explore Again
              </button>
              <button class="action-btn secondary" onclick="window.currentSimulation.showGuide('certificate')">
                📜 Get Certificate
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add celebration effects
    this.addCelebrationEffects();
  }

  /**
   * Add celebration effects for final completion
   */
  addCelebrationEffects() {
    // More intense confetti for final celebration
    const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#f7b801', '#fc5c65'];
    
    for (let i = 0; i < GAME_CONSTANTS.CELEBRATION_CONFETTI_COUNT; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece celebration';
        const size = GAME_CONSTANTS.MIN_CONFETTI_SIZE + Math.random() * GAME_CONSTANTS.MAX_CONFETTI_SIZE;
        confetti.style.cssText = `
          position: fixed;
          width: ${size}px;
          height: ${size}px;
          background-color: ${colors[Math.floor(Math.random() * colors.length)]};
          left: ${Math.random() * window.innerWidth}px;
          top: -20px;
          z-index: 10000;
          pointer-events: none;
          border-radius: 50%;
          animation: celebration-confetti ${GAME_CONSTANTS.CELEBRATION_ANIMATION_DURATION}ms ease-out forwards;
        `;
        
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), GAME_CONSTANTS.CELEBRATION_ANIMATION_DURATION);
      }, i * GAME_CONSTANTS.CELEBRATION_CONFETTI_DELAY);
    }
    
    // Add celebration CSS
    if (!document.getElementById('celebration-styles')) {
      const style = document.createElement('style');
      style.id = 'celebration-styles';
      style.textContent = `
        @keyframes celebration-confetti {
          to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        .final-celebration {
          text-align: center;
          padding: 2rem;
          animation: celebration-entrance 0.8s ease-out;
        }
        
        @keyframes celebration-entrance {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .celebration-header h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          background: linear-gradient(45deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .achievement-stats {
          display: flex;
          justify-content: center;
          gap: 3rem;
          margin: 2rem 0;
        }
        
        .big-stat {
          text-align: center;
        }
        
        .big-number {
          display: block;
          font-size: 3rem;
          font-weight: bold;
          color: #667eea;
        }
        
        .big-label {
          font-size: 1.1rem;
          color: #666;
        }
        
        .badges-showcase {
          margin: 3rem 0;
        }
        
        .badges-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
          margin: 2rem 0;
        }
        
        .badge-showcase {
          padding: 1.5rem;
          border-radius: 15px;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }
        
        .badge-icon-large {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          margin: 0 auto 1rem;
          color: white;
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        .next-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 2rem;
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Update the progress display throughout the UI
   */
  updateProgressDisplay() {
    // Update header progress
    const progressStats = document.querySelectorAll('.progress-stats .stat-value');
    if (progressStats.length >= GAME_CONSTANTS.PROGRESS_STATS_COUNT) {
      progressStats[0].textContent = this.gameState.completedScenarios;
      progressStats[1].textContent = this.gameState.insightsUnlocked;
      progressStats[2].textContent = `Level ${this.gameState.level}`;
    }
    
    // Update progress bar
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
      const percentage = (this.gameState.completedScenarios / this.gameState.totalScenarios) * 100;
      progressFill.style.width = `${percentage}%`;
    }
    
    // Update badges display
    this.updateBadgesDisplay();
    
    // Update scenario cards completion status
    this.updateScenarioCardsDisplay();
  }

  /**
   * Update the badges display in the sidebar
   */
  updateBadgesDisplay() {
    const badgesContainer = document.getElementById('badges-container');
    if (!badgesContainer) return;
    
    if (this.gameState.badges.length === 0) {
      badgesContainer.innerHTML = '<div class="badge-placeholder">Complete scenarios to earn badges!</div>';
      return;
    }
    
    badgesContainer.innerHTML = `
      <div class="earned-badges">
        ${this.gameState.badges.map(badge => `
          <div class="earned-badge" title="${badge.description}">
            <div class="badge-icon-small" style="background-color: ${badge.color}">
              ${badge.icon}
            </div>
            <span class="badge-title">${badge.title}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Update scenario cards to show completion status
   */
  updateScenarioCardsDisplay() {
    const scenarioCards = document.querySelectorAll('.scenario-card');
    scenarioCards.forEach(card => {
      const scenarioId = card.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
      if (scenarioId) {
        const scenario = this.scenarios.find(s => s.id === scenarioId);
        if (scenario && scenario.gameElements.progress >= 100) {
          card.classList.add('completed');
          
          // Update progress bar
          const progressFill = card.querySelector('.progress-fill-small');
          if (progressFill) {
            progressFill.style.width = '100%';
          }
          
          // Update progress text
          const progressText = card.querySelector('.progress-text');
          if (progressText) {
            progressText.textContent = '100% Complete';
          }
          
          // Update action text
          const actionText = card.querySelector('.action-text');
          if (actionText) {
            actionText.textContent = '🔄 Explore Again';
          }
        }
      }
    });
  }

  /**
   * Setup digital science lab integration
   */
  setupLabStationIntegration() {
    if (!this.digitalScienceLab || !this.labStations) return;

    // Add lab station activities to the simulation
    this.labActivities = this.labStations.map(station => ({
      stationName: station.name,
      purpose: station.purpose,
      tools: station.tools,
      experiments: station.experiments
    }));

    logger.info('Digital science lab integrated with simulation');
  }

  // Required methods from parent class
  cleanup() {
    logger.debug('BiasExplorerSimulation cleanup');
    if (this.container) {
      this.container.innerHTML = '';
    }
    // Clean up global reference
    if (window.currentSimulation === this) {
      delete window.currentSimulation;
    }
  }

  reset() {
    this.currentScenario = null;
    this.explorationHistory = [];
    this.currentChoices = {};
    this.consequences = [];
    this.setupUI();
  }

  emit(eventName, data = {}) {
    logger.debug(`Event: ${eventName}`, data);
  }
}

export default BiasExplorerSimulation;
