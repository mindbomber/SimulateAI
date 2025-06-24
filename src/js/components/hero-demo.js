/**
 * Hero Demo - Interactive preview simulation for the homepage
 * Demonstrates AI hiring bias scenarios with real-time ethics feedback
 */

class HeroDemo {
    constructor() {
        this.container = document.getElementById('hero-demo');
        this.currentScenario = 0;
        this.ethicsScores = {
            fairness: 50,
            transparency: 50,
            accountability: 50
        };
        this.userChoices = [];
        
        this.scenarios = [
            {
                title: "AI Hiring Assistant",
                question: "Your AI system is screening job applications. What data should it use to rank candidates?",
                choices: [
                    {
                        text: "Skills, experience, and education only",
                        impact: { fairness: +20, transparency: +10, accountability: +15 },
                        feedback: "Great choice! Using only relevant qualifications reduces bias."
                    },
                    {
                        text: "Include age and photo for 'cultural fit'",
                        impact: { fairness: -30, transparency: -10, accountability: -20 },
                        feedback: "This could introduce age and appearance bias into hiring decisions."
                    },
                    {
                        text: "Add anonymous demographic data for diversity tracking",
                        impact: { fairness: +10, transparency: +20, accountability: +10 },
                        feedback: "Good balance - helps track diversity without direct bias."
                    }
                ]
            },
            {
                title: "Algorithm Transparency",
                question: "A candidate asks why they were rejected. How should your AI system respond?",
                choices: [
                    {
                        text: "Provide detailed explanation of decision factors",
                        impact: { fairness: +15, transparency: +25, accountability: +20 },
                        feedback: "Excellent! Transparency builds trust and allows for bias detection."
                    },
                    {
                        text: "Give generic response to protect trade secrets",
                        impact: { fairness: -10, transparency: -30, accountability: -15 },
                        feedback: "This makes it impossible to identify and fix potential bias."
                    },
                    {
                        text: "Explain general criteria but keep specifics confidential",
                        impact: { fairness: +5, transparency: +10, accountability: +5 },
                        feedback: "A reasonable compromise, though full transparency is preferred."
                    }
                ]
            }
        ];
        
        this.init();
    }

    init() {
        if (!this.container) return;
        
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
                        </div>
                        
                        <div class="scenario-feedback" id="demo-feedback" style="display: none;">
                            <div class="feedback-content" id="feedback-content"></div>
                            <button class="btn btn-primary btn-sm" id="next-scenario-btn" style="display: none;">
                                Next Scenario →
                            </button>
                            <button class="btn btn-secondary btn-sm" id="try-full-simulation" style="display: none;">
                                Try Full Simulation
                            </button>
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
            </div>
        `;
        
        this.attachEventListeners();
        this.updateEthicsDisplay();
    }

    renderChoices(scenarioIndex) {
        return this.scenarios[scenarioIndex].choices.map((choice, index) => `
            <button class="choice-btn" data-choice="${index}" data-scenario="${scenarioIndex}">
                <span class="choice-text">${choice.text}</span>
                <span class="choice-arrow">→</span>
            </button>
        `).join('');
    }

    renderEthicsMeters() {
        return Object.entries(this.ethicsScores).map(([category, score]) => `
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
        `).join('');
    }

    attachEventListeners() {
        // Choice buttons
        this.container.addEventListener('click', (e) => {
            if (e.target.closest('.choice-btn')) {
                this.handleChoice(e.target.closest('.choice-btn'));
            } else if (e.target.id === 'next-scenario-btn') {
                this.nextScenario();
            } else if (e.target.id === 'try-full-simulation') {
                this.launchFullSimulation();
            }
        });

        // Keyboard navigation
        this.container.addEventListener('keydown', (e) => {
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
        
        // Store user choice
        this.userChoices.push({
            scenario: scenarioIndex,
            choice: choiceIndex,
            text: choice.text
        });

        // Update ethics scores with animation
        this.updateEthicsScores(choice.impact);
        
        // Show feedback
        this.showFeedback(choice.feedback, scenarioIndex);
        
        // Disable all choice buttons
        const allChoices = this.container.querySelectorAll('.choice-btn');
        allChoices.forEach(btn => {
            btn.disabled = true;
            btn.classList.add('disabled');
        });
        
        // Highlight selected choice
        choiceBtn.classList.add('selected');
        
        // Track analytics
        if (window.AnalyticsManager) {
            AnalyticsManager.trackEvent('hero_demo_choice', {
                scenario: scenarioIndex,
                choice: choiceIndex,
                impact: choice.impact
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
            if ((increment > 0 && currentScore >= newScore) || 
                (increment < 0 && currentScore <= newScore)) {
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
        const contentEl = document.getElementById('feedback-content');
        const nextBtn = document.getElementById('next-scenario-btn');
        const tryFullBtn = document.getElementById('try-full-simulation');
        
        contentEl.innerHTML = `
            <div class="feedback-message">
                <span class="feedback-icon">💭</span>
                <p>${message}</p>
            </div>
        `;
        
        feedbackEl.style.display = 'block';
        
        // Show appropriate next action button
        if (scenarioIndex < this.scenarios.length - 1) {
            nextBtn.style.display = 'inline-block';
            tryFullBtn.style.display = 'none';
        } else {
            nextBtn.style.display = 'none';
            tryFullBtn.style.display = 'inline-block';
            
            // Show completion summary
            this.showCompletionSummary();
        }
        
        // Scroll feedback into view
        feedbackEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    showCompletionSummary() {
        const contentEl = document.getElementById('feedback-content');
        const avgScore = Math.round(
            Object.values(this.ethicsScores).reduce((a, b) => a + b, 0) / 3
        );
        
        const summaryClass = avgScore >= 70 ? 'excellent' : avgScore >= 50 ? 'good' : 'needs-improvement';
        
        contentEl.innerHTML += `
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
            document.getElementById('demo-scenario-title').textContent = scenario.title;
            document.getElementById('demo-question').textContent = scenario.question;
            document.getElementById('demo-choices').innerHTML = this.renderChoices(this.currentScenario);
            
            // Hide feedback
            document.getElementById('demo-feedback').style.display = 'none';
        }
    }

    launchFullSimulation() {
        // Trigger the full bias simulation
        if (window.app && window.app.openSimulation) {
            window.app.openSimulation('bias-fairness');
        } else {
            // Fallback: scroll to simulations section
            document.getElementById('simulations').scrollIntoView({ 
                behavior: 'smooth' 
            });
        }
        
        // Track analytics
        if (window.AnalyticsManager) {
            AnalyticsManager.trackEvent('hero_demo_completed', {
                finalScores: this.ethicsScores,
                choices: this.userChoices
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
            return "Consider how your choices might affect fairness and transparency. Try the full simulation to learn more!";
        }
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Export for ES6 modules
export default HeroDemo;
