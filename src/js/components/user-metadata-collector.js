// Constants
const RATING_SCALE = [1, 2, 3, 4, 5, 6, 7];
const STEP_DEMOGRAPHICS = 1;
const STEP_PHILOSOPHY = 2;
const STEP_MORAL_FOUNDATIONS = 3;
const STEP_CONSENT = 4;
const BASE_36 = 36;
const RANDOM_ID_LENGTH = 9;

export class UserMetadataCollector {
  constructor() {
    this.currentStep = 0;
    this.totalSteps = 5;
    this.userData = {
      demographics: {},
      philosophy: {
        moralFoundations: {},
      },
      engagement: {
        scenarioCompletionCount: 0,
        totalTimeSpent: 0,
        averageDecisionTime: 0,
        remixActivity: 0,
        favoriteCategories: [],
        streakCount: 0,
        achievementUnlocked: [],
      },
      learning: {
        conceptsExplored: [],
        skillsAssessed: {},
        learningGoals: [],
        progressMilestones: [],
        reflectionNotes: [],
        growthAreas: [],
      },
      consent: {},
      privacy: {
        profileVisibility: 'private',
        sessionTracking: true,
        analyticsOptOut: false,
      },
    };
    this.isOptional = false;
    this.onComplete = null;
    this.onSkip = null;
  }

  /**
   * Initialize the metadata collection modal
   */
  init(options = {}) {
    this.isOptional = options.optional || false;
    this.onComplete = options.onComplete || (() => {});
    this.onSkip = options.onSkip || (() => {});

    this.createModal();
    this.showStep(0);
  }

  /**
   * Create the metadata collection modal
   */
  createModal() {
    const modalHTML = `
      <div id="metadata-collection-modal" class="metadata-modal-overlay">
        <div class="metadata-modal">
          <!-- Header -->
          <div class="metadata-modal-header">
            <h2 id="metadata-step-title">Welcome to SimulateAI</h2>
            <div class="metadata-progress">
              <div class="metadata-progress-bar">
                <div class="metadata-progress-fill" style="width: 0%"></div>
              </div>
              <span class="metadata-progress-text">Step 1 of ${this.totalSteps}</span>
            </div>
          </div>

          <!-- Content -->
          <div class="metadata-modal-content" id="metadata-step-content">
            <!-- Dynamic content will be inserted here -->
          </div>

          <!-- Footer -->
          <div class="metadata-modal-footer">
            <div class="metadata-modal-actions">
              <button id="metadata-back-btn" class="btn btn-secondary" style="display: none;">
                Back
              </button>
              <div class="metadata-action-group">
                ${this.isOptional ? '<button id="metadata-skip-btn" class="btn btn-outline">Skip for Now</button>' : ''}
                <button id="metadata-next-btn" class="btn btn-primary">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal if present
    const existingModal = document.getElementById('metadata-collection-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Setup event listeners
    this.setupEventListeners();
  }

  /**
   * Setup event listeners for modal controls
   */
  setupEventListeners() {
    const modal = document.getElementById('metadata-collection-modal');
    const backBtn = document.getElementById('metadata-back-btn');
    const nextBtn = document.getElementById('metadata-next-btn');
    const skipBtn = document.getElementById('metadata-skip-btn');

    // Navigation buttons
    backBtn?.addEventListener('click', () => this.previousStep());
    nextBtn?.addEventListener('click', () => this.nextStep());
    skipBtn?.addEventListener('click', () => this.skipCollection());

    // Close modal on background click
    modal.addEventListener('click', e => {
      if (e.target === modal) {
        this.closeModal();
      }
    });

    // Prevent modal close on content click
    modal.querySelector('.metadata-modal').addEventListener('click', e => {
      e.stopPropagation();
    });
  }

  /**
   * Show specific step of the collection process
   */
  showStep(stepIndex) {
    this.currentStep = stepIndex;
    this.updateProgress();
    this.updateButtons();

    const steps = [
      () => this.renderWelcomeStep(),
      () => this.renderDemographicStep(),
      () => this.renderPhilosophyStep(),
      () => this.renderMoralFoundationsStep(),
      () => this.renderConsentStep(),
    ];

    if (steps[stepIndex]) {
      steps[stepIndex]();
    }
  }

  /**
   * Update progress bar and step indicator
   */
  updateProgress() {
    const progress = ((this.currentStep + 1) / this.totalSteps) * 100;
    const progressFill = document.querySelector('.metadata-progress-fill');
    const progressText = document.querySelector('.metadata-progress-text');

    if (progressFill) progressFill.style.width = `${progress}%`;
    if (progressText)
      progressText.textContent = `Step ${this.currentStep + 1} of ${this.totalSteps}`;
  }

  /**
   * Update button states based on current step
   */
  updateButtons() {
    const backBtn = document.getElementById('metadata-back-btn');
    const nextBtn = document.getElementById('metadata-next-btn');

    // Show/hide back button
    if (backBtn) {
      backBtn.style.display = this.currentStep > 0 ? 'block' : 'none';
    }

    // Update next button text
    if (nextBtn) {
      nextBtn.textContent =
        this.currentStep === this.totalSteps - 1 ? 'Complete' : 'Next';
    }
  }

  /**
   * Render welcome and introduction step
   */
  renderWelcomeStep() {
    const titleElement = document.getElementById('metadata-step-title');
    const contentElement = document.getElementById('metadata-step-content');

    titleElement.textContent = 'Welcome to SimulateAI Research';

    contentElement.innerHTML = `
      <div class="metadata-welcome">
        <div class="metadata-welcome-icon">🧠✨</div>
        <h3>Help Us Understand How People Think About AI Ethics</h3>
        
        <div class="metadata-welcome-description">
          <p>SimulateAI is not just a learning platform—it's also a research initiative exploring how different people approach AI ethics dilemmas.</p>
          
          <p>By sharing some information about yourself, you'll help us:</p>
          <ul>
            <li><strong>Personalize your experience</strong> with scenarios that match your interests</li>
            <li><strong>Understand diverse perspectives</strong> on AI ethics across cultures and backgrounds</li>
            <li><strong>Advance research</strong> in ethical AI design and decision-making</li>
            <li><strong>Build better tools</strong> for ethics education and training</li>
          </ul>
        </div>

        <div class="metadata-welcome-privacy">
          <div class="privacy-highlight">
            <span class="privacy-icon">🔒</span>
            <div class="privacy-text">
              <strong>Your Privacy Matters</strong>
              <p>All data is anonymized and encrypted. You control what you share and can modify or delete your information at any time.</p>
            </div>
          </div>
        </div>

        <div class="metadata-welcome-time">
          <span class="time-icon">⏱️</span>
          <span><strong>Takes 3-5 minutes</strong> • Completely optional • Can be updated anytime</span>
        </div>
      </div>
    `;
  }

  /**
   * Render demographic information step
   */
  renderDemographicStep() {
    const titleElement = document.getElementById('metadata-step-title');
    const contentElement = document.getElementById('metadata-step-content');

    titleElement.textContent = 'About You';

    contentElement.innerHTML = `
      <div class="metadata-demographic">
        <p class="step-description">Help us understand the diversity of perspectives in AI ethics by sharing some basic information about yourself.</p>
        
        <div class="metadata-form">
          <!-- Age Range -->
          <div class="form-group">
            <label for="age-range">Age Range</label>
            <select id="age-range" class="form-control">
              <option value="">Select age range</option>
              ${DEMOGRAPHIC_OPTIONS.ageRanges
                .map(
                  option =>
                    `<option value="${option.value}">${option.label}</option>`
                )
                .join('')}
            </select>
          </div>

          <!-- Gender Identity -->
          <div class="form-group">
            <label for="gender-identity">Gender Identity</label>
            <select id="gender-identity" class="form-control">
              <option value="">Select gender identity</option>
              ${DEMOGRAPHIC_OPTIONS.genderIdentities
                .map(
                  option =>
                    `<option value="${option.value}">${option.label}</option>`
                )
                .join('')}
            </select>
          </div>

          <!-- Country -->
          <div class="form-group">
            <label for="country">Country</label>
            <input type="text" id="country" class="form-control" placeholder="e.g., United States, Canada, Germany">
          </div>

          <!-- Education Level -->
          <div class="form-group">
            <label for="education-level">Education Level</label>
            <select id="education-level" class="form-control">
              <option value="">Select education level</option>
              ${DEMOGRAPHIC_OPTIONS.educationLevels
                .map(
                  option =>
                    `<option value="${option.value}">${option.label}</option>`
                )
                .join('')}
            </select>
          </div>

          <!-- Profession -->
          <div class="form-group">
            <label for="profession">Profession/Field</label>
            <select id="profession" class="form-control">
              <option value="">Select profession or field</option>
              ${DEMOGRAPHIC_OPTIONS.professionCategories
                .map(
                  option =>
                    `<option value="${option.value}">${option.label}</option>`
                )
                .join('')}
            </select>
          </div>

          <!-- Religious Affiliation (Optional) -->
          <div class="form-group">
            <label for="religious-affiliation">Religious/Spiritual Affiliation <span class="optional">(Optional)</span></label>
            <select id="religious-affiliation" class="form-control">
              <option value="">Select affiliation (optional)</option>
              ${DEMOGRAPHIC_OPTIONS.religiousAffiliations
                .map(
                  option =>
                    `<option value="${option.value}">${option.label}</option>`
                )
                .join('')}
            </select>
          </div>
        </div>

        <div class="metadata-note">
          <p><em>All fields are optional. This information helps us understand how different backgrounds influence ethical reasoning.</em></p>
        </div>
      </div>
    `;

    // Load saved data if available
    this.loadDemographicData();
  }

  /**
   * Render philosophical approach step
   */
  renderPhilosophyStep() {
    const titleElement = document.getElementById('metadata-step-title');
    const contentElement = document.getElementById('metadata-step-content');

    titleElement.textContent = 'Your Philosophical Approach';

    contentElement.innerHTML = `
      <div class="metadata-philosophy">
        <p class="step-description">Understanding your philosophical leanings helps us provide more relevant scenarios and insights.</p>
        
        <div class="metadata-form">
          <!-- Ethical Framework -->
          <div class="form-group">
            <label>Which ethical approach resonates most with you?</label>
            <div class="philosophy-options">
              ${PHILOSOPHICAL_OPTIONS.ethicalFrameworks
                .map(
                  framework => `
                <div class="philosophy-option">
                  <input type="radio" id="framework-${framework.value}" name="ethical-framework" value="${framework.value}">
                  <label for="framework-${framework.value}" class="philosophy-card">
                    <div class="philosophy-title">${framework.label}</div>
                    <div class="philosophy-description">${framework.description}</div>
                    <div class="philosophy-keywords">${framework.keywords.join(' • ')}</div>
                  </label>
                </div>
              `
                )
                .join('')}
            </div>
          </div>

          <!-- Cognitive Style -->
          <div class="form-group">
            <label>How do you typically approach complex decisions?</label>
            <div class="cognitive-style-options">
              ${PHILOSOPHICAL_OPTIONS.cognitiveStyles
                .map(
                  style => `
                <div class="cognitive-option">
                  <input type="radio" id="cognitive-${style.value}" name="cognitive-style" value="${style.value}">
                  <label for="cognitive-${style.value}" class="cognitive-card">
                    <div class="cognitive-title">${style.label}</div>
                    <div class="cognitive-description">${style.description}</div>
                  </label>
                </div>
              `
                )
                .join('')}
            </div>
          </div>

          <!-- Political Orientation (Optional) -->
          <div class="form-group">
            <label for="political-orientation">Political Orientation <span class="optional">(Optional)</span></label>
            <select id="political-orientation" class="form-control">
              <option value="">Select orientation (optional)</option>
              ${PHILOSOPHICAL_OPTIONS.politicalOrientations
                .map(
                  option =>
                    `<option value="${option.value}">${option.label}</option>`
                )
                .join('')}
            </select>
            <small class="form-help">This helps us understand how political views might influence ethical reasoning in governance scenarios.</small>
          </div>
        </div>
      </div>
    `;

    // Load saved data if available
    this.loadPhilosophyData();
  }

  /**
   * Render moral foundations assessment step
   */
  renderMoralFoundationsStep() {
    const titleElement = document.getElementById('metadata-step-title');
    const contentElement = document.getElementById('metadata-step-content');

    titleElement.textContent = 'Moral Foundations';

    contentElement.innerHTML = `
      <div class="metadata-moral-foundations">
        <p class="step-description">Rate how important each moral foundation is to you when making ethical decisions (1 = Not important, 7 = Extremely important).</p>
        
        <div class="moral-foundations-grid">
          ${Object.entries(MORAL_FOUNDATIONS)
            .map(
              ([key, foundation]) => `
            <div class="moral-foundation-item">
              <div class="foundation-header">
                <h4>${foundation.name}</h4>
                <p>${foundation.description}</p>
              </div>
              
              <div class="foundation-rating">
                <label>How important is this to you?</label>
                <div class="rating-scale">
                  <span class="rating-label">Not Important</span>
                  ${[1, 2, 3, 4, 5, 6, 7]
                    .map(
                      rating => `
                    <label class="rating-option">
                      <input type="radio" name="foundation-${key}" value="${rating}">
                      <span class="rating-number">${rating}</span>
                    </label>
                  `
                    )
                    .join('')}
                  <span class="rating-label">Extremely Important</span>
                </div>
              </div>
            </div>
          `
            )
            .join('')}
        </div>

        <div class="metadata-note">
          <p><em>Based on Jonathan Haidt's Moral Foundations Theory. This helps us understand the diversity of moral reasoning approaches.</em></p>
        </div>
      </div>
    `;

    // Load saved data if available
    this.loadMoralFoundationsData();
  }

  /**
   * Render consent and data sharing step
   */
  renderConsentStep() {
    const titleElement = document.getElementById('metadata-step-title');
    const contentElement = document.getElementById('metadata-step-content');

    titleElement.textContent = 'Consent & Data Sharing';

    contentElement.innerHTML = `
      <div class="metadata-consent">
        <p class="step-description">Choose how you'd like your data to be used. You can change these preferences anytime in your profile settings.</p>
        
        <div class="consent-options">
          <!-- Research Participation -->
          <div class="consent-item">
            <div class="consent-header">
              <input type="checkbox" id="research-participation" class="consent-checkbox">
              <label for="research-participation" class="consent-title">
                <span class="consent-icon">🔬</span>
                Include my responses in anonymized research studies
              </label>
            </div>
            <p class="consent-description">Your scenario responses will be anonymized and included in academic research about AI ethics education and decision-making patterns.</p>
          </div>

          <!-- Data Sharing -->
          <div class="consent-item">
            <div class="consent-header">
              <input type="checkbox" id="data-sharing" class="consent-checkbox">
              <label for="data-sharing" class="consent-title">
                <span class="consent-icon">📊</span>
                Share anonymized response data with researchers
              </label>
            </div>
            <p class="consent-description">Anonymized data may be shared with qualified researchers studying AI ethics, moral psychology, and decision science.</p>
          </div>

          <!-- Public Contribution -->
          <div class="consent-item">
            <div class="consent-header">
              <input type="checkbox" id="public-contribution" class="consent-checkbox">
              <label for="public-contribution" class="consent-title">
                <span class="consent-icon">🌍</span>
                Contribute to public scenario development
              </label>
            </div>
            <p class="consent-description">Help improve SimulateAI by contributing feedback and suggestions for new scenarios and features.</p>
          </div>

          <!-- Insights Sharing -->
          <div class="consent-item">
            <div class="consent-header">
              <input type="checkbox" id="insights-sharing" class="consent-checkbox">
              <label for="insights-sharing" class="consent-title">
                <span class="consent-icon">💡</span>
                Receive personalized insights and comparisons
              </label>
            </div>
            <p class="consent-description">Get insights about your ethical reasoning patterns and how they compare to others (all data remains anonymous).</p>
          </div>

          <!-- Marketing Communication -->
          <div class="consent-item">
            <div class="consent-header">
              <input type="checkbox" id="marketing-communication" class="consent-checkbox">
              <label for="marketing-communication" class="consent-title">
                <span class="consent-icon">📧</span>
                Receive updates about new scenarios and features
              </label>
            </div>
            <p class="consent-description">Occasional emails about new SimulateAI scenarios, research findings, and platform updates.</p>
          </div>
        </div>

        <!-- Data Retention -->
        <div class="form-group">
          <label for="data-retention">How long should we keep your data?</label>
          <select id="data-retention" class="form-control">
            <option value="1year">1 year</option>
            <option value="3years" selected>3 years</option>
            <option value="5years">5 years</option>
            <option value="indefinite">Indefinitely (until I request deletion)</option>
          </select>
        </div>

        <div class="privacy-notice">
          <h4>Privacy Notice</h4>
          <p>Your data is encrypted and stored securely. You can:</p>
          <ul>
            <li>Update these preferences anytime in your profile</li>
            <li>Request a copy of your data</li>
            <li>Request deletion of your data</li>
            <li>Withdraw consent at any time</li>
          </ul>
          <p>For more details, see our <a href="/privacy-policy" target="_blank">Privacy Policy</a> and <a href="/research-consent" target="_blank">Research Consent Agreement</a>.</p>
        </div>
      </div>
    `;

    // Load saved data if available
    this.loadConsentData();
  }

  /**
   * Load demographic data from current userData
   */
  loadDemographicData() {
    const fields = [
      'age-range',
      'gender-identity',
      'country',
      'education-level',
      'profession',
      'religious-affiliation',
    ];
    const { demographics } = this.userData;

    fields.forEach(field => {
      const element = document.getElementById(field);
      const key = field.replace(/-([a-z])/g, g => g[1].toUpperCase());
      if (element && demographics[key]) {
        element.value = demographics[key];
      }
    });
  }

  /**
   * Load philosophy data from current userData
   */
  loadPhilosophyData() {
    const framework = this.userData.philosophy.preferredEthicalFramework;
    if (framework) {
      const frameworkRadio = document.querySelector(
        `input[name="ethical-framework"][value="${framework}"]`
      );
      if (frameworkRadio) frameworkRadio.checked = true;
    }

    const { cognitiveStyle } = this.userData.philosophy;
    if (cognitiveStyle) {
      const cognitiveRadio = document.querySelector(
        `input[name="cognitive-style"][value="${cognitiveStyle}"]`
      );
      if (cognitiveRadio) cognitiveRadio.checked = true;
    }

    const { politicalOrientation } = this.userData.philosophy;
    if (politicalOrientation) {
      const politicalSelect = document.getElementById('political-orientation');
      if (politicalSelect) politicalSelect.value = politicalOrientation;
    }
  }

  /**
   * Load moral foundations data from current userData
   */
  loadMoralFoundationsData() {
    const foundations = this.userData.philosophy.moralFoundations;
    Object.keys(foundations).forEach(foundation => {
      const rating = foundations[foundation];
      if (rating) {
        const radioButton = document.querySelector(
          `input[name="foundation-${foundation}"][value="${rating}"]`
        );
        if (radioButton) radioButton.checked = true;
      }
    });
  }

  /**
   * Load consent data from current userData
   */
  loadConsentData() {
    const { consent } = this.userData;
    const checkboxes = [
      'research-participation',
      'data-sharing',
      'public-contribution',
      'insights-sharing',
      'marketing-communication',
    ];

    checkboxes.forEach(checkboxId => {
      const checkbox = document.getElementById(checkboxId);
      const key = checkboxId.replace(/-([a-z])/g, g => g[1].toUpperCase());
      if (checkbox && consent[key]) {
        checkbox.checked = consent[key];
      }
    });

    const dataRetention = document.getElementById('data-retention');
    if (dataRetention && consent.dataRetentionPeriod) {
      dataRetention.value = consent.dataRetentionPeriod;
    }
  }

  /**
   * Save current step data
   */
  saveCurrentStepData() {
    switch (this.currentStep) {
      case 1:
        this.saveDemographicData();
        break;
      case 2:
        this.savePhilosophyData();
        break;
      case 3:
        this.saveMoralFoundationsData();
        break;
      case 4:
        this.saveConsentData();
        break;
    }
  }

  /**
   * Save demographic data
   */
  saveDemographicData() {
    const fields = [
      { id: 'age-range', key: 'ageRange' },
      { id: 'gender-identity', key: 'genderIdentity' },
      { id: 'country', key: 'country' },
      { id: 'education-level', key: 'educationLevel' },
      { id: 'profession', key: 'profession' },
      { id: 'religious-affiliation', key: 'religiousAffiliation' },
    ];

    fields.forEach(({ id, key }) => {
      const element = document.getElementById(id);
      if (element && element.value) {
        this.userData.demographics[key] = element.value;
      }
    });
  }

  /**
   * Save philosophy data
   */
  savePhilosophyData() {
    const frameworkRadio = document.querySelector(
      'input[name="ethical-framework"]:checked'
    );
    if (frameworkRadio) {
      this.userData.philosophy.preferredEthicalFramework = frameworkRadio.value;
    }

    const cognitiveRadio = document.querySelector(
      'input[name="cognitive-style"]:checked'
    );
    if (cognitiveRadio) {
      this.userData.philosophy.cognitiveStyle = cognitiveRadio.value;
    }

    const politicalSelect = document.getElementById('political-orientation');
    if (politicalSelect && politicalSelect.value) {
      this.userData.philosophy.politicalOrientation = politicalSelect.value;
    }
  }

  /**
   * Save moral foundations data
   */
  saveMoralFoundationsData() {
    Object.keys(MORAL_FOUNDATIONS).forEach(foundation => {
      const ratingRadio = document.querySelector(
        `input[name="foundation-${foundation}"]:checked`
      );
      if (ratingRadio) {
        this.userData.philosophy.moralFoundations[foundation] = parseInt(
          ratingRadio.value
        );
      }
    });
  }

  /**
   * Save consent data
   */
  saveConsentData() {
    const checkboxes = [
      { id: 'research-participation', key: 'researchParticipation' },
      { id: 'data-sharing', key: 'dataSharing' },
      { id: 'public-contribution', key: 'publicContribution' },
      { id: 'insights-sharing', key: 'insightsSharing' },
      { id: 'marketing-communication', key: 'marketingCommunication' },
    ];

    checkboxes.forEach(({ id, key }) => {
      const checkbox = document.getElementById(id);
      if (checkbox) {
        this.userData.consent[key] = checkbox.checked;
      }
    });

    const dataRetention = document.getElementById('data-retention');
    if (dataRetention) {
      this.userData.consent.dataRetentionPeriod = dataRetention.value;
    }

    // Set consent metadata
    this.userData.consent.consentVersion = '1.0';
    this.userData.consent.consentDate = new Date().toISOString();
  }

  /**
   * Validate current step
   */
  validateCurrentStep() {
    switch (this.currentStep) {
      case 0:
        return true; // Welcome step always valid
      case 1:
        return true; // Demographic step is optional
      case 2:
        return true; // Philosophy step is optional
      case 3:
        return true; // Moral foundations optional
      case 4:
        return true; // Consent step always valid
      default:
        return true;
    }
  }

  /**
   * Go to next step
   */
  nextStep() {
    if (!this.validateCurrentStep()) {
      return;
    }

    this.saveCurrentStepData();

    if (this.currentStep < this.totalSteps - 1) {
      this.showStep(this.currentStep + 1);
    } else {
      this.completeCollection();
    }
  }

  /**
   * Go to previous step
   */
  previousStep() {
    if (this.currentStep > 0) {
      this.saveCurrentStepData();
      this.showStep(this.currentStep - 1);
    }
  }

  /**
   * Skip the entire collection process
   */
  skipCollection() {
    this.closeModal();
    if (this.onSkip) {
      this.onSkip();
    }
  }

  /**
   * Complete the metadata collection
   */
  completeCollection() {
    this.saveCurrentStepData();

    // Add timestamps
    this.userData.createdAt = new Date().toISOString();
    this.userData.updatedAt = new Date().toISOString();
    this.userData.userId = this.generateUserId();

    // Close modal
    this.closeModal();

    // Call completion callback
    if (this.onComplete) {
      this.onComplete(this.userData);
    }
  }

  /**
   * Close the metadata collection modal
   */
  closeModal() {
    const modal = document.getElementById('metadata-collection-modal');
    if (modal) {
      modal.remove();
    }
  }

  /**
   * Generate a unique user ID
   */
  generateUserId() {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current collected data
   */
  getCollectedData() {
    return { ...this.userData };
  }

  /**
   * Load existing user data
   */
  loadExistingData(userData) {
    this.userData = { ...this.userData, ...userData };
  }
}

export default UserMetadataCollector;
