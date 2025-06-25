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
    DAYS_PER_YEAR: 365
};

// Responsive Breakpoints (in pixels)
export const BREAKPOINTS = {
    MOBILE_SMALL: 576,
    MOBILE: 768,
    TABLET: 992,
    DESKTOP: 1200,
    DESKTOP_LARGE: 1400
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
    BUFFER_SIZE: 1024
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
        NOTIFICATION: 3000
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
        XXL: 48
    },
    
    // Border radius
    BORDER_RADIUS: {
        SMALL: 4,
        MEDIUM: 8,
        LARGE: 12,
        PILL: 999
    }
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
    PROGRESS_STARTED: 0.1
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
    USER_INTERACTION_SAMPLE_RATE: 0.8
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
    HOVER_ALPHA: 0.9
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
    BOUNCE_C3: 2.70158,   // c1 + 1
    BOUNCE_C4: 2.75,
    BOUNCE_C5: 7.5625,
    
    // Elastic constants
    ELASTIC_C4: 2.0943951023931953, // (2 * Math.PI) / 3
    ELASTIC_C5: 1.3962634015954636  // (2 * Math.PI) / 4.5
};

// File and Data Limits
export const LIMITS = {
    // File sizes (in bytes)
    MAX_FILE_SIZE: 10485760, // 10MB
    MAX_IMAGE_SIZE: 5242880,  // 5MB
    MAX_TEXT_SIZE: 1048576,   // 1MB
    
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
    MAX_CONCURRENT_SIMULATIONS: 5
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
    SCALE_MAX: 10
};

// Educational Content Constants
export const EDUCATION = {
    // Difficulty levels
    DIFFICULTY: {
        BEGINNER: 1,
        INTERMEDIATE: 2,
        ADVANCED: 3,
        EXPERT: 4
    },
    
    // Duration ranges (in minutes)
    DURATION: {
        QUICK: 5,
        SHORT: 15,
        MEDIUM: 30,
        LONG: 60,
        EXTENDED: 120
    },
    
    // Age groups
    AGE_GROUPS: {
        MIDDLE_SCHOOL: 13,
        HIGH_SCHOOL: 16,
        COLLEGE: 18,
        ADULT: 25
    }
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
    EDUCATION
};
