/**
 * Bias and Fairness Simulation
 * Explores algorithmic bias in hiring scenarios
 */

// Import required modules
import EthicsSimulation from '../core/simulation.js';
import CanvasManager from '../utils/canvas-manager.js';

// Simple helper functions
const Helpers = {
  random: {
    choice: (array) => array[Math.floor(Math.random() * array.length)]
  }
};

class BiasSimulation extends EthicsSimulation {  constructor(id) {
    super(id, {
      title: 'Algorithmic Bias in Hiring',
      description: 'Explore how AI systems can perpetuate bias in hiring decisions',
      learningObjectives: [
        'Understand how training data affects AI decisions',
        'Recognize different types of bias in AI systems',
        'Explore strategies for creating fairer algorithms'
      ],
      difficulty: 'intermediate',
      estimatedTime: 15
    });

    this.candidates = [];
    this.currentRound = 0;
    this.totalRounds = 5;
    this.biasSettings = {
      genderBias: 0.5,
      educationBias: 0.3,
      experienceBias: 0.7
    };
    
    // Canvas management
    this.canvasIds = {
      controls: null,
      metrics: null,
      analytics: null
    };
  }  // Override the base init method to match expected interface
  init(engineInstance) {
    console.log('BiasSimulation.init() called with engine:', engineInstance);
    
    this.engine = engineInstance;
    
    console.log('Generating candidates...');
    this.generateCandidates();
    console.log(`Generated ${this.candidates.length} candidates`);
    
    console.log('Setting up UI...');
    this.setupUI();
    console.log('UI setup completed');
    
    // Skip parent's UI setup since we have our own
    // Just do the basic initialization without UI components that expect specific engine config
    this.startTime = Date.now();
    this.emit('simulation:initialized');
    
    console.log('BiasSimulation initialization complete');
    return this;
  }
  generateCandidates() {
    try {
      const firstNames = {
        male: ['James', 'John', 'Robert', 'Michael', 'William'],
        female: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth']
      };

      const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'];
      const schools = ['State University', 'Community College', 'Ivy League', 'Technical Institute'];
      const positions = ['Junior Developer', 'Senior Developer', 'Team Lead'];

      this.candidates = [];
      for (let i = 0; i < 20; i++) {
        const gender = Math.random() > 0.5 ? 'male' : 'female';
        const firstName = Helpers.random.choice(firstNames[gender]);
        const lastName = Helpers.random.choice(lastNames);
        
        const candidate = {
          id: i,
          name: `${firstName} ${lastName}`,
          gender,
          education: Helpers.random.choice(schools),
          experience: Math.floor(Math.random() * 10) + 1,
          skills: Math.floor(Math.random() * 100) + 1,
          previousRole: Helpers.random.choice(positions),
          qualificationScore: Math.floor(Math.random() * 100) + 1
        };

        this.candidates.push(candidate);
      }
    } catch (error) {
      console.error('Error generating candidates:', error);
      this.candidates = []; // Fallback to empty array
    }
  }  setupUI() {
    console.log('BiasSimulation.setupUI() called');
    
    try {
      // Use enhanced objects from the visual engine if available
      if (this.engine && this.engine.createEthicsMeter) {
        console.log('Using enhanced UI');
        this.setupEnhancedUI();
      } else {
        console.log('Using basic UI fallback');
        this.setupBasicUI();
      }
      console.log('UI setup completed successfully');
    } catch (error) {
      console.error('Error setting up UI:', error);
      console.log('Falling back to basic UI');
      this.setupBasicUI(); // Fallback to basic UI
    }
  }
  setupEnhancedUI() {
    // Integration with Visual Engine and Enhanced Objects
    console.log('Setting up enhanced UI with visual engine');
    
    try {
      // Create main container
      const container = document.createElement('div');
      container.className = 'bias-simulation-enhanced';
      container.style.cssText = `
        display: grid;
        grid-template-columns: 300px 1fr 250px;
        gap: 20px;
        height: 100%;
        padding: 20px;
      `;

      // Enhanced ethics meters using visual engine
      this.setupEnhancedMeters(container);
      
      // Enhanced controls
      this.setupEnhancedControls(container);
      
      // Results display
      this.setupResultsDisplay(container);

      if (this.container) {
        console.log('Appending enhanced UI to container:', this.container);
        this.container.appendChild(container);
        console.log('Enhanced UI successfully appended');
      } else {
        console.error('No container available for enhanced UI, falling back to basic UI');
        this.setupBasicUI();
      }
    } catch (error) {
      console.error('Error setting up enhanced UI:', error);
      console.log('Falling back to basic UI');
      this.setupBasicUI();
    }
  }  setupEnhancedMeters(parentContainer) {
    try {
      const metersPanel = document.createElement('div');
      metersPanel.className = 'enhanced-meters-panel';
      metersPanel.innerHTML = `
        <h3>Bias Metrics</h3>
        <div class="metrics-display" id="metrics-container">
          <!-- Canvas will be created by canvas manager -->
        </div>
      `;

      // Create managed canvas for metrics
      const metricsContainer = metersPanel.querySelector('#metrics-container');
      if (!metricsContainer) {
        throw new Error('Metrics container not found');
      }

      const { canvas, id } = CanvasManager.createCanvas({
        width: 240,
        height: 300,
        container: metricsContainer,
        className: 'bias-metrics-canvas'
      });
      
      this.canvasIds.metrics = id;

      // Create visual engine for metrics
      this.createEnhancedBiasMeters(id);

      parentContainer.appendChild(metersPanel);
    } catch (error) {
      console.error('Error setting up enhanced meters:', error);
      // Create fallback UI
      const fallbackPanel = document.createElement('div');
      fallbackPanel.className = 'enhanced-meters-panel fallback';
      fallbackPanel.innerHTML = `
        <h3>Bias Metrics</h3>
        <div class="metrics-display-fallback">
          <p>Metrics will be displayed here</p>
        </div>
      `;
      parentContainer.appendChild(fallbackPanel);
    }
  }
  setupBasicUI() {
    console.log('BiasSimulation.setupBasicUI() called');
    
    try {
      // Create a simple UI compatibility layer for the engine
      this.ui = {
        createElement: (tag, options = {}) => {
          const element = document.createElement(tag);
          if (options.className) element.className = options.className;
          if (options.style) element.style.cssText = options.style;
          if (options.textContent) element.textContent = options.textContent;
          if (options.innerHTML) element.innerHTML = options.innerHTML;
          return element;
        },
        createPanel: (options = {}) => {
          const panel = document.createElement('div');
          panel.className = `panel ${options.className || ''}`;
          if (options.style) panel.style.cssText = options.style;
          if (options.title) {
            const title = document.createElement('h3');
            title.textContent = options.title;
            title.className = 'panel-title';
            panel.appendChild(title);
          }
          return panel;
        },
        createButton: (options = {}) => {
          const button = document.createElement('button');
          button.textContent = options.text || 'Button';
          button.className = `btn ${options.className || 'btn-primary'}`;
          if (options.onClick) button.addEventListener('click', options.onClick);
          return button;
        },
        createSlider: (options = {}) => {
          const container = document.createElement('div');
          container.className = 'slider-container';
          
          if (options.label) {
            const label = document.createElement('label');
            label.textContent = options.label;
            label.className = 'slider-label';
            container.appendChild(label);
          }
          
          const slider = document.createElement('input');
          slider.type = 'range';
          slider.min = options.min || 0;
          slider.max = options.max || 100;
          slider.step = options.step || 1;
          slider.value = options.value || 50;
          slider.className = 'slider-input';
          
          if (options.onChange) {
            slider.addEventListener('input', (e) => options.onChange(parseFloat(e.target.value)));
          }
            container.appendChild(slider);
          return { container, slider };
        },
        showFeedback: (options = {}) => {
          // Simple modal-like feedback system
          const modal = document.createElement('div');
          modal.className = 'feedback-modal';
          modal.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.7); display: flex; align-items: center;
            justify-content: center; z-index: 1000;
          `;
          
          const content = document.createElement('div');
          content.className = 'feedback-content';
          content.style.cssText = `
            background: white; padding: 30px; border-radius: 8px;
            max-width: 500px; margin: 20px; text-align: center;
          `;
          
          if (options.title) {
            const title = document.createElement('h3');
            title.textContent = options.title;
            content.appendChild(title);
          }
          
          if (options.message) {
            const message = document.createElement('p');
            message.style.whiteSpace = 'pre-line';
            message.textContent = options.message;
            content.appendChild(message);
          }
          
          if (options.actionText) {
            const button = document.createElement('button');
            button.textContent = options.actionText;
            button.className = 'btn btn-primary';
            button.style.marginTop = '20px';
            button.onclick = () => {
              document.body.removeChild(modal);
              if (options.onAction) options.onAction();
            };
            content.appendChild(button);
          }
          
          modal.appendChild(content);
          document.body.appendChild(modal);
          
          // Close on background click
          modal.onclick = (e) => {
            if (e.target === modal) {
              document.body.removeChild(modal);
            }
          };
        }
      };      // Get simulation container from engine
      this.container = this.engine.container || document.getElementById('simulation-container');
      
      console.log('Container set to:', this.container);
      
      if (!this.container) {
        console.error('No simulation container available');
        return;
      }

      const container = this.ui.createElement('div', {
        className: 'bias-simulation-container',
        style: 'display: flex; gap: 20px; height: 100%; padding: 20px;'
      });

    // Control Panel
    const controlPanel = this.ui.createPanel({
      title: 'Algorithm Settings',
      className: 'controls-panel',
      style: 'width: 300px;'
    });

    // Bias sliders
    Object.keys(this.biasSettings).forEach(biasType => {
      const slider = this.ui.createSlider({
        label: this.formatBiasLabel(biasType),
        min: 0,
        max: 1,
        step: 0.1,
        value: this.biasSettings[biasType],
        onChange: (value) => {
          this.biasSettings[biasType] = value;
          this.updateBiasDisplay();
        }
      });
      controlPanel.appendChild(slider.container);
    });

    // Run button
    const runButton = this.ui.createButton({
      text: 'Run Hiring Algorithm',
      onClick: () => this.runHiringRound(),
      className: 'primary-button'
    });
    controlPanel.appendChild(runButton);

    // Results Panel
    const resultsPanel = this.ui.createPanel({
      title: 'Hiring Results',
      className: 'results-panel',
      style: 'flex: 1;'
    });

    this.resultsContainer = this.ui.createElement('div', {
      className: 'results-container'
    });
    resultsPanel.appendChild(this.resultsContainer);

    // Statistics Panel
    const statsPanel = this.ui.createPanel({
      title: 'Bias Metrics',
      className: 'stats-panel',
      style: 'width: 250px;'
    });

    this.statsContainer = this.ui.createElement('div', {
      className: 'stats-container'
    });
    statsPanel.appendChild(this.statsContainer);    container.appendChild(controlPanel);
    container.appendChild(resultsPanel);
    container.appendChild(statsPanel);    // Ensure container is properly available
    if (this.container) {
      console.log('Appending UI to container:', this.container);
      this.container.appendChild(container);
      console.log('UI successfully appended to container');
    } else {
      console.error('Simulation container not available');
    }
    } catch (error) {
      console.error('Error setting up UI:', error);
    }
  }

  formatBiasLabel(biasType) {
    const labels = {
      genderBias: 'Gender Bias',
      educationBias: 'Education Bias',
      experienceBias: 'Experience Bias'
    };
    return labels[biasType] || biasType;
  }

  runHiringRound() {
    if (this.currentRound >= this.totalRounds) {
      this.showFinalResults();
      return;
    }

    const hired = this.simulateHiring();
    this.recordMetrics(hired);
    this.displayResults(hired);
    this.updateStatistics();
    
    this.currentRound++;
    
    // Trigger scenario event
    this.triggerEvent('hiringDecision', {
      round: this.currentRound,
      hired: hired.length,
      biasSettings: { ...this.biasSettings }
    });
  }

  simulateHiring() {
    const candidates = [...this.candidates];
    const positionsAvailable = 5;
    
    // Apply bias to scores
    candidates.forEach(candidate => {
      let biasedScore = candidate.qualificationScore;
      
      // Gender bias
      if (candidate.gender === 'male') {
        biasedScore += this.biasSettings.genderBias * 20;
      }
      
      // Education bias (favor prestigious schools)
      if (candidate.education === 'Ivy League') {
        biasedScore += this.biasSettings.educationBias * 15;
      }
      
      // Experience bias
      biasedScore += this.biasSettings.experienceBias * candidate.experience;
      
      candidate.biasedScore = Math.min(100, biasedScore);
    });
    
    // Sort by biased score and select top candidates
    candidates.sort((a, b) => b.biasedScore - a.biasedScore);
    return candidates.slice(0, positionsAvailable);
  }
  displayResults(hired) {
    const candidatesDisplay = document.getElementById('candidates-display');
    if (!candidatesDisplay) return;

    candidatesDisplay.innerHTML = '';
    
    // Update round progress
    this.updateRoundProgress();
    
    // Create interactive candidate cards
    hired.forEach((candidate, index) => {
      const candidateCard = this.createInteractiveCandidateCard(candidate, index);
      candidatesDisplay.appendChild(candidateCard);
    });
    
    // Add comparison with rejected candidates
    this.addRejectedCandidatesSection(candidatesDisplay, hired);
    
    // Update analytics chart
    this.updateAnalyticsChart();
    
    // Animate the new results
    this.animateResults();
  }

  createInteractiveCandidateCard(candidate, index) {
    const card = document.createElement('div');
    card.className = 'candidate-card interactive';
    card.setAttribute('data-candidate-id', candidate.id);
    
    // Calculate bias contribution
    const biasBreakdown = this.calculateBiasBreakdown(candidate);
    
    card.innerHTML = `
      <div class="candidate-header">
        <div class="candidate-avatar">
          <span class="avatar-icon">${candidate.gender === 'male' ? '👨' : '👩'}</span>
        </div>
        <div class="candidate-basic-info">
          <h4>${candidate.name}</h4>
          <p class="candidate-position">Rank #${index + 1}</p>
        </div>
        <div class="candidate-scores">
          <div class="score original">
            <span class="score-label">Merit</span>
            <span class="score-value">${candidate.qualificationScore}</span>
          </div>
          <div class="score biased">
            <span class="score-label">Algorithm</span>
            <span class="score-value">${Math.round(candidate.biasedScore)}</span>
          </div>
        </div>
      </div>
      
      <div class="candidate-details">
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">Education:</span>
            <span class="detail-value">${candidate.education}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Experience:</span>
            <span class="detail-value">${candidate.experience} years</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Previous Role:</span>
            <span class="detail-value">${candidate.previousRole}</span>
          </div>
        </div>
        
        <div class="bias-breakdown">
          <h5>Bias Analysis</h5>
          <div class="bias-factors">
            ${this.renderBiasFactors(biasBreakdown)}
          </div>
        </div>
        
        <button class="candidate-action-btn" onclick="window.app.currentSimulation.showCandidateDetails('${candidate.id}')">
          View Full Profile
        </button>
      </div>
    `;
    
    // Add hover effects and interactions
    this.addCandidateInteractions(card, candidate);
    
    return card;
  }

  calculateBiasBreakdown(candidate) {
    const breakdown = {
      gender: 0,
      education: 0,
      experience: 0,
      age: 0,
      total: candidate.biasedScore - candidate.qualificationScore
    };
    
    // Gender bias contribution
    if (candidate.gender === 'male') {
      breakdown.gender = this.biasSettings.genderBias * 20;
    }
    
    // Education bias contribution
    if (candidate.education === 'Ivy League') {
      breakdown.education = this.biasSettings.educationBias * 15;
    }
    
    // Experience bias contribution
    breakdown.experience = this.biasSettings.experienceBias * candidate.experience;
    
    // Age bias contribution (simulate age data)
    const simulatedAge = 22 + candidate.experience + Math.random() * 10;
    if (simulatedAge < 30) {
      breakdown.age = this.biasSettings.ageBias * 10;
    }
    
    return breakdown;
  }

  renderBiasFactors(breakdown) {
    const factors = [
      { key: 'gender', label: 'Gender', value: breakdown.gender, color: '#E91E63' },
      { key: 'education', label: 'Education', value: breakdown.education, color: '#2196F3' },
      { key: 'experience', label: 'Experience', value: breakdown.experience, color: '#FF9800' },
      { key: 'age', label: 'Age', value: breakdown.age, color: '#9C27B0' }
    ];
    
    return factors.map(factor => {
      const impact = factor.value > 0 ? 'positive' : factor.value < 0 ? 'negative' : 'neutral';
      const width = Math.abs(factor.value) / 20 * 100; // Max 20 point bias
      
      return `
        <div class="bias-factor ${impact}">
          <div class="factor-header">
            <span class="factor-label">${factor.label}</span>
            <span class="factor-value ${impact}">${factor.value > 0 ? '+' : ''}${factor.value.toFixed(1)}</span>
          </div>
          <div class="factor-bar">
            <div class="factor-fill" 
                 style="width: ${width}%; background-color: ${factor.color};">
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  addCandidateInteractions(card, candidate) {
    // Hover effects
    card.addEventListener('mouseenter', () => {
      card.classList.add('hovered');
      this.highlightBiasFactors(candidate);
    });
    
    card.addEventListener('mouseleave', () => {
      card.classList.remove('hovered');
      this.clearBiasHighlights();
    });
    
    // Click to expand/collapse details
    card.addEventListener('click', (e) => {
      if (!e.target.classList.contains('candidate-action-btn')) {
        card.classList.toggle('expanded');
      }
    });
  }

  highlightBiasFactors(candidate) {
    // Highlight corresponding bias sliders
    const biasBreakdown = this.calculateBiasBreakdown(candidate);
    
    Object.keys(biasBreakdown).forEach(factor => {
      const slider = this.biasSliders?.get(`${factor}-bias`);
      if (slider) {
        slider.highlight(true);
      }
    });
  }

  clearBiasHighlights() {
    this.biasSliders?.forEach(slider => {
      slider.highlight(false);
    });
  }

  addRejectedCandidatesSection(container, hired) {
    const rejectedSection = document.createElement('div');
    rejectedSection.className = 'rejected-candidates-section';
    
    const rejected = this.candidates
      .filter(c => !hired.find(h => h.id === c.id))
      .sort((a, b) => (b.biasedScore || b.qualificationScore) - (a.biasedScore || a.qualificationScore))
      .slice(0, 3); // Show top 3 rejected candidates
    
    rejectedSection.innerHTML = `
      <div class="section-header">
        <h5>Top Rejected Candidates</h5>
        <button class="toggle-rejected" onclick="this.parentElement.parentElement.classList.toggle('expanded')">
          Show Details
        </button>
      </div>
      <div class="rejected-grid">
        ${rejected.map(candidate => `
          <div class="rejected-card">
            <div class="rejected-info">
              <span class="rejected-name">${candidate.name}</span>
              <span class="rejected-score">Score: ${candidate.qualificationScore}</span>
            </div>
            <div class="rejection-reason">
              <span class="reason-text">${this.getTopRejectionReason(candidate)}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    
    container.appendChild(rejectedSection);
  }

  getTopRejectionReason(candidate) {
    const reasons = [];
    
    if (candidate.gender === 'female' && this.biasSettings.genderBias > 0.3) {
      reasons.push('Gender bias');
    }
    
    if (candidate.education !== 'Ivy League' && this.biasSettings.educationBias > 0.3) {
      reasons.push('Education bias');
    }
    
    if (candidate.experience < 5 && this.biasSettings.experienceBias > 0.5) {
      reasons.push('Experience requirement');
    }
    
    return reasons.length > 0 ? reasons[0] : 'Lower overall score';
  }

  updateRoundProgress() {
    const progressFill = document.getElementById('round-progress');
    const progressText = document.getElementById('progress-text');
    const roundTitle = document.getElementById('round-title');
    
    if (progressFill) {
      const progress = (this.currentRound / this.totalRounds) * 100;
      progressFill.style.width = `${progress}%`;
    }
    
    if (progressText) {
      progressText.textContent = `${this.currentRound} / ${this.totalRounds} rounds`;
    }
    
    if (roundTitle) {
      roundTitle.textContent = `Round ${this.currentRound} Results`;
    }
  }

  animateResults() {
    const cards = document.querySelectorAll('.candidate-card');
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        card.style.transition = 'all 0.5s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 100);
    });
  }

  showCandidateDetails(candidateId) {
    const candidate = this.candidates.find(c => c.id === parseInt(candidateId));
    if (!candidate) return;

    // Create detailed candidate modal
    const modal = this.createCandidateModal(candidate);
    document.body.appendChild(modal);
  }

  createCandidateModal(candidate) {
    const modal = document.createElement('div');
    modal.className = 'candidate-modal';
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3>${candidate.name} - Detailed Analysis</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="candidate-full-profile">
            <div class="profile-section">
              <h4>Qualifications</h4>
              <div class="qualification-grid">
                <div class="qual-item">
                  <span class="qual-label">Education:</span>
                  <span class="qual-value">${candidate.education}</span>
                </div>
                <div class="qual-item">
                  <span class="qual-label">Experience:</span>
                  <span class="qual-value">${candidate.experience} years</span>
                </div>
                <div class="qual-item">
                  <span class="qual-label">Skills Score:</span>
                  <span class="qual-value">${candidate.skills}/100</span>
                </div>
                <div class="qual-item">
                  <span class="qual-label">Previous Role:</span>
                  <span class="qual-value">${candidate.previousRole}</span>
                </div>
              </div>
            </div>
            
            <div class="bias-analysis-section">
              <h4>Bias Impact Analysis</h4>
              <div class="bias-comparison">
                <div class="score-comparison">
                  <div class="score-item original">
                    <span class="score-label">Merit-Based Score</span>
                    <span class="score-value">${candidate.qualificationScore}</span>
                  </div>
                  <div class="score-arrow">→</div>
                  <div class="score-item biased">
                    <span class="score-label">Algorithm Score</span>
                    <span class="score-value">${Math.round(candidate.biasedScore)}</span>
                  </div>
                </div>
                <div class="bias-impact">
                  <span class="impact-label">Total Bias Impact:</span>
                  <span class="impact-value ${candidate.biasedScore > candidate.qualificationScore ? 'positive' : 'negative'}">
                    ${candidate.biasedScore > candidate.qualificationScore ? '+' : ''}${(candidate.biasedScore - candidate.qualificationScore).toFixed(1)} points
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add close functionality
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');
    
    [closeBtn, overlay].forEach(element => {
      element.addEventListener('click', () => {
        document.body.removeChild(modal);
      });
    });

    return modal;
  }

  recordMetrics(hired) {
    const metrics = {
      genderBalance: this.calculateGenderBalance(hired),
      educationDiversity: this.calculateEducationDiversity(hired),
      averageExperience: hired.reduce((sum, c) => sum + c.experience, 0) / hired.length,
      averageOriginalScore: hired.reduce((sum, c) => sum + c.qualificationScore, 0) / hired.length
    };

    this.updateMetrics(metrics);
  }

  calculateGenderBalance(hired) {
    const maleCount = hired.filter(c => c.gender === 'male').length;
    return maleCount / hired.length;
  }

  calculateEducationDiversity(hired) {
    const schools = new Set(hired.map(c => c.education));
    return schools.size / 4; // Normalized by total school types
  }
  updateStatistics() {
    const allMetrics = this.getMetrics();
    
    // Update enhanced metrics if available
    this.updateEnhancedMetrics();
    
    // Update basic statistics display
    if (this.statsContainer) {
      this.statsContainer.innerHTML = `
        <div class="stat-item">
          <label>Gender Balance</label>
          <div class="stat-bar">
            <div class="stat-fill" style="width: ${(1 - Math.abs(0.5 - allMetrics.genderBalance)) * 100}%"></div>
          </div>
          <span>${Math.round((1 - Math.abs(0.5 - allMetrics.genderBalance)) * 100)}% Fair</span>
        </div>
        
        <div class="stat-item">
          <label>Education Diversity</label>
          <div class="stat-bar">
            <div class="stat-fill" style="width: ${allMetrics.educationDiversity * 100}%"></div>
          </div>
          <span>${Math.round(allMetrics.educationDiversity * 100)}%</span>
        </div>
        
        <div class="stat-item">
          <label>Avg. Experience</label>
          <span>${allMetrics.averageExperience.toFixed(1)} years</span>
        </div>
        
        <div class="stat-item">
          <label>Avg. Merit Score</label>
          <span>${allMetrics.averageOriginalScore.toFixed(1)}</span>
        </div>
      `;
    }
  }
  updateBiasDisplay() {
    // Visual feedback for bias settings could be added here
    // Use console.log instead of undefined analytics
    console.log('Bias settings changed:', this.biasSettings);
  }

  showFinalResults() {
    const finalMetrics = this.getMetrics();
    
    this.ui.showFeedback({
      type: 'success',
      title: 'Simulation Complete!',
      message: `
        You've completed ${this.totalRounds} rounds of hiring decisions.
        
        Key Insights:
        • Gender fairness: ${Math.round((1 - Math.abs(0.5 - finalMetrics.genderBalance)) * 100)}%
        • Education diversity: ${Math.round(finalMetrics.educationDiversity * 100)}%
        • Average merit score: ${finalMetrics.averageOriginalScore.toFixed(1)}
        
        Reflect on how your algorithm settings affected the outcomes.
      `,
      actionText: 'Try Again',
      onAction: () => this.reset()
    });
  }

  /**
   * Cleanup all canvas resources when simulation ends
   */
  cleanup() {
    try {
      // Remove all managed canvases
      Object.values(this.canvasIds).forEach(canvasId => {
        if (canvasId) {
          CanvasManager.removeCanvas(canvasId);
        }
      });

      // Reset canvas IDs
      this.canvasIds = {
        controls: null,
        metrics: null,
        analytics: null
      };

      // Clear engine references
      this.controlsEngine = null;
      this.metricsEngine = null;
      this.analyticsEngine = null;
      this.biasSliders = null;
      this.actionButtons = null;
      this.biasMeters = null;

      console.log('Bias simulation cleanup completed');
    } catch (error) {
      console.error('Error during simulation cleanup:', error);
    }
  }

  /**
   * Override reset to include canvas cleanup
   */
  reset() {
    // Cleanup canvases first
    this.cleanup();
    
    // Reset simulation data
    this.currentRound = 0;
    this.clearMetrics();
    this.generateCandidates();
    
    // Reset UI displays
    const candidatesDisplay = document.getElementById('candidates-display');
    if (candidatesDisplay) {
      candidatesDisplay.innerHTML = `
        <div class="start-message">
          <p>Click "Run Algorithm" to begin the simulation</p>
          <div class="demo-stats">
            <div class="stat-preview">
              <span class="stat-icon">👥</span>
              <span>Gender Balance</span>
            </div>
            <div class="stat-preview">
              <span class="stat-icon">🎓</span>
              <span>Education Diversity</span>
            </div>
            <div class="stat-preview">
              <span class="stat-icon">⚖️</span>
              <span>Overall Fairness</span>
            </div>
          </div>
        </div>
      `;
    }
    
    // Reset progress
    this.updateRoundProgress();
    
    // Reset chart data
    if (this.chartData) {
      this.chartData = {
        rounds: [],
        genderBalance: [],
        educationDiversity: [],
        overallFairness: []
      };
    }

    // Reinitialize UI after cleanup
    setTimeout(() => {
      this.setupUI();
    }, 100);
  }

  getReflectionQuestions() {
    return [
      "How did adjusting bias parameters affect the diversity of hired candidates?",
      "What are the trade-offs between different types of bias in hiring algorithms?",
      "How might you design a fairer hiring algorithm?",
      "What real-world factors contribute to bias in AI hiring systems?"
    ];
  }

  // Missing methods from parent class - add compatibility
  setupEthicsDisplay() {
    // Override parent method - we handle ethics display in our custom UI
  }
  
  loadScenario(index) {
    // Override parent method - we don't use scenarios in this simulation
    this.currentScenario = index;
  }
  
  emit(eventName, data = {}) {
    // Simple event emitter for compatibility
    if (this.events && this.events.has(eventName)) {
      this.events.get(eventName).forEach(callback => callback(data));
    }
  }
  
  updateMetrics(metrics) {
    // Store metrics for statistics display
    if (!this.metricsHistory) this.metricsHistory = [];
    this.metricsHistory.push({ ...metrics, timestamp: Date.now() });
  }
  
  getMetrics() {
    // Return latest metrics or default values
    if (this.metricsHistory && this.metricsHistory.length > 0) {
      return this.metricsHistory[this.metricsHistory.length - 1];
    }
    return {
      genderBalance: 0.5,
      educationDiversity: 0.5,
      averageExperience: 5,
      averageOriginalScore: 50
    };
  }
  
  clearMetrics() {
    this.metricsHistory = [];
  }
  
  triggerEvent(eventName, data) {
    // Track simulation events
    console.log(`Simulation event: ${eventName}`, data);
    this.emit(eventName, data);
  }
  async createEnhancedBiasMeters(canvasId) {
    try {
      // Create visual engine for this canvas
      this.metricsEngine = await CanvasManager.createVisualEngine(canvasId, {
        renderMode: 'canvas',
        accessibility: true
      });

      // Import enhanced objects
      const { EthicsMeter } = await import('../objects/enhanced-objects.js');
      
      // Create bias metrics meters
      const metrics = ['genderBalance', 'educationDiversity', 'overallFairness'];
      
      metrics.forEach((metric, index) => {
        const meter = new EthicsMeter({
          id: `bias-${metric}`,
          x: 20,
          y: 50 + (index * 80),
          width: 200,
          height: 60,
          label: this.formatMetricLabel(metric),
          value: 0.5,
          color: this.getMetricColor(metric),
          ariaLabel: `${metric} bias metric`,
          showLabel: true,
          showValue: true,
          animated: true
        });

        this.metricsEngine.scene.add(meter);
        this.biasMeters = this.biasMeters || new Map();
        this.biasMeters.set(metric, meter);
      });
    } catch (error) {
      console.error('Error creating enhanced bias meters:', error);
    }
  }

  formatMetricLabel(metric) {
    const labels = {
      genderBalance: 'Gender Balance',
      educationDiversity: 'Education Diversity',
      overallFairness: 'Overall Fairness'
    };
    return labels[metric] || metric;
  }

  getMetricColor(metric) {
    const colors = {
      genderBalance: '#4CAF50',
      educationDiversity: '#2196F3', 
      overallFairness: '#FF9800'
    };
    return colors[metric] || '#9E9E9E';
  }

  updateEnhancedMetrics() {
    if (!this.biasMeters) return;

    const metrics = this.getMetrics();
    
    // Update gender balance meter
    const genderFairness = 1 - Math.abs(0.5 - metrics.genderBalance);
    this.biasMeters.get('genderBalance')?.setValue(genderFairness, true);
    
    // Update education diversity meter
    this.biasMeters.get('educationDiversity')?.setValue(metrics.educationDiversity, true);
    
    // Calculate overall fairness
    const overallFairness = (genderFairness + metrics.educationDiversity) / 2;
    this.biasMeters.get('overallFairness')?.setValue(overallFairness, true);
  }  setupEnhancedControls(parentContainer) {
    const controlsPanel = document.createElement('div');
    controlsPanel.className = 'enhanced-controls-panel panel';
    controlsPanel.innerHTML = `
      <h3>Algorithm Configuration</h3>
      <div class="controls-content">
        <div class="bias-controls" id="controls-container">
          <!-- Canvas will be created by canvas manager -->
        </div>
        <div class="scenario-selector">
          <h4>Hiring Scenario</h4>
          <select id="scenario-select" class="scenario-dropdown">
            <option value="tech">Tech Company</option>
            <option value="healthcare">Healthcare</option>
            <option value="finance">Finance</option>
            <option value="education">Education</option>
          </select>
        </div>
        <div class="dataset-info">
          <h4>Training Data</h4>
          <div class="dataset-stats">
            <div class="stat-chip">
              <span class="stat-label">Candidates:</span>
              <span class="stat-value" id="candidate-count">20</span>
            </div>
            <div class="stat-chip">
              <span class="stat-label">Diversity:</span>
              <span class="stat-value" id="diversity-score">Medium</span>
            </div>
          </div>
        </div>
      </div>
    `;

    // Create managed canvas for controls
    const controlsContainer = controlsPanel.querySelector('#controls-container');
    const { canvas, id } = CanvasManager.createCanvas({
      width: 260,
      height: 400,
      container: controlsContainer,
      className: 'bias-controls-canvas'
    });
    
    this.canvasIds.controls = id;

    // Create enhanced interactive controls
    this.createEnhancedSliders(id);
    
    parentContainer.appendChild(controlsPanel);
  }
  async createEnhancedSliders(canvasId) {
    try {
      // Create visual engine for controls
      this.controlsEngine = await CanvasManager.createVisualEngine(canvasId, {
        renderMode: 'canvas',
        accessibility: true
      });

      // Import enhanced objects
      const { InteractiveSlider, InteractiveButton } = await import('../objects/enhanced-objects.js');
      
      this.createBiasSliders(InteractiveSlider);
      this.createActionButtons(InteractiveButton);
    } catch (error) {
      console.error('Error creating enhanced controls:', error);
    }
  }

  createBiasSliders(InteractiveSlider) {
    const sliderConfigs = [
      {
        id: 'gender-bias',
        label: 'Gender Bias',
        value: this.biasSettings.genderBias,
        y: 50,
        color: '#E91E63',
        description: 'Affects preference for male vs female candidates'
      },
      {
        id: 'education-bias',
        label: 'Education Bias',
        value: this.biasSettings.educationBias,
        y: 140,
        color: '#2196F3',
        description: 'Favors prestigious educational institutions'
      },
      {
        id: 'experience-bias',
        label: 'Experience Bias',
        value: this.biasSettings.experienceBias,
        y: 230,
        color: '#FF9800',
        description: 'Overweights years of experience'
      },
      {
        id: 'age-bias',
        label: 'Age Bias',
        value: 0.2,
        y: 320,
        color: '#9C27B0',
        description: 'Preference for younger candidates'
      }
    ];

    this.biasSliders = new Map();
    
    sliderConfigs.forEach(config => {
      const slider = new InteractiveSlider({
        id: config.id,
        x: 20,
        y: config.y,
        width: 220,
        height: 60,
        label: config.label,
        value: config.value,
        min: 0,
        max: 1,
        step: 0.05,
        color: config.color,
        showLabel: true,
        showValue: true,
        animated: true,
        ariaLabel: `${config.label}: ${config.description}`,
        onChange: (value) => this.handleBiasChange(config.id, value)
      });

      this.controlsEngine.scene.add(slider);
      this.biasSliders.set(config.id, slider);
      
      // Store bias value
      if (config.id === 'age-bias') {
        this.biasSettings.ageBias = config.value;
      }
    });
  }

  createActionButtons(InteractiveButton) {
    const buttonConfigs = [
      {
        id: 'run-simulation',
        text: 'Run Algorithm',
        x: 20,
        y: 400,
        width: 100,
        height: 35,
        color: '#4CAF50',
        onClick: () => this.runHiringRound()
      },
      {
        id: 'reset-simulation',
        text: 'Reset',
        x: 140,
        y: 400,
        width: 100,
        height: 35,
        color: '#F44336',
        onClick: () => this.resetSimulation()
      }
    ];

    this.actionButtons = new Map();
    
    buttonConfigs.forEach(config => {
      const button = new InteractiveButton({
        id: config.id,
        x: config.x,
        y: config.y,
        width: config.width,
        height: config.height,
        text: config.text,
        color: config.color,
        textColor: 'white',
        ariaLabel: config.text,
        onClick: config.onClick
      });

      this.controlsEngine.scene.add(button);
      this.actionButtons.set(config.id, button);
    });
  }

  handleBiasChange(biasType, value) {
    // Update bias settings
    switch(biasType) {
      case 'gender-bias':
        this.biasSettings.genderBias = value;
        break;
      case 'education-bias':
        this.biasSettings.educationBias = value;
        break;
      case 'experience-bias':
        this.biasSettings.experienceBias = value;
        break;
      case 'age-bias':
        this.biasSettings.ageBias = value;
        break;
    }

    // Update real-time preview
    this.updateBiasPreview();
    
    // Update analytics
    this.trackBiasAdjustment(biasType, value);
  }

  updateBiasPreview() {
    // Real-time preview of bias effects
    const previewCandidates = this.candidates.slice(0, 5);
    const rankedCandidates = this.simulateHiring(previewCandidates);
    
    // Update diversity score display
    const diversityScore = this.calculateDiversityScore(rankedCandidates);
    const diversityElement = document.getElementById('diversity-score');
    if (diversityElement) {
      diversityElement.textContent = this.getDiversityLabel(diversityScore);
      diversityElement.className = `stat-value ${this.getDiversityClass(diversityScore)}`;
    }
    
    // Animate bias meters
    this.updateEnhancedMetrics();
  }

  calculateDiversityScore(candidates) {
    const genderBalance = this.calculateGenderBalance(candidates);
    const educationDiversity = this.calculateEducationDiversity(candidates);
    return (genderBalance + educationDiversity) / 2;
  }

  getDiversityLabel(score) {
    if (score >= 0.8) return 'High';
    if (score >= 0.6) return 'Medium';
    if (score >= 0.4) return 'Low';
    return 'Very Low';
  }

  getDiversityClass(score) {
    if (score >= 0.8) return 'diversity-high';
    if (score >= 0.6) return 'diversity-medium';
    if (score >= 0.4) return 'diversity-low';
    return 'diversity-very-low';
  }

  trackBiasAdjustment(biasType, value) {
    // Enhanced analytics tracking
    if (window.AnalyticsManager) {
      AnalyticsManager.trackEvent('bias_adjustment', {
        biasType,
        value,
        timestamp: Date.now(),
        currentRound: this.currentRound,
        scenario: this.getCurrentScenario()
      });
    }
  }

  getCurrentScenario() {
    const selector = document.getElementById('scenario-select');
    return selector ? selector.value : 'tech';
  }

  /**
   * Enhanced Results Display
   * Interactive tabs, analytics charts, and real-time insights
   */
  setupResultsDisplay(parentContainer) {
    const resultsPanel = document.createElement('div');
    resultsPanel.className = 'enhanced-results-panel panel';
    resultsPanel.innerHTML = `
      <h3>Hiring Results & Analysis</h3>
      <div class="results-tabs">
        <button class="tab-button active" data-tab="results">Results</button>
        <button class="tab-button" data-tab="analytics">Analytics</button>
        <button class="tab-button" data-tab="comparison">Compare</button>
      </div>
      <div class="results-content">
        <div class="tab-content active" id="results-tab">
          <div class="results-header">
            <h4 id="round-title">Ready to Start</h4>
            <div class="round-progress">
              <div class="progress-bar">
                <div class="progress-fill" id="round-progress"></div>
              </div>
              <span id="progress-text">0 / ${this.totalRounds} rounds</span>
            </div>
          </div>
          <div class="candidates-grid" id="candidates-display">
            <div class="start-message">
              <p>Click "Run Algorithm" to begin the simulation</p>
              <div class="demo-stats">
                <div class="stat-preview">
                  <span class="stat-icon">👥</span>
                  <span>Gender Balance</span>
                </div>
                <div class="stat-preview">
                  <span class="stat-icon">🎓</span>
                  <span>Education Diversity</span>
                </div>
                <div class="stat-preview">
                  <span class="stat-icon">⚖️</span>
                  <span>Overall Fairness</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="tab-content" id="analytics-tab">
          <div class="analytics-container">
            <canvas id="analytics-chart" width="400" height="300"></canvas>
            <div class="analytics-insights" id="insights-display">
              <h5>Key Insights</h5>
              <ul id="insights-list">
                <li>No data yet - run the simulation to see insights</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="tab-content" id="comparison-tab">
          <div class="comparison-container">
            <h5>Bias Impact Comparison</h5>
            <div class="comparison-grid" id="comparison-display">
              <div class="comparison-placeholder">
                <p>Compare results from different bias settings</p>
                <button class="btn btn-secondary" id="save-configuration">
                  Save Current Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Setup tab functionality
    this.setupResultsTabs(resultsPanel);
    
    // Setup analytics chart
    this.setupAnalyticsChart(resultsPanel);
    
    parentContainer.appendChild(resultsPanel);
  }

  setupResultsTabs(panel) {
    const tabButtons = panel.querySelectorAll('.tab-button');
    const tabContents = panel.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const targetTab = button.dataset.tab;
        
        // Update active states
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        button.classList.add('active');
        panel.querySelector(`#${targetTab}-tab`).classList.add('active');
        
        // Load tab-specific content
        this.loadTabContent(targetTab);
      });
    });

    // Setup save configuration button
    const saveBtn = panel.querySelector('#save-configuration');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveConfiguration());
    }
  }
  setupAnalyticsChart(panel) {
    const chartContainer = panel.querySelector('.analytics-container');
    if (!chartContainer) return;

    // Create managed canvas for analytics
    const { canvas, id } = CanvasManager.createCanvas({
      width: 400,
      height: 300,
      container: chartContainer,
      className: 'analytics-chart-canvas'
    });
    
    this.canvasIds.analytics = id;

    try {
      this.createAnalyticsChart(id);
    } catch (error) {
      console.error('Error setting up analytics chart:', error);
    }
  }
  async createAnalyticsChart(canvasId) {
    try {
      // Create visual engine for analytics
      this.analyticsEngine = await CanvasManager.createVisualEngine(canvasId, {
        renderMode: 'canvas',
        accessibility: true
      });

      // Initialize chart data
      this.chartData = {
        rounds: [],
        genderBalance: [],
        educationDiversity: [],
        overallFairness: []
      };

      this.renderAnalyticsChart();
    } catch (error) {
      console.error('Error creating analytics chart:', error);
    }
  }

  renderAnalyticsChart() {
    if (!this.analyticsEngine) return;

    // Clear previous chart
    this.analyticsEngine.scene.clear();

    const canvas = this.analyticsEngine.canvas;
    const ctx = canvas.getContext('2d');
    
    // Chart dimensions
    const padding = 40;
    const chartWidth = canvas.width - (padding * 2);
    const chartHeight = canvas.height - (padding * 2);
    
    // Draw chart background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(padding, padding, chartWidth, chartHeight);
    
    // Draw grid lines
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    
    // Vertical grid lines
    for (let i = 0; i <= this.totalRounds; i++) {
      const x = padding + (i / this.totalRounds) * chartWidth;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, padding + chartHeight);
      ctx.stroke();
    }
    
    // Horizontal grid lines
    for (let i = 0; i <= 10; i++) {
      const y = padding + (i / 10) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);
      ctx.stroke();
    }
    
    // Draw data lines if we have data
    if (this.chartData.rounds.length > 0) {
      this.drawDataLine(ctx, this.chartData.genderBalance, '#E91E63', 'Gender Balance');
      this.drawDataLine(ctx, this.chartData.educationDiversity, '#2196F3', 'Education Diversity');
      this.drawDataLine(ctx, this.chartData.overallFairness, '#4CAF50', 'Overall Fairness');
    }
    
    // Draw labels
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Rounds', canvas.width / 2, canvas.height - 10);
    
    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Fairness Score', 0, 0);
    ctx.restore();
  }

  drawDataLine(ctx, data, color, label) {
    if (data.length < 2) return;

    const canvas = this.analyticsEngine.canvas;
    const padding = 40;
    const chartWidth = canvas.width - (padding * 2);
    const chartHeight = canvas.height - (padding * 2);

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();

    data.forEach((value, index) => {
      const x = padding + (index / (this.totalRounds - 1)) * chartWidth;
      const y = padding + (1 - value) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw data points
    ctx.fillStyle = color;
    data.forEach((value, index) => {
      const x = padding + (index / (this.totalRounds - 1)) * chartWidth;
      const y = padding + (1 - value) * chartHeight;
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  updateAnalyticsChart() {
    const metrics = this.getMetrics();
    
    // Add data point
    this.chartData.rounds.push(this.currentRound);
    this.chartData.genderBalance.push(1 - Math.abs(0.5 - metrics.genderBalance));
    this.chartData.educationDiversity.push(metrics.educationDiversity);
    this.chartData.overallFairness.push(
      (this.chartData.genderBalance[this.chartData.genderBalance.length - 1] + 
       metrics.educationDiversity) / 2
    );

    // Re-render chart
    this.renderAnalyticsChart();
    
    // Update insights
    this.updateInsights();
  }

  updateInsights() {
    const insightsList = document.getElementById('insights-list');
    if (!insightsList) return;

    const insights = this.generateInsights();
    insightsList.innerHTML = insights.map(insight => 
      `<li class="insight-item ${insight.type}">
        <span class="insight-icon">${insight.icon}</span>
        <span>${insight.text}</span>
      </li>`
    ).join('');
  }

  generateInsights() {
    const insights = [];
    const metrics = this.getMetrics();
    
    // Gender balance insights
    const genderFairness = 1 - Math.abs(0.5 - metrics.genderBalance);
    if (genderFairness < 0.3) {
      insights.push({
        type: 'warning',
        icon: '⚠️',
        text: 'Significant gender bias detected. Consider reducing gender bias parameter.'
      });
    } else if (genderFairness > 0.8) {
      insights.push({
        type: 'success',
        icon: '✅',
        text: 'Excellent gender balance achieved!'
      });
    }
    
    // Education diversity insights
    if (metrics.educationDiversity < 0.4) {
      insights.push({
        type: 'warning',
        icon: '🎓',
        text: 'Low education diversity. Algorithm may be favoring prestigious schools.'
      });
    }
    
    // Experience bias insights
    if (this.biasSettings.experienceBias > 0.8) {
      insights.push({
        type: 'info',
        icon: '💼',
        text: 'High experience bias may exclude qualified junior candidates.'
      });
    }
    
    // Age bias insights
    if (this.biasSettings.ageBias > 0.5) {
      insights.push({
        type: 'warning',
        icon: '👴',
        text: 'Age bias detected. This may violate anti-discrimination laws.'
      });
    }

    return insights.length > 0 ? insights : [{
      type: 'info',
      icon: '📊',
      text: 'Continue running rounds to generate more insights.'
    }];
  }

  saveConfiguration() {
    const config = {
      id: Date.now(),
      name: `Config ${this.savedConfigurations?.length + 1 || 1}`,
      biasSettings: { ...this.biasSettings },
      timestamp: new Date().toLocaleString(),
      scenario: this.getCurrentScenario(),
      results: this.metricsHistory ? [...this.metricsHistory] : []
    };

    if (!this.savedConfigurations) {
      this.savedConfigurations = [];
    }
    
    this.savedConfigurations.push(config);
    this.updateComparisonDisplay();
    
    // Show success feedback
    this.showConfigurationSaved(config.name);
  }

  showConfigurationSaved(configName) {
    const notification = document.createElement('div');
    notification.className = 'config-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">✅</span>
        <span class="notification-text">Configuration "${configName}" saved!</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 2000);
  }
  updateComparisonDisplay() {
    const comparisonDisplay = document.getElementById('comparison-display');
    
    if (!comparisonDisplay || !this.savedConfigurations) return;

    if (this.savedConfigurations.length === 0) {
      comparisonDisplay.innerHTML = `
        <div class="comparison-placeholder">
          <p>Compare results from different bias settings</p>
          <button class="btn btn-secondary" id="save-configuration">
            Save Current Configuration
          </button>
        </div>
      `;
      return;
    }

    comparisonDisplay.innerHTML = `
      <div class="comparison-header">
        <h5>Saved Configurations</h5>
        <button class="btn btn-primary btn-sm" onclick="window.app.currentSimulation.compareAllConfigurations()">
          Compare All
        </button>
      </div>
      <div class="configurations-grid">
        ${this.savedConfigurations.map((config, index) => `
          <div class="config-card" data-config-id="${config.id}">
            <div class="config-header">
              <h6>${config.name}</h6>
              <span class="config-timestamp">${config.timestamp}</span>
            </div>
            <div class="config-settings">
              <div class="setting-item">
                <span>Gender Bias:</span>
                <span class="setting-value">${(config.biasSettings.genderBias * 100).toFixed(0)}%</span>
              </div>
              <div class="setting-item">
                <span>Education Bias:</span>
                <span class="setting-value">${(config.biasSettings.educationBias * 100).toFixed(0)}%</span>
              </div>
              <div class="setting-item">
                <span>Experience Bias:</span>
                <span class="setting-value">${(config.biasSettings.experienceBias * 100).toFixed(0)}%</span>
              </div>
            </div>
            <div class="config-actions">
              <button class="btn btn-sm btn-outline" onclick="window.app.currentSimulation.loadConfiguration(${config.id})">
                Load
              </button>
              <button class="btn btn-sm btn-outline" onclick="window.app.currentSimulation.deleteConfiguration(${config.id})">
                Delete
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  loadConfiguration(configId) {
    const config = this.savedConfigurations?.find(c => c.id === configId);
    if (!config) return;

    // Update bias settings
    this.biasSettings = { ...config.biasSettings };
    
    // Update sliders
    this.biasSliders?.forEach((slider, key) => {
      const biasKey = key.replace('-bias', '');
      const value = this.biasSettings[biasKey + 'Bias'] || this.biasSettings[biasKey];
      if (value !== undefined) {
        slider.setValue(value, true);
      }
    });
    
    // Update scenario
    const scenarioSelect = document.getElementById('scenario-select');
    if (scenarioSelect && config.scenario) {
      scenarioSelect.value = config.scenario;
    }
    
    // Show feedback
    this.ui.showFeedback({
      type: 'info',
      title: 'Configuration Loaded',
      message: `Configuration "${config.name}" has been loaded. You can now run the simulation with these settings.`,
      actionText: 'Run Simulation',
      onAction: () => this.runHiringRound()
    });
  }

  deleteConfiguration(configId) {
    if (!this.savedConfigurations) return;
    
    this.savedConfigurations = this.savedConfigurations.filter(c => c.id !== configId);
    this.updateComparisonDisplay();
  }

  compareAllConfigurations() {
    if (!this.savedConfigurations || this.savedConfigurations.length < 2) {
      this.ui.showFeedback({
        type: 'warning',
        title: 'Need More Configurations',
        message: 'Save at least 2 configurations to enable comparison.',
        actionText: 'OK'
      });
      return;
    }

    this.showComparisonModal();
  }

  showComparisonModal() {
    const modal = document.createElement('div');
    modal.className = 'comparison-modal';
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content large">
        <div class="modal-header">
          <h3>Configuration Comparison</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="comparison-chart-container">
            <canvas id="comparison-chart" width="800" height="400"></canvas>
          </div>
          <div class="comparison-table">
            ${this.generateComparisonTable()}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    
    // Setup close functionality
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');
    
    [closeBtn, overlay].forEach(element => {
      element.addEventListener('click', () => {
        document.body.removeChild(modal);
      });
    });

    // Create comparison chart
    this.createComparisonChart(modal.querySelector('#comparison-chart'));
  }

  generateComparisonTable() {
    if (!this.savedConfigurations) return '';

    const headers = ['Configuration', 'Gender Bias', 'Education Bias', 'Experience Bias', 'Avg Gender Balance', 'Avg Ed. Diversity'];
    
    return `
      <table class="comparison-table">
        <thead>
          <tr>
            ${headers.map(header => `<th>${header}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${this.savedConfigurations.map(config => {
            const avgGenderBalance = config.results.length > 0 
              ? config.results.reduce((sum, r) => sum + (1 - Math.abs(0.5 - r.genderBalance)), 0) / config.results.length 
              : 0;
            const avgEdDiversity = config.results.length > 0
              ? config.results.reduce((sum, r) => sum + r.educationDiversity, 0) / config.results.length
              : 0;
              
            return `
              <tr>
                <td>${config.name}</td>
                <td>${(config.biasSettings.genderBias * 100).toFixed(0)}%</td>
                <td>${(config.biasSettings.educationBias * 100).toFixed(0)}%</td>
                <td>${(config.biasSettings.experienceBias * 100).toFixed(0)}%</td>
                <td class="metric-cell">${(avgGenderBalance * 100).toFixed(1)}%</td>
                <td class="metric-cell">${(avgEdDiversity * 100).toFixed(1)}%</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  }

  createComparisonChart(canvas) {
    if (!canvas || !this.savedConfigurations) return;

    const ctx = canvas.getContext('2d');
    const padding = 60;
    const chartWidth = canvas.width - (padding * 2);
    const chartHeight = canvas.height - (padding * 2);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(padding, padding, chartWidth, chartHeight);
    
    // Draw chart for each configuration
    const colors = ['#E91E63', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0'];
    
    this.savedConfigurations.forEach((config, index) => {
      const color = colors[index % colors.length];
      this.drawConfigurationData(ctx, config, color, index, padding, chartWidth, chartHeight);
    });
    
    // Draw legend
    this.drawComparisonLegend(ctx, canvas.width, canvas.height);
  }

  drawConfigurationData(ctx, config, color, index, padding, chartWidth, chartHeight) {
    if (config.results.length === 0) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    config.results.forEach((result, resultIndex) => {
      const x = padding + (resultIndex / Math.max(1, config.results.length - 1)) * chartWidth;
      const fairnessScore = (1 - Math.abs(0.5 - result.genderBalance) + result.educationDiversity) / 2;
      const y = padding + (1 - fairnessScore) * chartHeight;
      
      if (resultIndex === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();
  }

  drawComparisonLegend(ctx, canvasWidth, canvasHeight) {
    const legendY = canvasHeight - 40;
    const colors = ['#E91E63', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0'];
    
    this.savedConfigurations.forEach((config, index) => {
      const color = colors[index % colors.length];
      const x = 80 + (index * 150);
      
      // Draw color indicator
      ctx.fillStyle = color;
      ctx.fillRect(x, legendY, 15, 3);
      
      // Draw text
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.fillText(config.name, x + 20, legendY + 3);
    });
  }

  loadTabContent(tabName) {
    switch(tabName) {
      case 'analytics':
        this.renderAnalyticsChart();
        break;
      case 'comparison':
        this.updateComparisonDisplay();
        break;
    }
  }

  resetSimulation() {
    // Reset all data
    this.currentRound = 0;
    this.clearMetrics();
    this.generateCandidates();
    
    // Reset UI displays
    const candidatesDisplay = document.getElementById('candidates-display');
    if (candidatesDisplay) {
      candidatesDisplay.innerHTML = `
        <div class="start-message">
          <p>Click "Run Algorithm" to begin the simulation</p>
          <div class="demo-stats">
            <div class="stat-preview">
              <span class="stat-icon">👥</span>
              <span>Gender Balance</span>
            </div>
            <div class="stat-preview">
              <span class="stat-icon">🎓</span>
              <span>Education Diversity</span>
            </div>
            <div class="stat-preview">
              <span class="stat-icon">⚖️</span>
              <span>Overall Fairness</span>
            </div>
          </div>
        </div>
      `;
    }
    
    // Reset progress
    this.updateRoundProgress();
    
    // Reset chart data
    if (this.chartData) {
      this.chartData = {
        rounds: [],
        genderBalance: [],
        educationDiversity: [],
        overallFairness: []
      };      this.renderAnalyticsChart();
    }
    
    // Reset enhanced meters
    this.biasMeters?.forEach(meter => {
      meter.setValue(0.5, true);
    });
  }
  /**
   * Start the simulation - required lifecycle method
   */
  start() {
    try {
      console.log('BiasSimulation.start() called');
      
      // Ensure we have candidates
      if (!this.candidates || this.candidates.length === 0) {
        console.log('No candidates found, generating...');
        this.generateCandidates();
      }
      
      console.log(`Starting with ${this.candidates.length} candidates`);
      
      // Update initial display
      console.log('Updating initial statistics...');
      this.updateStatistics();
      
      // Emit start event
      this.emit('simulation:started');
      
      console.log('BiasSimulation started successfully');
      return this;
    } catch (error) {
      console.error('Error starting simulation:', error);
      return this;
    }
  }

  /**
   * Pause the simulation - required lifecycle method
   */
  pause() {
    this.isPaused = true;
    this.emit('simulation:paused');
    return this;
  }

  /**
   * Resume the simulation - required lifecycle method
   */
  resume() {
    this.isPaused = false;
    this.emit('simulation:resumed');
    return this;
  }

  /**
   * Get current simulation state - required method
   */
  getState() {
    return {
      id: this.id,
      currentRound: this.currentRound,
      totalRounds: this.totalRounds,
      biasSettings: { ...this.biasSettings },
      metrics: this.getMetrics(),
      isComplete: this.currentRound >= this.totalRounds,
      isPaused: this.isPaused || false
    };
  }

  /**
   * Handle scenario loading - compatibility method
   */
  loadScenario(scenarioIndex) {
    // This simulation doesn't use scenarios, but we need the method for compatibility
    this.currentScenario = scenarioIndex;
    this.emit('scenario:loaded', { 
      scenario: { 
        id: `round-${this.currentRound}`,
        title: `Round ${this.currentRound}`,
        index: scenarioIndex 
      } 
    });
    return this;
  }

  /**
   * Get reflection questions - required method
   */
  getReflectionQuestions() {
    return [
      "How did adjusting bias parameters affect the diversity of hired candidates?",
      "What are the trade-offs between different types of bias in hiring algorithms?",
      "How might you design a fairer hiring algorithm?",
      "What real-world factors contribute to bias in AI hiring systems?"
    ];
  }

  // ...existing code...
}

// Export for ES6 modules
export default BiasSimulation;

// Register simulation
if (typeof window !== 'undefined') {
  window.BiasSimulation = BiasSimulation;
}
