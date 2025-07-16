/**
 * Google reCAPTCHA v3 Service for SimulateAI Platform
 * Handles reCAPTCHA token generation and validation for form submissions
 *
 * @version 1.0.0
 * @author SimulateAI Team
 * @license Apache-2.0
 */

import logger from '../utils/logger.js';

/**
 * Configuration for Google reCAPTCHA v3
 */
const RECAPTCHA_CONFIG = {
  SITE_KEY: '6LfizIQrAAAAAETdjKY14uI3ckhF-JeUujcloH53',
  ACTIONS: {
    SUBMIT_FORM: 'submit_form',
    CONTACT_FORM: 'contact_form',
    RESEARCH_CONSENT: 'research_consent',
    FEEDBACK_FORM: 'feedback_form',
    AUTH_LOGIN: 'auth_login',
    AUTH_SIGNUP: 'auth_signup',
    SCENARIO_SUBMIT: 'scenario_submit',
    EMAIL_SUBSCRIBE: 'email_subscribe',
  },
  MIN_SCORE: 0.5, // Minimum score to consider valid (0.0 to 1.0)
  TIMEOUT: 10000, // 10 seconds timeout for reCAPTCHA
  BUTTON_RESTORE_TIMEOUT: 5000, // 5 seconds to restore button
  TOKEN_MIN_LENGTH: 20, // Minimum token length for validation
  CALLBACK_ID_BASE: 36, // Base for random ID generation
  CALLBACK_ID_LENGTH: 9, // Length of callback ID suffix
  ERROR_DISPLAY_TIMEOUT: 5000, // 5 seconds to show error message
};

/**
 * Google reCAPTCHA Service Class
 */
export class RecaptchaService {
  constructor() {
    this.isLoaded = false;
    this.siteKey = RECAPTCHA_CONFIG.SITE_KEY;
    this.loadingPromise = null;

    // Don't auto-initialize to prevent service duplication
    // Call init() manually after construction
  }

  /**
   * Initialize reCAPTCHA service
   */
  async init() {
    try {
      await this.waitForRecaptchaLoad();
      this.isLoaded = true;
      logger.info('reCAPTCHA', '✅ Google reCAPTCHA v3 service initialized');
    } catch (error) {
      logger.error('reCAPTCHA', '❌ Failed to initialize reCAPTCHA:', error);
    }
  }

  /**
   * Wait for Google reCAPTCHA API to load
   */
  waitForRecaptchaLoad() {
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('reCAPTCHA loading timeout'));
      }, RECAPTCHA_CONFIG.TIMEOUT);

      const checkRecaptcha = () => {
        if (window.grecaptcha && window.grecaptcha.ready) {
          clearTimeout(timeout);
          window.grecaptcha.ready(() => {
            resolve();
          });
        } else {
          setTimeout(checkRecaptcha, 100);
        }
      };

      checkRecaptcha();
    });

    return this.loadingPromise;
  }

  /**
   * Execute reCAPTCHA for a specific action
   * @param {string} action - The action to execute (e.g., 'submit_form')
   * @returns {Promise<string>} - reCAPTCHA token
   */
  async executeRecaptcha(action = RECAPTCHA_CONFIG.ACTIONS.SUBMIT_FORM) {
    try {
      if (!this.isLoaded) {
        await this.waitForRecaptchaLoad();
      }

      if (!window.grecaptcha || !window.grecaptcha.execute) {
        throw new Error('reCAPTCHA not available');
      }

      const token = await window.grecaptcha.execute(this.siteKey, { action });

      logger.info('reCAPTCHA', `✅ Token generated for action: ${action}`);
      return token;
    } catch (error) {
      logger.error(
        'reCAPTCHA',
        `❌ Failed to execute reCAPTCHA for action ${action}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Automatically bind reCAPTCHA to a button element
   * @param {HTMLElement} button - Button element to bind
   * @param {string} action - reCAPTCHA action
   * @param {Function} callback - Callback function to execute on success
   */
  bindToButton(
    button,
    action = RECAPTCHA_CONFIG.ACTIONS.SUBMIT_FORM,
    callback = null
  ) {
    if (!button) {
      logger.warn('reCAPTCHA', 'No button element provided for binding');
      return;
    }

    // Add reCAPTCHA attributes
    button.classList.add('g-recaptcha');
    button.setAttribute('data-sitekey', this.siteKey);
    button.setAttribute('data-action', action);

    if (callback) {
      const callbackName = `recaptcha_callback_${Date.now()}_${Math.random().toString(RECAPTCHA_CONFIG.CALLBACK_ID_BASE).substr(2, RECAPTCHA_CONFIG.CALLBACK_ID_LENGTH)}`;
      window[callbackName] = callback;
      button.setAttribute('data-callback', callbackName);
    }

    logger.info('reCAPTCHA', `✅ Button bound with action: ${action}`);
  }

  /**
   * Create a protected form submission handler
   * @param {HTMLFormElement} form - Form element to protect
   * @param {string} action - reCAPTCHA action
   * @param {Function} submitHandler - Custom submit handler function
   */
  protectForm(
    form,
    action = RECAPTCHA_CONFIG.ACTIONS.SUBMIT_FORM,
    submitHandler = null
  ) {
    if (!form) {
      logger.warn('reCAPTCHA', 'No form element provided for protection');
      return;
    }

    const originalSubmit = form.onsubmit;

    form.onsubmit = async event => {
      event.preventDefault();

      let submitBtn = null;
      let originalText = '';

      try {
        // Show loading state
        submitBtn = form.querySelector(
          'button[type="submit"], input[type="submit"]'
        );
        if (submitBtn) {
          submitBtn.disabled = true;
          originalText = submitBtn.textContent;
          submitBtn.textContent = '🔒 Verifying...';

          // Restore button after timeout
          setTimeout(() => {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = originalText;
            }
          }, RECAPTCHA_CONFIG.BUTTON_RESTORE_TIMEOUT);
        }

        // Execute reCAPTCHA
        const token = await this.executeRecaptcha(action);

        // Add token to form data
        let tokenInput = form.querySelector(
          'input[name="g-recaptcha-response"]'
        );
        if (!tokenInput) {
          tokenInput = document.createElement('input');
          tokenInput.type = 'hidden';
          tokenInput.name = 'g-recaptcha-response';
          form.appendChild(tokenInput);
        }
        tokenInput.value = token;

        // Execute custom handler or original submit
        if (submitHandler) {
          await submitHandler(form, token);
        } else if (originalSubmit) {
          originalSubmit.call(form, event);
        } else {
          form.submit();
        }

        // Restore button
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      } catch (error) {
        logger.error('reCAPTCHA', 'Form submission failed:', error);

        // Show error message
        this.showError(form, 'Security verification failed. Please try again.');

        // Restore button
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
    };

    logger.info('reCAPTCHA', `✅ Form protected with action: ${action}`);
  }

  /**
   * Validate reCAPTCHA token on client side (basic validation)
   * Note: Server-side validation is still required for security
   * @param {string} token - reCAPTCHA token to validate
   * @returns {boolean} - Basic validation result
   */
  validateToken(token) {
    if (!token || typeof token !== 'string') {
      return false;
    }

    // Basic format validation
    const tokenPattern = /^[A-Za-z0-9_-]+$/;
    return (
      tokenPattern.test(token) &&
      token.length > RECAPTCHA_CONFIG.TOKEN_MIN_LENGTH
    );
  }

  /**
   * Show error message to user
   * @param {HTMLElement} element - Element to show error near
   * @param {string} message - Error message
   */
  showError(element, message) {
    // Remove existing error
    const existingError = element.parentNode.querySelector('.recaptcha-error');
    if (existingError) {
      existingError.remove();
    }

    // Create error element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'recaptcha-error';
    errorDiv.style.cssText = `
      color: #dc3545;
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 4px;
      padding: 8px 12px;
      margin-top: 8px;
      font-size: 14px;
    `;
    errorDiv.textContent = message;

    // Insert after element
    element.parentNode.insertBefore(errorDiv, element.nextSibling);

    // Auto-remove after timeout
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.remove();
      }
    }, RECAPTCHA_CONFIG.ERROR_DISPLAY_TIMEOUT);
  }

  /**
   * Get available reCAPTCHA actions
   * @returns {Object} - Available actions
   */
  getActions() {
    return { ...RECAPTCHA_CONFIG.ACTIONS };
  }

  /**
   * Check if reCAPTCHA is ready
   * @returns {boolean} - Ready status
   */
  isReady() {
    return this.isLoaded && window.grecaptcha && window.grecaptcha.execute;
  }

  /**
   * Reset reCAPTCHA (if needed)
   */
  reset() {
    if (window.grecaptcha && window.grecaptcha.reset) {
      window.grecaptcha.reset();
      logger.info('reCAPTCHA', '🔄 reCAPTCHA reset');
    }
  }
}

// Create singleton instance
const recaptchaService = new RecaptchaService();

// Global callback functions for automatic binding
window.onRecaptchaSubmit = async function (token) {
  logger.info('reCAPTCHA', '✅ Token received via callback:', token);

  // Find the form associated with the reCAPTCHA button
  const recaptchaButton = document.querySelector(
    '.g-recaptcha[data-callback="onRecaptchaSubmit"]'
  );
  if (recaptchaButton) {
    const form = recaptchaButton.closest('form');
    if (form) {
      // Add token to form
      let tokenInput = form.querySelector('input[name="g-recaptcha-response"]');
      if (!tokenInput) {
        tokenInput = document.createElement('input');
        tokenInput.type = 'hidden';
        tokenInput.name = 'g-recaptcha-response';
        form.appendChild(tokenInput);
      }
      tokenInput.value = token;

      // Submit form
      form.submit();
    }
  }
};

// Export service and actions
export { RECAPTCHA_CONFIG };
export default recaptchaService;

// Make available globally for debugging
if (typeof window !== 'undefined') {
  window.recaptchaService = recaptchaService;
  window.RECAPTCHA_ACTIONS = RECAPTCHA_CONFIG.ACTIONS;
}

logger.info('reCAPTCHA', '📦 reCAPTCHA service module loaded');
