/**
 * Scenario Metadata Schema and Utilities
 * Defines the structure for tagging and categorizing AI ethics scenarios
 */

import {
  getCategoryCreationDate,
  getCategoryTheme,
} from "./scenario-creation-dates.js";

/**
 * Scenario metadata schema for Firestore
 */
export const SCENARIO_SCHEMA = {
  // Required fields
  id: "string", // Unique identifier
  title: "string", // Display title
  description: "string", // Brief description
  category: "string", // Primary category (see CATEGORIES)
  difficulty: "string", // beginner, intermediate, advanced
  philosophical_leaning: "string", // Primary philosophical approach
  tags: "array", // Array of tag strings
  searchKeywords: "array", // Keywords for search

  // Optional fields
  estimatedTime: "number", // Minutes to complete
  createdAt: "timestamp", // Creation date
  updatedAt: "timestamp", // Last modified
  authorId: "string", // Creator user ID
  isPublished: "boolean", // Published status
  version: "number", // Version number

  // Analytics fields
  completionCount: "number", // Times completed
  averageRating: "number", // User rating average
  reportCount: "number", // Abuse reports

  // Content fields
  scenario: "object", // Full scenario data
  choices: "array", // Choice options
  outcomes: "object", // Possible outcomes
  vocabulary: "object", // Key terms definitions
  ethicsMeters: "object", // Ethics dimension weights
};

/**
 * Available categories with enhanced metadata
 */
export const CATEGORIES = {
  "trolley-problem": {
    name: "The Trolley Problem",
    icon: "🚃",
    description:
      "Classic ethical dilemma of utilitarian vs deontological ethics",
    createdAt: getCategoryCreationDate("trolley-problem"),
    theme: getCategoryTheme("trolley-problem"),
  },
  "ai-black-box": {
    name: "The AI Black Box",
    icon: "📦",
    description: "Epistemological challenges of opaque AI systems",
    createdAt: getCategoryCreationDate("ai-black-box"),
    theme: getCategoryTheme("ai-black-box"),
  },
  "automation-oversight": {
    name: "Automation vs Human Oversight",
    icon: "⚖️",
    description: "Free will and determinism in automated systems",
    createdAt: getCategoryCreationDate("automation-oversight"),
    theme: getCategoryTheme("automation-oversight"),
  },
  "consent-surveillance": {
    name: "Consent and Surveillance",
    icon: "👁️",
    description: "Privacy, autonomy, and social justice in AI monitoring",
    createdAt: getCategoryCreationDate("consent-surveillance"),
    theme: getCategoryTheme("consent-surveillance"),
  },
  "moral-luck": {
    name: "Moral Luck",
    icon: "🎲",
    description: "Responsibility and blame in uncertain AI outcomes",
    createdAt: getCategoryCreationDate("moral-luck"),
    theme: getCategoryTheme("moral-luck"),
  },
  "responsibility-blame": {
    name: "Responsibility & Blame",
    icon: "⚡",
    description: "Accountability in AI decision-making systems",
    createdAt: getCategoryCreationDate("responsibility-blame"),
    theme: getCategoryTheme("responsibility-blame"),
  },
  "ship-of-theseus": {
    name: "Ship of Theseus",
    icon: "🚢",
    description: "Identity and continuity paradoxes in AI systems",
    createdAt: getCategoryCreationDate("ship-of-theseus"),
    theme: getCategoryTheme("ship-of-theseus"),
  },
  "simulation-hypothesis": {
    name: "Simulation Hypothesis",
    icon: "🌐",
    description: "Reality and existence in computational worlds",
    createdAt: getCategoryCreationDate("simulation-hypothesis"),
    theme: getCategoryTheme("simulation-hypothesis"),
  },
  "experience-machine": {
    name: "Experience Machine",
    icon: "🎭",
    description: "Philosophy of mind and the nature of well-being",
    createdAt: getCategoryCreationDate("experience-machine"),
    theme: getCategoryTheme("experience-machine"),
  },
  "sorites-paradox": {
    name: "Sorites Paradox",
    icon: "🔄",
    description: "Vagueness and logical reasoning in AI classifications",
    createdAt: getCategoryCreationDate("sorites-paradox"),
    theme: getCategoryTheme("sorites-paradox"),
  },
};

/**
 * Difficulty levels
 */
export const DIFFICULTY_LEVELS = {
  beginner: {
    name: "Beginner",
    description: "Introductory concepts, clear moral dimensions",
    color: "#065f46",
    backgroundColor: "#d1fae5",
  },
  intermediate: {
    name: "Intermediate",
    description: "Multiple perspectives, some ambiguity",
    color: "#92400e",
    backgroundColor: "#fef3c7",
  },
  advanced: {
    name: "Advanced",
    description: "Complex trade-offs, nuanced ethical considerations",
    color: "#991b1b",
    backgroundColor: "#fee2e2",
  },
};

/**
 * Philosophical approaches
 */
export const PHILOSOPHICAL_APPROACHES = {
  utilitarian: {
    name: "Utilitarian",
    description: "Greatest good for the greatest number",
    keywords: [
      "consequence",
      "outcome",
      "utility",
      "happiness",
      "bentham",
      "mill",
    ],
  },
  deontological: {
    name: "Deontological",
    description: "Duty-based ethics, categorical imperatives",
    keywords: [
      "duty",
      "kant",
      "categorical",
      "imperative",
      "rights",
      "obligation",
    ],
  },
  "virtue-ethics": {
    name: "Virtue Ethics",
    description: "Character-based ethics, moral virtues",
    keywords: ["virtue", "character", "aristotle", "eudaimonia", "flourishing"],
  },
  existentialist: {
    name: "Existentialist",
    description: "Individual freedom, authenticity, responsibility",
    keywords: [
      "freedom",
      "authenticity",
      "sartre",
      "kierkegaard",
      "choice",
      "anxiety",
    ],
  },
  pragmatist: {
    name: "Pragmatist",
    description: "Practical consequences, contextual solutions",
    keywords: [
      "practical",
      "context",
      "dewey",
      "james",
      "workable",
      "adaptive",
    ],
  },
  "social-contract": {
    name: "Social Contract",
    description: "Agreement-based ethics, social cooperation",
    keywords: [
      "contract",
      "agreement",
      "rousseau",
      "hobbes",
      "cooperation",
      "society",
    ],
  },
};

/**
 * Common ethical tags
 */
export const ETHICAL_TAGS = [
  // Core AI Ethics
  "bias",
  "fairness",
  "transparency",
  "accountability",
  "explainability",
  "safety",
  "reliability",
  "robustness",
  "privacy",
  "security",

  // Human Values
  "autonomy",
  "dignity",
  "equality",
  "justice",
  "human-rights",
  "freedom",
  "consent",
  "trust",
  "respect",
  "compassion",

  // Decision Making
  "decision-making",
  "responsibility",
  "blame",
  "causation",
  "intention",
  "agency",
  "control",
  "oversight",
  "supervision",

  // Technology & Society
  "automation",
  "human-in-the-loop",
  "displacement",
  "surveillance",
  "monitoring",
  "prediction",
  "profiling",
  "discrimination",
  "manipulation",
  "persuasion",
  "influence",

  // Philosophical Concepts
  "free-will",
  "determinism",
  "consciousness",
  "identity",
  "personhood",
  "sentience",
  "mind",
  "reality",
  "existence",
  "knowledge",
  "truth",
  "certainty",
  "probability",

  // Applied Ethics
  "medical-ethics",
  "research-ethics",
  "business-ethics",
  "legal-ethics",
  "environmental-ethics",
  "data-ethics",

  // Emerging Issues
  "artificial-general-intelligence",
  "superintelligence",
  "alignment",
  "value-learning",
  "reward-hacking",
  "mesa-optimization",
  "inner-alignment",
];

/**
 * Firestore collection and document utilities
 */
export class ScenarioMetadata {
  /**
   * Validate scenario metadata against schema
   */
  static validate(scenario) {
    const errors = [];

    // Required fields
    if (!scenario.id) errors.push("Missing required field: id");
    if (!scenario.title) errors.push("Missing required field: title");
    if (!scenario.description)
      errors.push("Missing required field: description");
    if (!scenario.category) errors.push("Missing required field: category");
    if (!scenario.difficulty) errors.push("Missing required field: difficulty");
    if (!scenario.philosophical_leaning)
      errors.push("Missing required field: philosophical_leaning");
    if (!Array.isArray(scenario.tags)) errors.push("tags must be an array");
    if (!Array.isArray(scenario.searchKeywords))
      errors.push("searchKeywords must be an array");

    // Validate category
    if (scenario.category && !CATEGORIES[scenario.category]) {
      errors.push(`Invalid category: ${scenario.category}`);
    }

    // Validate difficulty
    if (scenario.difficulty && !DIFFICULTY_LEVELS[scenario.difficulty]) {
      errors.push(`Invalid difficulty: ${scenario.difficulty}`);
    }

    // Validate philosophical approach
    if (
      scenario.philosophical_leaning &&
      !PHILOSOPHICAL_APPROACHES[scenario.philosophical_leaning]
    ) {
      errors.push(
        `Invalid philosophical_leaning: ${scenario.philosophical_leaning}`,
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate search keywords from scenario content
   */
  static generateSearchKeywords(scenario) {
    const keywords = new Set();

    // Add title words
    scenario.title
      ?.toLowerCase()
      .split(/\s+/)
      .forEach((word) => {
        if (word.length > 2) keywords.add(word);
      });

    // Add description words
    scenario.description
      ?.toLowerCase()
      .split(/\s+/)
      .forEach((word) => {
        if (word.length > 3) keywords.add(word);
      });

    // Add category keywords
    if (scenario.category && CATEGORIES[scenario.category]) {
      keywords.add(scenario.category);
      keywords.add(CATEGORIES[scenario.category].name.toLowerCase());
    }

    // Add philosophical approach keywords
    if (
      scenario.philosophical_leaning &&
      PHILOSOPHICAL_APPROACHES[scenario.philosophical_leaning]
    ) {
      const approach = PHILOSOPHICAL_APPROACHES[scenario.philosophical_leaning];
      approach.keywords.forEach((keyword) => keywords.add(keyword));
    }

    // Add tags
    scenario.tags?.forEach((tag) => keywords.add(tag));

    return Array.from(keywords);
  }

  /**
   * Create a new scenario document with proper metadata
   */
  static createScenarioDocument(scenarioData) {
    const now = new Date();

    const scenario = {
      ...scenarioData,
      createdAt: now,
      updatedAt: now,
      version: 1,
      isPublished: false,
      completionCount: 0,
      averageRating: 0,
      reportCount: 0,
    };

    // Generate search keywords if not provided
    if (!scenario.searchKeywords) {
      scenario.searchKeywords = this.generateSearchKeywords(scenario);
    }

    // Validate before returning
    const validation = this.validate(scenario);
    if (!validation.isValid) {
      throw new Error(
        `Invalid scenario metadata: ${validation.errors.join(", ")}`,
      );
    }

    return scenario;
  }

  /**
   * Update scenario metadata
   */
  static updateScenarioDocument(existingScenario, updates) {
    const updatedScenario = {
      ...existingScenario,
      ...updates,
      updatedAt: new Date(),
      version: (existingScenario.version || 1) + 1,
    };

    // Regenerate search keywords if content changed
    if (updates.title || updates.description || updates.tags) {
      updatedScenario.searchKeywords =
        this.generateSearchKeywords(updatedScenario);
    }

    // Validate
    const validation = this.validate(updatedScenario);
    if (!validation.isValid) {
      throw new Error(
        `Invalid scenario metadata: ${validation.errors.join(", ")}`,
      );
    }

    return updatedScenario;
  }
}

/**
 * Firestore query helpers
 */
export class ScenarioQueries {
  /**
   * Build a Firestore query with filters
   */
  static buildQuery(db, filters = {}) {
    let query = db.collection("scenarios");

    // Category filter
    if (filters.category) {
      query = query.where("category", "==", filters.category);
    }

    // Difficulty filter
    if (filters.difficulty) {
      query = query.where("difficulty", "==", filters.difficulty);
    }

    // Philosophical approach filter
    if (filters.philosophical_leaning) {
      query = query.where(
        "philosophical_leaning",
        "==",
        filters.philosophical_leaning,
      );
    }

    // Tags filter (single tag)
    if (filters.tag) {
      query = query.where("tags", "array-contains", filters.tag);
    }

    // Tags filter (multiple tags - requires client-side filtering)
    if (filters.tags && filters.tags.length > 1) {
      query = query.where("tags", "array-contains-any", filters.tags);
    }

    // Published status
    if (filters.isPublished !== undefined) {
      query = query.where("isPublished", "==", filters.isPublished);
    }

    // Ordering
    if (filters.orderBy) {
      query = query.orderBy(filters.orderBy, filters.orderDirection || "asc");
    }

    // Pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.startAfter) {
      query = query.startAfter(filters.startAfter);
    }

    return query;
  }

  /**
   * Search scenarios by keywords
   */
  static async searchScenarios(db, searchTerm, additionalFilters = {}) {
    // Note: Firestore doesn't support full-text search natively
    // This is a simplified approach - consider using Algolia or similar for production

    const baseQuery = this.buildQuery(db, additionalFilters);
    const results = await baseQuery.get();

    const searchWords = searchTerm.toLowerCase().split(/\s+/);

    return results.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((scenario) => {
        const searchableText = [
          scenario.title,
          scenario.description,
          ...(scenario.searchKeywords || []),
          ...(scenario.tags || []),
        ]
          .join(" ")
          .toLowerCase();

        return searchWords.some((word) => searchableText.includes(word));
      });
  }

  /**
   * Get popular/trending scenarios
   */
  static getTrendingScenarios(db, limit = 10) {
    return db
      .collection("scenarios")
      .where("isPublished", "==", true)
      .orderBy("completionCount", "desc")
      .limit(limit);
  }

  /**
   * Get recently added scenarios
   */
  static getRecentScenarios(db, limit = 10) {
    return db
      .collection("scenarios")
      .where("isPublished", "==", true)
      .orderBy("createdAt", "desc")
      .limit(limit);
  }
}
