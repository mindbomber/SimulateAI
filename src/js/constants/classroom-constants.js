/**
 * Constants for classroom management functionality
 * @module ClassroomConstants
 * @author SimulateAI Development Team
 * @since 1.80.0
 */

/**
 * Classroom management constants
 */
export const CLASSROOM_CONSTANTS = {
  // Session configuration
  MAX_STUDENTS: 50,
  SESSION_TIMEOUT_MINUTES: 120, // 2 hours
  CLASSROOM_CODE_LENGTH: 7, // ABC-123 format

  // Timing constants
  DEBOUNCE_DELAY: 300,
  HEARTBEAT_INTERVAL: 30000, // 30 seconds
  CONNECTION_TIMEOUT: 10000, // 10 seconds

  // Validation limits
  CLASSROOM_NAME_MAX_LENGTH: 100,
  CLASSROOM_NAME_MIN_LENGTH: 3,
  NICKNAME_MAX_LENGTH: 20,
  NICKNAME_MIN_LENGTH: 2,
  MAX_SCENARIOS_PER_SESSION: 20,
  MIN_SCENARIOS_PER_SESSION: 1,

  // Database paths
  DB_PATHS: {
    CLASSROOMS: "classrooms",
    ROSTER: "roster",
    SESSION_STATUS: "sessionStatus",
    STUDENT_CHOICES: "studentChoices",
    SCENARIOS: "scenarios",
    PROGRESS: "overallProgress",
  },

  // Session status values
  SESSION_STATUS: {
    WAITING: "waiting",
    LIVE: "live",
    PAUSED: "paused",
    COMPLETED: "completed",
    EXPIRED: "expired",
  },

  // Student status values
  STUDENT_STATUS: {
    ACTIVE: "active",
    INACTIVE: "inactive",
    DISCONNECTED: "disconnected",
    COMPLETED: "completed",
  },

  // Modal identifiers
  MODALS: {
    CREATE_CLASSROOM: "create-classroom-modal",
    CLASSROOM_CODE: "classroom-code-modal",
    LIVE_SESSION: "live-session-modal",
    JOIN_CLASSROOM: "join-classroom-modal",
    WAITING_ROOM: "waiting-room-modal",
    FINAL_CHOICES: "final-choices-modal",
  },

  // Event types for analytics
  EVENTS: {
    CLASSROOM_CREATED: "classroom_created",
    STUDENT_JOINED: "student_joined",
    SESSION_STARTED: "session_started",
    SESSION_PAUSED: "session_paused",
    SESSION_COMPLETED: "session_completed",
    CHOICE_SUBMITTED: "choice_submitted",
    STUDENT_LEFT: "student_left",
    ERROR_OCCURRED: "error_occurred",
  },

  // Error codes
  ERROR_CODES: {
    CLASSROOM_NOT_FOUND: "CLASSROOM_NOT_FOUND",
    CLASSROOM_FULL: "CLASSROOM_FULL",
    SESSION_CLOSED: "SESSION_CLOSED",
    INVALID_CODE: "INVALID_CODE",
    NICKNAME_TAKEN: "NICKNAME_TAKEN",
    CONNECTION_FAILED: "CONNECTION_FAILED",
    PERMISSION_DENIED: "PERMISSION_DENIED",
    SESSION_EXPIRED: "SESSION_EXPIRED",
  },

  // UI display constants
  UI: {
    CLASSROOM_CODE_DISPLAY_FORMAT: "ABC-123",
    PROGRESS_UPDATE_INTERVAL: 1000, // 1 second
    ROSTER_UPDATE_ANIMATION_DELAY: 300,
    TOAST_DURATION: 5000, // 5 seconds

    // Grid layouts
    SCENARIO_GRID_COLUMNS: 3,
    STUDENT_GRID_COLUMNS: 4,
    CHOICE_DISPLAY_MAX_LENGTH: 50,

    // Colors for UI elements
    COLORS: {
      ACTIVE_STUDENT: "#10b981", // green-500
      INACTIVE_STUDENT: "#6b7280", // gray-500
      COMPLETED_STUDENT: "#3b82f6", // blue-500
      WAITING_STATUS: "#f59e0b", // amber-500
      LIVE_STATUS: "#10b981", // green-500
      PAUSED_STATUS: "#f59e0b", // amber-500
      COMPLETED_STATUS: "#6b7280", // gray-500
    },
  },

  // Accessibility constants
  ACCESSIBILITY: {
    FOCUS_TRAP_SELECTOR:
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ARIA_LABELS: {
      CLASSROOM_CODE: "Classroom code for students to join",
      STUDENT_ROSTER: "List of students in the classroom",
      SESSION_CONTROLS: "Controls for managing the live session",
      PROGRESS_INDICATOR: "Student progress indicator",
      CHOICE_DISPLAY: "Student choice for scenario",
    },
  },

  // Storage keys for local data
  STORAGE_KEYS: {
    CURRENT_CLASSROOM: "simulateai_current_classroom",
    STUDENT_SESSION: "simulateai_student_session",
    TEACHER_SESSION: "simulateai_teacher_session",
    RECENT_CLASSROOMS: "simulateai_recent_classrooms",
  },

  // Real-time database configuration
  REALTIME_DB: {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // 1 second
    BATCH_SIZE: 50, // For bulk operations
    CACHE_TIMEOUT: 300000, // 5 minutes

    // Listener priorities
    LISTENER_PRIORITY: {
      ROSTER: "high",
      SESSION_STATUS: "high",
      STUDENT_CHOICES: "medium",
      PROGRESS: "low",
    },
  },

  // Feature flags for gradual rollout
  FEATURES: {
    LATE_JOINING: true,
    SESSION_RECORDING: false,
    ADVANCED_ANALYTICS: true,
    MULTI_INSTRUCTOR: false,
    CUSTOM_SCENARIOS: false,
  },

  // Performance thresholds
  PERFORMANCE: {
    MAX_RENDER_TIME: 100, // milliseconds
    MAX_UPDATE_FREQUENCY: 10, // updates per second
    MEMORY_LIMIT_MB: 50,
    MAX_CONCURRENT_LISTENERS: 10,
  },
};

/**
 * Error messages for user display
 */
export const ERROR_MESSAGES = {
  [CLASSROOM_CONSTANTS.ERROR_CODES.CLASSROOM_NOT_FOUND]:
    "Classroom not found. Please check the code and try again.",

  [CLASSROOM_CONSTANTS.ERROR_CODES.CLASSROOM_FULL]:
    "This classroom is full and cannot accept more students.",

  [CLASSROOM_CONSTANTS.ERROR_CODES.SESSION_CLOSED]:
    "This session is no longer accepting new students.",

  [CLASSROOM_CONSTANTS.ERROR_CODES.INVALID_CODE]:
    "Invalid classroom code format. Please enter a valid code (e.g., ABC-123).",

  [CLASSROOM_CONSTANTS.ERROR_CODES.NICKNAME_TAKEN]:
    "This nickname is already taken. Please choose a different one.",

  [CLASSROOM_CONSTANTS.ERROR_CODES.CONNECTION_FAILED]:
    "Unable to connect to the classroom. Please check your internet connection.",

  [CLASSROOM_CONSTANTS.ERROR_CODES.PERMISSION_DENIED]:
    "You do not have permission to perform this action.",

  [CLASSROOM_CONSTANTS.ERROR_CODES.SESSION_EXPIRED]:
    "This session has expired. Please create a new classroom.",
};

/**
 * Success messages for user display
 */
export const SUCCESS_MESSAGES = {
  CLASSROOM_CREATED: "Classroom created successfully!",
  STUDENT_JOINED: "Student joined the classroom.",
  SESSION_STARTED: "Live session started successfully.",
  SESSION_COMPLETED: "Session completed successfully.",
  CHOICE_SUBMITTED: "Your choice has been recorded.",
  DATA_EXPORTED: "Student data exported successfully.",
};

/**
 * Default configuration for new classrooms
 */
export const DEFAULT_CLASSROOM_CONFIG = {
  settings: {
    maxStudents: CLASSROOM_CONSTANTS.MAX_STUDENTS,
    allowLateJoining: true,
    sessionTimeoutMinutes: CLASSROOM_CONSTANTS.SESSION_TIMEOUT_MINUTES,
    requireNicknameUniqueness: true,
    showRealTimeProgress: true,
    enableChoiceTracking: true,
  },
  permissions: {
    studentsCanSeeOthers: false,
    studentsCanChangeChoices: false,
    instructorCanSeeIndividualChoices: true,
    exportDataAfterSession: true,
  },
  ui: {
    showProgressBar: true,
    showTimer: true,
    showStudentCount: true,
    theme: "default",
  },
};

/**
 * Validation rules for classroom data
 */
export const VALIDATION_RULES = {
  classroomName: {
    required: true,
    minLength: CLASSROOM_CONSTANTS.CLASSROOM_NAME_MIN_LENGTH,
    maxLength: CLASSROOM_CONSTANTS.CLASSROOM_NAME_MAX_LENGTH,
    pattern: /^[a-zA-Z0-9\s\-_.,!?()]+$/,
  },
  nickname: {
    required: true,
    minLength: CLASSROOM_CONSTANTS.NICKNAME_MIN_LENGTH,
    maxLength: CLASSROOM_CONSTANTS.NICKNAME_MAX_LENGTH,
    pattern: /^[a-zA-Z0-9_-]+$/,
  },
  classroomCode: {
    required: true,
    length: CLASSROOM_CONSTANTS.CLASSROOM_CODE_LENGTH,
    pattern: /^[A-Z]{3}-[0-9]{3}$/,
  },
  scenarioSelection: {
    minScenarios: CLASSROOM_CONSTANTS.MIN_SCENARIOS_PER_SESSION,
    maxScenarios: CLASSROOM_CONSTANTS.MAX_SCENARIOS_PER_SESSION,
    required: true,
  },
};
