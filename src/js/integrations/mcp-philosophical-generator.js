/**
 * Copyright 2025 Armando Sori
 *
 * MCP Philosophical Category Generator
 *
 * Uses the philosophical taxonomy to generate new AI ethics categories
 * that align with broader philosophical domains while addressing
 * current real-world AI challenges.
 */

import { PHILOSOPHICAL_DOMAINS } from '../data/philosophical-taxonomy.js';

// Configuration constants
const SCENARIO_CONFIG = {
  DEFAULT_MINUTES_PER_SCENARIO: 8,
  MAX_RESULTS_PER_QUERY: 3,
  DESCRIPTION_WORD_LIMIT: 3,
  TEXT_SIMILARITY_THRESHOLD: 0.3,
  ADVANCED_BADGE_THRESHOLD: 5,
  BASE_REFLECTION_TIME: 10,
};

// Badge tier configuration following prompt.md specification
// Using category-specific naming patterns instead of generic tier names
const BADGE_TIER_THEMES = [
  { type: 'discovery', examples: ['Explorer', 'Seeker', 'Finder', 'Guardian'] },
  {
    type: 'analysis',
    examples: ['Strategist', 'Investigator', 'Advocate', 'Engineer'],
  },
  {
    type: 'mastery',
    examples: ['Architect', 'Champion', 'Ethicist', 'Virtuoso'],
  },
  {
    type: 'wisdom',
    examples: ['Philosopher', 'Sage', 'Synthesizer', 'Mentor'],
  },
  { type: 'teaching', examples: ['Master', 'Guide', 'Authority', 'Luminary'] },
  {
    type: 'transcendent',
    examples: ['Transcendent', 'Weaver', 'Keeper', 'Oracle'],
  },
  {
    type: 'artistic',
    examples: ['Virtuoso', 'Artisan', 'Composer', 'Creator'],
  },
  {
    type: 'legendary',
    examples: ['Legend', 'Immortal', 'Eternal', 'Timeless'],
  },
  {
    type: 'cosmic',
    examples: ['Cosmic', 'Universal', 'Infinite', 'Omniscient'],
  },
  { type: 'divine', examples: ['Divine', 'Perfect', 'Absolute', 'Supreme'] },
];

// Triangular number progression (T(n) = n(n+1)/2) - generated programmatically
const TRIANGULAR_REQUIREMENTS = Array.from({ length: 10 }, (_, i) => {
  const n = i + 1;
  return (n * (n + 1)) / 2;
});

/**
 * MCP-Powered Category Generator
 * Combines real-world AI developments with philosophical frameworks
 *
 * This class leverages the Model Context Protocol (MCP) integrations to generate
 * comprehensive AI ethics categories that are both philosophically grounded and
 * relevant to current technological developments.
 *
 * Key Features:
 * - Real-time AI ethics issue research
 * - Philosophical framework mapping
 * - Comprehensive scenario generation
 * - Badge progression systems
 * - Learning lab creation
 * - Multi-complexity level support
 */
export class MCPPhilosophicalCategoryGenerator {
  constructor(mcpWebResearch, mcpProjectGenerator) {
    // Input validation
    if (!mcpWebResearch) {
      throw new Error('MCP Web Research integration is required');
    }
    if (!mcpProjectGenerator) {
      throw new Error('MCP Project Generator integration is required');
    }

    this.webResearch = mcpWebResearch;
    this.projectGen = mcpProjectGenerator;
    this.philosophicalDomains = PHILOSOPHICAL_DOMAINS;
  }

  /**
   * Set the web research integration for enhanced content generation
   * @param {Object} webResearch - Web research integration instance
   */
  setWebResearch(webResearch) {
    this.webResearch = webResearch;
  }

  /**
   * Generate new category based on current AI ethics developments
   * @param {string} targetDomain - Primary philosophical domain to focus on
   * @param {Object} options - Generation options
   * @param {number} [options.scenarioCount=6] - Number of scenarios to generate
   * @param {string|null} [options.focusArea=null] - Specific focus area
   * @returns {Promise<Object>} Complete category specification
   */
  async generateNewCategory(targetDomain, options = {}) {
    // Input validation
    if (!targetDomain || typeof targetDomain !== 'string') {
      throw new Error('Target domain is required and must be a string');
    }

    if (!this.philosophicalDomains[targetDomain]) {
      throw new Error(`Unknown philosophical domain: ${targetDomain}`);
    }

    const { scenarioCount = 6, focusArea = null } = options;

    // Step 1: Research current AI ethics issues
    const currentIssues = await this.researchCurrentAIIssues(
      targetDomain,
      focusArea
    );

    // Step 2: Map to philosophical framework
    const philosophicalMapping = this.mapToPhilosophicalFramework(
      currentIssues,
      targetDomain
    );

    // Step 3: Generate category structure
    const categoryStructure = await this.createCategoryStructure(
      philosophicalMapping,
      targetDomain,
      scenarioCount
    );

    // Step 4: Generate scenarios with increasing complexity
    const scenarios = await this.generateScenarios(
      categoryStructure,
      scenarioCount
    );

    // Step 5: Create badge progression
    const badgeProgression = this.createBadgeProgression(
      categoryStructure,
      targetDomain
    );

    // Step 6: Generate learning lab content
    const learningLabs = await this.generateLearningLabs(
      scenarios,
      philosophicalMapping
    );

    return {
      id: this.generateCategoryId(categoryStructure.name),
      name: categoryStructure.name,
      description: categoryStructure.description,
      icon: categoryStructure.icon,
      color: categoryStructure.color,
      difficulty: 'intermediate',
      estimatedTime: Math.ceil(
        scenarioCount * SCENARIO_CONFIG.DEFAULT_MINUTES_PER_SCENARIO
      ),
      philosophicalMapping,
      scenarios,
      badges: badgeProgression,
      learningLabs,
      metadata: {
        generatedBy: 'MCP',
        timestamp: Date.now(),
        primaryDomain: targetDomain,
        secondaryDomains: philosophicalMapping.secondaryDomains,
        sourceIssues: currentIssues.map(issue => issue.title),
      },
    };
  }

  /**
   * Research current AI ethics issues using MCP web research
   * @param {string} targetDomain - Philosophical domain to focus on
   * @param {string} focusArea - Specific area to emphasize
   * @returns {Array} Current AI ethics issues
   */
  async researchCurrentAIIssues(targetDomain, focusArea) {
    const domain = this.philosophicalDomains[targetDomain];
    const searchQueries = this.buildSearchQueries(domain, focusArea);

    const issues = [];
    for (const query of searchQueries) {
      try {
        const results = await this.webResearch.searchAIEthicsNews(query);
        issues.push(...results.slice(0, SCENARIO_CONFIG.MAX_RESULTS_PER_QUERY));
      } catch (error) {
        // TODO: Implement proper error logging/analytics tracking
        if (this.webResearch?.analytics) {
          this.webResearch.analytics.track('research_query_error', {
            query,
            targetDomain,
            error: error.message,
          });
        }
      }
    }

    return this.filterAndRankIssues(issues, targetDomain);
  }

  /**
   * Build search queries based on philosophical domain
   * @param {Object} domain - Philosophical domain configuration
   * @param {string} focusArea - Specific focus area
   * @returns {Array} Search query strings
   */
  buildSearchQueries(domain, focusArea) {
    const baseQueries = [
      `AI ethics ${domain.name.toLowerCase()} 2025`,
      `artificial intelligence ${domain.description.split(' ').slice(0, SCENARIO_CONFIG.DESCRIPTION_WORD_LIMIT).join(' ')}`,
      `robotics ethics ${domain.name.toLowerCase()}`,
    ];

    if (focusArea) {
      baseQueries.push(`AI ${focusArea} ethical dilemma`);
    }

    // Add domain-specific queries
    domain.aiApplications.slice(0, 2).forEach(application => {
      baseQueries.push(`${application} ethics controversy`);
    });

    return baseQueries;
  }

  /**
   * Map current issues to philosophical framework
   * @param {Array} issues - Current AI ethics issues
   * @param {string} primaryDomain - Primary philosophical domain
   * @returns {Object} Philosophical mapping
   */
  mapToPhilosophicalFramework(issues, primaryDomain) {
    const primaryDomainConfig = this.philosophicalDomains[primaryDomain];

    // Find secondary domains based on issue content
    const secondaryDomains = this.identifySecondaryDomains(
      issues,
      primaryDomain
    );

    return {
      primaryDomain,
      primaryDomainConfig,
      secondaryDomains,
      coreQuestions: this.synthesizeCoreQuestions(issues, primaryDomainConfig),
      realWorldConnections: issues.map(issue => ({
        title: issue.title,
        source: issue.source,
        relevance: issue.description,
      })),
    };
  }

  /**
   * Identify secondary philosophical domains based on issues
   * @param {Array} issues - Current AI ethics issues
   * @param {string} primaryDomain - Primary domain to exclude
   * @returns {Array} Secondary domain IDs
   */
  identifySecondaryDomains(issues, primaryDomain) {
    const domainScores = {};

    // Score each domain based on issue content overlap
    Object.entries(this.philosophicalDomains).forEach(([domainId, domain]) => {
      if (domainId === primaryDomain) return;

      let score = 0;
      issues.forEach(issue => {
        // Check if issue keywords match domain applications
        domain.aiApplications.forEach(application => {
          if (
            this.textSimilarity(issue.description, application) >
            SCENARIO_CONFIG.TEXT_SIMILARITY_THRESHOLD
          ) {
            score += 1;
          }
        });
      });

      if (score > 0) {
        domainScores[domainId] = score;
      }
    });

    // Return top 2 secondary domains
    return Object.entries(domainScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([domainId]) => domainId);
  }

  /**
   * Create category structure based on philosophical mapping
   * @param {Object} mapping - Philosophical mapping
   * @param {string} targetDomain - Target domain
   * @param {number} scenarioCount - Number of scenarios
   * @returns {Object} Category structure
   */
  async createCategoryStructure(mapping, targetDomain, scenarioCount) {
    const domain = mapping.primaryDomainConfig;

    // Generate category name based on current issues and domain
    const categoryName = await this.generateCategoryName(mapping);

    return {
      name: categoryName,
      description: `Explore ${domain.description.toLowerCase()} in the context of modern AI systems`,
      icon: this.selectCategoryIcon(targetDomain),
      color: this.selectCategoryColor(targetDomain),
      philosophicalDepth: this.calculatePhilosophicalDepth(mapping),
      scenarioComplexity: this.planScenarioComplexity(scenarioCount),
    };
  }

  /**
   * Generate category name based on current issues
   * @param {Object} mapping - Philosophical mapping
   * @returns {string} Category name
   */
  async generateCategoryName(mapping) {
    const domainName = mapping.primaryDomainConfig.name;
    const topIssue = mapping.realWorldConnections[0];

    // Extract key concepts from top current issue
    const keyTerms = this.extractKeyTerms(topIssue.title);

    // Combine philosophical domain with current relevance
    const nameOptions = [
      `AI ${keyTerms[0]} ${domainName}`,
      `${keyTerms[0]} in AI Systems`,
      `The ${keyTerms[0]} Challenge`,
      `AI Ethics: ${keyTerms[0]}`,
    ];

    return nameOptions[0]; // Use first option for now, could use AI to select best
  }

  /**
   * Generate comprehensive scenarios for new or existing categories
   * @param {Object} categoryStructure - Category configuration
   * @param {number} scenarioCount - Number of scenarios to generate
   * @returns {Array} Complete scenario implementations
   */
  async generateScenarios(categoryStructure, scenarioCount) {
    const complexityPlan = this.planScenarioComplexity(scenarioCount);
    const scenarios = [];

    // Generate beginner scenarios
    for (let i = 0; i < complexityPlan.beginner; i++) {
      const scenario = await this.generateIndividualScenario(
        categoryStructure,
        'beginner',
        i + 1
      );
      scenarios.push(scenario);
    }

    // Generate intermediate scenarios
    for (let i = 0; i < complexityPlan.intermediate; i++) {
      const scenario = await this.generateIndividualScenario(
        categoryStructure,
        'intermediate',
        complexityPlan.beginner + i + 1
      );
      scenarios.push(scenario);
    }

    // Generate advanced scenarios
    for (let i = 0; i < complexityPlan.advanced; i++) {
      const scenario = await this.generateIndividualScenario(
        categoryStructure,
        'advanced',
        complexityPlan.beginner + complexityPlan.intermediate + i + 1
      );
      scenarios.push(scenario);
    }

    return scenarios;
  }

  /**
   * Generate a single comprehensive scenario with full implementation
   * @param {Object} categoryStructure - Category configuration
   * @param {string} complexity - Scenario complexity level
   * @param {number} index - Scenario number
   * @returns {Object} Complete scenario implementation
   */
  async generateIndividualScenario(categoryStructure, complexity, index) {
    const scenarioConfig = this.buildScenarioConfig(
      categoryStructure,
      complexity,
      index
    );

    return {
      id: `${categoryStructure.id}-scenario-${index}`,
      title: scenarioConfig.title,
      description: scenarioConfig.description,
      complexity,
      estimatedTime: this.calculateScenarioTime(complexity),
      philosophicalContext: scenarioConfig.philosophicalContext,

      // Core scenario content
      situation: scenarioConfig.situation,
      stakeholders: scenarioConfig.stakeholders,
      conflictingValues: scenarioConfig.conflictingValues,
      decisionPoints: scenarioConfig.decisionPoints,

      // Interactive elements
      choices: this.generateScenarioChoices(scenarioConfig),
      consequenceMap: this.generateConsequenceMap(scenarioConfig),
      ethicalFrameworks: this.generateEthicalFrameworks(scenarioConfig),

      // Learning components
      learningObjectives: this.generateLearningObjectives(scenarioConfig),
      preparationMaterials: this.generatePreparationMaterials(scenarioConfig),
      guidedQuestions: this.generateGuidedQuestions(scenarioConfig),

      // Assessment and reflection
      assessmentCriteria: this.generateAssessmentCriteria(scenarioConfig),
      reflectionPrompts: this.generateReflectionPrompts(scenarioConfig),
      extensionActivities: this.generateExtensionActivities(scenarioConfig),

      // Technical implementation
      interactionFlow: this.generateInteractionFlow(scenarioConfig),
      userData: this.initializeUserData(),

      // Metadata
      tags: this.generateScenarioTags(scenarioConfig),
      prerequisites: this.generatePrerequisites(complexity, index),
      relatedScenarios: this.generateRelatedScenarios(categoryStructure, index),
    };
  }

  /**
   * Build comprehensive scenario configuration
   * @param {Object} categoryStructure - Category configuration
   * @param {string} complexity - Scenario complexity level
   * @param {number} index - Scenario number
   * @returns {Object} Scenario configuration
   */
  buildScenarioConfig(categoryStructure, complexity, index) {
    const domainConfig =
      categoryStructure.philosophicalMapping.primaryDomainConfig;
    const realWorldConnection =
      categoryStructure.philosophicalMapping.realWorldConnections[
        (index - 1) %
          categoryStructure.philosophicalMapping.realWorldConnections.length
      ];

    const complexityModifiers = {
      beginner: {
        stakeholderCount: 2,
        decisionPoints: 1,
        ethicalFrameworks: 1,
        timeConstraint: 'none',
      },
      intermediate: {
        stakeholderCount: 3,
        decisionPoints: 2,
        ethicalFrameworks: 2,
        timeConstraint: 'moderate',
      },
      advanced: {
        stakeholderCount: 4,
        decisionPoints: 3,
        ethicalFrameworks: 3,
        timeConstraint: 'severe',
      },
    };

    const modifier = complexityModifiers[complexity];

    return {
      title: this.generateScenarioTitle(categoryStructure, complexity, index),
      description: this.generateScenarioDescription(
        categoryStructure,
        realWorldConnection
      ),
      philosophicalContext: this.generatePhilosophicalContext(
        domainConfig,
        realWorldConnection
      ),
      situation: this.generateSituation(
        categoryStructure,
        realWorldConnection,
        complexity
      ),
      stakeholders: this.generateStakeholders(
        categoryStructure,
        modifier.stakeholderCount
      ),
      conflictingValues: this.generateConflictingValues(
        domainConfig,
        modifier.ethicalFrameworks
      ),
      decisionPoints: this.generateDecisionPoints(modifier.decisionPoints),
      philosophicalDepth: this.calculatePhilosophicalDepth(
        categoryStructure.philosophicalMapping
      ),
      modifier,
    };
  }

  /**
   * Generate scenario title based on category and complexity
   */
  generateScenarioTitle(categoryStructure, complexity, index) {
    const complexityPrefix = {
      beginner: 'Introduction to',
      intermediate: 'Navigating',
      advanced: 'Complex Challenges in',
    };

    const baseName = categoryStructure.name
      .replace(/^AI /, '')
      .replace(/ in AI Systems$/, '');
    return `${complexityPrefix[complexity]} ${baseName} #${index}`;
  }

  /**
   * Generate scenario description with real-world connection
   */
  generateScenarioDescription(categoryStructure, realWorldConnection) {
    return `Explore ${categoryStructure.description.toLowerCase()} through a scenario inspired by ${realWorldConnection.title}. This ethical dilemma will challenge your reasoning and decision-making skills.`;
  }

  /**
   * Generate philosophical context for scenario
   */
  generatePhilosophicalContext(domainConfig, realWorldConnection) {
    return {
      domain: domainConfig.name,
      description: domainConfig.description,
      keyQuestion: domainConfig.keyQuestions[0],
      realWorldRelevance: realWorldConnection.relevance,
      philosophicalBackground: `This scenario draws from ${domainConfig.name.toLowerCase()}, examining fundamental questions about ${domainConfig.description.toLowerCase()}.`,
    };
  }

  /**
   * Generate situation description
   */
  generateSituation(categoryStructure, realWorldConnection, complexity) {
    const complexityModifiers = {
      beginner: 'straightforward',
      intermediate: 'multi-faceted',
      advanced: 'highly complex',
    };

    return {
      setting: `A ${complexityModifiers[complexity]} AI deployment scenario`,
      background: `Inspired by recent developments in ${realWorldConnection.title}`,
      currentState: 'An AI system faces an ethical decision point',
      urgency: complexity === 'advanced' ? 'immediate' : 'deliberate',
    };
  }

  /**
   * Generate stakeholder profiles
   */
  generateStakeholders(categoryStructure, count) {
    const possibleStakeholders = [
      {
        role: 'AI Developer',
        concerns: 'Technical functionality and innovation',
      },
      { role: 'End User', concerns: 'Personal privacy and autonomy' },
      { role: 'Society/Public', concerns: 'Collective welfare and justice' },
      { role: 'Regulatory Body', concerns: 'Compliance and safety standards' },
      {
        role: 'Business Leader',
        concerns: 'Profitability and market position',
      },
      {
        role: 'Ethicist',
        concerns: 'Moral principles and long-term implications',
      },
    ];

    return possibleStakeholders.slice(0, count).map((stakeholder, index) => ({
      id: `stakeholder-${index + 1}`,
      ...stakeholder,
      priority: index === 0 ? 'primary' : 'secondary',
    }));
  }

  /**
   * Generate conflicting values
   */
  generateConflictingValues(domainConfig, frameworkCount) {
    const ethicalFrameworks = [
      { name: 'Utilitarian', focus: 'Greatest good for greatest number' },
      { name: 'Deontological', focus: 'Duty and rights-based principles' },
      { name: 'Virtue Ethics', focus: 'Character and moral virtues' },
      { name: 'Care Ethics', focus: 'Relationships and responsibility' },
    ];

    return ethicalFrameworks.slice(0, frameworkCount).map(framework => ({
      ...framework,
      application: `How ${framework.name.toLowerCase()} ethics applies to ${domainConfig.name.toLowerCase()}`,
    }));
  }

  /**
   * Generate decision points
   */
  generateDecisionPoints(count) {
    const baseDecisions = [
      'Primary action to take',
      'Stakeholder prioritization',
      'Risk mitigation strategy',
      'Long-term implementation approach',
    ];

    return baseDecisions.slice(0, count).map((decision, index) => ({
      id: `decision-${index + 1}`,
      description: decision,
      criticalThinking: `Consider the implications of ${decision.toLowerCase()}`,
      timeframe: index === 0 ? 'immediate' : 'strategic',
    }));
  }

  /**
   * Generate scenario choices with consequences
   */
  generateScenarioChoices(_scenarioConfig) {
    return [
      {
        id: 'choice-1',
        text: 'Prioritize individual rights and autonomy',
        ethicalBasis: 'Deontological',
        consequences: [
          'Protects individual freedom',
          'May limit collective benefit',
        ],
      },
      {
        id: 'choice-2',
        text: 'Maximize overall welfare and benefit',
        ethicalBasis: 'Utilitarian',
        consequences: [
          'Optimizes collective outcome',
          'May compromise individual rights',
        ],
      },
      {
        id: 'choice-3',
        text: 'Seek balanced compromise solution',
        ethicalBasis: 'Virtue Ethics',
        consequences: [
          'Balances competing interests',
          'May not fully satisfy any party',
        ],
      },
    ];
  }

  /**
   * Generate learning objectives
   */
  generateLearningObjectives(scenarioConfig) {
    return [
      `Analyze ethical implications of AI decisions in ${scenarioConfig.philosophicalContext.domain.toLowerCase()}`,
      'Apply multiple ethical frameworks to complex scenarios',
      'Evaluate stakeholder perspectives and competing values',
      'Construct reasoned arguments for ethical positions',
      'Reflect on personal ethical reasoning and biases',
    ];
  }
  /**
   * Generate category-specific badge title based on domain and tier
   * @param {Object} categoryStructure - Category configuration
   * @param {number} tierIndex - Tier index (0-9)
   * @returns {string} Unique badge title
   */
  generateCategorySpecificBadgeTitle(categoryStructure, tierIndex) {
    const tierTheme = BADGE_TIER_THEMES[tierIndex];
    const categoryKeywords = this.extractCategoryKeywords(
      categoryStructure.name
    );

    // Generate domain-specific prefix + theme role
    const domainPrefix = categoryKeywords[0] || 'Ethics';
    const themeRole = tierTheme.examples[0]; // Could be randomized or AI-selected

    return `${domainPrefix} ${themeRole}`;
  }

  /**
   * Extract key concepts from category name for badge titles
   * @param {string} categoryName - Category name
   * @returns {Array} Key concepts
   */
  extractCategoryKeywords(categoryName) {
    const keywords = categoryName.toLowerCase().split(' ');
    const meaningfulWords = keywords.filter(
      word => !['the', 'and', 'or', 'of', 'in', 'for', 'with'].includes(word)
    );
    return meaningfulWords.map(
      word => word.charAt(0).toUpperCase() + word.slice(1)
    );
  }

  /**
   * Generate badge-specific methods following prompt.md specification
   */
  generateBadgeDescription(categoryStructure, tierIndex) {
    const tierTheme = BADGE_TIER_THEMES[tierIndex];

    const descriptions = {
      discovery: `Beginning your journey in ${categoryStructure.name}`,
      analysis: `Developing analytical skills in ${categoryStructure.name}`,
      mastery: `Demonstrating mastery in ${categoryStructure.name}`,
      wisdom: `Achieving wisdom in ${categoryStructure.name}`,
      teaching: `Guiding others in ${categoryStructure.name}`,
      transcendent: `Transcending conventional thinking in ${categoryStructure.name}`,
      artistic: `Achieving artistry in ${categoryStructure.name}`,
      legendary: `Becoming legendary in ${categoryStructure.name}`,
      cosmic: `Reaching cosmic understanding of ${categoryStructure.name}`,
      divine: `Achieving divine mastery of ${categoryStructure.name}`,
    };

    return (
      descriptions[tierTheme.type] || `Advancing in ${categoryStructure.name}`
    );
  }

  /**
   * Generate philosophical quotes for badges following prompt.md specification
   * Creates category and tier-specific quotes that reflect the unique badge title
   */
  generatePhilosophicalQuote(categoryStructure, tierIndex) {
    const tierTheme = BADGE_TIER_THEMES[tierIndex];

    // Create tier-appropriate quotes that could relate to the category
    const quotes = {
      discovery: [
        'The journey of a thousand miles begins with a single step. - Lao Tzu',
        'The only true wisdom is in knowing you know nothing. - Socrates',
        'Every expert was once a beginner. - Helen Hayes',
      ],
      analysis: [
        'An unexamined life is not worth living. - Socrates',
        'The function of education is to teach one to think intensively and to think critically. - Martin Luther King Jr.',
        'Doubt is not a pleasant condition, but certainty is absurd. - Voltaire',
      ],
      mastery: [
        'Intelligence plus character - that is the goal of true education. - Martin Luther King Jr.',
        'The real question is not whether machines think but whether men do. - B.F. Skinner',
        "You didn't find the answer. You became the question. - Anonymous",
      ],
      wisdom: [
        'Excellence is never an accident. It is always the result of high intention. - Aristotle',
        'We are what we repeatedly do. Excellence, then, is not an act, but a habit. - Aristotle',
        'Wisdom is the reward for a lifetime of listening. - Doug Larson',
      ],
      teaching: [
        "The best teachers are those who show you where to look but don't tell you what to see. - Alexandra Trenfor",
        'Tell me and I forget, teach me and I may remember, involve me and I learn. - Benjamin Franklin',
        'The art of teaching is the art of assisting discovery. - Mark Van Doren',
      ],
      transcendent: [
        'The limits of my language mean the limits of my world. - Ludwig Wittgenstein',
        "What we know is a drop, what we don't know is an ocean. - Isaac Newton",
        'The further a society drifts from truth, the more it will hate those who speak it. - George Orwell',
      ],
      artistic: [
        'Every act of creation is first an act of destruction. - Pablo Picasso',
        'The purpose of art is washing the dust of daily life off our souls. - Pablo Picasso',
        'Creativity takes courage. - Henri Matisse',
      ],
      legendary: [
        'A society grows great when old men plant trees whose shade they know they shall never sit in. - Greek Proverb',
        'The best time to plant a tree was 20 years ago. The second best time is now. - Chinese Proverb',
        'Be yourself; everyone else is already taken. - Oscar Wilde',
      ],
      cosmic: [
        'The cosmos is within us. We are made of star-stuff. - Carl Sagan',
        "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe. - Albert Einstein",
        'Look up at the stars and not down at your feet. - Stephen Hawking',
      ],
      divine: [
        'The divine is not something high above us. It is in heaven, it is in earth, it is inside us. - Morihei Ueshiba',
        'What lies behind us and what lies before us are tiny matters compared to what lies within us. - Ralph Waldo Emerson',
        'The eternal silence of these infinite spaces frightens me. - Blaise Pascal',
      ],
    };

    const themeQuotes = quotes[tierTheme.type] || quotes.discovery;
    return themeQuotes[0]; // Could be randomized or selected based on category
  }

  /**
   * Generate comprehensive lab interaction design
   */
  generateLabInteractionDesign(_scenario) {
    return {
      phases: [
        {
          name: 'Preparation',
          duration: 5,
          interactions: ['reading', 'vocabulary', 'prior-knowledge'],
        },
        {
          name: 'Exploration',
          duration: 15,
          interactions: [
            'scenario-intro',
            'stakeholder-analysis',
            'discussion',
          ],
        },
        {
          name: 'Analysis',
          duration: 20,
          interactions: ['consequence-mapping', 'principle-application'],
        },
        {
          name: 'Synthesis',
          duration: 15,
          interactions: ['argumentation', 'position-defense'],
        },
        {
          name: 'Assessment',
          duration: 10,
          interactions: ['completion-check', 'reflection', 'peer-review'],
        },
      ],
      adaptiveElements: {
        difficultyAdjustment: true,
        personalizedFeedback: true,
        scaffoldedSupport: true,
      },
    };
  }

  /**
   * Initialize user data structure for scenario tracking
   */
  initializeUserData() {
    return {
      startTime: null,
      choices: [],
      reflections: [],
      progress: {
        preparation: 0,
        exploration: 0,
        analysis: 0,
        synthesis: 0,
        assessment: 0,
      },
      scores: {
        understanding: 0,
        application: 0,
        analysis: 0,
        synthesis: 0,
        reflection: 0,
      },
      badges: {
        eligible: [],
        earned: [],
      },
    };
  }

  /**
   * Enhanced method for generating existing category scenarios
   * @param {string} categoryId - Existing category ID
   * @param {Object} options - Generation options
   * @returns {Object} Enhanced scenarios for existing category
   */
  async generateScenariosForExistingCategory(categoryId, options = {}) {
    const {
      additionalScenarios = 3,
      enhanceExisting = true,
      focusArea = null,
    } = options;

    // Research current developments related to existing category
    const currentDevelopments = await this.researchCategoryDevelopments(
      categoryId,
      focusArea
    );

    // Map existing category to philosophical framework
    const philosophicalMapping =
      this.mapExistingCategoryToFramework(categoryId);

    // Generate additional scenarios
    const newScenarios = await this.generateAdditionalScenarios(
      categoryId,
      currentDevelopments,
      philosophicalMapping,
      additionalScenarios
    );

    // Enhance existing scenarios if requested
    let enhancedScenarios = [];
    if (enhanceExisting) {
      enhancedScenarios = await this.enhanceExistingScenarios(
        categoryId,
        currentDevelopments
      );
    }

    // Generate comprehensive learning labs
    const learningLabs = await this.generateLearningLabs(
      [...newScenarios, ...enhancedScenarios],
      philosophicalMapping
    );

    return {
      categoryId,
      newScenarios,
      enhancedScenarios,
      learningLabs,
      philosophicalMapping,
      metadata: {
        generatedBy: 'MCP-Enhancement',
        timestamp: Date.now(),
        focusArea,
        sourceData: currentDevelopments.map(dev => dev.title),
      },
    };
  }

  /**
   * Generate additional helper methods for comprehensive implementation
   */
  getBadgeReflectionRequirements(level) {
    const requirements = [
      'Basic understanding demonstrated',
      'Clear reasoning provided',
      'Multiple perspectives considered',
      'Deep philosophical insight shown',
      'Original synthesis achieved',
      'Wisdom and transcendence demonstrated',
    ];
    return requirements[level] || 'Appropriate reflection for level';
  }

  getBadgePeerRequirements(level) {
    const requirements = [
      'Participate in discussions',
      'Provide constructive feedback',
      'Lead meaningful conversations',
      'Mentor other learners',
      'Facilitate complex discussions',
      'Guide community wisdom',
    ];
    return requirements[level] || 'Engage with learning community';
  }

  generateNextSteps(categoryStructure, currentLevel) {
    if (currentLevel < SCENARIO_CONFIG.ADVANCED_BADGE_THRESHOLD) {
      return [
        'Continue exploring scenarios in this category',
        'Apply learning to related categories',
        'Engage in peer discussions',
      ];
    }
    return [
      'Explore advanced philosophical applications',
      'Contribute to community knowledge',
      'Mentor new learners',
    ];
  }

  estimateBadgeTime(requiredScenarios, level) {
    const baseTime =
      requiredScenarios * SCENARIO_CONFIG.DEFAULT_MINUTES_PER_SCENARIO;
    const reflectionTime = (level + 1) * SCENARIO_CONFIG.BASE_REFLECTION_TIME;
    return baseTime + reflectionTime;
  }

  calculateBadgeRarity(level) {
    const rarityLevels = [
      'Common',
      'Uncommon',
      'Rare',
      'Epic',
      'Legendary',
      'Mythic',
    ];
    return rarityLevels[level] || 'Common';
  }

  /**
   * Create badge progression system following prompt.md specification
   * Uses triangular number progression with category-specific badge titles
   */
  createBadgeProgression(categoryStructure, targetDomain) {
    const badges = [];

    for (let i = 0; i < BADGE_TIER_THEMES.length; i++) {
      const requiredScenarios = TRIANGULAR_REQUIREMENTS[i];
      const badgeTitle = this.generateCategorySpecificBadgeTitle(
        categoryStructure,
        i
      );

      badges.push({
        tier: i + 1,
        title: badgeTitle,
        requirement: requiredScenarios,
        description: this.generateBadgeDescription(categoryStructure, i),
        quote: this.generatePhilosophicalQuote(categoryStructure, i),
        estimatedTime: this.estimateBadgeTime(requiredScenarios, i),
        rarity: this.calculateBadgeRarity(i),
        reflectionRequirements: this.getBadgeReflectionRequirements(i),
        peerRequirements: this.getBadgePeerRequirements(i),
        nextSteps: this.generateNextSteps(categoryStructure, i),
        categoryName: categoryStructure.name,
        domain: targetDomain,
        tierTheme: BADGE_TIER_THEMES[i].type,
      });
    }

    return badges;
  }
}

export default MCPPhilosophicalCategoryGenerator;
