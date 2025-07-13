/**
 * Copyright 2025 Armando Sori
 *
 * MCP Philosophical Category Generator
 *
 * Uses the philosophical taxonomy to generate new AI ethics categories
 * that align with broader philosophical domains while addressing
 * current real-world AI challenges.
 */

import {
  PHILOSOPHICAL_DOMAINS,
  CATEGORY_CREATION_GUIDELINES,
  MCP_CATEGORY_GENERATION,
} from './philosophical-taxonomy.js';

/**
 * MCP-Powered Category Generator
 * Combines real-world AI developments with philosophical frameworks
 */
export class MCPPhilosophicalCategoryGenerator {
  constructor(mcpWebResearch, mcpProjectGenerator) {
    this.webResearch = mcpWebResearch;
    this.projectGen = mcpProjectGenerator;
    this.philosophicalDomains = PHILOSOPHICAL_DOMAINS;
  }

  /**
   * Generate new category based on current AI ethics developments
   * @param {string} targetDomain - Primary philosophical domain to focus on
   * @param {Object} options - Generation options
   * @returns {Object} Complete category specification
   */
  async generateNewCategory(targetDomain, options = {}) {
    const {
      scenarioCount = 6,
      includeAdvanced = true,
      focusArea = null,
    } = options;

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
      estimatedTime: Math.ceil(scenarioCount * 8), // 8 minutes per scenario
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
        issues.push(...results.slice(0, 3)); // Top 3 results per query
      } catch (error) {
        console.warn(`Failed to research ${query}:`, error);
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
      `artificial intelligence ${domain.description.split(' ').slice(0, 3).join(' ')}`,
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
          if (this.textSimilarity(issue.description, application) > 0.3) {
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
  generateScenarioChoices(scenarioConfig) {
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
   * Generate badge-specific methods
   */
  generateBadgeDescription(categoryStructure, level) {
    const descriptions = {
      Explorer: `Beginning your journey in ${categoryStructure.name}`,
      Apprentice: `Developing skills in ${categoryStructure.name}`,
      Scholar: `Demonstrating competence in ${categoryStructure.name}`,
      Philosopher: `Achieving wisdom in ${categoryStructure.name}`,
      Master: `Mastering the complexities of ${categoryStructure.name}`,
      Sage: `Transcending conventional thinking in ${categoryStructure.name}`,
    };
    return descriptions[level] || `Advancing in ${categoryStructure.name}`;
  }

  /**
   * Generate philosophical quotes for badges
   */
  generatePhilosophicalQuote(domainConfig, level) {
    const quotes = {
      Explorer:
        'The journey of a thousand miles begins with a single step. - Lao Tzu',
      Apprentice:
        'The only true wisdom is in knowing you know nothing. - Socrates',
      Scholar: 'An unexamined life is not worth living. - Socrates',
      Philosopher:
        'The function of education is to teach one to think intensively and to think critically. - Martin Luther King Jr.',
      Master:
        'Intelligence is not enough. Intelligence plus character - that is the goal. - Martin Luther King Jr.',
      Sage: 'The real question is not whether machines think but whether men do. - B.F. Skinner',
    };
    return (
      quotes[level] ||
      'Wisdom is the reward for a lifetime of listening. - Doug Larson'
    );
  }

  /**
   * Generate comprehensive lab interaction design
   */
  generateLabInteractionDesign(scenario) {
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
    if (currentLevel < 5) {
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
    const baseTime = requiredScenarios * 8; // 8 minutes per scenario
    const reflectionTime = (level + 1) * 10; // Increasing reflection time
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
}
