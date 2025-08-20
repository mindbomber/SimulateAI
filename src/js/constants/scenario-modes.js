/**
 * Scenario Modes and Configurations
 * Centralized flags to orchestrate reflection, badges, persistence, and analytics
 */

export const SCENARIO_MODES = Object.freeze({
  RESEARCH_FULL: "research_full",
  BADGE_ONLY: "badge_only",
  PREVIEW: "preview",
  // New unified classroom-live mode for students joining a live classroom
  CLASSROOM_LIVE: "classroom_live",
  CLASSROOM_LIVE_STUDENT: "classroom_live_student",
  CLASSROOM_LIVE_INSTRUCTOR: "classroom_live_instructor",
});

// Declarative mode configuration
export const MODE_CONFIGS = Object.freeze({
  [SCENARIO_MODES.RESEARCH_FULL]: {
    showReflection: true,
    enableBadges: true,
    persistProgress: true,
    analyticsLevel: "full",
    classroomOverlay: false,
  },
  [SCENARIO_MODES.BADGE_ONLY]: {
    showReflection: false,
    enableBadges: true,
    persistProgress: true,
    analyticsLevel: "minimal",
    classroomOverlay: false,
  },
  [SCENARIO_MODES.PREVIEW]: {
    // Lightweight: no reflection, no badge/progress persistence
    showReflection: false,
    enableBadges: false,
    persistProgress: false,
    analyticsLevel: "none",
    classroomOverlay: false,
  },
  // Unified classroom mode for student participants receiving scenarios from instructor
  [SCENARIO_MODES.CLASSROOM_LIVE]: {
    showReflection: false,
    enableBadges: false,
    persistProgress: false,
    analyticsLevel: "classroom", // classroom-focused analytics
    classroomOverlay: "student",
  },
  [SCENARIO_MODES.CLASSROOM_LIVE_STUDENT]: {
    showReflection: true,
    enableBadges: false,
    persistProgress: true,
    analyticsLevel: "classroom",
    classroomOverlay: "student",
  },
  [SCENARIO_MODES.CLASSROOM_LIVE_INSTRUCTOR]: {
    showReflection: false, // instructor orchestrates
    enableBadges: false,
    persistProgress: false,
    analyticsLevel: "classroom",
    classroomOverlay: "instructor",
  },
});

export function getModeConfig(mode) {
  return MODE_CONFIGS[mode] || MODE_CONFIGS[SCENARIO_MODES.RESEARCH_FULL];
}

export default SCENARIO_MODES;
