/**
 * AI Ethics Simulation: Bias and Fairness Explorer
 * An open-ended exploration of AI bias in real-world scenarios
 * Educational tool for all ages with no "correct" answers
 */

import EthicsSimulation from '../core/simulation.js';
import logger from '../utils/logger.js';
import { TIMING } from '../utils/constants.js';

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

    // Real-world scenarios for exploration
    this.scenarios = [
      {
        id: 'hiring',
        title: 'AI Hiring Assistant',
        context: 'A company uses AI to screen job applications',
        description: 'Help TechCorp design their AI hiring system. Your choices will affect who gets interviewed.',
        setting: 'Corporate recruiting department',
        stakeholders: ['Job applicants', 'HR managers', 'Company shareholders', 'Society']
      },
      {
        id: 'lending',
        title: 'Smart Loan Approval',
        context: 'A bank uses AI to approve or deny loans',
        description: 'Design an AI system for CommunityBank that decides who gets loans for homes and businesses.',
        setting: 'Community bank serving diverse neighborhoods',
        stakeholders: ['Loan applicants', 'Bank customers', 'Local community', 'Bank investors']
      },
      {
        id: 'healthcare',
        title: 'Medical AI Assistant',
        context: 'An AI helps doctors prioritize patient care',
        description: 'Create an AI system that helps doctors decide which patients need immediate attention.',
        setting: 'Busy urban hospital emergency room',
        stakeholders: ['Patients', 'Medical staff', 'Hospital administration', 'Insurance companies']
      },
      {
        id: 'education',
        title: 'Personalized Learning AI',
        context: 'An AI system personalizes education for students',
        description: 'Design an AI tutor that adapts to different learning styles and backgrounds.',
        setting: 'Public school with diverse student population',
        stakeholders: ['Students', 'Teachers', 'Parents', 'School administrators']
      }
    ];

    // Current exploration state
    this.currentScenario = null;
    this.explorationHistory = [];
    this.currentChoices = {};
    this.consequences = [];
    
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
        <h1>AI Ethics Explorer</h1>
        <p class="explorer-subtitle">Explore real-world AI scenarios and see the impact of your choices</p>
      </header>
      
      <main class="explorer-main">
        <div class="scenario-area" id="scenario-area">
          <!-- Scenario content will be loaded here -->
        </div>
        
        <aside class="explorer-sidebar">
          <div class="educator-panel">
            <h3>🎓 For Educators</h3>
            <div class="educator-resources">
              <button class="resource-btn" onclick="this.showGuide('discussion')">
                Discussion Guide
              </button>
              <button class="resource-btn" onclick="this.showGuide('classroom')">
                Classroom Activities
              </button>
              <button class="resource-btn" onclick="this.showGuide('assessment')">
                Assessment Ideas
              </button>
            </div>
          </div>
          
          <div class="exploration-history" id="exploration-history">
            <h3>🔍 Your Exploration</h3>
            <div class="history-content">
              <p>Your choices and their consequences will appear here as you explore.</p>
            </div>
          </div>
          
          <div class="perspective-panel" id="perspective-panel">
            <h3>👥 Multiple Perspectives</h3>
            <div class="perspectives-content">
              <p>Consider how different groups might be affected by AI decisions.</p>
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
        <h2>Choose a Real-World AI Scenario to Explore</h2>
        <p class="selection-subtitle">Each scenario presents real challenges faced by organizations using AI. There are no "right" answers - just explore and learn!</p>
        
        <div class="scenarios-grid">
          ${this.scenarios.map(scenario => `
            <div class="scenario-card" onclick="window.currentSimulation.selectScenario('${scenario.id}')">
              <h3>${scenario.title}</h3>
              <p class="scenario-context">${scenario.context}</p>
              <p class="scenario-description">${scenario.description}</p>
              <div class="scenario-meta">
                <span class="setting">📍 ${scenario.setting}</span>
                <span class="stakeholders">👥 ${scenario.stakeholders.length} stakeholder groups</span>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="exploration-tips">
          <h3>💡 How to Explore</h3>
          <ul>
            <li>Choose a scenario that interests you</li>
            <li>Make decisions about how the AI system should work</li>
            <li>See how your choices affect different groups</li>
            <li>Try different approaches and compare outcomes</li>
            <li>Discuss with others - there's no single "correct" solution</li>
          </ul>
        </div>
      </div>
    `;
    
    // Make simulation globally accessible for onclick handlers
    window.currentSimulation = this;
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
    
    scenarioArea.innerHTML = `
      <div class="scenario-exploration">
        <div class="scenario-header">
          <button class="back-btn" onclick="window.currentSimulation.showScenarioSelection()">← Back to Scenarios</button>
          <h2>${scenario.title}</h2>
          <p class="scenario-setting">📍 ${scenario.setting}</p>
        </div>
        
        <div class="scenario-context">
          <h3>The Situation</h3>
          <p>${scenario.description}</p>
        </div>
        
        <div class="stakeholders-overview">
          <h3>Who's Affected?</h3>
          <div class="stakeholders-list">
            ${scenario.stakeholders.map(stakeholder => `
              <span class="stakeholder-tag">${stakeholder}</span>
            `).join('')}
          </div>
        </div>
        
        <div class="choice-section" id="choice-section">
          ${this.generateChoiceSection()}
        </div>
        
        <div class="consequences-area" id="consequences-area">
          <!-- Consequences will appear here as choices are made -->
        </div>
        
        <div class="exploration-actions">
          <button class="action-btn primary" onclick="window.currentSimulation.exploreConsequences()">
            See What Happens
          </button>
          <button class="action-btn secondary" onclick="window.currentSimulation.resetChoices()">
            Try Different Choices
          </button>
          <button class="action-btn tertiary" onclick="window.currentSimulation.compareApproaches()">
            Compare Approaches
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
