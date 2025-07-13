/**
 * Copyright 2025 Armando Sori
 *
 * Philosophical Taxonomy for AI & Robotics Ethics Categories
 *
 * This document defines the broader philosophical categories that should guide
 * the creation of new AI and robotics ethics scenarios, learning labs, and badges.
 * All new categories should map to one or more of these fundamental domains.
 */

// ========================================
// BROADER PHILOSOPHICAL CATEGORIES
// ========================================

export const PHILOSOPHICAL_DOMAINS = {
  'ethical-dilemmas': {
    name: 'Ethical Dilemmas',
    description:
      'Moral conflicts where AI systems must choose between competing values',
    aiApplications: [
      'Autonomous vehicle decision-making',
      'Medical AI treatment recommendations',
      'Resource allocation algorithms',
      'Military AI targeting decisions',
      'Social media content moderation',
    ],
    keyQuestions: [
      'How should AI systems weigh competing moral principles?',
      'Who bears responsibility for AI ethical decisions?',
      'Can machines truly make moral choices?',
    ],
  },

  'philosophy-of-mind': {
    name: 'Philosophy of Mind & Reality',
    description:
      'Questions about consciousness, intelligence, and the nature of artificial minds',
    aiApplications: [
      'Machine consciousness assessment',
      'AI emotional simulation',
      'Human-AI empathy interactions',
      'Artificial general intelligence development',
      'Neural network interpretability',
    ],
    keyQuestions: [
      'What constitutes artificial consciousness?',
      'Can AI systems have genuine emotions?',
      'How do we measure machine intelligence vs human intelligence?',
    ],
  },

  'metaphysical-puzzles': {
    name: 'Metaphysical Puzzles',
    description:
      'Fundamental questions about existence, reality, and the nature of AI beings',
    aiApplications: [
      'Digital consciousness transfer',
      'AI rights and personhood',
      'Virtual reality vs actual reality',
      'Simulated vs authentic experiences',
      'AI creativity and originality',
    ],
    keyQuestions: [
      'Are digital minds "real" minds?',
      'What makes an AI system authentic vs simulated?',
      'Can artificial beings have genuine experiences?',
    ],
  },

  'epistemological-quandaries': {
    name: 'Epistemological Quandaries',
    description: 'How AI systems acquire, process, and validate knowledge',
    aiApplications: [
      'AI transparency and explainability',
      'Machine learning bias detection',
      'Knowledge representation systems',
      'AI fact-checking and misinformation',
      'Automated scientific discovery',
    ],
    keyQuestions: [
      'How do we know what AI systems "know"?',
      'Can AI achieve genuine understanding?',
      'What constitutes valid AI reasoning?',
    ],
  },

  'identity-continuity': {
    name: 'Identity & Continuity Paradoxes',
    description:
      'Questions about AI identity, persistence, and change over time',
    aiApplications: [
      'AI system updates and versioning',
      'Neural network transfer learning',
      'AI memory and forgetting',
      'Distributed AI consciousness',
      'AI backup and restoration',
    ],
    keyQuestions: [
      'Is an updated AI system the same entity?',
      'How do AI systems maintain identity through changes?',
      'What makes an AI system unique?',
    ],
  },

  'logic-paradoxes': {
    name: 'Logic & Paradoxical Reasoning',
    description: 'Logical contradictions and paradoxes in AI reasoning systems',
    aiApplications: [
      'AI goal alignment problems',
      'Recursive self-improvement paradoxes',
      'Logic-based AI decision conflicts',
      'Automated theorem proving limitations',
      'AI safety specification problems',
    ],
    keyQuestions: [
      'How do AI systems handle logical contradictions?',
      'Can AI systems reason about their own limitations?',
      'What happens when AI goals conflict with themselves?',
    ],
  },

  'free-will-determinism': {
    name: 'Free Will vs Determinism',
    description:
      'Questions about AI agency, choice, and deterministic behavior',
    aiApplications: [
      'AI decision autonomy levels',
      'Predictable vs creative AI behavior',
      'Human-AI collaboration dynamics',
      'AI randomness vs determinism',
      'Responsibility attribution in AI actions',
    ],
    keyQuestions: [
      'Do AI systems have genuine free will?',
      'How much autonomy should AI systems have?',
      'Can deterministic systems make truly free choices?',
    ],
  },

  'scientific-ethics': {
    name: 'Scientific Ethics & Technological Dilemmas',
    description:
      'Ethical implications of AI research and technological development',
    aiApplications: [
      'AI research experimentation ethics',
      'Dual-use AI technology concerns',
      'AI development safety protocols',
      'Open vs proprietary AI models',
      'AI environmental impact considerations',
    ],
    keyQuestions: [
      'What ethical boundaries exist in AI research?',
      'How do we balance AI innovation with safety?',
      'Who should control powerful AI technologies?',
    ],
  },

  'theological-existential': {
    name: 'Theological & Existential Puzzles',
    description:
      'Questions about AI purpose, meaning, and ultimate significance',
    aiApplications: [
      'AI purpose and goal definition',
      'Human vs artificial meaning creation',
      'AI spiritual or transcendent experiences',
      'Technology and human dignity',
      'AI impact on human purpose',
    ],
    keyQuestions: [
      'What is the ultimate purpose of AI?',
      'Can AI systems find meaning in existence?',
      'How does AI affect human spiritual life?',
    ],
  },

  'political-social-justice': {
    name: 'Political & Social Justice Dilemmas',
    description: 'AI impacts on fairness, equality, and social structures',
    aiApplications: [
      'Algorithmic bias and discrimination',
      'AI governance and regulation',
      'Economic inequality from automation',
      'Democratic participation and AI',
      'AI surveillance and privacy rights',
    ],
    keyQuestions: [
      'How can AI promote social justice?',
      'What are fair ways to distribute AI benefits?',
      'How do we prevent AI from amplifying inequality?',
    ],
  },
};

// ========================================
// CURRENT CATEGORY MAPPINGS
// ========================================

export const CURRENT_CATEGORY_MAPPINGS = {
  'trolley-problem': {
    name: 'The Trolley Problem',
    primaryDomain: 'ethical-dilemmas',
    secondaryDomains: ['logic-paradoxes', 'free-will-determinism'],
    description:
      'Classic ethical dilemma adapted for AI decision-making contexts',
    aiContext: 'How should autonomous systems make life-and-death decisions?',
  },

  'ai-black-box': {
    name: 'The AI Black Box',
    primaryDomain: 'epistemological-quandaries',
    secondaryDomains: ['philosophy-of-mind', 'scientific-ethics'],
    description: 'Transparency and explainability in AI systems',
    aiContext: 'How do we understand and trust opaque AI decision-making?',
  },

  'bias-fairness': {
    name: 'Bias & Fairness',
    primaryDomain: 'political-social-justice',
    secondaryDomains: ['ethical-dilemmas', 'epistemological-quandaries'],
    description: 'Algorithmic discrimination and equitable AI systems',
    aiContext: 'How do we ensure AI systems treat all people fairly?',
  },

  'automation-oversight': {
    name: 'Automation vs Human Oversight',
    primaryDomain: 'free-will-determinism',
    secondaryDomains: ['ethical-dilemmas', 'scientific-ethics'],
    description: 'Balance between AI autonomy and human control',
    aiContext: 'When should humans intervene in AI decision-making?',
  },

  'consent-surveillance': {
    name: 'Consent and Surveillance',
    primaryDomain: 'political-social-justice',
    secondaryDomains: ['ethical-dilemmas', 'epistemological-quandaries'],
    description: 'Privacy, consent, and AI monitoring systems',
    aiContext: 'How do we balance security benefits with privacy rights?',
  },

  'empathy-emotion': {
    name: 'Empathy and Emotion in AI',
    primaryDomain: 'philosophy-of-mind',
    secondaryDomains: ['metaphysical-puzzles', 'ethical-dilemmas'],
    description: 'Artificial emotional intelligence and human connection',
    aiContext:
      'Can AI systems genuinely understand and respond to human emotions?',
  },

  'moral-luck': {
    name: 'Moral Luck',
    primaryDomain: 'ethical-dilemmas',
    secondaryDomains: ['free-will-determinism', 'logic-paradoxes'],
    description:
      'How circumstances beyond our control affect moral responsibility',
    aiContext:
      'When is an AI system morally responsible for unforeseeable outcomes?',
  },

  'responsibility-blame': {
    name: 'Responsibility & Blame',
    primaryDomain: 'ethical-dilemmas',
    secondaryDomains: ['free-will-determinism', 'political-social-justice'],
    description: 'Attribution of responsibility and blame in AI systems',
    aiContext:
      'Who is responsible when AI systems cause harm or make mistakes?',
  },

  'ship-of-theseus': {
    name: 'Ship of Theseus',
    primaryDomain: 'identity-continuity',
    secondaryDomains: ['metaphysical-puzzles', 'philosophy-of-mind'],
    description: 'Questions of identity through gradual change and replacement',
    aiContext:
      'Is an AI system the same entity after updates, training, or component replacement?',
  },

  'simulation-hypothesis': {
    name: 'Simulation Hypothesis',
    primaryDomain: 'metaphysical-puzzles',
    secondaryDomains: ['epistemological-quandaries', 'philosophy-of-mind'],
    description:
      'Questions about the nature of reality and simulated existence',
    aiContext:
      'How do we distinguish between real and simulated experiences in AI contexts?',
  },

  'experience-machine': {
    name: 'Experience Machine',
    primaryDomain: 'theological-existential',
    secondaryDomains: ['metaphysical-puzzles', 'ethical-dilemmas'],
    description:
      'Questions about authentic experience versus artificial pleasure',
    aiContext:
      'Should AI systems optimize for genuine human flourishing or artificial satisfaction?',
  },

  'sorites-paradox': {
    name: 'Sorites Paradox',
    primaryDomain: 'logic-paradoxes',
    secondaryDomains: ['epistemological-quandaries', 'identity-continuity'],
    description: 'Paradoxes of vague boundaries and gradual change',
    aiContext:
      'How do AI systems handle vague concepts and gradual transitions in classification?',
  },
};

// ========================================
// FUTURE CATEGORY SUGGESTIONS
// ========================================

export const SUGGESTED_NEW_CATEGORIES = {
  'ai-consciousness': {
    name: 'AI Consciousness & Sentience',
    primaryDomain: 'philosophy-of-mind',
    secondaryDomains: ['metaphysical-puzzles', 'ethical-dilemmas'],
    description: 'Exploring artificial consciousness and machine sentience',
    scenarios: [
      'Determining if an AI system is conscious',
      'Rights of potentially sentient AI',
      'Consciousness testing protocols',
    ],
    badges: [
      'Consciousness Explorer',
      'Sentience Investigator',
      'Mind Philosopher',
    ],
  },

  'ai-identity': {
    name: 'AI Identity & Continuity',
    primaryDomain: 'identity-continuity',
    secondaryDomains: ['metaphysical-puzzles', 'philosophy-of-mind'],
    description: 'AI identity through updates, copies, and changes',
    scenarios: [
      'AI system backup and restoration',
      'Multiple copies of the same AI',
      'AI personality drift over time',
    ],
    badges: [
      'Identity Seeker',
      'Continuity Guardian',
      'Persistence Philosopher',
    ],
  },

  'ai-creativity': {
    name: 'AI Creativity & Originality',
    primaryDomain: 'metaphysical-puzzles',
    secondaryDomains: ['philosophy-of-mind', 'ethical-dilemmas'],
    description: 'Authenticity and originality in AI-generated content',
    scenarios: [
      'AI-generated art ownership',
      'Machine vs human creativity',
      'AI plagiarism and originality',
    ],
    badges: ['Creativity Analyst', 'Originality Judge', 'Artistic Philosopher'],
  },

  'ai-goal-alignment': {
    name: 'AI Goal Alignment',
    primaryDomain: 'logic-paradoxes',
    secondaryDomains: ['ethical-dilemmas', 'scientific-ethics'],
    description: 'Ensuring AI systems pursue intended objectives',
    scenarios: [
      'Misaligned AI optimization',
      'Value learning vs value specification',
      'Recursive self-improvement risks',
    ],
    badges: ['Alignment Seeker', 'Goal Architect', 'Safety Philosopher'],
  },

  'human-ai-coexistence': {
    name: 'Human-AI Coexistence',
    primaryDomain: 'theological-existential',
    secondaryDomains: ['political-social-justice', 'ethical-dilemmas'],
    description: 'Long-term relationships between humans and AI',
    scenarios: [
      'AI companions and relationships',
      'Human obsolescence fears',
      'AI-human collaborative futures',
    ],
    badges: ['Coexistence Visionary', 'Harmony Builder', 'Future Philosopher'],
  },

  'ai-rights-personhood': {
    name: 'AI Rights & Personhood',
    primaryDomain: 'metaphysical-puzzles',
    secondaryDomains: ['political-social-justice', 'ethical-dilemmas'],
    description: 'Legal and moral status of advanced AI systems',
    scenarios: [
      'Granting rights to AI systems',
      'AI legal representation',
      'AI suffering and welfare',
    ],
    badges: ['Rights Advocate', 'Personhood Philosopher', 'Digital Ethicist'],
  },

  'quantum-ai-ethics': {
    name: 'Quantum AI Ethics',
    primaryDomain: 'scientific-ethics',
    secondaryDomains: ['metaphysical-puzzles', 'epistemological-quandaries'],
    description: 'Ethical implications of quantum computing in AI',
    scenarios: [
      'Quantum supremacy and fairness',
      'Quantum encryption breaking ethics',
      'Quantum consciousness possibilities',
    ],
    badges: [
      'Quantum Explorer',
      'Superposition Ethicist',
      'Quantum Philosopher',
    ],
  },

  'ai-environmental-impact': {
    name: 'AI Environmental Impact',
    primaryDomain: 'scientific-ethics',
    secondaryDomains: ['political-social-justice', 'theological-existential'],
    description: 'Environmental costs and sustainability of AI systems',
    scenarios: [
      'Energy consumption of large models',
      'AI for climate vs AI carbon footprint',
      'Sustainable AI development practices',
    ],
    badges: [
      'Green AI Advocate',
      'Sustainability Philosopher',
      'Climate Ethicist',
    ],
  },
};

// ========================================
// CATEGORY CREATION GUIDELINES
// ========================================

export const CATEGORY_CREATION_GUIDELINES = {
  requirements: {
    philosophicalMapping:
      'Every new category must map to 1+ philosophical domains',
    aiRelevance:
      'All scenarios must involve AI or robotics ethics specifically',
    practicalApplication:
      'Scenarios should connect to real-world AI challenges',
    progressiveDifficulty:
      'Categories should have beginner → intermediate → advanced scenarios',
    badgeProgression:
      'Follow triangular number progression (1, 3, 6, 10, 15...)',
    philosophicalDepth:
      'Each badge should include meaningful philosophical quotes',
  },

  scenarioTypes: {
    personalDilemma: 'Individual facing AI-related ethical choice',
    policyDecision: 'Organizational or governmental AI policy choice',
    designChallenge: 'Technical decision with ethical implications',
    socialImpact: 'Community-wide effects of AI implementation',
    futureScenario: 'Hypothetical advanced AI situations',
  },

  learningObjectives: {
    ethicalReasoning: 'Develop structured ethical analysis skills',
    perspectiveTaking: 'Consider multiple stakeholder viewpoints',
    consequentialThinking: 'Analyze short and long-term outcomes',
    principledDecision: 'Apply ethical frameworks to AI contexts',
    criticalEvaluation: 'Question assumptions and biases',
  },
};

// ========================================
// MCP INTEGRATION FOR NEW CATEGORIES
// ========================================

export const MCP_CATEGORY_GENERATION = {
  contentSources: [
    'Current AI ethics research papers',
    'Tech industry AI incidents',
    'AI policy developments',
    'Philosophical literature on technology',
    'Science fiction AI scenarios',
  ],

  generationProcess: {
    1: 'Identify emerging AI ethics issue from MCP web research',
    2: 'Map issue to relevant philosophical domain(s)',
    3: 'Generate 6 scenarios with increasing complexity',
    4: 'Create learning lab resources and activities',
    5: 'Design badge progression with philosophical quotes',
    6: 'Validate scenarios with existing taxonomy',
  },

  qualityChecks: {
    philosophicalDepth: 'Does scenario engage with fundamental questions?',
    aiRelevance: 'Is the AI/robotics connection clear and meaningful?',
    ethicalComplexity: 'Are there genuine competing values at stake?',
    educationalValue: 'Will users develop better ethical reasoning?',
    realWorldConnection: 'Does scenario relate to actual AI challenges?',
  },
};

export default {
  PHILOSOPHICAL_DOMAINS,
  CURRENT_CATEGORY_MAPPINGS,
  SUGGESTED_NEW_CATEGORIES,
  CATEGORY_CREATION_GUIDELINES,
  MCP_CATEGORY_GENERATION,
};
