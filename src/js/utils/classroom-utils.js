/**
 * Utility functions for classroom management
 * Handles classroom code generation, validation, and helper functions
 * @module ClassroomUtils
 * @author SimulateAI Development Team
 * @since 1.80.0
 */

import logger from "./logger.js";

/**
 * Generate a unique 6-character classroom code
 * Format: ABC-123 (3 uppercase letters, hyphen, 3 numbers)
 * @returns {string} Generated classroom code
 */
export function generateClassroomCode() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";

  // Generate 3 random letters
  let code = "";
  for (let i = 0; i < 3; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }

  // Add hyphen separator
  code += "-";

  // Generate 3 random numbers
  for (let i = 0; i < 3; i++) {
    code += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }

  return code;
}

/**
 * Validate classroom code format
 * @param {string} code - Classroom code to validate
 * @returns {boolean} True if valid format
 */
export function validateClassroomCode(code) {
  if (typeof code !== "string") {
    return false;
  }

  // Check format: ABC-123 (3 letters, hyphen, 3 numbers)
  const codePattern = /^[A-Z]{3}-[0-9]{3}$/;
  return codePattern.test(code);
}

/**
 * Format classroom code for display (ensure uppercase)
 * @param {string} code - Raw classroom code
 * @returns {string} Formatted classroom code
 */
export function formatClassroomCode(code) {
  if (!code || typeof code !== "string") {
    return "";
  }

  return code.toUpperCase().trim();
}

/**
 * Generate a unique student nickname suggestion based on name
 * @param {string} baseName - Base name for nickname
 * @param {Array<string>} existingNicknames - List of existing nicknames to avoid
 * @returns {string} Unique nickname suggestion
 */
export function generateUniqueNickname(baseName, existingNicknames = []) {
  if (!baseName || typeof baseName !== "string") {
    baseName = "Student";
  }

  // Clean and format base name
  let cleanName = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .substring(0, 10);

  if (cleanName.length === 0) {
    cleanName = "student";
  }

  // Check if base name is available
  if (!existingNicknames.includes(cleanName)) {
    return cleanName;
  }

  // Try adding numbers
  let counter = 1;
  let nickname = `${cleanName}${counter}`;

  while (existingNicknames.includes(nickname) && counter < 100) {
    counter++;
    nickname = `${cleanName}${counter}`;
  }

  return nickname;
}

/**
 * Validate student nickname
 * @param {string} nickname - Nickname to validate
 * @param {Array<string>} existingNicknames - List of existing nicknames
 * @returns {Object} Validation result with isValid and message
 */
export function validateNickname(nickname, existingNicknames = []) {
  if (!nickname || typeof nickname !== "string") {
    return {
      isValid: false,
      message: "Nickname is required",
    };
  }

  const cleanNickname = nickname.trim();

  // Length validation
  if (cleanNickname.length < 2) {
    return {
      isValid: false,
      message: "Nickname must be at least 2 characters long",
    };
  }

  if (cleanNickname.length > 20) {
    return {
      isValid: false,
      message: "Nickname must be 20 characters or less",
    };
  }

  // Character validation (alphanumeric and some special characters)
  const nicknamePattern = /^[a-zA-Z0-9_-]+$/;
  if (!nicknamePattern.test(cleanNickname)) {
    return {
      isValid: false,
      message:
        "Nickname can only contain letters, numbers, underscores, and hyphens",
    };
  }

  // Check for uniqueness
  if (existingNicknames.includes(cleanNickname.toLowerCase())) {
    return {
      isValid: false,
      message: "This nickname is already taken. Please choose another.",
    };
  }

  return {
    isValid: true,
    message: "Nickname is valid",
  };
}

/**
 * Format time duration for display
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration (e.g., "2m 30s")
 */
export function formatDuration(seconds) {
  if (!seconds || seconds < 0) {
    return "0s";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  let result = "";

  if (hours > 0) {
    result += `${hours}h `;
  }

  if (minutes > 0) {
    result += `${minutes}m `;
  }

  if (remainingSeconds > 0 || result === "") {
    result += `${remainingSeconds}s`;
  }

  return result.trim();
}

/**
 * Calculate session statistics
 * @param {Object} sessionData - Session data object
 * @returns {Object} Statistics summary
 */
export function calculateSessionStats(sessionData) {
  const stats = {
    totalStudents: 0,
    activeStudents: 0,
    completedStudents: 0,
    averageProgress: 0,
    totalScenarios: 0,
    sessionDuration: 0,
  };

  if (!sessionData) {
    return stats;
  }

  // Calculate roster statistics
  const roster = sessionData.roster || {};
  stats.totalStudents = Object.keys(roster).length;
  stats.activeStudents = Object.values(roster).filter(
    (student) => student.isActive,
  ).length;

  // Calculate progress statistics
  const studentChoices = sessionData.studentChoices || {};
  const selectedScenarios = sessionData.selectedScenarios || [];
  stats.totalScenarios = selectedScenarios.length;

  if (stats.totalStudents > 0 && stats.totalScenarios > 0) {
    let totalProgress = 0;
    let completedCount = 0;

    Object.values(studentChoices).forEach((student) => {
      const progress = student.overallProgress || {};
      const completed = progress.completed || 0;
      totalProgress += completed;

      if (completed === stats.totalScenarios) {
        completedCount++;
      }
    });

    stats.completedStudents = completedCount;
    stats.averageProgress =
      Math.round((totalProgress / stats.totalStudents) * 100) / 100;
  }

  // Calculate session duration
  const sessionStatus = sessionData.sessionStatus || {};
  if (sessionStatus.startTime && sessionStatus.completedAt) {
    const startTime = new Date(sessionStatus.startTime);
    const endTime = new Date(sessionStatus.completedAt);
    stats.sessionDuration = Math.floor((endTime - startTime) / 1000);
  } else if (sessionStatus.startTime && sessionStatus.isLive) {
    const startTime = new Date(sessionStatus.startTime);
    const now = new Date();
    stats.sessionDuration = Math.floor((now - startTime) / 1000);
  }

  return stats;
}

/**
 * Export student choices data for analysis
 * @param {Object} studentChoices - Student choices data
 * @param {Array} scenarios - Selected scenarios array
 * @returns {Array} Formatted data for export
 */
export function exportStudentChoicesData(studentChoices, scenarios = []) {
  const exportData = [];

  if (!studentChoices || typeof studentChoices !== "object") {
    return exportData;
  }

  Object.entries(studentChoices).forEach(([studentId, studentData]) => {
    const studentScenarios = studentData.scenarios || {};

    scenarios.forEach((scenario, index) => {
      const choice = studentScenarios[scenario.scenarioId];

      exportData.push({
        studentId,
        scenarioOrder: index + 1,
        scenarioId: scenario.scenarioId,
        scenarioTitle: scenario.title,
        scenarioCategory: scenario.category,
        studentChoice: choice?.choice || "no_response",
        responseTime: choice?.responseTime || null,
        confidence: choice?.confidence || null,
        timestamp: choice?.timestamp || null,
        isComplete: choice?.isComplete || false,
      });
    });
  });

  return exportData;
}

/**
 * Check if a classroom session is expired
 * @param {Object} sessionData - Session data object
 * @param {number} timeoutMinutes - Timeout duration in minutes
 * @returns {boolean} True if session is expired
 */
export function isSessionExpired(sessionData, timeoutMinutes = 60) {
  if (!sessionData || !sessionData.sessionStatus) {
    return false;
  }

  const sessionStatus = sessionData.sessionStatus;

  // If session is not live, check last activity
  if (!sessionStatus.isLive) {
    return false; // Completed sessions don't expire
  }

  const startTime = sessionStatus.startTime;
  if (!startTime) {
    return false;
  }

  const now = new Date();
  const sessionStart = new Date(startTime);
  const diffMinutes = (now - sessionStart) / (1000 * 60);

  return diffMinutes > timeoutMinutes;
}

/**
 * Get next scenario in sequence for a student
 * @param {Array} scenarios - Selected scenarios array
 * @param {Object} studentProgress - Student's progress data
 * @returns {Object|null} Next scenario object or null if completed
 */
export function getNextScenario(scenarios, studentProgress) {
  if (!scenarios || !Array.isArray(scenarios) || scenarios.length === 0) {
    return null;
  }

  if (!studentProgress || !studentProgress.scenarios) {
    return scenarios[0]; // Return first scenario
  }

  const completedScenarios = Object.keys(studentProgress.scenarios);

  // Find first incomplete scenario
  for (const scenario of scenarios) {
    if (!completedScenarios.includes(scenario.scenarioId)) {
      return scenario;
    }
  }

  return null; // All scenarios completed
}

/**
 * Sanitize classroom name for safe storage and display
 * @param {string} name - Raw classroom name
 * @returns {string} Sanitized classroom name
 */
export function sanitizeClassroomName(name) {
  if (!name || typeof name !== "string") {
    return "Untitled Classroom";
  }

  return name
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .substring(0, 100); // Limit length
}

/**
 * Generate classroom sharing URL
 * @param {string} classroomCode - Classroom code
 * @param {string} baseUrl - Base application URL
 * @returns {string} Shareable classroom URL
 */
export function generateClassroomShareUrl(
  classroomCode,
  optionsOrBase = (function () {
    try {
      const { origin, pathname } = window.location;
      if (pathname && pathname.toLowerCase().includes("app.html")) {
        return `${origin}${pathname}`;
      }
      return `${origin}/app.html`;
    } catch (_) {
      return "/app.html";
    }
  })(),
) {
  // Backward compatibility: second arg can be baseUrl string
  const isString = typeof optionsOrBase === "string";
  const baseUrl = isString
    ? optionsOrBase
    : optionsOrBase?.baseUrl ||
      (function () {
        try {
          const { origin, pathname } = window.location;
          if (pathname && pathname.toLowerCase().includes("app.html")) {
            return `${origin}${pathname}`;
          }
          return `${origin}/app.html`;
        } catch (_) {
          return "/app.html";
        }
      })();

  if (!classroomCode) return baseUrl;

  const params = new URLSearchParams();
  params.set("join", classroomCode);

  // If options contains a seed payload, embed a compact base64 seed
  if (!isString && optionsOrBase?.seed) {
    try {
      const seed = optionsOrBase.seed;
      // Minimal classroom seed (avoid large fields)
      const compactSeed = {
        classroomId: seed.classroomId,
        classroomName: seed.classroomName,
        classroomCode: seed.classroomCode,
        instructorName: seed.instructorName,
        selectedScenarios: Array.isArray(seed.selectedScenarios)
          ? seed.selectedScenarios.map((s) => ({
              id: s.id || s.scenarioId || s.title,
              title: s.title,
              category: s.category,
            }))
          : [],
        settings: seed.settings || {},
        sessionStatus: seed.sessionStatus || {
          isLive: false,
          isPaused: false,
          currentScenario: 0,
          startTime: null,
          completedAt: null,
        },
      };
      const encoded = btoa(
        unescape(encodeURIComponent(JSON.stringify(compactSeed))),
      );
      params.set("seed", encoded);
    } catch (e) {
      logger.warn(
        "ClassroomUtils",
        "Failed to embed classroom seed in share URL",
        e,
      );
    }
  }

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Log classroom event for analytics
 * @param {string} eventType - Type of classroom event
 * @param {Object} eventData - Event data for logging
 */
export function logClassroomEvent(eventType, eventData = {}) {
  try {
    logger.info("ClassroomUtils", `Classroom event: ${eventType}`, eventData);

    // Send to analytics if available
    if (
      window.simpleAnalytics &&
      typeof window.simpleAnalytics.trackEvent === "function"
    ) {
      window.simpleAnalytics.trackEvent(`classroom_${eventType}`, {
        event_category: "classroom",
        ...eventData,
      });
    }
  } catch (error) {
    logger.warn("ClassroomUtils", "Failed to log classroom event", error);
  }
}
