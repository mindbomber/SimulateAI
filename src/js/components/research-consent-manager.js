/**
 * Research Consent Form Handler
 * Manages consent form interactions, validation, and data storage
 */

class ResearchConsentManager {
  constructor() {
    // Constants
    this.ANIMATION_DURATION = 200;
    this.FEEDBACK_DISPLAY_DURATION = 3000;
    this.FEEDBACK_FADE_DURATION = 500;
    this.REDIRECT_DELAY = 2000;
    this.CONSENT_VALIDITY_DAYS = 30;
    this.RADIX_BASE = 36;
    this.SESSION_ID_LENGTH = 9;
    this.MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

    this.consentData = {
      timestamp: null,
      consents: {},
      userAgent: navigator.userAgent,
      ipAddress: 'recorded_server_side',
      sessionId: this.generateSessionId(),
    };

    this.init();
  }

  init() {
    this.setCurrentDate();
    this.setupEventListeners();
    this.checkExistingConsent();
    this.setupProgressTracking();
    this.setupAccessibility();
  }

  generateSessionId() {
    const timestamp = Date.now();
    const randomStr = Math.random()
      .toString(this.RADIX_BASE)
      .substr(2, this.SESSION_ID_LENGTH);
    return `consent_${timestamp}_${randomStr}`;
  }

  setCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
      dateElement.textContent = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  }

  setupEventListeners() {
    // Checkbox handling
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', e => this.handleCheckboxChange(e));
    });

    // Button handlers
    const agreeButton = document.getElementById('agreeButton');
    if (agreeButton) {
      agreeButton.addEventListener('click', () => this.submitConsent());
    }

    // Scroll progress
    window.addEventListener('scroll', () => this.updateScrollProgress());

    // Auto-save draft
    document.addEventListener('change', () => this.saveDraft());

    // Keyboard navigation
    document.addEventListener('keydown', e => this.handleKeyNavigation(e));
  }

  handleCheckboxChange(event) {
    const checkbox = event.target;
    const container = checkbox.closest('.consent-checkbox');

    // Update visual state
    if (checkbox.checked) {
      container.classList.add('checked');
      this.animateCheckbox(container);
    } else {
      container.classList.remove('checked');
    }

    // Update consent data
    this.consentData.consents[checkbox.name] = checkbox.checked;

    // Update progress and validation
    this.updateProgress();
    this.validateAllConsents();

    // Analytics tracking
    this.trackConsentInteraction(checkbox.name, checkbox.checked);
  }

  animateCheckbox(container) {
    container.style.transform = 'scale(1.05)';
    setTimeout(() => {
      container.style.transform = '';
    }, 200);
  }

  updateProgress() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const checked = document.querySelectorAll(
      'input[type="checkbox"]:checked'
    ).length;
    const progress = (checked / checkboxes.length) * 100;

    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
      progressBar.style.width = `${progress}%`;

      // Add completion effect
      if (progress === 100) {
        progressBar.style.background =
          'linear-gradient(90deg, #4caf50, #66bb6a)';
        this.showCompletionFeedback();
      }
    }
  }

  updateScrollProgress() {
    const scrolled = window.pageYOffset;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min((scrolled / total) * 100, 100);

    const progressBar = document.getElementById('progressBar');
    if (progressBar && progress > 0) {
      // Combine scroll and checkbox progress
      const checkboxProgress = this.getCheckboxProgress();
      const combinedProgress = Math.max(progress, checkboxProgress);
      progressBar.style.width = `${combinedProgress}%`;
    }
  }

  getCheckboxProgress() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const checked = document.querySelectorAll(
      'input[type="checkbox"]:checked'
    ).length;
    return (checked / checkboxes.length) * 100;
  }

  validateAllConsents() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const agreeButton = document.getElementById('agreeButton');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);

    if (agreeButton) {
      agreeButton.disabled = !allChecked;

      if (allChecked) {
        agreeButton.style.background =
          'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)';
        agreeButton.innerHTML = '✅ All Requirements Met - Proceed';
        agreeButton.classList.add('ready');
        this.enableSubmission();
      } else {
        agreeButton.style.background = '';
        agreeButton.innerHTML = '🚀 I Agree - Activate Research Profile';
        agreeButton.classList.remove('ready');
      }
    }
  }

  showCompletionFeedback() {
    // Create a subtle success indicator
    const existingFeedback = document.querySelector('.completion-feedback');
    if (!existingFeedback) {
      const feedback = document.createElement('div');
      feedback.className = 'completion-feedback';
      feedback.innerHTML = '🎉 All consents completed!';
      feedback.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #4caf50, #66bb6a);
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                font-weight: 600;
                box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
                z-index: 1001;
                animation: slideInRight 0.5s ease-out;
            `;

      document.body.appendChild(feedback);

      // Remove after 3 seconds
      setTimeout(() => {
        feedback.style.animation = 'slideOutRight 0.5s ease-out';
        setTimeout(() => feedback.remove(), 500);
      }, 3000);
    }
  }

  enableSubmission() {
    const agreeButton = document.getElementById('agreeButton');
    if (agreeButton) {
      agreeButton.style.animation = 'pulse 2s infinite';
    }
  }

  async submitConsent() {
    const agreeButton = document.getElementById('agreeButton');

    try {
      // Show loading state
      this.setButtonLoading(agreeButton, true);

      // Prepare consent data
      this.consentData.timestamp = new Date().toISOString();
      this.consentData.formVersion = '1.0';
      this.consentData.pageUrl = window.location.href;

      // Validate all consents are checked
      if (!this.validateConsentData()) {
        throw new Error('Not all required consents are provided');
      }

      // Store locally
      this.storeConsentData();

      // Send to server (if implemented)
      await this.sendConsentToServer();

      // Show success and redirect
      this.showSuccessMessage();

      // Redirect after delay
      setTimeout(() => {
        this.redirectToActivation();
      }, 2000);
    } catch (error) {
      console.error('Consent submission error:', error);
      this.showErrorMessage(error.message);
      this.setButtonLoading(agreeButton, false);
    }
  }

  setButtonLoading(button, isLoading) {
    if (isLoading) {
      button.innerHTML = '⏳ Processing...';
      button.disabled = true;
      button.style.cursor = 'wait';
    } else {
      button.innerHTML = '🚀 I Agree - Activate Research Profile';
      button.disabled = false;
      button.style.cursor = 'pointer';
    }
  }

  validateConsentData() {
    const requiredConsents = ['consent1', 'consent2', 'consent3', 'consent4'];
    return requiredConsents.every(consentId => {
      const checkbox = document.getElementById(consentId);
      return checkbox && checkbox.checked;
    });
  }

  storeConsentData() {
    try {
      // Store in localStorage
      localStorage.setItem(
        'research_consent',
        JSON.stringify(this.consentData)
      );

      // Store in sessionStorage as backup
      sessionStorage.setItem(
        'research_consent_session',
        JSON.stringify({
          ...this.consentData,
          sessionOnly: true,
        })
      );

      console.log('Consent data stored successfully');
    } catch (error) {
      console.error('Error storing consent data:', error);
      throw new Error('Failed to store consent data locally');
    }
  }

  async sendConsentToServer() {
    // This would integrate with your backend API
    // For now, we'll simulate the API call

    try {
      const response = await fetch('/api/research/consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.consentData),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Consent submitted to server:', result);
    } catch (error) {
      // For demo purposes, we'll not fail on server errors
      console.warn(
        'Server submission failed (this is expected in demo):',
        error
      );
    }
  }

  showSuccessMessage() {
    const message = document.createElement('div');
    message.innerHTML = `
            <div style="background: linear-gradient(135deg, #4caf50, #66bb6a); color: white; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0; animation: slideUp 0.5s ease-out;">
                <h3>✅ Consent Recorded Successfully!</h3>
                <p>You will now be redirected to complete your research profile activation.</p>
                <small>Redirecting in 2 seconds...</small>
            </div>
        `;

    const consentForm = document.querySelector('.consent-form');
    consentForm.appendChild(message);
  }

  showErrorMessage(errorText) {
    const existingError = document.querySelector('.error-message');
    if (existingError) existingError.remove();

    const message = document.createElement('div');
    message.className = 'error-message';
    message.innerHTML = `
            <div style="background: #ffebee; color: #c62828; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #f44336;">
                <strong>❌ Error:</strong> ${errorText}
            </div>
        `;

    const agreeButton = document.getElementById('agreeButton');
    agreeButton.parentNode.insertBefore(message, agreeButton);
  }

  redirectToActivation() {
    // In a real implementation, redirect to payment/activation page
    const hasActivationPage = document.querySelector('a[href*="activation"]');

    if (hasActivationPage) {
      window.location.href = '/research-activation.html';
    } else {
      // Demo: show alert and redirect to main app
      alert(
        '✅ Consent completed!\n\nIn a production environment, you would be redirected to complete a $5 donation for research participation activation.'
      );
      window.location.href = '/';
    }
  }

  saveDraft() {
    // Auto-save form state
    const draftData = {
      consents: this.consentData.consents,
      timestamp: new Date().toISOString(),
      isDraft: true,
    };

    try {
      localStorage.setItem('research_consent_draft', JSON.stringify(draftData));
    } catch (error) {
      console.warn('Could not save draft:', error);
    }
  }

  checkExistingConsent() {
    try {
      // Check for existing consent
      const existingConsent = localStorage.getItem('research_consent');
      if (existingConsent) {
        const consent = JSON.parse(existingConsent);
        const consentDate = new Date(consent.timestamp);
        const daysSinceConsent =
          (Date.now() - consentDate.getTime()) / (1000 * 60 * 60 * 24);

        // If consent is less than 30 days old, offer to skip
        if (daysSinceConsent < 30) {
          this.showExistingConsentMessage(consentDate);
        }
      }

      // Check for draft
      const draft = localStorage.getItem('research_consent_draft');
      if (draft) {
        this.loadDraft(JSON.parse(draft));
      }
    } catch (error) {
      console.warn('Error checking existing consent:', error);
    }
  }

  showExistingConsentMessage(consentDate) {
    const message = document.createElement('div');
    message.innerHTML = `
            <div style="background: #e3f2fd; border: 1px solid #1976d2; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h4 style="color: #1976d2; margin-bottom: 10px;">🔍 Existing Consent Found</h4>
                <p>You provided research consent on ${consentDate.toLocaleDateString()}. You may proceed directly to the research platform.</p>
                <button onclick="window.location.href='/'" style="background: #1976d2; color: white; border: none; padding: 8px 16px; border-radius: 4px; margin-top: 10px; cursor: pointer;">
                    Go to Research Platform
                </button>
            </div>
        `;

    const consentContent = document.querySelector('.consent-content');
    consentContent.insertBefore(message, consentContent.firstChild);
  }

  loadDraft(draft) {
    Object.keys(draft.consents).forEach(consentId => {
      const checkbox = document.getElementById(consentId);
      if (checkbox && draft.consents[consentId]) {
        checkbox.checked = true;
        checkbox.dispatchEvent(new Event('change'));
      }
    });

    // Show draft notification
    const notification = document.createElement('div');
    notification.innerHTML = `
            <div style="background: #fff3e0; border: 1px solid #f57c00; padding: 10px; border-radius: 4px; margin-bottom: 15px; font-size: 14px;">
                📝 Draft restored from previous session
            </div>
        `;

    const consentForm = document.querySelector('.consent-form');
    consentForm.insertBefore(notification, consentForm.firstChild);
  }

  setupProgressTracking() {
    // Track user engagement metrics
    this.startTime = Date.now();
    this.scrollDepth = 0;
    this.maxScrollDepth = 0;

    window.addEventListener('scroll', () => {
      const scrollPercent =
        (window.scrollY /
          (document.documentElement.scrollHeight - window.innerHeight)) *
        100;
      this.maxScrollDepth = Math.max(this.maxScrollDepth, scrollPercent);
    });

    // Track time spent on each section
    this.setupSectionTracking();
  }

  setupSectionTracking() {
    const sections = document.querySelectorAll('.section');
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const sectionTitle = entry.target.querySelector('h2')?.textContent;
            this.trackSectionView(sectionTitle);
          }
        });
      },
      { threshold: 0.5 }
    );

    sections.forEach(section => observer.observe(section));
  }

  trackConsentInteraction(consentType, checked) {
    console.log(`Consent interaction: ${consentType} = ${checked}`);
    // Here you could send analytics to your tracking service
  }

  trackSectionView(sectionTitle) {
    console.log(`Section viewed: ${sectionTitle}`);
    // Here you could send analytics to your tracking service
  }

  setupAccessibility() {
    // Keyboard navigation improvements
    document.addEventListener('keydown', e => this.handleKeyNavigation(e));

    // Focus management
    this.setupFocusManagement();

    // Screen reader announcements
    this.setupScreenReaderSupport();
  }

  handleKeyNavigation(e) {
    // Enter key on checkboxes
    if (e.key === 'Enter' && e.target.type === 'checkbox') {
      e.target.click();
    }

    // Tab navigation to next unchecked item
    if (e.key === 'Tab' && e.ctrlKey) {
      e.preventDefault();
      this.focusNextUnchecked();
    }
  }

  focusNextUnchecked() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const unchecked = Array.from(checkboxes).find(cb => !cb.checked);
    if (unchecked) {
      unchecked.focus();
    }
  }

  setupFocusManagement() {
    // Highlight focused elements
    document.addEventListener('focusin', e => {
      if (e.target.matches('input[type="checkbox"]')) {
        e.target.closest('.consent-checkbox').style.outline =
          '3px solid #1976d2';
      }
    });

    document.addEventListener('focusout', e => {
      if (e.target.matches('input[type="checkbox"]')) {
        e.target.closest('.consent-checkbox').style.outline = '';
      }
    });
  }

  setupScreenReaderSupport() {
    // Add aria-live region for progress updates
    const progressAnnouncer = document.createElement('div');
    progressAnnouncer.setAttribute('aria-live', 'polite');
    progressAnnouncer.setAttribute('aria-atomic', 'true');
    progressAnnouncer.style.cssText =
      'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
    progressAnnouncer.id = 'progress-announcer';
    document.body.appendChild(progressAnnouncer);

    // Announce progress changes
    const originalUpdateProgress = this.updateProgress.bind(this);
    this.updateProgress = function () {
      originalUpdateProgress();
      const checked = document.querySelectorAll(
        'input[type="checkbox"]:checked'
      ).length;
      const total = document.querySelectorAll('input[type="checkbox"]').length;
      progressAnnouncer.textContent = `${checked} of ${total} consent items completed`;
    };
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ResearchConsentManager();
});

// Add required CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .btn.ready {
        animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);
