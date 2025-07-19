/**
 * Input Utilities Module Index
 * Barrel export for all input utility components
 *
 * This file provides a clean API for importing input utility components
 * that were previously bundled in a single large file.
 *
 * Copyright 2025 Armando Sori
 * Licensed under the Apache License, Version 2.0
 */

// Import constants and theme first
import {
  INPUT_UTILITY_CONSTANTS,
  ANIMATION_DEFAULTS,
  ACCESSIBILITY_DEFAULTS,
} from './constants.js';
import { ComponentTheme } from './theme.js';

// Shared utilities and constants
export { ANIMATION_DEFAULTS, ACCESSIBILITY_DEFAULTS } from './constants.js';
export { ComponentTheme } from './theme.js';

// Legacy constants from original file (will be migrated to constants.js)
export { INPUT_UTILITY_CONSTANTS } from '../../objects/input-utility-components.js';

// Individual components (extracted)
export { ColorPicker } from './color-picker.js';
export { Accordion } from './accordion.js';
export { DateTimePicker } from './date-time-picker.js';
export { NumberInput } from './number-input.js';
export { Drawer } from './drawer.js';
export { SearchBox } from './search-box.js';

// Temporary re-export from original file until migration is complete
// This ensures backward compatibility during the transition

// Utility classes from their new modular locations
export { PerformanceMonitor } from '../../utils/performance-monitor.js';
export { ComponentError } from '../../utils/component-error.js';
export { AnimationManager } from '../../utils/animation-manager.js';

// Default export for convenience
export default {
  INPUT_UTILITY_CONSTANTS,
  ANIMATION_DEFAULTS,
  ACCESSIBILITY_DEFAULTS,
  ComponentTheme,
  // Note: Components will be imported dynamically to avoid circular dependencies
};
