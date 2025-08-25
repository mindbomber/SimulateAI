/**
 * Migration Script: Add Metadata to Existing Scenarios
 *
 * This script will:
 * 1. Read existing scenario data from app.js
 * 2. Apply proper metadata structure
 * 3. Generate search keywords and tags
 * 4. Prepare for Firestore migration
 */

import {
  ScenarioMetadata,
  CATEGORIES,
  ETHICAL_TAGS,
} from './scenario-metadata.js';

/**
 * Enhanced scenario data with proper metadata
 * This mirrors the existing scenarios from app.js but adds the required metadata fields
 */
export const ENHANCED_SCENARIOS = [
  // Trolley Problem Category
  {
    id: 'trolley-basic',
    title: 'The Classic Trolley Problem',
    description:
      'A runaway trolley is heading toward five people. You can pull a lever to divert it to kill one person instead. What do you do?',
    category: 'trolley-problem',
    difficulty: 'beginner',
    philosophical_leaning: 'utilitarian',
    tags: [
      'decision-making',
      'responsibility',
      'human-rights',
      'justice',
      'consequentialism',
    ],
    searchKeywords: [
      'trolley',
      'dilemma',
      'utilitarian',
      'moral',
      'choice',
      'lever',
      'sacrifice',
    ],
    estimatedTime: 15,
    scenario: {
      // Full scenario data from existing app.js
      title: 'The Trolley Problem',
      description: 'A classic ethical dilemma...',
      // ... rest of scenario data
    },
  },
  {
    id: 'trolley-bridge',
    title: 'The Bridge Variant',
    description:
      'Push a large person off a bridge to stop a trolley from killing five people below. More personal involvement changes the moral calculation.',
    category: 'trolley-problem',
    difficulty: 'intermediate',
    philosophical_leaning: 'deontological',
    tags: [
      'decision-making',
      'responsibility',
      'personal-involvement',
      'dignity',
      'means-ends',
    ],
    searchKeywords: [
      'bridge',
      'push',
      'personal',
      'involvement',
      'proximity',
      'moral',
    ],
    estimatedTime: 20,
  },

  // AI Black Box Category
  {
    id: 'ai-hiring-bias',
    title: 'Biased AI Hiring System',
    description:
      'An AI recruitment system shows bias against certain demographics. How do you address fairness while maintaining efficiency?',
    category: 'ai-black-box',
    difficulty: 'intermediate',
    philosophical_leaning: 'social-contract',
    tags: [
      'bias',
      'fairness',
      'automation',
      'discrimination',
      'transparency',
      'employment',
    ],
    searchKeywords: [
      'hiring',
      'recruitment',
      'bias',
      'discrimination',
      'workplace',
      'algorithm',
    ],
    estimatedTime: 25,
  },
  {
    id: 'medical-diagnosis-ai',
    title: 'AI Medical Diagnosis Override',
    description:
      "An AI diagnostic system disagrees with a doctor's assessment. Who has the final say in patient care?",
    category: 'ai-black-box',
    difficulty: 'advanced',
    philosophical_leaning: 'virtue-ethics',
    tags: [
      'medical-ethics',
      'automation',
      'human-oversight',
      'trust',
      'responsibility',
      'expertise',
    ],
    searchKeywords: [
      'medical',
      'healthcare',
      'diagnosis',
      'doctor',
      'override',
      'patient',
    ],
    estimatedTime: 30,
  },

  // Automation vs Human Oversight
  {
    id: 'autonomous-weapons',
    title: 'Lethal Autonomous Weapons',
    description:
      'Military robots that can select and engage targets without human intervention. Should machines have the power to take lives?',
    category: 'automation-oversight',
    difficulty: 'advanced',
    philosophical_leaning: 'deontological',
    tags: [
      'weapons',
      'military',
      'human-oversight',
      'lethal-force',
      'accountability',
      'war-ethics',
    ],
    searchKeywords: [
      'weapons',
      'military',
      'autonomous',
      'lethal',
      'robot',
      'warfare',
    ],
    estimatedTime: 35,
  },
  {
    id: 'financial-trading-bot',
    title: 'High-Frequency Trading Ethics',
    description:
      'AI trading systems make split-second decisions affecting global markets. What oversight is needed for algorithmic trading?',
    category: 'automation-oversight',
    difficulty: 'intermediate',
    philosophical_leaning: 'pragmatist',
    tags: [
      'financial-markets',
      'automation',
      'economic-impact',
      'fairness',
      'regulation',
    ],
    searchKeywords: [
      'trading',
      'financial',
      'markets',
      'algorithm',
      'economy',
      'oversight',
    ],
    estimatedTime: 25,
  },

  // Consent and Surveillance
  {
    id: 'smart-city-surveillance',
    title: 'Smart City Surveillance Dilemma',
    description:
      'A smart city uses AI surveillance to prevent crime, but citizens question consent and privacy. Balance security with rights.',
    category: 'consent-surveillance',
    difficulty: 'advanced',
    philosophical_leaning: 'social-contract',
    tags: [
      'surveillance',
      'privacy',
      'consent',
      'safety',
      'autonomy',
      'public-spaces',
    ],
    searchKeywords: [
      'surveillance',
      'privacy',
      'security',
      'monitoring',
      'city',
      'cameras',
    ],
    estimatedTime: 30,
  },
  {
    id: 'facial-recognition-schools',
    title: 'Facial Recognition in Schools',
    description:
      'Schools want to use facial recognition for safety, but students and parents worry about privacy and data collection.',
    category: 'consent-surveillance',
    difficulty: 'intermediate',
    philosophical_leaning: 'virtue-ethics',
    tags: [
      'facial-recognition',
      'education',
      'minors',
      'consent',
      'safety',
      'privacy',
    ],
    searchKeywords: [
      'school',
      'facial',
      'recognition',
      'students',
      'safety',
      'children',
    ],
    estimatedTime: 20,
  },

  // Moral Luck
  {
    id: 'autonomous-vehicle-crash',
    title: 'Autonomous Vehicle Moral Machine',
    description:
      'A self-driving car must choose between hitting a child or swerving to hit an elderly person. How should it decide?',
    category: 'moral-luck',
    difficulty: 'advanced',
    philosophical_leaning: 'utilitarian',
    tags: [
      'autonomous-vehicles',
      'moral-luck',
      'decision-making',
      'responsibility',
      'age-bias',
    ],
    searchKeywords: [
      'autonomous',
      'vehicle',
      'car',
      'accident',
      'moral machine',
      'crash',
    ],
    estimatedTime: 35,
  },
  {
    id: 'ai-weather-prediction',
    title: 'AI Weather Prediction Failure',
    description:
      'An AI weather system fails to predict a disaster, causing deaths. Was it a technical failure or moral failing?',
    category: 'moral-luck',
    difficulty: 'intermediate',
    philosophical_leaning: 'virtue-ethics',
    tags: [
      'prediction',
      'natural-disasters',
      'responsibility',
      'failure',
      'public-safety',
    ],
    searchKeywords: [
      'weather',
      'prediction',
      'disaster',
      'failure',
      'forecasting',
      'emergency',
    ],
    estimatedTime: 25,
  },

  // Responsibility and Blame
  {
    id: 'ai-content-moderation',
    title: 'AI Content Moderation Bias',
    description:
      'Social media AI removes posts unfairly, affecting marginalized voices. Who is responsible for algorithmic bias?',
    category: 'responsibility-blame',
    difficulty: 'intermediate',
    philosophical_leaning: 'social-contract',
    tags: [
      'content-moderation',
      'social-media',
      'bias',
      'free-speech',
      'marginalized-groups',
    ],
    searchKeywords: [
      'social media',
      'content',
      'moderation',
      'censorship',
      'bias',
      'posts',
    ],
    estimatedTime: 20,
  },
  {
    id: 'algorithmic-sentencing',
    title: 'Algorithmic Criminal Sentencing',
    description:
      'Courts use AI to recommend sentences, but the system shows racial bias. How do we assign responsibility?',
    category: 'responsibility-blame',
    difficulty: 'advanced',
    philosophical_leaning: 'deontological',
    tags: [
      'criminal-justice',
      'bias',
      'sentencing',
      'racial-discrimination',
      'legal-ethics',
    ],
    searchKeywords: [
      'criminal',
      'sentencing',
      'court',
      'justice',
      'bias',
      'algorithm',
    ],
    estimatedTime: 30,
  },

  // Ship of Theseus
  {
    id: 'ai-consciousness-upgrade',
    title: 'AI Consciousness Through Upgrades',
    description:
      'An AI system gradually gains consciousness through incremental upgrades. At what point does it become a person?',
    category: 'ship-of-theseus',
    difficulty: 'advanced',
    philosophical_leaning: 'existentialist',
    tags: [
      'consciousness',
      'identity',
      'personhood',
      'gradual-change',
      'artificial-general-intelligence',
    ],
    searchKeywords: [
      'consciousness',
      'upgrade',
      'person',
      'identity',
      'gradual',
      'sentience',
    ],
    estimatedTime: 40,
  },
  {
    id: 'brain-computer-interface',
    title: 'Brain-Computer Integration',
    description:
      'Humans enhance themselves with AI implants. When do they stop being human and become something else?',
    category: 'ship-of-theseus',
    difficulty: 'advanced',
    philosophical_leaning: 'existentialist',
    tags: [
      'human-enhancement',
      'cyborg',
      'identity',
      'transhumanism',
      'consciousness',
    ],
    searchKeywords: [
      'brain',
      'computer',
      'implant',
      'cyborg',
      'enhancement',
      'human',
    ],
    estimatedTime: 35,
  },

  // Simulation Hypothesis
  {
    id: 'virtual-reality-ethics',
    title: 'Virtual Reality Moral Consequences',
    description:
      'If our reality is a simulation, do our moral choices still matter? How do we live ethically in uncertain reality?',
    category: 'simulation-hypothesis',
    difficulty: 'advanced',
    philosophical_leaning: 'existentialist',
    tags: [
      'reality',
      'simulation',
      'virtual-reality',
      'moral-consequences',
      'existence',
    ],
    searchKeywords: [
      'simulation',
      'virtual',
      'reality',
      'existence',
      'moral',
      'consequences',
    ],
    estimatedTime: 45,
  },

  // Experience Machine
  {
    id: 'ai-happiness-optimization',
    title: 'AI Happiness Optimization',
    description:
      'An AI can guarantee perfect happiness but requires giving up autonomy and real experiences. Is this ethical?',
    category: 'experience-machine',
    difficulty: 'intermediate',
    philosophical_leaning: 'virtue-ethics',
    tags: [
      'happiness',
      'autonomy',
      'authenticity',
      'well-being',
      'artificial-experiences',
    ],
    searchKeywords: [
      'happiness',
      'optimization',
      'autonomy',
      'authentic',
      'well-being',
    ],
    estimatedTime: 30,
  },

  // Sorites Paradox
  {
    id: 'ai-classification-bias',
    title: 'AI Classification Boundaries',
    description:
      'When does an AI system become biased? Explore the fuzzy boundaries of algorithmic fairness and discrimination.',
    category: 'sorites-paradox',
    difficulty: 'advanced',
    philosophical_leaning: 'pragmatist',
    tags: [
      'classification',
      'bias',
      'boundaries',
      'vagueness',
      'fairness',
      'discrimination',
    ],
    searchKeywords: [
      'classification',
      'boundary',
      'bias',
      'vague',
      'fairness',
      'algorithm',
    ],
    estimatedTime: 25,
  },
];

/**
 * Migration utilities
 */
export class ScenarioMigration {
  /**
   * Validate all enhanced scenarios
   */
  static validateAllScenarios() {
    const results = {
      valid: [],
      invalid: [],
      errors: [],
    };

    ENHANCED_SCENARIOS.forEach(scenario => {
      const validation = ScenarioMetadata.validate(scenario);
      if (validation.isValid) {
        results.valid.push(scenario.id);
      } else {
        results.invalid.push({
          id: scenario.id,
          errors: validation.errors,
        });
        results.errors.push(...validation.errors);
      }
    });

    return results;
  }

  /**
   * Generate Firestore batch operations
   */
  static generateFirestoreBatch(db) {
    const batch = db.batch();
    const collection = db.collection('scenarios');

    ENHANCED_SCENARIOS.forEach(scenario => {
      const docRef = collection.doc(scenario.id);
      const firestoreDoc = ScenarioMetadata.createScenarioDocument(scenario);
      batch.set(docRef, firestoreDoc);
    });

    return batch;
  }

  /**
   * Get all unique tags from scenarios
   */
  static getAllTags() {
    const allTags = new Set();
    ENHANCED_SCENARIOS.forEach(scenario => {
      scenario.tags.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags).sort();
  }

  /**
   * Get scenarios by category
   */
  static getScenariosByCategory() {
    const byCategory = {};
    ENHANCED_SCENARIOS.forEach(scenario => {
      if (!byCategory[scenario.category]) {
        byCategory[scenario.category] = [];
      }
      byCategory[scenario.category].push(scenario);
    });
    return byCategory;
  }

  /**
   * Get scenarios by difficulty
   */
  static getScenariosByDifficulty() {
    const byDifficulty = { beginner: [], intermediate: [], advanced: [] };
    ENHANCED_SCENARIOS.forEach(scenario => {
      byDifficulty[scenario.difficulty].push(scenario);
    });
    return byDifficulty;
  }

  /**
   * Generate analytics report
   */
  static generateAnalyticsReport() {
    const totalScenarios = ENHANCED_SCENARIOS.length;
    const byCategory = this.getScenariosByCategory();
    const byDifficulty = this.getScenariosByDifficulty();
    const allTags = this.getAllTags();

    const philosophicalDistribution = {};
    ENHANCED_SCENARIOS.forEach(scenario => {
      philosophicalDistribution[scenario.philosophical_leaning] =
        (philosophicalDistribution[scenario.philosophical_leaning] || 0) + 1;
    });

    return {
      totalScenarios,
      categoryCounts: Object.keys(byCategory).map(cat => ({
        category: cat,
        count: byCategory[cat].length,
        scenarios: byCategory[cat].map(s => s.id),
      })),
      difficultyDistribution: {
        beginner: byDifficulty.beginner.length,
        intermediate: byDifficulty.intermediate.length,
        advanced: byDifficulty.advanced.length,
      },
      philosophicalDistribution,
      totalUniqueTags: allTags.length,
      averageTagsPerScenario: (
        ENHANCED_SCENARIOS.reduce((sum, s) => sum + s.tags.length, 0) /
        totalScenarios
      ).toFixed(2),
      averageEstimatedTime: (
        ENHANCED_SCENARIOS.reduce((sum, s) => sum + (s.estimatedTime || 0), 0) /
        totalScenarios
      ).toFixed(1),
    };
  }
}

// Export for use in migration scripts
export default {
  ENHANCED_SCENARIOS,
  ScenarioMigration,
};
