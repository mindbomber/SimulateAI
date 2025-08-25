/**
 * Scenario Creation Date Enhancement
 * Adds creation dates and metadata to existing scenarios for better organization and theming
 */

/**
 * Scenario Creation Dates Registry
 * Maps scenario IDs to their creation dates for organizational purposes
 */
export const SCENARIO_CREATION_DATES = {
  // AI Black Box Scenarios (Original content, early development)
  "medical-diagnosis-unexplained": "2024-12-15T00:00:00Z",
  "parole-denial-algorithm": "2024-12-15T00:00:00Z",
  "child-protection-alert": "2024-12-15T00:00:00Z",
  "college-admission-mystery": "2024-12-16T00:00:00Z",
  "insurance-claim-blackbox": "2024-12-16T00:00:00Z",
  "financial-credit-opacity": "2024-12-16T00:00:00Z",

  // Trolley Problem Scenarios (Core ethical dilemmas)
  "autonomous-vehicle-dilemma": "2024-12-10T00:00:00Z",
  "medical-resource-allocation": "2024-12-10T00:00:00Z",
  "drone-warfare-targeting": "2024-12-10T00:00:00Z",
  "social-media-content-moderation": "2024-12-11T00:00:00Z",
  "pandemic-lockdown-ai": "2024-12-11T00:00:00Z",
  "climate-intervention-system": "2024-12-12T00:00:00Z",

  // Automation vs Human Oversight (Balance and control scenarios)
  "manufacturing-safety-override": "2024-12-18T00:00:00Z",
  "financial-trading-halt": "2024-12-18T00:00:00Z",
  "emergency-response-coordination": "2024-12-18T00:00:00Z",
  "nuclear-facility-management": "2024-12-19T00:00:00Z",
  "urban-traffic-control": "2024-12-19T00:00:00Z",
  "space-mission-autonomy": "2024-12-19T00:00:00Z",

  // Consent and Surveillance (Privacy and monitoring)
  "workplace-productivity-monitoring": "2024-12-20T00:00:00Z",
  "student-behavior-tracking": "2024-12-20T00:00:00Z",
  "elderly-care-surveillance": "2024-12-20T00:00:00Z",
  "public-space-facial-recognition": "2024-12-21T00:00:00Z",
  "health-data-sharing": "2024-12-21T00:00:00Z",
  "smart-city-monitoring": "2024-12-21T00:00:00Z",

  // Experience Machine (Happiness and reality)
  "virtual-reality-therapy": "2024-12-22T00:00:00Z",
  "ai-companion-relationships": "2024-12-22T00:00:00Z",
  "memory-enhancement-technology": "2024-12-22T00:00:00Z",
  "digital-afterlife-services": "2024-12-23T00:00:00Z",
  "happiness-optimization-ai": "2024-12-23T00:00:00Z",
  "synthetic-experience-generation": "2024-12-23T00:00:00Z",

  // Moral Luck (Chance and responsibility)
  "autonomous-vehicle-accident": "2024-12-24T00:00:00Z",
  "ai-investment-advice": "2024-12-24T00:00:00Z",
  "weather-prediction-failure": "2024-12-24T00:00:00Z",
  "medical-ai-misdiagnosis": "2024-12-25T00:00:00Z",
  "algorithmic-hiring-bias": "2024-12-25T00:00:00Z",
  "predictive-policing-error": "2024-12-25T00:00:00Z",

  // Responsibility and Blame (Accountability)
  "ai-generated-content-harm": "2024-12-26T00:00:00Z",
  "autonomous-weapon-malfunction": "2024-12-26T00:00:00Z",
  "medical-robot-error": "2024-12-26T00:00:00Z",
  "algorithmic-trading-crash": "2024-12-27T00:00:00Z",
  "ai-tutor-misinformation": "2024-12-27T00:00:00Z",
  "smart-home-privacy-breach": "2024-12-27T00:00:00Z",

  // Ship of Theseus (Identity and continuity)
  "ai-consciousness-transfer": "2024-12-28T00:00:00Z",
  "digital-identity-merger": "2024-12-28T00:00:00Z",
  "robot-personality-update": "2024-12-28T00:00:00Z",
  "ai-memory-replacement": "2024-12-29T00:00:00Z",
  "synthetic-human-replica": "2024-12-29T00:00:00Z",
  "distributed-ai-consciousness": "2024-12-29T00:00:00Z",

  // Simulation Hypothesis (Reality and existence)
  "ai-world-simulation": "2024-12-30T00:00:00Z",
  "consciousness-uploading": "2024-12-30T00:00:00Z",
  "reality-verification-system": "2024-12-30T00:00:00Z",
  "digital-universe-creation": "2024-12-31T00:00:00Z",
  "simulated-being-rights": "2024-12-31T00:00:00Z",
  "nested-reality-discovery": "2024-12-31T00:00:00Z",

  // Sorites Paradox (Vagueness and boundaries)
  "ai-sentience-threshold": "2025-01-01T00:00:00Z",
  "autonomous-vehicle-levels": "2025-01-01T00:00:00Z",
  "content-moderation-boundaries": "2025-01-01T00:00:00Z",
  "privacy-invasion-spectrum": "2025-01-02T00:00:00Z",
  "ai-creativity-classification": "2025-01-02T00:00:00Z",
  "human-ai-collaboration-scale": "2025-01-02T00:00:00Z",
};

/**
 * Category Creation Dates Registry
 * Maps category IDs to their creation dates
 */
export const CATEGORY_CREATION_DATES = {
  "trolley-problem": "2024-12-10T00:00:00Z",
  "ai-black-box": "2024-12-15T00:00:00Z",
  "automation-oversight": "2024-12-18T00:00:00Z",
  "consent-surveillance": "2024-12-20T00:00:00Z",
  "experience-machine": "2024-12-22T00:00:00Z",
  "moral-luck": "2024-12-24T00:00:00Z",
  "responsibility-blame": "2024-12-26T00:00:00Z",
  "ship-of-theseus": "2024-12-28T00:00:00Z",
  "simulation-hypothesis": "2024-12-30T00:00:00Z",
  "sorites-paradox": "2025-01-01T00:00:00Z",
};

/**
 * Seasonal Theme Mapping
 * Maps creation dates to seasonal themes for styling purposes
 */
export const SEASONAL_THEMES = {
  "winter-2024": {
    dateRange: { start: "2024-12-01T00:00:00Z", end: "2024-12-31T23:59:59Z" },
    theme: "winter",
    colors: {
      primary: "#2563eb", // Winter blue
      secondary: "#1e40af",
      accent: "#3b82f6",
      background: "#f8fafc",
    },
    cardStyle: "frost-border",
    icon: "❄️",
  },
  "new-year-2025": {
    dateRange: { start: "2025-01-01T00:00:00Z", end: "2025-01-31T23:59:59Z" },
    theme: "new-year",
    colors: {
      primary: "#dc2626", // Celebration red
      secondary: "#b91c1c",
      accent: "#f59e0b", // Gold accent
      background: "#fef3c7",
    },
    cardStyle: "celebration-border",
    icon: "🎊",
  },
  "spring-2025": {
    dateRange: { start: "2025-03-01T00:00:00Z", end: "2025-05-31T23:59:59Z" },
    theme: "spring",
    colors: {
      primary: "#059669", // Spring green
      secondary: "#047857",
      accent: "#10b981",
      background: "#f0fdf4",
    },
    cardStyle: "nature-border",
    icon: "🌸",
  },
  "summer-2025": {
    dateRange: { start: "2025-06-01T00:00:00Z", end: "2025-08-31T23:59:59Z" },
    theme: "summer",
    colors: {
      primary: "#ea580c", // Summer orange
      secondary: "#c2410c",
      accent: "#fb923c",
      background: "#fff7ed",
    },
    cardStyle: "sunny-border",
    icon: "☀️",
  },
};

/**
 * Get creation date for a scenario
 * @param {string} scenarioId - The scenario identifier
 * @returns {string|null} ISO date string or null if not found
 */
export function getScenarioCreationDate(scenarioId) {
  return SCENARIO_CREATION_DATES[scenarioId] || null;
}

/**
 * Get creation date for a category
 * @param {string} categoryId - The category identifier
 * @returns {string|null} ISO date string or null if not found
 */
export function getCategoryCreationDate(categoryId) {
  return CATEGORY_CREATION_DATES[categoryId] || null;
}

/**
 * Get seasonal theme for a given date
 * @param {string|Date} date - The date to check (ISO string or Date object)
 * @returns {object|null} Theme object or null if no theme found
 */
export function getSeasonalTheme(date) {
  const checkDate = typeof date === "string" ? new Date(date) : date;
  const isoString = checkDate.toISOString();

  for (const [themeName, themeData] of Object.entries(SEASONAL_THEMES)) {
    if (
      isoString >= themeData.dateRange.start &&
      isoString <= themeData.dateRange.end
    ) {
      return { name: themeName, ...themeData };
    }
  }

  return null;
}

/**
 * Get theme for scenario based on creation date
 * @param {string} scenarioId - The scenario identifier
 * @returns {object|null} Theme object or null if no theme found
 */
export function getScenarioTheme(scenarioId) {
  const creationDate = getScenarioCreationDate(scenarioId);
  return creationDate ? getSeasonalTheme(creationDate) : null;
}

/**
 * Get theme for category based on creation date
 * @param {string} categoryId - The category identifier
 * @returns {object|null} Theme object or null if no theme found
 */
export function getCategoryTheme(categoryId) {
  const creationDate = getCategoryCreationDate(categoryId);
  return creationDate ? getSeasonalTheme(creationDate) : null;
}

/**
 * Get all scenarios created within a date range
 * @param {string} startDate - Start date (ISO string)
 * @param {string} endDate - End date (ISO string)
 * @returns {Array} Array of scenario IDs
 */
export function getScenariosInDateRange(startDate, endDate) {
  return Object.entries(SCENARIO_CREATION_DATES)
    .filter(([, date]) => date >= startDate && date <= endDate)
    .map(([scenarioId]) => scenarioId);
}

/**
 * Get scenarios by seasonal theme
 * @param {string} themeName - Theme name (e.g., 'winter-2024')
 * @returns {Array} Array of scenario IDs
 */
export function getScenariosByTheme(themeName) {
  const theme = SEASONAL_THEMES[themeName];
  if (!theme) return [];

  return getScenariosInDateRange(theme.dateRange.start, theme.dateRange.end);
}

/**
 * Add creation metadata to scenario object
 * @param {object} scenario - The scenario object
 * @param {string} scenarioId - The scenario identifier
 * @returns {object} Enhanced scenario with metadata
 */
export function addCreationMetadata(scenario, scenarioId) {
  const creationDate = getScenarioCreationDate(scenarioId);
  const theme = getScenarioTheme(scenarioId);

  return {
    ...scenario,
    metadata: {
      createdAt: creationDate,
      updatedAt: creationDate, // Initially same as creation date
      theme: theme,
      version: 1.0,
      isPublished: true,
      ...scenario.metadata, // Preserve any existing metadata
    },
  };
}

/**
 * Utility for future scenario creation
 * @param {object} scenario - The new scenario object
 * @param {string} scenarioId - The scenario identifier
 * @param {object} options - Creation options
 * @returns {object} Scenario with creation metadata
 */
export function createScenarioWithMetadata(scenario, scenarioId, options = {}) {
  const now = new Date().toISOString();
  const theme = getSeasonalTheme(now);

  return {
    ...scenario,
    metadata: {
      createdAt: now,
      updatedAt: now,
      theme: theme,
      version: options.version || 1.0,
      isPublished: options.isPublished !== false,
      authorId: options.authorId || "system",
      tags: options.tags || [],
      difficulty: options.difficulty || "intermediate",
      estimatedTime: options.estimatedTime || 15,
      ...options.metadata,
    },
  };
}

export default {
  SCENARIO_CREATION_DATES,
  CATEGORY_CREATION_DATES,
  SEASONAL_THEMES,
  getScenarioCreationDate,
  getCategoryCreationDate,
  getSeasonalTheme,
  getScenarioTheme,
  getCategoryTheme,
  getScenariosInDateRange,
  getScenariosByTheme,
  addCreationMetadata,
  createScenarioWithMetadata,
};
