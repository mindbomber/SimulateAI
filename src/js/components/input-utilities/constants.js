/**
 * Input Utility Constants and Shared Utilities
 * Extracted from input-utility-components.js for better organization
 *
 * Copyright 2025 Armando Sori
 * Licensed under the Apache License, Version 2.0
 */

// Constants to eliminate magic numbers
export const INPUT_UTILITY_CONSTANTS = {
  // Memory and performance
  MEMORY_WARNING_MB: 50,
  BYTES_PER_KB: 1024,

  // Color picker dimensions
  DEFAULT_COLOR_PICKER_WIDTH: 280,
  DEFAULT_COLOR_PICKER_HEIGHT: 320,

  // Color adjustments
  HUE_ADJUSTMENT_STEP: 5,
  SATURATION_ADJUSTMENT_STEP: 5,
  LIGHTNESS_ADJUSTMENT_STEP: 5,

  // Color conversion constants
  HEX_COLOR_LENGTH: 6,
  HEX_BLUE_OFFSET: 4,
  RGB_CHANNEL_COUNT: 3,
  RGB_MAX_VALUE: 255,
  HUE_MAX_DEGREES: 360,
  SATURATION_MAX_PERCENT: 100,
  LIGHTNESS_MAX_PERCENT: 100,

  // HSL conversion factors
  HUE_SECTOR_COUNT: 6,
  HUE_SECTOR_DEGREES: 60,
  RGB_CONVERSION_FACTOR: 255,
  HSL_CONVERSION_FACTOR: 100,
  HUE_RED_MAX: 60,
  HUE_ORANGE_MAX: 90,
  HUE_YELLOW_MAX: 120,
  HUE_GREEN_MAX: 180,
  HUE_CYAN_MAX: 240,
  HUE_BLUE_MAX: 270,
  HUE_PURPLE_MAX: 300,
  HUE_MAGENTA_MAX: 330,
  HUE_RED_MIN: 330,

  // Color name detection thresholds
  SATURATION_THRESHOLD: 10,
  LIGHTNESS_LOW_THRESHOLD: 15,
  LIGHTNESS_HIGH_THRESHOLD: 90,
  LIGHTNESS_MID_THRESHOLD: 50,

  // Animation constants
  DEFAULT_ANIMATION_DURATION: 300,
  FAST_ANIMATION_DURATION: 150,
  SLOW_ANIMATION_DURATION: 500,

  // Accordion defaults
  ACCORDION_PANEL_PADDING: 16,
  ACCORDION_HEADER_HEIGHT: 48,

  // Focus and navigation
  FIRST_ITEM_INDEX: 0,
  NO_FOCUSED_ITEM: -1,

  // Color wheel rendering
  COLOR_WHEEL_SECTORS: 360,
  COLOR_WHEEL_RADIUS_RATIO: 0.4,
  SATURATION_LIGHTNESS_DEFAULT: 50,

  // Slider positions
  SLIDER_THUMB_SIZE: 16,
  SLIDER_TRACK_HEIGHT: 4,

  // Color validation patterns
  HEX_PATTERN: /^#?([a-f\d]{3}|[a-f\d]{6})$/i,
  RGB_PATTERN: /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/,
  HSL_PATTERN: /^hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)$/,

  // Preset colors
  DEFAULT_PRESET_COLORS: [
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#000000",
    "#FFFFFF",
  ],

  // Current color display
  CURRENT_COLOR_SIZE: 40,

  // Rendering constants
  CANVAS_DEVICE_PIXEL_RATIO: 2,
  DEFAULT_FONT_SIZE: 14,
  DEFAULT_LINE_HEIGHT: 1.4,
  DEFAULT_BORDER_RADIUS: 4,
  FOCUS_OUTLINE_WIDTH: 2,
  DEFAULT_PADDING: 8,
  DEFAULT_MARGIN: 4,

  // Slider rendering constants
  SLIDER_HANDLE_RADIUS: 8,
  SLIDER_TRACK_BORDER_WIDTH: 1,

  // Color display constants
  COLOR_SWATCH_SIZE: 20,
  COLOR_GRID_SPACING: 4,

  // Accordion constants
  MAX_ACCORDION_HEIGHT: 500,
  ACCORDION_TRANSITION_DURATION: 300,

  // Easing constants
  EASE_OUT_CUBIC: "cubic-bezier(0.215, 0.610, 0.355, 1.000)",

  // DateTimePicker constants
  DAYS_IN_WEEK: 7,
  MONTHS_IN_YEAR: 12,
  HOURS_IN_DAY: 24,
  MINUTES_IN_HOUR: 60,
  MILLISECONDS_IN_SECOND: 1000,
  SECONDS_IN_MINUTE: 60,
  MINUTES_IN_DAY: 1440,

  // Calendar display
  CALENDAR_WEEKS_DISPLAYED: 6,
  CALENDAR_CELL_SIZE: 32,

  // More accordion constants
  ACCORDION_ANIMATION_TIMING: "ease-out",
  ACCORDION_HEADER_FONT_WEIGHT: 500,
};

// Animation defaults for consistent behavior
export const ANIMATION_DEFAULTS = {
  duration: INPUT_UTILITY_CONSTANTS.DEFAULT_ANIMATION_DURATION,
  easing: INPUT_UTILITY_CONSTANTS.EASE_OUT_CUBIC,
  fill: "forwards",
};

// Accessibility defaults
export const ACCESSIBILITY_DEFAULTS = {
  announceChanges: true,
  keyboardNavigation: true,
  screenReaderSupport: true,
  highContrastMode: false,
  reducedMotion: false,
};

// Performance thresholds for monitoring
export const PERFORMANCE_THRESHOLDS = {
  RENDER_WARNING_MS: 16, // 60fps threshold
  MEMORY_WARNING_MB: 50,
  ANIMATION_WARNING_MS: 100,
  NETWORK_WARNING_MS: 1000,
};

export default INPUT_UTILITY_CONSTANTS;
