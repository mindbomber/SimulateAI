// Auth/Session constants for IntentionalLogoutManager and related flows
// Follows SimulateAI constants guidelines: descriptive names, immutable values

/**
 * Centralized constants for authentication/session management
 * - Use these to avoid magic numbers and string keys
 */
export const AUTH_SESSION_CONSTANTS = Object.freeze({
  INACTIVITY_TIMEOUT_MS: 30 * 60 * 1000, // 30 minutes
  WARNING_TIME_MS: 5 * 60 * 1000, // 5 minutes before logout
  SESSION_REFRESH_INTERVAL_MS: 60 * 1000, // Check every minute
  MAX_SESSION_DURATION_MS: 8 * 60 * 60 * 1000, // 8 hours max session
  INACTIVITY_CHECK_INTERVAL_MS: 30 * 1000, // Polling cadence
  COUNTDOWN_UPDATE_MS: 1000, // Countdown tick
  BROADCAST: Object.freeze({
    CHANNEL: "simulateai-auth-session",
  }),
  STORAGE_KEYS: Object.freeze({
    SESSION_START: "session_start_time",
    SESSION_EXTEND: "simulateai:session:extend",
    SESSION_LOGOUT: "simulateai:session:logout",
  }),
});

export default AUTH_SESSION_CONSTANTS;
