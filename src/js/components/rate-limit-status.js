/**
 * Rate Limit Status Component
 * Provides user-friendly feedback for authentication rate limiting
 */

class RateLimitStatus {
  constructor() {
    this.firebaseService = window.firebaseService;
    this.container = null;
    this.isVisible = false;
    this.refreshInterval = null;
  }

  /**
   * Create and show rate limit status UI
   */
  show(rateLimitResult) {
    if (!rateLimitResult || rateLimitResult.allowed) {
      this.hide();
      return;
    }

    this.createContainer();
    this.updateContent(rateLimitResult);
    this.startRefreshTimer();
    this.isVisible = true;
  }

  /**
   * Hide rate limit status UI
   */
  hide() {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }

    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }

    this.isVisible = false;
  }

  /**
   * Create the status container
   */
  createContainer() {
    if (this.container) {
      return;
    }

    this.container = document.createElement('div');
    this.container.className = 'rate-limit-status';
    this.container.innerHTML = `
      <div class="rate-limit-content">
        <div class="rate-limit-icon">⏱️</div>
        <div class="rate-limit-message">
          <h4>Too Many Attempts</h4>
          <p class="rate-limit-description"></p>
          <div class="rate-limit-timer"></div>
        </div>
        <button class="rate-limit-close" type="button" aria-label="Close">×</button>
      </div>
    `;

    // Add event listeners
    const closeBtn = this.container.querySelector('.rate-limit-close');
    closeBtn.addEventListener('click', () => this.hide());

    // Insert into DOM
    const targetContainer =
      document.querySelector('.auth-modal') ||
      document.querySelector('.modal-content') ||
      document.body;

    targetContainer.appendChild(this.container);
  }

  /**
   * Update the content with current rate limit info
   */
  updateContent(rateLimitResult) {
    if (!this.container || !rateLimitResult) return;

    const description = this.container.querySelector('.rate-limit-description');
    const timer = this.container.querySelector('.rate-limit-timer');

    // Generate helpful description
    const { remainingMinutes } = rateLimitResult;
    let message = 'Please wait before trying to sign in again.';

    if (remainingMinutes > 60) {
      const hours = Math.ceil(remainingMinutes / 60);
      message = `Too many failed attempts. Please try again in ${hours} hour${hours > 1 ? 's' : ''}.`;
    } else if (remainingMinutes > 1) {
      message = `Too many failed attempts. Please try again in ${remainingMinutes} minutes.`;
    } else {
      message =
        'Too many failed attempts. Please try again in less than a minute.';
    }

    description.textContent = message;

    // Update timer display
    this.updateTimer(rateLimitResult);
  }

  /**
   * Update the countdown timer
   */
  updateTimer(rateLimitResult) {
    if (!this.container) return;

    const timer = this.container.querySelector('.rate-limit-timer');
    const { remainingMinutes, cooldownEnd } = rateLimitResult;

    if (!cooldownEnd) {
      timer.textContent = '';
      return;
    }

    const now = Date.now();
    const remaining = Math.max(0, cooldownEnd - now);

    if (remaining <= 0) {
      timer.textContent = 'You can try signing in again now.';
      timer.classList.add('rate-limit-ready');
      return;
    }

    const minutes = Math.floor(remaining / (60 * 1000));
    const seconds = Math.floor((remaining % (60 * 1000)) / 1000);

    if (minutes > 0) {
      timer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')} remaining`;
    } else {
      timer.textContent = `${seconds} seconds remaining`;
    }

    timer.classList.remove('rate-limit-ready');
  }

  /**
   * Start the refresh timer to update countdown
   */
  startRefreshTimer() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    this.refreshInterval = setInterval(async () => {
      try {
        // Get current rate limit status
        const status = await this.firebaseService.getRateLimitStatus();

        if (status.allowed) {
          // Rate limit lifted, hide the UI
          this.hide();
        } else {
          // Update the timer
          this.updateTimer(status);
        }
      } catch (error) {
        // If we can't check status, hide the UI
        this.hide();
      }
    }, 1000); // Update every second
  }

  /**
   * Show a brief success message when rate limit is lifted
   */
  showReadyMessage() {
    const message = document.createElement('div');
    message.className = 'rate-limit-ready-message';
    message.innerHTML = `
      <div class="rate-limit-ready-content">
        <span class="rate-limit-ready-icon">✅</span>
        <span>You can now try signing in again</span>
      </div>
    `;

    document.body.appendChild(message);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (message.parentNode) {
        message.remove();
      }
    }, 3000);
  }
}

// CSS styles for the rate limit status component
const rateLimitCSS = `
.rate-limit-status {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  max-width: 400px;
  background: #fee;
  border: 2px solid #fcc;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.rate-limit-content {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  gap: 12px;
}

.rate-limit-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.rate-limit-message {
  flex: 1;
  min-width: 0;
}

.rate-limit-message h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #d73027;
}

.rate-limit-description {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

.rate-limit-timer {
  font-size: 13px;
  font-weight: 500;
  color: #d73027;
  font-family: monospace;
}

.rate-limit-timer.rate-limit-ready {
  color: #2e7d32;
}

.rate-limit-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.rate-limit-close:hover {
  color: #666;
}

.rate-limit-ready-message {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 10000;
  background: #e8f5e8;
  border: 2px solid #4caf50;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.rate-limit-ready-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #2e7d32;
}

.rate-limit-ready-icon {
  font-size: 16px;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .rate-limit-status {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
  
  .rate-limit-ready-message {
    bottom: 10px;
    right: 10px;
    left: 10px;
  }
}
`;

// Inject CSS styles
if (!document.querySelector('#rate-limit-status-styles')) {
  const style = document.createElement('style');
  style.id = 'rate-limit-status-styles';
  style.textContent = rateLimitCSS;
  document.head.appendChild(style);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RateLimitStatus;
} else {
  window.RateLimitStatus = RateLimitStatus;
}
