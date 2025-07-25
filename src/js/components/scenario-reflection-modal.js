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
 * ScenarioReflectionModal - Scenario-Specific Post-Choice Analysis
 *
 * A focused reflection modal designed specifically for the ScenarioModal system.
 * Shows community choice statistics, ethical impact analysis, and collects
 * research data for the main research side of the application.
 *
 * Features:
 * - Community choice comparison with global statistics
 * - Single-choice ethical impact visualization
 * - Brief but meaningful reflection questions
 * - Research data collection for academic purposes
 * - Cultural and demographic insight gathering
 *
 * @author SimulateAI Development Team
 * @version 1.0.0
 */

import ModalUtility from "./modal-utility.js";
import { simulationInfo } from "../data/simulation-info.js";
import { userProgress } from "../utils/simple-storage.js";
import { simpleAnalytics } from "../utils/simple-analytics.js";

// Reflection step constants for scenario-based reflection
const SCENARIO_REFLECTION_STEPS = {
  CHOICE_IMPACT: 0,
  COMMUNITY_COMPARISON: 1,
  REFLECTION: 2,
  INSIGHTS: 3,
};

export class ScenarioReflectionModal {
  constructor(options = {}) {
    this.options = {
      categoryId: options.categoryId || "bias-fairness",
      scenarioId: options.scenarioId || "unknown",
      selectedOption: options.selectedOption || null,
      scenarioData: options.scenarioData || {},
      onComplete: options.onComplete || (() => {}),
      onSkip: options.onSkip || (() => {}),
      collectResearchData: options.collectResearchData !== false,
      ...options,
    };

    // Get scenario info from simulation-info.js
    this.scenarioInfo = this.getScenarioInfo();
    this.selectedOption = this.options.selectedOption;
    this.reflectionData = {};
    this.currentStep = 0;
    this.totalSteps = 4;
    this.modal = null;

    // Mock community data (in real app, this would come from your analytics API)
    this.communityStats = this.generateCommunityStats();

    // Initialize and show the modal
    this.init();
  }

  /**
   * Get scenario information from simulation-info.js
   */
  getScenarioInfo() {
    // Find the scenario in SIMULATION_INFO
    const categoryData = simulationInfo[this.options.categoryId];
    if (categoryData && categoryData.scenarios) {
      const scenario = categoryData.scenarios.find(
        (s) => s.id === this.options.scenarioId,
      );
      if (scenario) {
        return {
          title: scenario.title,
          category: categoryData.title || this.options.categoryId,
          description: scenario.description,
          ethicalDimensions: scenario.ethicalDimensions || [],
        };
      }
    }

    // Fallback
    return {
      title: this.options.scenarioData.title || "Ethical Scenario",
      category: "AI Ethics",
      description: this.options.scenarioData.description || "",
      ethicalDimensions: [],
    };
  }

  /**
   * Generate mock community statistics
   * In production, this would fetch real data from your analytics API
   */
  generateCommunityStats() {
    // Mock data showing how the community chose
    const options = this.options.scenarioData.options || [];
    const totalResponses = Math.floor(Math.random() * 50000) + 10000; // 10k-60k responses
    let remaining = 100;

    const stats = options.map((option, index) => {
      const isLast = index === options.length - 1;
      const percentage = isLast
        ? remaining
        : Math.floor(Math.random() * remaining * 0.6) + 10;
      remaining -= percentage;

      return {
        optionId: option.id,
        optionText: option.text,
        percentage: percentage,
        count: Math.floor((percentage / 100) * totalResponses),
        isUserChoice: option.id === this.selectedOption?.id,
      };
    });

    return {
      totalResponses,
      options: stats,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Initialize the reflection modal
   */
  init() {
    // Track analytics
    simpleAnalytics.trackEvent("scenario_reflection_modal", "opened", {
      category_id: this.options.categoryId,
      scenario_id: this.options.scenarioId,
      selected_option: this.selectedOption?.id || "unknown",
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
      closeOnEscape: true,
      size: "large",
      className: "scenario-reflection-modal",
    });

    this.modal.open();
    this.setupEventHandlers();
    this.initializeCharts();
  }

  /**
   * Generate modal title
   */
  generateModalTitle() {
    return `🎯 Your Choice: ${this.scenarioInfo.title}`;
  }

  /**
   * Generate the main modal content
   */
  generateModalContent() {
    return `
      <div class="scenario-reflection-content">
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
        <div class="reflection-step-content">
          ${this.generateStepContent(this.currentStep)}
        </div>
      </div>
    `;
  }

  /**
   * Generate progress steps
   */
  generateProgressSteps() {
    const steps = [
      { id: 0, title: "Your Choice", icon: "🎯" },
      { id: 1, title: "Community", icon: "🌍" },
      { id: 2, title: "Reflection", icon: "🤔" },
      { id: 3, title: "Insights", icon: "💡" },
    ];

    return steps
      .map(
        (step) => `
        <div class="progress-step ${step.id <= this.currentStep ? "completed" : ""} ${step.id === this.currentStep ? "active" : ""}"
             data-step="${step.id}">
          <div class="step-icon">${step.icon}</div>
          <div class="step-title">${step.title}</div>
        </div>
      `,
      )
      .join("");
  }

  /**
   * Generate content for each step
   */
  generateStepContent(step) {
    switch (step) {
      case SCENARIO_REFLECTION_STEPS.CHOICE_IMPACT:
        return this.generateChoiceImpactStep();
      case SCENARIO_REFLECTION_STEPS.COMMUNITY_COMPARISON:
        return this.generateCommunityComparisonStep();
      case SCENARIO_REFLECTION_STEPS.REFLECTION:
        return this.generateReflectionStep();
      case SCENARIO_REFLECTION_STEPS.INSIGHTS:
        return this.generateInsightsStep();
      default:
        return this.generateChoiceImpactStep();
    }
  }

  /**
   * Step 0: Show the user's choice and its ethical impact
   */
  generateChoiceImpactStep() {
    return `
      <div class="step-content choice-impact-step">
        <h3>🎯 Your Choice Analysis</h3>
        
        <div class="choice-summary">
          <div class="chosen-option">
            <h4>You chose:</h4>
            <div class="option-display">
              <div class="option-text">"${this.selectedOption?.text || "Unknown choice"}"</div>
              <div class="option-reasoning">${this.selectedOption?.description || ""}</div>
            </div>
          </div>
        </div>

        <div class="ethical-impact-chart">
          <h4>📊 Ethical Impact Analysis</h4>
          <div class="impact-visualization" id="ethical-impact-radar">
            ${this.generateEthicalImpactVisualization()}
          </div>
        </div>

        <div class="impact-explanation">
          <h4>🔍 What This Means</h4>
          ${this.generateImpactExplanation()}
        </div>
      </div>
    `;
  }

  /**
   * Step 1: Community comparison with statistics
   */
  generateCommunityComparisonStep() {
    return `
      <div class="step-content community-comparison-step">
        <h3>🌍 How You Compare to the Global Community</h3>
        
        <div class="community-stats-summary">
          <p>Based on <strong>${this.communityStats.totalResponses.toLocaleString()}</strong> responses from people worldwide:</p>
        </div>

        <div class="community-chart">
          <div class="chart-container" id="community-choices-chart">
            ${this.generateCommunityChart()}
          </div>
        </div>

        <div class="community-insights">
          ${this.generateCommunityInsights()}
        </div>

        <div class="demographic-context">
          <h4>🔬 For Research Purposes</h4>
          <p>Help us understand global perspectives on AI ethics:</p>
          ${this.generateDemographicQuestions()}
        </div>
      </div>
    `;
  }

  /**
   * Step 2: Brief reflection questions specific to the scenario
   */
  generateReflectionStep() {
    return `
      <div class="step-content reflection-step">
        <h3>🤔 Quick Reflection</h3>
        <p class="step-description">
          Help us understand your reasoning (this data helps our research):
        </p>

        <div class="reflection-questions">
          ${this.generateScenarioReflectionQuestions()}
        </div>
      </div>
    `;
  }

  /**
   * Step 3: Insights and next steps
   */
  generateInsightsStep() {
    return `
      <div class="step-content insights-step">
        <h3>💡 Key Insights</h3>
        
        <div class="insight-cards">
          ${this.generateInsightCards()}
        </div>

        <div class="next-exploration">
          <h4>🚀 Continue Exploring</h4>
          ${this.generateNextScenarioSuggestions()}
        </div>

        <div class="research-impact">
          <h4>🔬 Your Contribution to Research</h4>
          <p>Your response has been anonymously added to our global database of ethical decision-making patterns. This helps researchers understand how different cultures and backgrounds approach AI ethics challenges.</p>
          <div class="research-stats">
            <span class="stat">🌍 ${this.communityStats.totalResponses.toLocaleString()} global responses</span>
            <span class="stat">🔬 Contributing to 15+ research studies</span>
            <span class="stat">📚 Supporting ethical AI education worldwide</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Generate ethical impact visualization
   */
  generateEthicalImpactVisualization() {
    const impact = this.selectedOption?.impact || {};
    const dimensions = [
      "fairness",
      "transparency",
      "accountability",
      "privacy",
      "beneficence",
    ];

    return `
      <div class="impact-radar">
        ${dimensions
          .map(
            (dim) => `
          <div class="impact-dimension">
            <div class="dimension-label">${dim.charAt(0).toUpperCase() + dim.slice(1)}</div>
            <div class="dimension-bar">
              <div class="dimension-fill" style="width: ${(impact[dim] || 0.5) * 100}%"></div>
            </div>
            <div class="dimension-value">${Math.round((impact[dim] || 0.5) * 100)}%</div>
          </div>
        `,
          )
          .join("")}
      </div>
    `;
  }

  /**
   * Generate community choice chart
   */
  generateCommunityChart() {
    return `
      <div class="community-bar-chart">
        ${this.communityStats.options
          .map(
            (stat) => `
          <div class="choice-bar ${stat.isUserChoice ? "user-choice" : ""}">
            <div class="choice-label">
              <span class="choice-text">${stat.optionText}</span>
              ${stat.isUserChoice ? '<span class="your-choice-indicator">👈 Your Choice</span>' : ""}
            </div>
            <div class="choice-bar-container">
              <div class="choice-bar-fill" style="width: ${stat.percentage}%"></div>
              <span class="choice-percentage">${stat.percentage}%</span>
            </div>
            <div class="choice-count">${stat.count.toLocaleString()} people</div>
          </div>
        `,
          )
          .join("")}
      </div>
    `;
  }

  /**
   * Generate community insights
   */
  generateCommunityInsights() {
    const userStat = this.communityStats.options.find(
      (stat) => stat.isUserChoice,
    );
    const isPopularChoice = userStat && userStat.percentage > 40;
    const isMinorityChoice = userStat && userStat.percentage < 20;

    let insight = "";
    if (isPopularChoice) {
      insight = `<div class="insight popular">🌟 You're in the majority! ${userStat.percentage}% of people made the same choice.</div>`;
    } else if (isMinorityChoice) {
      insight = `<div class="insight minority">🎯 You're thinking independently! Only ${userStat.percentage}% chose this option.</div>`;
    } else {
      insight = `<div class="insight balanced">⚖️ You're part of a balanced perspective - ${userStat.percentage}% share your choice.</div>`;
    }

    return `
      <div class="community-insights-container">
        ${insight}
        <div class="cultural-note">
          <p>💭 <em>Different cultural backgrounds and experiences often lead to varied approaches to ethical dilemmas. There's rarely one "right" answer.</em></p>
        </div>
      </div>
    `;
  }

  /**
   * Generate demographic questions for research
   */
  generateDemographicQuestions() {
    return `
      <div class="demographic-questions">
        <div class="demo-question">
          <label>What best describes your background?</label>
          <select name="background" data-research="background">
            <option value="">Select (optional)</option>
            <option value="tech">Technology/Engineering</option>
            <option value="academia">Academic/Research</option>
            <option value="business">Business/Management</option>
            <option value="healthcare">Healthcare</option>
            <option value="education">Education</option>
            <option value="government">Government/Public Sector</option>
            <option value="student">Student</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div class="demo-question">
          <label>Which region are you from?</label>
          <select name="region" data-research="region">
            <option value="">Select (optional)</option>
            <option value="north-america">North America</option>
            <option value="europe">Europe</option>
            <option value="asia-pacific">Asia-Pacific</option>
            <option value="latin-america">Latin America</option>
            <option value="africa">Africa</option>
            <option value="middle-east">Middle East</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
    `;
  }

  /**
   * Generate reflection questions specific to this scenario
   */
  generateScenarioReflectionQuestions() {
    return `
      <div class="scenario-questions">
        <div class="reflection-question">
          <label>What was the main factor that influenced your decision?</label>
          <div class="radio-group">
            <label><input type="radio" name="main_factor" value="ethical_principles" data-research="main_factor"> Ethical principles</label>
            <label><input type="radio" name="main_factor" value="practical_outcomes" data-research="main_factor"> Practical outcomes</label>
            <label><input type="radio" name="main_factor" value="stakeholder_impact" data-research="main_factor"> Impact on stakeholders</label>
            <label><input type="radio" name="main_factor" value="personal_experience" data-research="main_factor"> Personal experience</label>
            <label><input type="radio" name="main_factor" value="cultural_values" data-research="main_factor"> Cultural values</label>
          </div>
        </div>

        <div class="reflection-question">
          <label>How confident are you in your choice? (1-5 scale)</label>
          <div class="confidence-scale">
            <input type="range" name="confidence" min="1" max="5" value="3" data-research="confidence" class="confidence-slider">
            <div class="scale-labels">
              <span>Not confident</span>
              <span>Very confident</span>
            </div>
          </div>
        </div>

        <div class="reflection-question">
          <label>Any additional thoughts? (Optional)</label>
          <textarea name="additional_thoughts" placeholder="Share any insights or concerns..." rows="3" data-research="additional_thoughts"></textarea>
        </div>
      </div>
    `;
  }

  /**
   * Generate insight cards
   */
  generateInsightCards() {
    return `
      <div class="insight-card">
        <div class="insight-icon">🎯</div>
        <div class="insight-content">
          <h5>Decision-Making Pattern</h5>
          <p>You demonstrated ${this.getDecisionPattern()} in your approach to this ethical dilemma.</p>
        </div>
      </div>

      <div class="insight-card">
        <div class="insight-icon">🌍</div>
        <div class="insight-content">
          <h5>Global Perspective</h5>
          <p>Your choice reflects ${this.getGlobalPerspective()} values commonly seen in ethical AI discussions worldwide.</p>
        </div>
      </div>

      <div class="insight-card">
        <div class="insight-icon">📚</div>
        <div class="insight-content">
          <h5>Learning Opportunity</h5>
          <p>${this.getLearningOpportunity()}</p>
        </div>
      </div>
    `;
  }

  /**
   * Generate next scenario suggestions
   */
  generateNextScenarioSuggestions() {
    return `
      <div class="next-scenarios">
        <p>Based on your choice, you might find these scenarios interesting:</p>
        <div class="scenario-suggestions">
          <div class="suggestion-card" data-category="privacy-surveillance" data-scenario="facial-recognition">
            <div class="suggestion-title">🔒 Privacy vs. Security</div>
            <div class="suggestion-desc">Explore facial recognition ethics</div>
          </div>
          <div class="suggestion-card" data-category="bias-fairness" data-scenario="hiring-algorithm">
            <div class="suggestion-title">⚖️ Algorithmic Fairness</div>
            <div class="suggestion-desc">Hiring algorithm bias scenarios</div>
          </div>
          <div class="suggestion-card" data-category="transparency-explainability" data-scenario="medical-diagnosis">
            <div class="suggestion-title">🔍 AI Transparency</div>
            <div class="suggestion-desc">Medical AI decision-making</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Generate modal footer
   */
  generateModalFooter() {
    return `
      <div class="modal-footer-content">
        <div class="footer-left">
          <button class="btn btn-outline" data-action="skip-reflection">
            Skip to End
          </button>
        </div>
        
        <div class="footer-center">
          <span class="step-indicator">
            ${this.currentStep + 1} of ${this.totalSteps}
          </span>
        </div>
        
        <div class="footer-right">
          <button class="btn btn-secondary" data-action="previous" 
                  ${this.currentStep === 0 ? "disabled" : ""}>
            ← Previous
          </button>
          <button class="btn btn-primary" data-action="next">
            ${this.currentStep === this.totalSteps - 1 ? "Complete" : "Next →"}
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Setup event handlers
   */
  setupEventHandlers() {
    if (!this.modal?.modalElement) {
      console.warn(
        "🚨 ScenarioReflectionModal: Modal element not found for event setup",
      );
      return;
    }

    const { modalElement } = this.modal;
    console.log(
      "🔧 ScenarioReflectionModal: Setting up event handlers on",
      modalElement,
    );

    // Remove any existing listeners to prevent duplicates
    const existingHandler = modalElement._scenarioReflectionHandler;
    if (existingHandler) {
      modalElement.removeEventListener("click", existingHandler);
      console.log("🗑️ Removed existing event handler");
    }

    // Create new handler
    const clickHandler = (e) => {
      console.log(
        "🎯 ScenarioReflectionModal click detected:",
        e.target,
        "Action:",
        e.target.dataset?.action,
      );

      if (e.target.matches('[data-action="next"]')) {
        console.log("▶️ Next button clicked");
        this.handleNext();
      } else if (e.target.matches('[data-action="previous"]')) {
        console.log("◀️ Previous button clicked");
        this.handlePrevious();
      } else if (e.target.matches('[data-action="skip-reflection"]')) {
        console.log("⏭️ Skip button clicked");
        this.handleSkip();
      } else if (e.target.matches(".suggestion-card")) {
        console.log("💡 Suggestion card clicked");
        this.handleScenarioSuggestion(e.target);
      }
    };

    // Store reference and add listener
    modalElement._scenarioReflectionHandler = clickHandler;
    modalElement.addEventListener("click", clickHandler);
    console.log("✅ Click event handler attached");

    // Research data collection
    const changeHandler = (e) => {
      if (e.target.matches("[data-research]")) {
        console.log(
          "📊 Research data collected (change):",
          e.target.name,
          e.target.value,
        );
        this.collectResearchData(e.target);
      }
    };

    const inputHandler = (e) => {
      if (e.target.matches("[data-research]")) {
        console.log(
          "📊 Research data collected (input):",
          e.target.name,
          e.target.value,
        );
        this.collectResearchData(e.target);
      }
    };

    modalElement.addEventListener("change", changeHandler);
    modalElement.addEventListener("input", inputHandler);
    console.log("✅ Research data event handlers attached");

    // Debug: Check if buttons are present
    const nextBtn = modalElement.querySelector('[data-action="next"]');
    const prevBtn = modalElement.querySelector('[data-action="previous"]');
    const skipBtn = modalElement.querySelector(
      '[data-action="skip-reflection"]',
    );

    console.log("🔍 Button check:", {
      nextBtn: !!nextBtn,
      prevBtn: !!prevBtn,
      skipBtn: !!skipBtn,
      nextText: nextBtn?.textContent,
      prevText: prevBtn?.textContent,
    });
  }

  /**
   * Handle next step navigation
   */
  handleNext() {
    console.log(
      "▶️ ScenarioReflectionModal: handleNext() called, currentStep:",
      this.currentStep,
      "totalSteps:",
      this.totalSteps,
    );

    if (this.currentStep < this.totalSteps - 1) {
      this.currentStep++;
      console.log("📈 Moving to step:", this.currentStep);
      this.updateModalContent();
    } else {
      console.log("🏁 Last step reached, calling handleComplete()");
      this.handleComplete();
    }
  }

  /**
   * Handle previous step navigation
   */
  handlePrevious() {
    console.log(
      "◀️ ScenarioReflectionModal: handlePrevious() called, currentStep:",
      this.currentStep,
    );

    if (this.currentStep > 0) {
      this.currentStep--;
      console.log("📉 Moving to step:", this.currentStep);
      this.updateModalContent();
    } else {
      console.log("🛑 Already at first step");
    }
  }

  /**
   * Update modal content for current step
   */
  updateModalContent() {
    console.log(
      "🔄 ScenarioReflectionModal: updateModalContent() called for step",
      this.currentStep,
    );

    if (!this.modal?.modalElement) {
      console.warn("🚨 Modal element not found in updateModalContent");
      return;
    }

    const contentElement = this.modal.modalElement.querySelector(
      ".reflection-step-content",
    );
    const footerElement = this.modal.modalElement.querySelector(
      ".modal-footer-content",
    );
    const progressElement = this.modal.modalElement.querySelector(
      ".reflection-progress",
    );

    console.log("🔍 Elements found:", {
      content: !!contentElement,
      footer: !!footerElement,
      progress: !!progressElement,
    });

    if (contentElement) {
      contentElement.innerHTML = this.generateStepContent(this.currentStep);
    }

    if (footerElement) {
      footerElement.innerHTML = this.generateModalFooter();
    }

    if (progressElement) {
      const progressBar = progressElement.querySelector(".progress-fill");
      const progressSteps = progressElement.querySelector(".progress-steps");

      if (progressBar) {
        progressBar.style.width = `${(this.currentStep / this.totalSteps) * 100}%`;
      }

      if (progressSteps) {
        progressSteps.innerHTML = this.generateProgressSteps();
      }
    }

    // Re-setup event handlers
    this.setupEventHandlers();

    // Initialize charts if needed
    if (this.currentStep === SCENARIO_REFLECTION_STEPS.CHOICE_IMPACT) {
      this.initializeCharts();
    }
  }

  /**
   * Collect research data
   */
  collectResearchData(element) {
    if (!this.options.collectResearchData) return;

    const dataType = element.getAttribute("data-research");
    const value =
      element.type === "range" ? parseInt(element.value) : element.value;

    this.reflectionData[dataType] = value;

    // Track for analytics
    simpleAnalytics.trackEvent("research_data_collected", dataType, {
      scenario_id: this.options.scenarioId,
      category_id: this.options.categoryId,
      selected_option: this.selectedOption?.id,
      data_type: dataType,
      value: value,
    });
  }

  /**
   * Handle completion
   */
  handleComplete() {
    // Save research data
    this.saveResearchData();

    // Track completion
    simpleAnalytics.trackEvent("scenario_reflection_completed", "completed", {
      scenario_id: this.options.scenarioId,
      category_id: this.options.categoryId,
      selected_option: this.selectedOption?.id,
      research_data_points: Object.keys(this.reflectionData).length,
    });

    // Dispatch event for badge system integration
    const reflectionCompletedEvent = new CustomEvent(
      "scenarioReflectionCompleted",
      {
        detail: {
          scenarioId: this.options.scenarioId,
          categoryId: this.options.categoryId,
          selectedOption: this.selectedOption,
          reflectionData: this.reflectionData,
          timestamp: Date.now(),
        },
      },
    );
    document.dispatchEvent(reflectionCompletedEvent);

    this.options.onComplete(this.reflectionData);
    this.modal.close();
  }

  /**
   * Handle skip
   */
  handleSkip() {
    this.options.onSkip();
    this.modal.close();
  }

  /**
   * Handle close
   */
  handleClose() {
    this.options.onComplete(this.reflectionData);
  }

  /**
   * Handle scenario suggestion clicks
   */
  handleScenarioSuggestion(element) {
    const categoryId = element.getAttribute("data-category");
    const scenarioId = element.getAttribute("data-scenario");

    // Close this modal and open the suggested scenario
    this.modal.close();

    // Dispatch event to open suggested scenario
    const event = new CustomEvent("open-suggested-scenario", {
      detail: { categoryId, scenarioId },
    });
    document.dispatchEvent(event);
  }

  /**
   * Save research data
   */
  saveResearchData() {
    const researchRecord = {
      timestamp: new Date().toISOString(),
      categoryId: this.options.categoryId,
      scenarioId: this.options.scenarioId,
      selectedOption: this.selectedOption?.id,
      reflectionData: this.reflectionData,
      communityStats: this.communityStats,
    };

    userProgress.addResearchData(researchRecord);
  }

  /**
   * Initialize charts and visualizations
   */
  initializeCharts() {
    // Initialize any chart libraries needed
    // This could integrate with Chart.js or other visualization libraries
  }

  // Helper methods for generating insights
  getDecisionPattern() {
    const patterns = [
      "analytical thinking",
      "value-based reasoning",
      "stakeholder-focused consideration",
      "practical problem-solving",
    ];
    return patterns[Math.floor(Math.random() * patterns.length)];
  }

  getGlobalPerspective() {
    const perspectives = [
      "collectivist",
      "individualist",
      "rights-based",
      "utilitarian",
      "virtue-based",
    ];
    return perspectives[Math.floor(Math.random() * perspectives.length)];
  }

  getLearningOpportunity() {
    const opportunities = [
      "Consider exploring scenarios that challenge your initial assumptions.",
      "Try scenarios from different cultural perspectives to broaden your ethical framework.",
      "Explore the long-term consequences of similar decisions in different contexts.",
      "Consider how different stakeholders might view your decision differently.",
    ];
    return opportunities[Math.floor(Math.random() * opportunities.length)];
  }

  /**
   * Generate impact explanation based on the selected option
   */
  generateImpactExplanation() {
    const impact = this.selectedOption?.impact || {};
    const explanations = [];

    if (impact.fairness > 0.7)
      explanations.push(
        "✅ High fairness impact - promotes equitable outcomes",
      );
    if (impact.fairness < 0.3)
      explanations.push(
        "⚠️ Low fairness impact - may create inequitable outcomes",
      );

    if (impact.privacy > 0.7) explanations.push("🔒 Strong privacy protection");
    if (impact.privacy < 0.3)
      explanations.push("🔓 Potential privacy concerns");

    if (impact.transparency > 0.7)
      explanations.push("🔍 High transparency - clear and understandable");
    if (impact.transparency < 0.3)
      explanations.push("❓ Low transparency - may lack clarity");

    if (explanations.length === 0) {
      explanations.push(
        "⚖️ Balanced approach with moderate impact across ethical dimensions",
      );
    }

    return `<ul>${explanations.map((exp) => `<li>${exp}</li>`).join("")}</ul>`;
  }
}
