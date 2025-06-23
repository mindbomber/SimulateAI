/**
 * Bias and Fairness Simulation
 * Explores algorithmic bias in hiring scenarios
 */

import EthicsSimulation from '../core/simulation.js';

class BiasSimulation extends EthicsSimulation {
  constructor(containerId) {
    super(containerId, {
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
  }

  async initialize() {
    await super.initialize();
    this.generateCandidates();
    this.setupUI();
    this.updateDisplay();
  }

  generateCandidates() {
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
  }

  setupUI() {
    const container = this.ui.createElement('div', {
      className: 'bias-simulation-container',
      style: 'display: flex; gap: 20px; height: 100%;'
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
    statsPanel.appendChild(this.statsContainer);

    container.appendChild(controlPanel);
    container.appendChild(resultsPanel);
    container.appendChild(statsPanel);

    this.container.appendChild(container);
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
    this.resultsContainer.innerHTML = '';
    
    const roundTitle = this.ui.createElement('h3', {
      textContent: `Round ${this.currentRound + 1} Results`,
      className: 'round-title'
    });
    this.resultsContainer.appendChild(roundTitle);

    hired.forEach(candidate => {
      const candidateCard = this.ui.createElement('div', {
        className: 'candidate-card',
        innerHTML: `
          <div class="candidate-info">
            <h4>${candidate.name}</h4>
            <p>Education: ${candidate.education}</p>
            <p>Experience: ${candidate.experience} years</p>
            <p>Original Score: ${candidate.qualificationScore}</p>
            <p>Algorithm Score: ${Math.round(candidate.biasedScore)}</p>
          </div>
        `
      });
      this.resultsContainer.appendChild(candidateCard);
    });
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

  updateBiasDisplay() {
    // Visual feedback for bias settings could be added here
    this.analytics.trackEvent('bias_setting_changed', {
      biasSettings: { ...this.biasSettings }
    });
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

  reset() {
    this.currentRound = 0;
    this.clearMetrics();
    this.generateCandidates();
    this.resultsContainer.innerHTML = '';
    this.statsContainer.innerHTML = '';
  }

  getReflectionQuestions() {
    return [
      "How did adjusting bias parameters affect the diversity of hired candidates?",
      "What are the trade-offs between different types of bias in hiring algorithms?",
      "How might you design a fairer hiring algorithm?",
      "What real-world factors contribute to bias in AI hiring systems?"
    ];
  }
}

// Export for ES6 modules
export default BiasSimulation;

// Register simulation
if (typeof window !== 'undefined') {
  window.BiasSimulation = BiasSimulation;
}
