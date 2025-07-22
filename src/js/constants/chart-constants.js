/**
 * Consolidated Chart Constants
 * Centralized chart-related constants to avoid conflicts between systems
 *
 * @version 1.0.0
 * @author SimulateAI Team
 */

// ===== RADAR CHART CONSTANTS (Chart.js) =====
export const RADAR_CHART_CONSTANTS = {
  // Default sizing
  DEFAULT_SIZE: 400,
  DEFAULT_WIDTH: 400,
  DEFAULT_HEIGHT: 400,

  // Animation and interaction
  ANIMATION_DURATION: 750,
  MOBILE_BREAKPOINT: 768,
  MODAL_LABEL_MAX_LENGTH: 10,
  SCALE_PERCENTAGE: 100,

  // Rendering quality
  DEVICE_PIXEL_RATIO: window.devicePixelRatio || 1,
  IMAGE_SMOOTHING_QUALITY: "high",

  // Chart.js specific
  CHART_TYPE: "radar",
  MAINTIAN_ASPECT_RATIO: true,
  RESPONSIVE: true,

  // Tooltip settings
  TOOLTIP_PADDING: 12,
  TOOLTIP_CORNER_RADIUS: 8,
  TOOLTIP_BORDER_WIDTH: 1,

  // Point styling
  POINT_RADIUS: 4,
  POINT_HOVER_RADIUS: 6,
  BORDER_WIDTH: 2,

  // Grid and axis
  GRID_LINE_WIDTH: 1,
  AXIS_LABEL_MAX_LENGTH: 10,
};

// ===== CANVAS RENDERER CONSTANTS =====
export const CANVAS_RENDERER_CONSTANTS = {
  // Canvas setup
  DEFAULT_WIDTH: 800,
  DEFAULT_HEIGHT: 600,
  MAX_CANVAS_SIZE: 32767,

  // Performance
  ANIMATION_FPS: 60,
  FRAME_TIME_THRESHOLD: 16.67,
  MAX_DRAW_CALLS: 10000,
  PERFORMANCE_SAMPLE_RATE: 0.1,

  // Font and text
  DEFAULT_FONT_SIZE: 14,
  LABEL_FONT_SIZE: 12,
  DEFAULT_BORDER_RADIUS: 4,

  // Chart layout (for custom charts)
  CHART_TITLE_Y_OFFSET: 20,
  CHART_AREA_RATIO: 0.8,
  CHART_BAR_PADDING_RATIO: 0.1,
  CHART_BAR_PADDING_MIN: 2,
  CHART_BAR_BOTTOM_MARGIN: 20,
  CHART_LABEL_Y_OFFSET: 5,
  CHART_POINT_RADIUS: 4,
  CHART_POINT_LABEL_Y_OFFSET: 15,
  CHART_GRID_LINES: 5,
  CHART_PIE_RADIUS_RATIO: 0.8,
  CHART_PIE_LABEL_RADIUS_RATIO: 0.7,
  CHART_PIE_MIN_SLICE_ANGLE: 0.2,
  CHART_LEGEND_OFFSET: 20,

  // Drawing styles
  FOCUSED_BORDER_WIDTH: 3,
  DEFAULT_STROKE_WIDTH: 1,
};

// ===== UI COMPONENT CONSTANTS =====
export const UI_COMPONENT_CONSTANTS = {
  // Modal defaults
  DEFAULT_MODAL_WIDTH: 400,
  DEFAULT_MODAL_HEIGHT: 300,
  MODAL_SHADOW_OFFSET: 4,
  MODAL_CLOSE_BUTTON_SIZE: 24,

  // Button defaults
  DEFAULT_BUTTON_WIDTH: 100,
  DEFAULT_BUTTON_HEIGHT: 36,

  // Animation values
  ANIMATION_FAST: 100,
  ANIMATION_NORMAL: 150,
  ANIMATION_SLOW: 300,

  // Z-index management
  MODAL_Z_INDEX: 2000,
  TOOLTIP_Z_INDEX: 3000,
  DROPDOWN_Z_INDEX: 1500,

  // Spacing and layout
  SPACING_XS: 4,
  SPACING_SM: 8,
  SPACING_MD: 16,
  SPACING_LG: 24,
  SPACING_XL: 32,

  // Border radius
  BORDER_RADIUS_SM: 4,
  BORDER_RADIUS_MD: 8,
  BORDER_RADIUS_LG: 12,
  BORDER_RADIUS_XL: 16,
};

// ===== SHARED CHART CONSTANTS =====
export const SHARED_CHART_CONSTANTS = {
  // Color system
  COLOR_HUE_FULL_CIRCLE: 360,
  COLOR_SATURATION: 70,
  COLOR_LIGHTNESS: 50,
  RGB_MAX: 255,

  // Accessibility
  MIN_CONTRAST_RATIO: 4.5,
  MIN_FONT_SIZE: 12,
  MIN_TOUCH_TARGET: 44,

  // Performance thresholds
  PERFORMANCE_THRESHOLD: 16, // 1 frame at 60fps

  // Common chart colors
  COLORS: {
    PRIMARY: "#2196F3",
    SECONDARY: "#757575",
    SUCCESS: "#4CAF50",
    WARNING: "#FF9800",
    ERROR: "#F44336",
    WHITE: "#FFFFFF",
    BLACK: "#000000",
    GRAY_50: "#FAFAFA",
    GRAY_100: "#F5F5F5",
    GRAY_200: "#EEEEEE",
    GRAY_300: "#E0E0E0",
    GRAY_400: "#BDBDBD",
    GRAY_500: "#9E9E9E",
    GRAY_600: "#757575",
    GRAY_700: "#616161",
    GRAY_800: "#424242",
    GRAY_900: "#212121",
  },

  // Theme definitions
  THEMES: {
    LIGHT: {
      background: "#ffffff",
      foreground: "#333333",
      primary: "#007acc",
      secondary: "#28a745",
      accent: "#6c757d",
    },
    DARK: {
      background: "#1a1a1a",
      foreground: "#e0e0e0",
      primary: "#4da6ff",
      secondary: "#66bb6a",
      accent: "#9e9e9e",
    },
    HIGH_CONTRAST: {
      background: "#000000",
      foreground: "#ffffff",
      primary: "#ffff00",
      secondary: "#00ffff",
      accent: "#ff00ff",
    },
  },
};

// ===== CHART SYSTEM REGISTRY =====
export const CHART_SYSTEM_REGISTRY = {
  RADAR_CHARTS: "radar-chart.js", // Chart.js based radar charts
  CUSTOM_CANVAS: "canvas-renderer.js", // Custom canvas drawing
  UI_COMPONENTS: "advanced-ui-components.js", // UI component charts (deprecated)
};

// ===== EASING FUNCTIONS =====
export const EASING_FUNCTIONS = {
  EASE_OUT_CUBIC: "easeOutCubic",
  EASE_OUT_QUAD: "easeOutQuad",
  EASE_OUT_BACK: "easeOutBack",
  EASE_IN_OUT_QUART: "easeInOutQuart",
};

// ===== CHART TYPE DEFINITIONS =====
export const CHART_TYPES = {
  RADAR: "radar",
  BAR: "bar",
  LINE: "line",
  PIE: "pie",
  SCATTER: "scatter",
  DOUGHNUT: "doughnut",
};

// Export default object for convenience
export default {
  RADAR_CHART: RADAR_CHART_CONSTANTS,
  CANVAS_RENDERER: CANVAS_RENDERER_CONSTANTS,
  UI_COMPONENT: UI_COMPONENT_CONSTANTS,
  SHARED: SHARED_CHART_CONSTANTS,
  REGISTRY: CHART_SYSTEM_REGISTRY,
  EASING: EASING_FUNCTIONS,
  TYPES: CHART_TYPES,
};
