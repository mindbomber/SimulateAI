/**
 * Hero Demo - Interactive preview simulation for the homepage
 * Demonstrates AI hiring bias scenarios with real-time ethics feedback
 */

import logger from '../utils/logger.js';

class HeroDemo {
  constructor() {
    logger.info('HeroDemo constructor called');
    this.container = document.getElementById('hero-demo');
    this.currentScenario = 0;
    this.ethicsScores = {
      fairness: 50,
      transparency: 50,
      accountability: 50,
    };
    this.userChoices = [];

    this.scenarios = [
      {
        title: 'AI Hiring Assistant',
        question:
          'Your AI system is screening job applications. What data should it use to rank candidates?',
        choices: [
          {
            text: 'Skills, experience, and education only',
            impact: { fairness: +20, transparency: +10, accountability: +15 },
            feedback:
              'Great choice! Using only relevant qualifications reduces bias.',
          },
          {
            text: "Include age and photo for 'cultural fit'",
            impact: { fairness: -30, transparency: -10, accountability: -20 },
            feedback:
              'This could introduce age and appearance bias into hiring decisions.',
          },
          {
            text: 'Add anonymous demographic data for diversity tracking',
            impact: { fairness: +10, transparency: +20, accountability: +10 },
            feedback:
              'Good balance - helps track diversity without direct bias.',
          },
        ],
      },
      {
        title: 'Algorithm Transparency',
        question:
          'A candidate asks why they were rejected. How should your AI system respond?',
        choices: [
          {
            text: 'Provide detailed explanation of decision factors',
            impact: { fairness: +15, transparency: +25, accountability: +20 },
            feedback:
              'Excellent! Transparency builds trust and allows for bias detection.',
          },
          {
            text: 'Give generic response to protect trade secrets',
            impact: { fairness: -10, transparency: -30, accountability: -15 },
            feedback:
              'This makes it impossible to identify and fix potential bias.',
          },
          {
            text: 'Explain general criteria but keep specifics confidential',
            impact: { fairness: +5, transparency: +10, accountability: +5 },
            feedback:
              'A reasonable compromise, though full transparency is preferred.',
          },
        ],
      },
    ];

    this.init();
  }
  init() {
    logger.info('HeroDemo init called');
    if (!this.container) {
      logger.error('Hero demo container not found');
      return;
    }

    logger.info('Hero demo container found, rendering...');

    this.container.innerHTML = `
            <div class="hero-demo-container">
                <div class="demo-header">
                    <h3 class="demo-title">Try It: AI Ethics in Action</h3>
                    <p class="demo-subtitle">Make decisions and see their ethical impact in real-time</p>
                </div>
                
                <div class="demo-content">
                    <div class="scenario-panel">
                        <div class="scenario-header">
                            <span class="scenario-counter">Scenario 1 of ${this.scenarios.length}</span>
                            <h4 class="scenario-title" id="demo-scenario-title">${this.scenarios[0].title}</h4>
                        </div>
                        
                        <div class="scenario-question" id="demo-question">
                            ${this.scenarios[0].question}
                        </div>
                        
                        <div class="scenario-choices" id="demo-choices">
                            ${this.renderChoices(0)}
                            <div class="scenario-feedback" id="demo-feedback" style="display: none;">
                                <button class="feedback-close" id="feedback-close-btn" aria-label="Close feedback">×</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="ethics-dashboard">
                        <h5 class="dashboard-title">Ethics Impact</h5>
                        <div class="ethics-meters">
                            ${this.renderEthicsMeters()}
                        </div>
                        <div class="demo-hint">
                            <span class="hint-icon">💡</span>
                            <span>Your choices affect ethical scores in real-time</span>
                        </div>
                    </div>
                </div>
                
                <!-- Action buttons positioned in bottom right corner -->
                <div class="demo-actions">
                    <button class="btn btn-secondary btn-sm" id="next-scenario-btn" style="display: none;">
                        Next Scenario →
                    </button>
                    <button class="btn btn-primary btn-sm" id="try-full-simulation" style="display: none;">
                        Try Full Simulation
                    </button>
                </div>
            </div>
        `;
    this.attachEventListeners();
    this.updateEthicsDisplay();
    logger.info('Hero demo initialization completed');
  }

  renderChoices(scenarioIndex) {
    // Check if there's already a selection for this scenario
    const existingChoice = this.userChoices.find(
      c => c.scenario === scenarioIndex
    );

    return this.scenarios[scenarioIndex].choices
      .map((choice, index) => {
        const isSelected = existingChoice && existingChoice.choice === index;
        const selectedClass = isSelected ? ' selected' : '';

        return `
                <button class="choice-btn${selectedClass}" data-choice="${index}" data-scenario="${scenarioIndex}">
                    <span class="choice-text">${choice.text}</span>
                    <span class="choice-arrow">→</span>
                </button>
            `;
      })
      .join('');
  }

  renderEthicsMeters() {
    return Object.entries(this.ethicsScores)
      .map(
        ([category, score]) => `
            <div class="ethics-meter">
                <div class="meter-header">
                    <span class="meter-label">${this.capitalizeFirst(category)}</span>
                    <span class="meter-value" id="${category}-value">${score}%</span>
                </div>
                <div class="meter-bar">
                    <div class="meter-fill ${this.getScoreClass(score)}" 
                         id="${category}-fill" 
                         style="width: ${score}%"
                         role="progressbar" 
                         aria-valuenow="${score}" 
                         aria-valuemin="0" 
                         aria-valuemax="100"
                         aria-label="${category} score: ${score}%">
                    </div>
                </div>
            </div>
        `
      )
      .join('');
  }

  attachEventListeners() {
    // Choice buttons
    this.container.addEventListener('click', e => {
      if (e.target.closest('.choice-btn')) {
        this.handleChoice(e.target.closest('.choice-btn'));
      } else if (e.target.id === 'next-scenario-btn') {
        this.nextScenario();
      } else if (e.target.id === 'try-full-simulation') {
        this.launchFullSimulation();
      } else if (
        e.target.id === 'feedback-close-btn' ||
        e.target.closest('#feedback-close-btn')
      ) {
        this.closeFeedback();
      }
    });

    // Keyboard navigation
    this.container.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (e.target.classList.contains('choice-btn')) {
          e.preventDefault();
          this.handleChoice(e.target);
        }
      }
    });
  }

  handleChoice(choiceBtn) {
    const choiceIndex = parseInt(choiceBtn.dataset.choice);
    const scenarioIndex = parseInt(choiceBtn.dataset.scenario);
    const choice = this.scenarios[scenarioIndex].choices[choiceIndex];

    // Remove previous selection styling
    const allChoices = this.container.querySelectorAll('.choice-btn');
    allChoices.forEach(btn => {
      btn.classList.remove('selected');
    });

    // Highlight current selection
    choiceBtn.classList.add('selected');

    // Store current choice for this scenario (replace if exists)
    const existingChoiceIndex = this.userChoices.findIndex(
      c => c.scenario === scenarioIndex
    );
    const choiceData = {
      scenario: scenarioIndex,
      choice: choiceIndex,
      text: choice.text,
    };

    if (existingChoiceIndex >= 0) {
      this.userChoices[existingChoiceIndex] = choiceData;
    } else {
      this.userChoices.push(choiceData);
    }

    // Update ethics scores to reflect current choice (not additive)
    this.updateEthicsScoresForChoice(choice.impact, scenarioIndex);

    // Show feedback
    this.showFeedback(choice.feedback, scenarioIndex);

    // Track analytics
    if (window.AnalyticsManager) {
      AnalyticsManager.trackEvent('hero_demo_choice', {
        scenario: scenarioIndex,
        choice: choiceIndex,
        impact: choice.impact,
      });
    }
  }

  updateEthicsScores(impact) {
    Object.entries(impact).forEach(([category, change]) => {
      // Update score with bounds checking
      const oldScore = this.ethicsScores[category];
      const newScore = Math.max(0, Math.min(100, oldScore + change));
      this.ethicsScores[category] = newScore;

      // Animate the change
      this.animateScoreChange(category, oldScore, newScore, change);
    });
  }

  updateEthicsScoresForChoice(_impact, _scenarioIndex) {
    // Calculate ethics scores based on all current user choices
    // Start with base scores of 50 for each category
    const baseScores = {
      fairness: 50,
      transparency: 50,
      accountability: 50,
    };

    // Apply impact from all current choices
    const calculatedScores = { ...baseScores };
    this.userChoices.forEach(userChoice => {
      const scenario = this.scenarios[userChoice.scenario];
      const choice = scenario.choices[userChoice.choice];

      Object.entries(choice.impact).forEach(([category, change]) => {
        calculatedScores[category] = Math.max(
          0,
          Math.min(100, calculatedScores[category] + change)
        );
      });
    });

    // Animate changes to the new calculated scores
    Object.entries(calculatedScores).forEach(([category, newScore]) => {
      const oldScore = this.ethicsScores[category];
      this.ethicsScores[category] = newScore;

      if (oldScore !== newScore) {
        const change = newScore - oldScore;
        this.animateScoreChange(category, oldScore, newScore, change);
      }
    });
  }

  animateScoreChange(category, oldScore, newScore, change) {
    const valueEl = document.getElementById(`${category}-value`);
    const fillEl = document.getElementById(`${category}-fill`);

    if (!valueEl || !fillEl) return;

    // Show change indicator
    const changeIndicator = change > 0 ? `+${change}` : `${change}`;
    const changeClass = change > 0 ? 'positive' : 'negative';

    // Create floating change indicator
    const indicator = document.createElement('span');
    indicator.className = `score-change ${changeClass}`;
    indicator.textContent = changeIndicator;
    valueEl.parentNode.appendChild(indicator);

    // Animate score value
    let currentScore = oldScore;
    const increment = (newScore - oldScore) / 20; // 20 steps

    const animateValue = () => {
      currentScore += increment;
      if (
        (increment > 0 && currentScore >= newScore) ||
        (increment < 0 && currentScore <= newScore)
      ) {
        currentScore = newScore;
        valueEl.textContent = `${Math.round(currentScore)}%`;
        fillEl.style.width = `${currentScore}%`;
        fillEl.className = `meter-fill ${this.getScoreClass(currentScore)}`;

        // Remove change indicator
        setTimeout(() => {
          if (indicator.parentNode) {
            indicator.parentNode.removeChild(indicator);
          }
        }, 1000);
        return;
      }

      valueEl.textContent = `${Math.round(currentScore)}%`;
      fillEl.style.width = `${currentScore}%`;
      fillEl.className = `meter-fill ${this.getScoreClass(currentScore)}`;
      requestAnimationFrame(animateValue);
    };

    requestAnimationFrame(animateValue);
  }

  showFeedback(message, scenarioIndex) {
    const feedbackEl = document.getElementById('demo-feedback');
    const nextBtn = document.getElementById('next-scenario-btn');
    const tryFullBtn = document.getElementById('try-full-simulation');

    feedbackEl.innerHTML = `
            <button class="feedback-close" id="feedback-close-btn" aria-label="Close feedback">×</button>
            <div class="feedback-message">
                <span class="feedback-icon">💭</span>
                <p>${message}</p>
            </div>
        `;

    // Show popover with proper animation
    feedbackEl.style.display = 'block';
    feedbackEl.classList.add('visible');

    // Show appropriate next action button
    if (nextBtn && tryFullBtn) {
      if (scenarioIndex < this.scenarios.length - 1) {
        nextBtn.style.display = 'inline-block';
        tryFullBtn.style.display = 'none';
      } else {
        nextBtn.style.display = 'none';
        tryFullBtn.style.display = 'inline-block';

        // Show completion summary
        this.showCompletionSummary();
      }
    }

    // Scroll feedback into view
    feedbackEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  closeFeedback() {
    const feedbackEl = document.getElementById('demo-feedback');
    if (feedbackEl) {
      feedbackEl.classList.remove('visible');
      // Hide after animation completes
      setTimeout(() => {
        feedbackEl.style.display = 'none';
      }, 400); // Match the CSS transition duration
    }
  }

  showCompletionSummary() {
    const feedbackEl = document.getElementById('demo-feedback');
    const avgScore = Math.round(
      Object.values(this.ethicsScores).reduce((a, b) => a + b, 0) / 3
    );

    const summaryClass =
      avgScore >= 70
        ? 'excellent'
        : avgScore >= 50
          ? 'good'
          : 'needs-improvement';

    feedbackEl.innerHTML += `
            <div class="completion-summary">
                <h6>Demo Complete!</h6>
                <div class="summary-score ${summaryClass}">
                    <span class="score-label">Overall Ethics Score:</span>
                    <span class="score-value">${avgScore}%</span>
                </div>
                <p class="summary-message">
                    ${this.getSummaryMessage(avgScore)}
                </p>
            </div>
        `;
  }

  nextScenario() {
    this.currentScenario++;

    if (this.currentScenario < this.scenarios.length) {
      // Update scenario content
      const scenario = this.scenarios[this.currentScenario];

      document.querySelector('.scenario-counter').textContent =
        `Scenario ${this.currentScenario + 1} of ${this.scenarios.length}`;
      document.getElementById('demo-scenario-title').textContent =
        scenario.title;
      document.getElementById('demo-question').textContent = scenario.question;
      document.getElementById('demo-choices').innerHTML = this.renderChoices(
        this.currentScenario
      );

      // Re-add the feedback container since innerHTML replaced it
      const choicesContainer = document.getElementById('demo-choices');
      if (!document.getElementById('demo-feedback')) {
        const feedbackEl = document.createElement('div');
        feedbackEl.className = 'scenario-feedback';
        feedbackEl.id = 'demo-feedback';
        feedbackEl.style.display = 'none';
        feedbackEl.innerHTML =
          '<button class="feedback-close" id="feedback-close-btn" aria-label="Close feedback">×</button>';
        choicesContainer.appendChild(feedbackEl);
      }

      // Hide feedback initially
      const feedbackEl = document.getElementById('demo-feedback');
      if (feedbackEl) {
        feedbackEl.style.display = 'none';
        feedbackEl.classList.remove('visible');
      }

      // Check if user has already made a choice for this scenario
      const existingChoice = this.userChoices.find(
        c => c.scenario === this.currentScenario
      );
      if (existingChoice) {
        // Show the feedback for the existing choice
        const choice = scenario.choices[existingChoice.choice];
        this.showFeedback(choice.feedback, this.currentScenario);
      }

      // Re-attach event listeners for the new buttons
      this.attachEventListeners();
    }
  }

  launchFullSimulation() {
    // Trigger the full bias simulation
    if (window.app && window.app.openSimulation) {
      window.app.openSimulation('bias-fairness');
    } else {
      // Fallback: scroll to simulations section
      document.getElementById('simulations').scrollIntoView({
        behavior: 'smooth',
      });
    }

    // Track analytics
    if (window.AnalyticsManager) {
      AnalyticsManager.trackEvent('hero_demo_completed', {
        finalScores: this.ethicsScores,
        choices: this.userChoices,
      });
    }
  }

  updateEthicsDisplay() {
    Object.entries(this.ethicsScores).forEach(([category, score]) => {
      const valueEl = document.getElementById(`${category}-value`);
      const fillEl = document.getElementById(`${category}-fill`);

      if (valueEl) valueEl.textContent = `${score}%`;
      if (fillEl) {
        fillEl.style.width = `${score}%`;
        fillEl.className = `meter-fill ${this.getScoreClass(score)}`;
      }
    });
  }

  getScoreClass(score) {
    if (score >= 70) return 'excellent';
    if (score >= 50) return 'good';
    if (score >= 30) return 'fair';
    return 'poor';
  }

  getSummaryMessage(avgScore) {
    if (avgScore >= 70) {
      return "Excellent work! You've made ethically sound decisions that promote fairness and transparency.";
    } else if (avgScore >= 50) {
      return "Good progress! You're thinking about ethics, but there's room for improvement in some areas.";
    } else {
      return 'Consider how your choices might affect fairness and transparency. Try the full simulation to learn more!';
    }
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Export for ES6 modules
export default HeroDemo;
