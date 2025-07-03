/**
 * Shared Constants for SimulateAI Platform
 *
 * This file contains commonly used constants across the application
 * to eliminate magic numbers and improve maintainability.
 *
 * @author SimulateAI Development Team
 * @version 1.0.0
 */

// Timing Constants (in milliseconds)
export const TIMING = {
  // Animation durations
  QUICK: 150,
  FAST: 300,
  NORMAL: 500,
  SLOW: 1000,
  VERY_SLOW: 2000,

  // Delays and intervals
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 100,
  POLLING_INTERVAL: 5000,
  SESSION_TIMEOUT: 30000,

  // Notification durations
  NOTIFICATION_SHORT: 3000,
  NOTIFICATION_NORMAL: 5000,
  NOTIFICATION_LONG: 8000,

  // Time conversions
  SECONDS_PER_MINUTE: 60,
  MINUTES_PER_HOUR: 60,
  HOURS_PER_DAY: 24,
  DAYS_PER_WEEK: 7,
  DAYS_PER_MONTH: 30,
  DAYS_PER_YEAR: 365,

  // DOM manipulation delays
  DOM_READY_DELAY: 50,
  POST_APPEND_DELAY: 100,
  INITIALIZATION_DELAY: 300,
  TRANSITION_DELAY: 150,

  // Animation durations
  FADE_DURATION: 200,
  SLIDE_DURATION: 300,
  SPIN_DURATION: 1000,

  // Timeouts
  NETWORK_TIMEOUT: 5000,
  LONG_TASK_TIMEOUT: 30000,
  USER_SESSION_TIMEOUT: 1800000, // 30 minutes

  // Intervals
  AUTOSAVE_INTERVAL: 60000, // 1 minute
  HEALTH_CHECK_INTERVAL: 300000, // 5 minutes
  PERFORMANCE_SAMPLE_INTERVAL: 10000, // 10 seconds
};

// Responsive Breakpoints (in pixels)
export const BREAKPOINTS = {
  MOBILE_SMALL: 576,
  MOBILE: 768,
  TABLET: 992,
  DESKTOP: 1200,
  DESKTOP_LARGE: 1400,
};

// Canvas and Rendering Constants
export const CANVAS = {
  // Default dimensions
  DEFAULT_WIDTH: 800,
  DEFAULT_HEIGHT: 600,

  // Canvas limits
  MAX_WIDTH: 4096,
  MAX_HEIGHT: 4096,

  // Rendering settings
  DPI_SCALE: 2,
  DEFAULT_FRAMERATE: 60,
  TARGET_FRAMERATE: 16.67, // 1000/60

  // WebGL constants
  WEBGL_MAX_TEXTURES: 16,
  BUFFER_SIZE: 1024,
};

// UI Component Constants
export const UI = {
  // Z-index layers
  Z_INDEX: {
    BASE: 1,
    DROPDOWN: 10,
    MODAL_BACKDROP: 100,
    MODAL: 1000,
    TOOLTIP: 2000,
    NOTIFICATION: 3000,
  },

  // Common sizes
  BUTTON_HEIGHT: 40,
  INPUT_HEIGHT: 40,
  HEADER_HEIGHT: 60,
  SIDEBAR_WIDTH: 250,
  SCROLLBAR_WIDTH: 16,

  // Spacing scale
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
    XXL: 48,
  },

  // Border radius
  BORDER_RADIUS: {
    SMALL: 4,
    MEDIUM: 8,
    LARGE: 12,
    PILL: 999,
  },
};

// Performance Thresholds
export const PERFORMANCE = {
  // Ethical scoring
  ETHICAL_EXCELLENT: 0.9,
  ETHICAL_GOOD: 0.7,
  ETHICAL_AVERAGE: 0.5,
  ETHICAL_NEEDS_IMPROVEMENT: 0.3,

  // General scoring
  SCORE_EXCELLENT: 0.8,
  SCORE_GOOD: 0.6,
  SCORE_AVERAGE: 0.4,
  SCORE_POOR: 0.2,

  // Progress indicators
  PROGRESS_COMPLETE: 1.0,
  PROGRESS_MOSTLY_COMPLETE: 0.8,
  PROGRESS_HALFWAY: 0.5,
  PROGRESS_STARTED: 0.1,
};

// Analytics and Tracking
export const ANALYTICS = {
  // Session limits
  MAX_SESSION_LENGTH: 3600000, // 1 hour in ms
  BATCH_SIZE: 50,
  FLUSH_INTERVAL: 10000,

  // Performance monitoring
  SLOW_OPERATION_THRESHOLD: 1000,
  MEMORY_WARNING_THRESHOLD: 100000000, // 100MB

  // Sampling rates
  ERROR_SAMPLE_RATE: 1.0,
  PERFORMANCE_SAMPLE_RATE: 0.1,
  USER_INTERACTION_SAMPLE_RATE: 0.8,
};

// Color System (using standard web color values)
export const COLORS = {
  // RGB color components
  RGB_MAX: 255,
  RGB_MIN: 0,

  // Alpha transparency
  TRANSPARENT: 0,
  SEMI_TRANSPARENT: 0.5,
  MOSTLY_OPAQUE: 0.8,
  OPAQUE: 1.0,

  // Common transparency levels
  OVERLAY_ALPHA: 0.3,
  DISABLED_ALPHA: 0.6,
  HOVER_ALPHA: 0.9,
};

// Animation Easing Values
export const EASING = {
  // Standard easing
  LINEAR: 0,
  EASE_IN: 0.42,
  EASE_OUT: 0.58,
  EASE_IN_OUT: 0.5,

  // Bounce easing coefficients
  BOUNCE_C1: 1.70158,
  BOUNCE_C2: 2.5949095, // c1 * 1.525
  BOUNCE_C3: 2.70158, // c1 + 1
  BOUNCE_C4: 2.75,
  BOUNCE_C5: 7.5625,

  // Elastic constants
  ELASTIC_C4: 2.0943951023931953, // (2 * Math.PI) / 3
  ELASTIC_C5: 1.3962634015954636, // (2 * Math.PI) / 4.5
};

// Common Magic Numbers - Most Frequently Used
export const COMMON = {
  // Fractions and percentages
  HALF: 0.5,
  QUARTER: 0.25,
  THREE_QUARTERS: 0.75,
  ONE_TENTH: 0.1,
  ONE_FIFTH: 0.2,
  ONE_THIRD: 0.33,
  TWO_THIRDS: 0.67,

  // Precise fractional values for animations
  ONE_AND_HALF: 1.5,
  TWO_AND_HALF: 2.5,
  TWO_AND_QUARTER: 2.25,
  TWO_AND_FIVE_EIGHTHS: 2.625,
  FIFTEEN_SIXTEENTHS: 0.9375,
  SIXTYTHREE_SIXTYFOURTHS: 0.984375,

  // Small integers (very common)
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
  SIX: 6,
  SEVEN: 7,
  EIGHT: 8,
  NINE: 9,
  TEN: 10,
  TWELVE: 12,
  FIFTEEN: 15,
  SIXTEEN: 16,
  TWENTY: 20,
  TWENTY_FOUR: 24,
  TWENTY_FIVE: 25,
  THIRTY: 30,
  THIRTY_SIX: 36,
  FORTY: 40,
  FIFTY: 50,
  SIXTY: 60,
  SEVENTY: 70,
  EIGHTY: 80,
  NINETY: 90,

  // Power of 2 values
  SIXTY_FOUR: 64,
  ONE_TWENTY_EIGHT: 128,
  TWO_FIFTY_SIX: 256,
  FIVE_TWELVE: 512,
  ONE_K: 1024,
  TWO_K: 2048,
  FOUR_K: 4096,

  // Geometric constants
  CIRCLE_DEGREES: 360,
  HALF_CIRCLE_DEGREES: 180,
  QUARTER_CIRCLE_DEGREES: 90,
  PI_DEGREES: 180,
  TWO_PI_DEGREES: 360,

  // Distance and positioning
  MARGIN_SMALL: 5,
  MARGIN_MEDIUM: 10,
  MARGIN_LARGE: 15,
  PADDING_SMALL: 5,
  PADDING_MEDIUM: 10,
  PADDING_LARGE: 20,

  // Negative values (commonly used)
  NEGATIVE_TWO: -2,
  NEGATIVE_FIVE: -5,
  NEGATIVE_TEN: -10,
  NEGATIVE_FIFTY: -50,

  // Timing values (milliseconds)
  MILLISECONDS_100: 100,
  MILLISECONDS_150: 150,
  MILLISECONDS_200: 200,
  MILLISECONDS_300: 300,
  MILLISECONDS_500: 500,
  MILLISECONDS_1000: 1000,
  MILLISECONDS_1500: 1500,
  MILLISECONDS_2000: 2000,
  MILLISECONDS_3000: 3000,
  MILLISECONDS_5000: 5000,
  MILLISECONDS_8000: 8000,
  MILLISECONDS_10000: 10000,
  MILLISECONDS_30000: 30000,
  MILLISECONDS_60000: 60000,

  // Standard sizes
  SMALL_SIZE: 25,
  MEDIUM_SIZE: 50,
  LARGE_SIZE: 100,
  XLARGE_SIZE: 150,
  XXLARGE_SIZE: 200,

  // Grid and layout
  GRID_COLS_7: 7, // Days of week
  GRID_COLS_12: 12, // Months
  GRID_ROWS_6: 6, // Calendar rows

  // Color values
  COLOR_255: 255, // RGB max
  COLOR_0: 0, // RGB min
  HEX_FF: 0xff,
  HEX_00FF: 0x00ff,
  HEX_0000FF: 0x0000ff,

  // Opacity levels
  OPACITY_10: 0.1,
  OPACITY_20: 0.2,
  OPACITY_30: 0.3,
  OPACITY_40: 0.4,
  OPACITY_50: 0.5,
  OPACITY_60: 0.6,
  OPACITY_70: 0.7,
  OPACITY_80: 0.8,
  OPACITY_90: 0.9,

  // Conversion factors
  HOURS_24: 24,
  MINUTES_60: 60,
  SECONDS_60: 60,
  DAYS_7: 7,
  DAYS_30: 30,
  DAYS_365: 365,

  // Math constants
  MATH_E: 2.718281828,
  MATH_PI: Math.PI,
  MATH_2PI: Math.PI * 2,
  MATH_PI_2: Math.PI / 2,
  MATH_SQRT_2: Math.SQRT2,

  // Percentage values
  PERCENT_5: 5,
  PERCENT_10: 10,
  PERCENT_20: 20,
  PERCENT_25: 25,
  PERCENT_50: 50,
  PERCENT_75: 75,
  PERCENT_100: 100,
};

// File and Data Limits
export const LIMITS = {
  // File sizes (in bytes)
  MAX_FILE_SIZE: 10485760, // 10MB
  MAX_IMAGE_SIZE: 5242880, // 5MB
  MAX_TEXT_SIZE: 1048576, // 1MB

  // String lengths
  MAX_USERNAME_LENGTH: 50,
  MAX_EMAIL_LENGTH: 254,
  MAX_PASSWORD_LENGTH: 128,
  MIN_PASSWORD_LENGTH: 8,

  // Array limits
  MAX_ARRAY_LENGTH: 10000,
  MAX_OBJECT_DEPTH: 10,

  // Simulation limits
  MAX_SIMULATION_TIME: 7200000, // 2 hours
  MAX_DECISIONS_PER_SESSION: 100,
  MAX_CONCURRENT_SIMULATIONS: 5,
};

// Validation Patterns and Constants
export const VALIDATION = {
  // Common numeric ranges
  PERCENTAGE_MIN: 0,
  PERCENTAGE_MAX: 100,
  PROBABILITY_MIN: 0.0,
  PROBABILITY_MAX: 1.0,

  // Age ranges for educational content
  MIN_AGE: 13,
  MAX_AGE: 120,

  // Rating scales
  RATING_MIN: 1,
  RATING_MAX: 5,
  SCALE_MIN: 0,
  SCALE_MAX: 10,
};

// Educational Content Constants
export const EDUCATION = {
  // Difficulty levels
  DIFFICULTY: {
    BEGINNER: 1,
    INTERMEDIATE: 2,
    ADVANCED: 3,
    EXPERT: 4,
  },

  // Duration ranges (in minutes)
  DURATION: {
    QUICK: 5,
    SHORT: 15,
    MEDIUM: 30,
    LONG: 60,
    EXTENDED: 120,
  },

  // Age groups
  AGE_GROUPS: {
    MIDDLE_SCHOOL: 13,
    HIGH_SCHOOL: 16,
    COLLEGE: 18,
    ADULT: 25,
  },
};

// Default export containing all constants
export default {
  TIMING,
  BREAKPOINTS,
  CANVAS,
  UI,
  PERFORMANCE,
  ANALYTICS,
  COLORS,
  EASING,
  LIMITS,
  VALIDATION,
  EDUCATION,
  COMMON,
};
