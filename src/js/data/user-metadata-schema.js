/**
 * User Metadata Collection System
 * Collects demographic, philosophical, and behavioral data for research and personalization
 */

export const USER_METADATA_SCHEMA = {
  // Core Identity
  userId: 'string', // Unique identifier
  createdAt: 'timestamp',
  updatedAt: 'timestamp',

  // Demographic & Identity Fields
  demographics: {
    ageRange: 'string', // "18-24", "25-34", "35-44", "45-54", "55-64", "65+"
    birthYear: 'number', // Optional for more precise age tracking
    genderIdentity: 'string', // Inclusive options
    country: 'string',
    region: 'string', // State/province
    nativeLanguages: 'array', // Array of language codes
    educationLevel: 'string',
    profession: 'string',
    fieldOfStudy: 'string',
    religiousAffiliation: 'string', // Optional
    culturalBackground: 'string', // Optional
  },

  // Philosophical & Cognitive Fields
  philosophy: {
    preferredEthicalFramework: 'string', // Primary framework
    secondaryEthicalFrameworks: 'array', // Additional frameworks
    politicalOrientation: 'string', // Optional
    cognitiveStyle: 'string', // "analytical", "intuitive", "balanced"
    moralFoundations: {
      care: 'number', // 1-7 scale
      fairness: 'number',
      loyalty: 'number',
      authority: 'number',
      sanctity: 'number',
      liberty: 'number', // Haidt's updated framework
    },
    ethicalComplexityPreference: 'string', // "simple", "moderate", "complex"
    conflictResolutionStyle: 'string', // "collaborative", "competitive", "avoidant", "accommodating"
  },

  // Engagement & Behavior Fields
  engagement: {
    scenarioCompletionCount: 'number',
    totalTimeSpent: 'number', // Minutes
    averageDecisionTime: 'number', // Seconds per decision
    preferredSessionLength: 'string', // "quick", "standard", "extended"
    remixActivity: 'number', // Count of answer modifications
    favoriteCategories: 'array', // Category IDs
    difficultyProgression: 'string', // "beginner", "intermediate", "advanced"
    lastActiveDate: 'timestamp',
    streakCount: 'number', // Consecutive days active
    achievementUnlocked: 'array', // Achievement IDs
  },

  // Learning & Growth Tracking
  learning: {
    conceptsExplored: 'array', // Philosophical concepts encountered
    skillsAssessed: 'object', // Skills and their levels
    learningGoals: 'array', // User-defined goals
    progressMilestones: 'array', // Completed milestones
    reflectionNotes: 'array', // User's self-reflection entries
    growthAreas: 'array', // Areas for improvement
  },

  // Consent & Data Sharing Preferences
  consent: {
    researchParticipation: 'boolean', // Anonymized research inclusion
    dataSharing: 'boolean', // Share anonymized responses
    publicContribution: 'boolean', // Contribute to public scenarios
    insightsSharing: 'boolean', // Receive comparative insights
    marketingCommunication: 'boolean', // Receive updates/newsletters
    dataRetentionPeriod: 'string', // "1year", "3years", "indefinite"
    consentVersion: 'string', // Version of consent agreement
    consentDate: 'timestamp',
  },

  // Privacy & Security
  privacy: {
    profileVisibility: 'string', // "private", "friends", "public"
    dataExportRequests: 'array', // History of data export requests
    dataDeleteRequests: 'array', // History of deletion requests
    sessionTracking: 'boolean', // Allow detailed session tracking
    analyticsOptOut: 'boolean', // Opt out of usage analytics
  },
};

/**
 * Demographic options with inclusive, research-backed categories
 */
export const DEMOGRAPHIC_OPTIONS = {
  ageRanges: [
    {
      value: 'under-18',
      label: 'Under 18',
      researchNote: 'Requires parental consent',
    },
    { value: '18-24', label: '18-24', researchNote: 'Emerging adulthood' },
    { value: '25-34', label: '25-34', researchNote: 'Young adults' },
    { value: '35-44', label: '35-44', researchNote: 'Middle adults' },
    { value: '45-54', label: '45-54', researchNote: 'Mid-life' },
    { value: '55-64', label: '55-64', researchNote: 'Pre-retirement' },
    { value: '65+', label: '65+', researchNote: 'Retirement age' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
  ],

  genderIdentities: [
    { value: 'woman', label: 'Woman' },
    { value: 'man', label: 'Man' },
    { value: 'non-binary', label: 'Non-binary' },
    { value: 'genderfluid', label: 'Genderfluid' },
    { value: 'transgender-woman', label: 'Transgender woman' },
    { value: 'transgender-man', label: 'Transgender man' },
    { value: 'two-spirit', label: 'Two-Spirit' },
    { value: 'agender', label: 'Agender' },
    { value: 'other', label: 'Other (please specify)' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
  ],

  educationLevels: [
    { value: 'some-high-school', label: 'Some high school' },
    { value: 'high-school-diploma', label: 'High school diploma/GED' },
    { value: 'some-college', label: 'Some college, no degree' },
    { value: 'associates-degree', label: "Associate's degree" },
    { value: 'bachelors-degree', label: "Bachelor's degree" },
    { value: 'masters-degree', label: "Master's degree" },
    {
      value: 'professional-degree',
      label: 'Professional degree (JD, MD, etc.)',
    },
    { value: 'doctoral-degree', label: 'Doctoral degree (PhD, EdD, etc.)' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
  ],

  professionCategories: [
    { value: 'student', label: 'Student' },
    { value: 'technology', label: 'Technology/IT' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'business-finance', label: 'Business/Finance' },
    { value: 'legal', label: 'Legal' },
    { value: 'government', label: 'Government/Public Service' },
    { value: 'nonprofit', label: 'Non-profit' },
    { value: 'research-academia', label: 'Research/Academia' },
    { value: 'arts-media', label: 'Arts/Media' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'science', label: 'Science' },
    { value: 'social-services', label: 'Social Services' },
    { value: 'retail-service', label: 'Retail/Service' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'retired', label: 'Retired' },
    { value: 'unemployed', label: 'Unemployed' },
    { value: 'self-employed', label: 'Self-employed' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
  ],

  religiousAffiliations: [
    { value: 'christian', label: 'Christian' },
    { value: 'muslim', label: 'Muslim' },
    { value: 'jewish', label: 'Jewish' },
    { value: 'hindu', label: 'Hindu' },
    { value: 'buddhist', label: 'Buddhist' },
    { value: 'sikh', label: 'Sikh' },
    { value: 'spiritual-not-religious', label: 'Spiritual but not religious' },
    { value: 'agnostic', label: 'Agnostic' },
    { value: 'atheist', label: 'Atheist' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
  ],
};

/**
 * Philosophical framework options
 */
export const PHILOSOPHICAL_OPTIONS = {
  ethicalFrameworks: [
    {
      value: 'utilitarian',
      label: 'Utilitarian',
      description: 'Greatest good for the greatest number',
      keywords: ['consequences', 'outcomes', 'maximize happiness'],
    },
    {
      value: 'deontological',
      label: 'Deontological',
      description: 'Duty-based ethics, moral rules and principles',
      keywords: ['duty', 'rights', 'principles', 'categorical imperative'],
    },
    {
      value: 'virtue-ethics',
      label: 'Virtue Ethics',
      description: 'Character-based ethics, moral virtues',
      keywords: ['character', 'virtues', 'flourishing', 'excellence'],
    },
    {
      value: 'care-ethics',
      label: 'Care Ethics',
      description: 'Emphasis on relationships and care',
      keywords: ['relationships', 'care', 'context', 'empathy'],
    },
    {
      value: 'existentialist',
      label: 'Existentialist',
      description: 'Individual freedom and authentic choice',
      keywords: ['freedom', 'authenticity', 'responsibility', 'choice'],
    },
    {
      value: 'pragmatist',
      label: 'Pragmatist',
      description: 'Practical consequences and workable solutions',
      keywords: ['practical', 'workable', 'contextual', 'adaptive'],
    },
    {
      value: 'social-contract',
      label: 'Social Contract',
      description: 'Agreement-based ethics and social cooperation',
      keywords: ['agreement', 'cooperation', 'fairness', 'justice'],
    },
    {
      value: 'relativist',
      label: 'Relativist',
      description: 'Context-dependent moral judgments',
      keywords: ['context', 'culture', 'relative', 'situational'],
    },
    {
      value: 'mixed-approach',
      label: 'Mixed Approach',
      description: 'Combination of multiple frameworks',
      keywords: ['flexible', 'multiple', 'situational', 'balanced'],
    },
    {
      value: 'still-exploring',
      label: 'Still Exploring',
      description: 'Learning about different approaches',
      keywords: ['learning', 'exploring', 'undecided'],
    },
  ],

  cognitiveStyles: [
    {
      value: 'analytical',
      label: 'Analytical',
      description: 'Systematic, logical, detail-oriented approach',
    },
    {
      value: 'intuitive',
      label: 'Intuitive',
      description: 'Gut-feeling, holistic, pattern-based approach',
    },
    {
      value: 'balanced',
      label: 'Balanced',
      description: 'Mix of analytical and intuitive approaches',
    },
    {
      value: 'creative',
      label: 'Creative',
      description: 'Innovative, imaginative, outside-the-box thinking',
    },
    {
      value: 'practical',
      label: 'Practical',
      description: 'Focus on real-world application and results',
    },
  ],

  politicalOrientations: [
    { value: 'very-liberal', label: 'Very Liberal' },
    { value: 'liberal', label: 'Liberal' },
    { value: 'slightly-liberal', label: 'Slightly Liberal' },
    { value: 'moderate', label: 'Moderate/Centrist' },
    { value: 'slightly-conservative', label: 'Slightly Conservative' },
    { value: 'conservative', label: 'Conservative' },
    { value: 'very-conservative', label: 'Very Conservative' },
    { value: 'libertarian', label: 'Libertarian' },
    { value: 'green', label: 'Green/Environmental' },
    { value: 'socialist', label: 'Socialist' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
    { value: 'not-applicable', label: 'Not applicable/Non-political' },
  ],
};

/**
 * Moral Foundations Theory - Haidt's framework
 */
export const MORAL_FOUNDATIONS = {
  care: {
    name: 'Care/Harm',
    description: 'Concern for the suffering of others',
    questions: [
      'How important is it to avoid causing harm to others?',
      'Should we prioritize protecting the vulnerable?',
    ],
  },
  fairness: {
    name: 'Fairness/Cheating',
    description: 'Concern for proportional treatment and justice',
    questions: [
      'How important is it that everyone gets their fair share?',
      'Should rules apply equally to everyone?',
    ],
  },
  loyalty: {
    name: 'Loyalty/Betrayal',
    description: 'Concern for group cohesion and solidarity',
    questions: [
      'How important is loyalty to your group or community?',
      'Should people prioritize their team/family/country?',
    ],
  },
  authority: {
    name: 'Authority/Subversion',
    description: 'Concern for tradition, hierarchy, and respect',
    questions: [
      'How important is it to respect authority and tradition?',
      'Should people follow established social hierarchies?',
    ],
  },
  sanctity: {
    name: 'Sanctity/Degradation',
    description: 'Concern for purity, sacredness, and dignity',
    questions: [
      'How important is it to maintain purity and avoid degradation?',
      'Are some things sacred and should not be violated?',
    ],
  },
  liberty: {
    name: 'Liberty/Oppression',
    description: 'Concern for freedom from domination',
    questions: [
      'How important is individual freedom and autonomy?',
      'Should people resist oppression and coercion?',
    ],
  },
};

export default {
  USER_METADATA_SCHEMA,
  DEMOGRAPHIC_OPTIONS,
  PHILOSOPHICAL_OPTIONS,
  MORAL_FOUNDATIONS,
};
