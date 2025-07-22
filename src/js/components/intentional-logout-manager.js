/**
 * Intentional Logout Manager
 * Handles graceful user logout with clear communication about the reason
 */

import eventDispatcher, { AUTH_EVENTS } from "../utils/event-dispatcher.js";

class IntentionalLogoutManager {
  constructor(authService) {
    this.authService = authService;
    this.firebaseService = authService?.firebaseService;
    this.logoutModal = null;
    this.logoutTimer = null;
    this.warningTimer = null;
    this.isShowingLogoutModal = false;

    // Configuration
    this.config = {
      inactivityTimeout: 30 * 60 * 1000, // 30 minutes
      warningTime: 5 * 60 * 1000, // 5 minutes before logout
      sessionRefreshInterval: 60 * 1000, // Check every minute
      maxSessionDuration: 8 * 60 * 60 * 1000, // 8 hours max session
    };

    this.initializeSessionMonitoring();
  }

  /**
   * Initialize session monitoring
   */
  initializeSessionMonitoring() {
    // Track user activity
    this.setupActivityTracking();

    // Monitor session duration
    this.setupSessionDurationMonitoring();

    // Listen for auth state changes
    this.setupAuthStateMonitoring();
  }

  /**
   * Setup activity tracking
   */
  setupActivityTracking() {
    this.lastActivity = Date.now();
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    const updateActivity = () => {
      this.lastActivity = Date.now();
      this.clearWarningIfActive();
    };

    events.forEach((event) => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Start inactivity monitoring
    this.startInactivityMonitoring();
  }

  /**
   * Setup session duration monitoring
   */
  setupSessionDurationMonitoring() {
    // Check session duration periodically
    setInterval(() => {
      this.checkSessionDuration();
    }, this.config.sessionRefreshInterval);
  }

  /**
   * Setup auth state monitoring for external changes
   */
  setupAuthStateMonitoring() {
    if (this.firebaseService?.auth) {
      this.firebaseService.auth.onAuthStateChanged((user) => {
        if (
          !user &&
          this.authService?.currentUser &&
          !this.isShowingLogoutModal
        ) {
          // User was signed out externally
          this.handleIntentionalLogout("external_logout", {
            title: "Session Ended",
            message: "You have been signed out from another device or window.",
            reason:
              "Your session was terminated from another location for security.",
            showReauthenticate: true,
          });
        }
      });
    }
  }

  /**
   * Start monitoring for inactivity
   */
  startInactivityMonitoring() {
    const checkInactivity = () => {
      const timeSinceActivity = Date.now() - this.lastActivity;
      const timeUntilLogout = this.config.inactivityTimeout - timeSinceActivity;

      if (timeUntilLogout <= this.config.warningTime && timeUntilLogout > 0) {
        // Show warning
        this.showInactivityWarning(Math.ceil(timeUntilLogout / 1000));
      } else if (timeUntilLogout <= 0) {
        // Log out due to inactivity
        this.handleIntentionalLogout("inactivity", {
          title: "Signed Out Due to Inactivity",
          message: "You have been automatically signed out for security.",
          reason: "No activity detected for 30 minutes.",
          showReauthenticate: true,
        });
        return; // Stop monitoring
      }

      // Continue monitoring
      setTimeout(checkInactivity, 30000); // Check every 30 seconds
    };

    // Start monitoring
    setTimeout(checkInactivity, 30000);
  }

  /**
   * Check session duration limits
   */
  checkSessionDuration() {
    if (!this.authService?.currentUser) return;

    const sessionStart = this.getSessionStartTime();
    if (
      sessionStart &&
      Date.now() - sessionStart > this.config.maxSessionDuration
    ) {
      this.handleIntentionalLogout("session_expired", {
        title: "Session Expired",
        message: "Your session has expired for security.",
        reason: "Sessions are limited to 8 hours for security purposes.",
        showReauthenticate: true,
      });
    }
  }

  /**
   * Get session start time from local storage or auth metadata
   */
  getSessionStartTime() {
    try {
      const sessionData = localStorage.getItem("session_start_time");
      return sessionData ? parseInt(sessionData, 10) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Show inactivity warning
   */
  showInactivityWarning(secondsRemaining) {
    if (this.isShowingLogoutModal) return;

    const minutes = Math.ceil(secondsRemaining / 60);

    this.showLogoutModal({
      type: "warning",
      title: "Session Timeout Warning",
      message: `You will be signed out in ${minutes} minute${minutes > 1 ? "s" : ""} due to inactivity.`,
      reason: "This helps protect your account when you step away.",
      actions: [
        {
          text: "Stay Signed In",
          action: () => {
            this.extendSession();
            this.hideLogoutModal();
          },
          primary: true,
        },
        {
          text: "Sign Out Now",
          action: () => {
            this.handleIntentionalLogout("user_requested", {
              title: "Signed Out",
              message: "You have been signed out successfully.",
              reason: "You chose to sign out.",
              showReauthenticate: false,
            });
          },
          primary: false,
        },
      ],
      countdown: secondsRemaining,
      autoAction: () => {
        this.handleIntentionalLogout("inactivity", {
          title: "Signed Out Due to Inactivity",
          message: "You have been automatically signed out for security.",
          reason: "No activity detected for 30 minutes.",
          showReauthenticate: true,
        });
      },
    });
  }

  /**
   * Handle intentional logout with reason
   */
  async handleIntentionalLogout(reason, options = {}) {
    // Prevent multiple logout attempts
    if (this.isShowingLogoutModal && reason !== "user_requested") return;

    this.isShowingLogoutModal = true;

    // Clear any existing timers
    this.clearAllTimers();

    // Log the logout reason for analytics
    this.logLogoutEvent(reason, options);

    // Show logout modal
    this.showLogoutModal({
      type: "logout",
      title: options.title || "Signed Out",
      message: options.message || "You have been signed out.",
      reason: options.reason || "Session ended.",
      actions: [
        ...(options.showReauthenticate
          ? [
              {
                text: "Sign In Again",
                action: () => {
                  this.hideLogoutModal();
                  this.authService?.showLoginModal?.();
                },
                primary: true,
              },
            ]
          : []),
        {
          text: "Close",
          action: () => {
            this.hideLogoutModal();
          },
          primary: false,
        },
      ],
    });

    // Perform the actual logout
    try {
      await this.performLogout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  /**
   * Perform the actual logout
   */
  async performLogout() {
    try {
      // Dispatch logout request event instead of calling auth service directly
      eventDispatcher.emit(AUTH_EVENTS.INTENTIONAL_LOGOUT_REQUESTED, {
        reason: "intentional_logout",
        data: {
          timestamp: Date.now(),
          source: "logout_manager",
        },
      });

      // Clear local session data
      this.clearSessionData();
      this.clearUserData();
    } catch (error) {
      // Even if logout fails, clear local session
      this.clearSessionData();
      this.clearUserData();
      throw error;
    }
  }

  /**
   * Show logout modal
   */
  showLogoutModal(config) {
    this.hideLogoutModal(); // Hide any existing modal

    this.logoutModal = document.createElement("div");
    this.logoutModal.className = "intentional-logout-modal";
    this.logoutModal.innerHTML = `
      <div class="logout-modal-overlay">
        <div class="logout-modal-content">
          <div class="logout-modal-header">
            <div class="logout-modal-icon">${this.getIconForType(config.type)}</div>
            <h3 class="logout-modal-title">${config.title}</h3>
          </div>
          <div class="logout-modal-body">
            <p class="logout-modal-message">${config.message}</p>
            <p class="logout-modal-reason">${config.reason}</p>
            ${config.countdown ? `<div class="logout-countdown" data-seconds="${config.countdown}"></div>` : ""}
          </div>
          <div class="logout-modal-actions">
            ${config.actions
              .map(
                (action) => `
              <button class="logout-action-btn ${action.primary ? "primary" : "secondary"}" 
                      data-action="${action.text}">
                ${action.text}
              </button>
            `,
              )
              .join("")}
          </div>
        </div>
      </div>
    `;

    // Add event listeners
    config.actions.forEach((action) => {
      const button = this.logoutModal.querySelector(
        `[data-action="${action.text}"]`,
      );
      if (button) {
        button.addEventListener("click", action.action);
      }
    });

    // Handle countdown
    if (config.countdown && config.autoAction) {
      this.startCountdown(config.countdown, config.autoAction);
    }

    // Prevent modal close on overlay click for important logouts
    if (config.type === "logout") {
      this.logoutModal.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    }

    document.body.appendChild(this.logoutModal);
  }

  /**
   * Start countdown timer
   */
  startCountdown(seconds, autoAction) {
    const countdownElement =
      this.logoutModal?.querySelector(".logout-countdown");
    if (!countdownElement) return;

    let remaining = seconds;

    const updateCountdown = () => {
      const minutes = Math.floor(remaining / 60);
      const secs = remaining % 60;
      countdownElement.textContent = `Auto-logout in: ${minutes}:${secs.toString().padStart(2, "0")}`;

      if (remaining <= 0) {
        autoAction();
        return;
      }

      remaining--;
      setTimeout(updateCountdown, 1000);
    };

    updateCountdown();
  }

  /**
   * Hide logout modal
   */
  hideLogoutModal() {
    if (this.logoutModal) {
      this.logoutModal.remove();
      this.logoutModal = null;
    }
    this.isShowingLogoutModal = false;
  }

  /**
   * Get icon for modal type
   */
  getIconForType(type) {
    const icons = {
      warning: "⚠️",
      logout: "👋",
      security: "🔒",
      error: "❌",
    };
    return icons[type] || "🔐";
  }

  /**
   * Extend session (reset activity timer)
   */
  extendSession() {
    this.lastActivity = Date.now();

    // Update session start time if needed
    try {
      localStorage.setItem("session_start_time", Date.now().toString());
    } catch (error) {
      // Ignore storage errors
    }

    // Dispatch session extension event
    eventDispatcher.emit(AUTH_EVENTS.SESSION_EXTENDED, {
      timestamp: Date.now(),
      source: "logout_manager",
    });
  }

  /**
   * Clear warning if active
   */
  clearWarningIfActive() {
    if (
      this.isShowingLogoutModal &&
      this.logoutModal?.querySelector(".logout-countdown")
    ) {
      this.hideLogoutModal();
    }
  }

  /**
   * Clear all timers
   */
  clearAllTimers() {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = null;
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
  }

  /**
   * Clear session data
   */
  clearSessionData() {
    try {
      localStorage.removeItem("session_start_time");
      sessionStorage.clear();
    } catch (error) {
      // Ignore storage errors
    }
  }

  /**
   * Clear user data
   */
  clearUserData() {
    // Clear any cached user data
    if (this.authService) {
      this.authService.currentUser = null;
      this.authService.userProfile = null;
    }
  }

  /**
   * Log logout event for analytics
   */
  logLogoutEvent(reason, options) {
    try {
      if (this.firebaseService?.logAnalytics) {
        this.firebaseService.logAnalytics("intentional_logout", {
          logout_reason: reason,
          logout_type: options.type || "automatic",
          session_duration:
            Date.now() - (this.getSessionStartTime() || Date.now()),
          user_id: this.authService?.currentUser?.uid || "anonymous",
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      // Analytics logging is optional
    }
  }

  /**
   * Public methods for triggering specific logouts
   */

  // Role change logout
  logoutForRoleChange(newRole, oldRole) {
    this.handleIntentionalLogout("role_change", {
      title: "Role Updated",
      message: "Your account role has been updated. Please sign in again.",
      reason: `Role changed from ${oldRole} to ${newRole}. Re-authentication required for security.`,
      showReauthenticate: true,
    });
  }

  // Security-related logout
  logoutForSecurity(securityReason) {
    this.handleIntentionalLogout("security", {
      title: "Security Logout",
      message: "You have been signed out for security reasons.",
      reason: securityReason || "Unusual activity detected on your account.",
      showReauthenticate: true,
    });
  }

  // Administrative logout
  logoutForAdmin(adminReason) {
    this.handleIntentionalLogout("admin_action", {
      title: "Administrative Logout",
      message: "An administrator has signed you out.",
      reason: adminReason || "Administrative action required.",
      showReauthenticate: true,
    });
  }

  // Maintenance logout
  logoutForMaintenance(maintenanceInfo) {
    this.handleIntentionalLogout("maintenance", {
      title: "System Maintenance",
      message: "System maintenance is beginning. You have been signed out.",
      reason:
        maintenanceInfo ||
        "Scheduled maintenance starting. Please try again later.",
      showReauthenticate: false,
    });
  }
}

// Export for use in other modules - browser environment
if (typeof window !== "undefined") {
  window.IntentionalLogoutManager = IntentionalLogoutManager;
}

// ES6 module export
export default IntentionalLogoutManager;
