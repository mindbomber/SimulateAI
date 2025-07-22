/**
 * Event Dispatcher Utility
 * Centralized event management for component communication
 */

class EventDispatcher {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * Register an event listener
   * @param {string} eventType - Type of event to listen for
   * @param {Function} listener - Function to call when event is dispatched
   * @param {Object} options - Event listener options
   */
  on(eventType, listener, options = {}) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    const listenerData = { listener, options };
    this.listeners.get(eventType).add(listenerData);

    // Also add to window for global events
    if (options.global !== false) {
      window.addEventListener(eventType, listener, options);
    }

    return () => this.off(eventType, listener);
  }

  /**
   * Remove an event listener
   * @param {string} eventType - Type of event
   * @param {Function} listener - Listener function to remove
   */
  off(eventType, listener) {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      // Find and remove the listener
      for (const listenerData of listeners) {
        if (listenerData.listener === listener) {
          listeners.delete(listenerData);
          window.removeEventListener(eventType, listener);
          break;
        }
      }

      // Clean up empty listener sets
      if (listeners.size === 0) {
        this.listeners.delete(eventType);
      }
    }
  }

  /**
   * Dispatch an event
   * @param {string} eventType - Type of event to dispatch
   * @param {*} detail - Event detail data
   * @param {Object} options - Event options
   */
  emit(eventType, detail = null, options = {}) {
    const customEvent = new CustomEvent(eventType, {
      detail,
      bubbles: options.bubbles !== false,
      cancelable: options.cancelable !== false,
      ...options,
    });

    // Track event for debugging
    this.logEvent(eventType, detail);

    // Dispatch on window for global events
    window.dispatchEvent(customEvent);

    return customEvent;
  }

  /**
   * Log event for debugging
   * @param {string} eventType - Event type
   * @param {*} detail - Event detail
   */
  logEvent(eventType, detail) {
    if (window.location.search.includes("debug=events")) {
      console.log(`📡 Event: ${eventType}`, detail);
    }
  }

  /**
   * Get all registered event types
   */
  getEventTypes() {
    return Array.from(this.listeners.keys());
  }

  /**
   * Clear all listeners
   */
  clear() {
    for (const [eventType, listeners] of this.listeners) {
      for (const listenerData of listeners) {
        window.removeEventListener(eventType, listenerData.listener);
      }
    }
    this.listeners.clear();
  }
}

// Authentication Events
const AUTH_EVENTS = {
  // User authentication state changes
  USER_SIGNED_IN: "userSignedIn",
  USER_SIGNED_OUT: "userSignedOut",
  AUTH_STATE_CHANGED: "authStateChanged",

  // Profile updates
  PROFILE_UPDATED: "profileUpdated",
  PROFILE_CUSTOMIZED: "profileCustomized",

  // Session management
  SESSION_STARTED: "sessionStarted",
  SESSION_EXTENDED: "sessionExtended",
  SESSION_WARNING: "sessionWarning",
  SESSION_EXPIRED: "sessionExpired",

  // Logout events
  LOGOUT_REQUESTED: "logoutRequested",
  INTENTIONAL_LOGOUT_REQUESTED: "intentionalLogoutRequested",
  LOGOUT_COMPLETED: "logoutCompleted",

  // Security events
  SECURITY_VIOLATION: "securityViolation",
  SUSPICIOUS_ACTIVITY: "suspiciousActivity",
};

// UI Events
const UI_EVENTS = {
  // Modal events
  MODAL_OPENED: "modalOpened",
  MODAL_CLOSED: "modalClosed",

  // Navigation events
  PAGE_CHANGED: "pageChanged",
  ROUTE_CHANGED: "routeChanged",

  // Settings events
  SETTING_CHANGED: "settingChanged",
  THEME_CHANGED: "themeChanged",

  // Component events
  COMPONENT_LOADED: "componentLoaded",
  COMPONENT_ERROR: "componentError",
};

// System Events
const SYSTEM_EVENTS = {
  // Network events
  NETWORK_ONLINE: "networkOnline",
  NETWORK_OFFLINE: "networkOffline",

  // Performance events
  PERFORMANCE_WARNING: "performanceWarning",
  MEMORY_WARNING: "memoryWarning",

  // Error events
  UNHANDLED_ERROR: "unhandledError",
  CRITICAL_ERROR: "criticalError",
};

// Create global event dispatcher instance
const eventDispatcher = new EventDispatcher();

// Export for use in other modules
if (typeof window !== "undefined") {
  window.EventDispatcher = EventDispatcher;
  window.eventDispatcher = eventDispatcher;
  window.AUTH_EVENTS = AUTH_EVENTS;
  window.UI_EVENTS = UI_EVENTS;
  window.SYSTEM_EVENTS = SYSTEM_EVENTS;
}

export default eventDispatcher;
export { EventDispatcher, AUTH_EVENTS, UI_EVENTS, SYSTEM_EVENTS };
