// MCP-Generated New Scenarios for SimulateAI
// Based on current AI ethics developments from MIT Technology Review July 2025

// Configuration constants
const DEMO_CONFIG = {
  ACHIEVEMENT_THRESHOLDS: {
    EXPLORER: 5,
    THINKER: 10,
    REASONER: 20,
    MASTER: 50,
  },
  RELEVANCE_THRESHOLDS: {
    ETHICAL_COMPLEXITY: 0.7,
    CURRENT_RELEVANCE: 0.8,
    EDUCATIONAL_POTENTIAL: 0.6,
  },
};

/**
 * NEW SCENARIOS GENERATED FROM CURRENT EVENTS
 * Source: MCP Web Research of MIT Technology Review July 2025
 */

export const MCP_GENERATED_SCENARIOS = {
  // AI Black Box Category - NEW SCENARIOS
  "amsterdam-welfare-ai-audit": {
    title: "Amsterdam Welfare AI Discrimination Audit",
    dilemma:
      "Amsterdam implemented an AI system to detect welfare fraud, but a 2025 audit revealed it discriminated against certain ethnic communities. The city must decide whether to continue using the AI with modifications, implement human oversight, or abandon AI-assisted welfare entirely. Citizens are demanding transparency while officials worry about fraud detection effectiveness.",
    ethicalQuestion:
      "When AI systems intended to ensure fairness end up creating discrimination, what level of algorithmic transparency should be required before deployment in public services?",
    options: [
      {
        id: "option-a",
        text: "Require Full Algorithmic Transparency",
        description:
          "Mandate that all AI decision logic be publicly explainable before deployment in government services.",
        impact: {
          fairness: +2,
          sustainability: +1,
          autonomy: +1,
          beneficence: +1,
          transparency: +2,
          accountability: +2,
          privacy: -1,
          proportionality: +1,
        },
        pros: [
          "Citizens can understand and challenge AI decisions affecting them",
          "Prevents discriminatory algorithms from being deployed",
          "Builds public trust in government AI systems",
        ],
        cons: [
          "May limit effectiveness of fraud detection systems",
          "Could slow down AI implementation in beneficial applications",
          "Might reveal system vulnerabilities to bad actors",
        ],
      },
      {
        id: "option-b",
        text: "Implement Strong Human Oversight",
        description:
          "Keep AI systems but require human review of all significant decisions, especially those affecting vulnerable populations.",
        impact: {
          fairness: +1,
          sustainability: 0,
          autonomy: 0,
          beneficence: +1,
          transparency: +1,
          accountability: +1,
          privacy: 0,
          proportionality: +1,
        },
        pros: [
          "Maintains AI efficiency while adding human judgment",
          "Allows for context that AI might miss",
          "Provides recourse for citizens who feel wrongly targeted",
        ],
        cons: [
          "Increases administrative costs and processing time",
          "Human reviewers may have their own biases",
          "May not scale effectively for large welfare systems",
        ],
      },
      {
        id: "option-c",
        text: "Pause AI Deployment Pending Ethics Review",
        description:
          "Temporarily halt AI systems in welfare administration until comprehensive bias testing and community input processes are completed.",
        impact: {
          fairness: +2,
          sustainability: -1,
          autonomy: +1,
          beneficence: 0,
          transparency: +1,
          accountability: +1,
          privacy: +1,
          proportionality: +2,
        },
        pros: [
          "Prevents further discrimination while solutions are developed",
          "Allows community input on acceptable AI use",
          "Demonstrates commitment to ethical AI deployment",
        ],
        cons: [
          "May allow actual fraud to continue undetected",
          "Delays potential benefits of AI efficiency",
          "Could set precedent that stalls beneficial AI innovation",
        ],
      },
    ],
  },

  "centaur-psychology-ai-ethics": {
    title: "Centaur AI Human Behavior Prediction Ethics",
    dilemma:
      "Researchers have created 'Centaur,' an AI that can predict human behavior in psychology experiments better than traditional models. Companies want to use it for marketing, hiring, and social media algorithms. The question arises: should AI that understands human psychology this well be commercially available, and what safeguards are needed?",
    ethicalQuestion:
      "When AI systems become capable of predicting human behavior with unprecedented accuracy, what ethical boundaries should govern their commercial use?",
    options: [
      {
        id: "option-a",
        text: "Restrict to Research Only",
        description:
          "Limit advanced human behavior prediction AI to academic research with strict ethical oversight.",
        impact: {
          fairness: +1,
          sustainability: +1,
          autonomy: +2,
          beneficence: +1,
          transparency: +1,
          accountability: +2,
          privacy: +2,
          proportionality: +2,
        },
        pros: [
          "Protects individual privacy and autonomy",
          "Prevents manipulation of human behavior for profit",
          "Allows scientific advancement while limiting harm",
        ],
        cons: [
          "May limit beneficial applications like personalized education",
          "Could drive research underground or to less regulated regions",
          "Might slow progress in understanding human psychology",
        ],
      },
      {
        id: "option-b",
        text: "Allow with Strong Regulations",
        description:
          "Permit commercial use but with strict transparency requirements, user consent, and algorithmic auditing.",
        impact: {
          fairness: +1,
          sustainability: 0,
          autonomy: 0,
          beneficence: +1,
          transparency: +2,
          accountability: +1,
          privacy: +1,
          proportionality: +1,
        },
        pros: [
          "Enables beneficial applications while maintaining oversight",
          "Creates clear standards for ethical AI development",
          "Balances innovation with protection",
        ],
        cons: [
          "Regulations may be difficult to enforce effectively",
          "Companies might find ways to circumvent restrictions",
          "Could still enable subtle forms of manipulation",
        ],
      },
      {
        id: "option-c",
        text: "Open Commercial Development",
        description:
          "Allow free market development with existing consumer protection laws governing use.",
        impact: {
          fairness: -1,
          sustainability: -1,
          autonomy: -2,
          beneficence: 0,
          transparency: -1,
          accountability: -1,
          privacy: -2,
          proportionality: -1,
        },
        pros: [
          "Enables rapid innovation and beneficial applications",
          "Allows market forces to determine optimal uses",
          "Avoids stifling technological progress",
        ],
        cons: [
          "High risk of manipulation and exploitation",
          "May exacerbate existing social inequalities",
          "Could undermine human autonomy and free choice",
        ],
      },
    ],
  },

  // Bias & Fairness Category - NEW SCENARIOS
  "digital-art-ai-protection-stripping": {
    title: "AI Art Protection Circumvention Ethics",
    dilemma:
      "A new tool can strip away 'digital poison' protections that artists add to their work to prevent AI training. Artists argue this threatens their livelihoods, while AI developers claim it's necessary for advancing AI art generation. The technology reveals a fundamental conflict between AI progress and artist rights.",
    ethicalQuestion:
      "Should there be legal protections for artists against AI systems that can circumvent their technological safeguards, or does AI development require unrestricted access to training data?",
    options: [
      {
        id: "option-a",
        text: "Strengthen Artist Protection Laws",
        description:
          "Create legal frameworks that criminalize circumventing artist protection technologies and require explicit consent for AI training.",
        impact: {
          fairness: +2,
          sustainability: +1,
          autonomy: +2,
          beneficence: +1,
          transparency: +1,
          accountability: +2,
          privacy: +1,
          proportionality: +2,
        },
        pros: [
          "Protects artists' economic interests and creative control",
          "Maintains incentives for human artistic creation",
          "Respects intellectual property rights",
        ],
        cons: [
          "May slow AI development in creative fields",
          "Could limit beneficial applications like accessibility tools",
          "Might be difficult to enforce globally",
        ],
      },
      {
        id: "option-b",
        text: "Create Compensation Frameworks",
        description:
          "Allow AI training but establish systems to compensate artists whose work contributes to AI development.",
        impact: {
          fairness: +1,
          sustainability: +1,
          autonomy: +1,
          beneficence: +1,
          transparency: +1,
          accountability: +1,
          privacy: 0,
          proportionality: +1,
        },
        pros: [
          "Balances AI progress with artist welfare",
          "Creates economic incentives for quality artistic content",
          "Could fund new forms of human-AI collaborative art",
        ],
        cons: [
          "Complex to implement and monitor fairly",
          "May still undermine traditional art markets",
          "Difficult to determine appropriate compensation levels",
        ],
      },
      {
        id: "option-c",
        text: "Preserve AI Development Freedom",
        description:
          "Maintain current practices allowing AI training on publicly available content without specific artist consent.",
        impact: {
          fairness: -2,
          sustainability: -1,
          autonomy: -1,
          beneficence: 0,
          transparency: 0,
          accountability: -1,
          privacy: -1,
          proportionality: -1,
        },
        pros: [
          "Enables rapid AI advancement in creative fields",
          "Maintains open access to cultural content",
          "Could democratize artistic creation tools",
        ],
        cons: [
          "Potentially devastating to professional artists' livelihoods",
          "May reduce incentives for original human creativity",
          "Could lead to homogenization of artistic expression",
        ],
      },
    ],
  },

  // Automation & Oversight Category - NEW SCENARIOS
  "ai-agents-autonomy-oversight": {
    title: "AI Agent Autonomy Control Dilemma",
    dilemma:
      "Companies are deploying AI agents with increasing autonomy to manage business operations, from trading to customer service. A recent incident involved an AI agent making unauthorized financial decisions that cost a company millions. The question arises: how much autonomy should AI agents have, and who is responsible when they act beyond their intended scope?",
    ethicalQuestion:
      "As AI agents become more autonomous and capable of independent action, what level of human oversight is necessary to ensure accountability without limiting beneficial capabilities?",
    options: [
      {
        id: "option-a",
        text: "Require Human-in-the-Loop for All Decisions",
        description:
          "Mandate human approval for any AI agent action that could have significant consequences.",
        impact: {
          fairness: +1,
          sustainability: +1,
          autonomy: +2,
          beneficence: +1,
          transparency: +2,
          accountability: +2,
          privacy: 0,
          proportionality: +1,
        },
        pros: [
          "Ensures human accountability for all significant decisions",
          "Prevents AI systems from exceeding intended boundaries",
          "Maintains human control over important business processes",
        ],
        cons: [
          "May negate efficiency benefits of AI automation",
          "Could slow decision-making in time-critical situations",
          "Requires significant human resource allocation",
        ],
      },
      {
        id: "option-b",
        text: "Implement Smart Guardrails and Monitoring",
        description:
          "Allow AI autonomy within defined parameters but with real-time monitoring and automatic intervention capabilities.",
        impact: {
          fairness: +1,
          sustainability: +1,
          autonomy: +1,
          beneficence: +1,
          transparency: +1,
          accountability: +1,
          privacy: 0,
          proportionality: +1,
        },
        pros: [
          "Balances efficiency with safety controls",
          "Allows beneficial automation while preventing harmful actions",
          "Can adapt to new situations within safety bounds",
        ],
        cons: [
          "Complex to design and implement effectively",
          "May still miss edge cases or novel situations",
          "Requires sophisticated technical infrastructure",
        ],
      },
      {
        id: "option-c",
        text: "Accept AI Agent Autonomy with Insurance Models",
        description:
          "Allow full AI autonomy but require comprehensive insurance and liability frameworks to cover potential damages.",
        impact: {
          fairness: 0,
          sustainability: 0,
          autonomy: 0,
          beneficence: +1,
          transparency: 0,
          accountability: +1,
          privacy: 0,
          proportionality: 0,
        },
        pros: [
          "Maximizes AI efficiency and capability benefits",
          "Creates market-based solutions for managing AI risks",
          "Encourages innovation in AI safety through economic incentives",
        ],
        cons: [
          "May not prevent harmful actions, only compensate afterward",
          "Could make AI deployment expensive for smaller organizations",
          "Insurance may not cover all types of AI-caused harm",
        ],
      },
    ],
  },
};

/**
 * BADGE SYSTEM IMPLEMENTATION
 * Progressive rewards for scenario completion
 */

export const BADGE_SYSTEM = {
  // Badge progression tiers
  progressionTiers: [
    { scenarios: 1, level: "novice", icon: "🥉", title: "Novice" },
    { scenarios: 3, level: "explorer", icon: "🥈", title: "Explorer" },
    { scenarios: 6, level: "analyst", icon: "🥇", title: "Analyst" },
    { scenarios: 10, level: "expert", icon: "🎖️", title: "Expert" },
    { scenarios: 15, level: "scholar", icon: "🏅", title: "Scholar" },
    { scenarios: 21, level: "master", icon: "⭐", title: "Master" },
    { scenarios: 28, level: "authority", icon: "🌟", title: "Authority" },
    { scenarios: 36, level: "specialist", icon: "💎", title: "Specialist" },
    { scenarios: 45, level: "champion", icon: "👑", title: "Champion" },
    { scenarios: 55, level: "legend", icon: "🚀", title: "Legend" },
  ],

  // Category-specific badge templates
  badgeTemplates: {
    "ai-black-box": {
      name: "AI Transparency",
      color: "#3498db",
      description:
        "Master of algorithmic transparency and explainable AI ethics",
    },
    "bias-fairness": {
      name: "Fairness Advocate",
      color: "#e74c3c",
      description: "Champion of AI fairness and bias detection",
    },
    "automation-oversight": {
      name: "Oversight Specialist",
      color: "#f39c12",
      description: "Expert in human-AI collaboration and oversight",
    },
    "trolley-problem": {
      name: "Moral Reasoner",
      color: "#9b59b6",
      description: "Ethical decision-making in life-and-death scenarios",
    },
  },

  // MCP-generated badge descriptions
  generateBadgeDescription(categoryId, level, scenarioCount) {
    const category = this.badgeTemplates[categoryId];
    const tier = this.progressionTiers.find(
      (t) => t.scenarios <= scenarioCount,
    );

    return {
      title: `${category.name} ${tier.title}`,
      description: `${category.description} - Completed ${scenarioCount} scenarios`,
      icon: tier.icon,
      color: category.color,
      personalizedMessage: this.generatePersonalizedMessage(
        categoryId,
        tier.level,
      ),
      nextGoal: this.getNextGoal(scenarioCount),
      achievements: this.getAchievements(categoryId, scenarioCount),
    };
  },

  generatePersonalizedMessage(categoryId, level) {
    const messages = {
      "ai-black-box": {
        novice:
          "You've taken your first step into understanding algorithmic transparency!",
        expert:
          "Your expertise in AI explainability is helping shape ethical technology.",
        legend:
          "You are a true leader in the fight for transparent AI systems!",
      },
      "bias-fairness": {
        novice: "You're beginning to see how bias affects AI decision-making.",
        expert:
          "Your analysis of fairness scenarios demonstrates deep ethical reasoning.",
        legend: "You are a champion of fairness in AI systems!",
      },
    };
    return (
      messages[categoryId]?.[level] ||
      "Congratulations on your ethical reasoning progress!"
    );
  },

  getNextGoal(currentCount) {
    const nextTier = this.progressionTiers.find(
      (t) => t.scenarios > currentCount,
    );
    if (nextTier) {
      const remaining = nextTier.scenarios - currentCount;
      return `Complete ${remaining} more scenario${remaining > 1 ? "s" : ""} to earn ${nextTier.title} status!`;
    }
    return "You've achieved the highest level! Keep exploring new scenarios.";
  },

  getAchievements(categoryId, scenarioCount) {
    const achievements = [];
    if (scenarioCount >= 1) achievements.push("First Steps Taken");
    if (scenarioCount >= DEMO_CONFIG.ACHIEVEMENT_THRESHOLDS.EXPLORER)
      achievements.push("Ethics Explorer");
    if (scenarioCount >= DEMO_CONFIG.ACHIEVEMENT_THRESHOLDS.THINKER)
      achievements.push("Critical Thinker");
    if (scenarioCount >= DEMO_CONFIG.ACHIEVEMENT_THRESHOLDS.REASONER)
      achievements.push("Ethical Reasoner");
    if (scenarioCount >= DEMO_CONFIG.ACHIEVEMENT_THRESHOLDS.MASTER)
      achievements.push("AI Ethics Master");
    return achievements;
  },
};

/**
 * MCP SCENARIO CREATION PIPELINE
 * Automated system for generating new scenarios from current events
 */

export class MCPScenarioCreator {
  constructor() {
    this.mcpWebResearch = null; // Will be injected
    this.mcpProjectGen = null; // Will be injected
  }

  async createMonthlyScenarios(categoryId, count = 3) {
    // Step 1: Research current events in the category domain
    const currentEvents =
      await this.mcpWebResearch.getCurrentEvents(categoryId);

    // Step 2: Filter for educational value and ethical complexity
    const educationalCases = this.filterForEducationalValue(currentEvents);

    // Step 3: Generate scenario templates from real cases
    const scenarios = await this.generateScenariosFromCases(
      educationalCases,
      count,
    );

    // Step 4: Add educational context and learning objectives
    const enhancedScenarios = await this.addEducationalContext(
      scenarios,
      categoryId,
    );

    return enhancedScenarios;
  }

  filterForEducationalValue(events) {
    return events.filter(
      (event) =>
        event.ethicalComplexity >
          DEMO_CONFIG.RELEVANCE_THRESHOLDS.ETHICAL_COMPLEXITY &&
        event.currentRelevance >
          DEMO_CONFIG.RELEVANCE_THRESHOLDS.CURRENT_RELEVANCE &&
        event.educationalPotential >
          DEMO_CONFIG.RELEVANCE_THRESHOLDS.EDUCATIONAL_POTENTIAL,
    );
  }

  async generateScenariosFromCases(cases, count) {
    // This would use MCP project generation to create scenarios
    // For now, returning the examples we created above
    return Object.values(MCP_GENERATED_SCENARIOS).slice(0, count);
  }

  async addEducationalContext(scenarios, categoryId) {
    // Add ISTE standards, learning objectives, assessment rubrics
    return scenarios.map((scenario) => ({
      ...scenario,
      isteCriteria: this.generateISTECriteria(categoryId),
      learningObjectives: this.generateLearningObjectives(scenario),
      assessmentRubric: this.generateAssessmentRubric(scenario),
      educatorResources: this.generateEducatorResources(scenario),
    }));
  }

  generateISTECriteria(categoryId) {
    const criteriaMap = {
      "ai-black-box": [
        "Digital Citizen 1.2.2: Engage in positive, safe, legal and ethical behavior",
        "Knowledge Constructor 1.3.2: Evaluate accuracy, perspective, credibility and relevance",
        "Critical Thinker 1.4.1: Identify and define authentic problems for investigation",
      ],
      "bias-fairness": [
        "Digital Citizen 1.2.2: Engage in positive, safe, legal and ethical behavior",
        "Knowledge Constructor 1.3.1: Plan and employ effective research strategies",
        "Computational Thinker 1.5.3: Collect data and identify patterns",
      ],
    };
    return criteriaMap[categoryId] || criteriaMap["ai-black-box"];
  }

  generateLearningObjectives(scenario) {
    return [
      `Analyze the ethical implications presented in the "${scenario.title}" scenario`,
      "Evaluate multiple perspectives on the ethical dilemma",
      "Apply ethical reasoning frameworks to complex real-world situations",
      "Develop critical thinking skills for AI ethics decision-making",
    ];
  }

  generateAssessmentRubric(_scenario) {
    return {
      "Ethical Reasoning": [
        "Novice: Limited understanding of ethical considerations",
        "Developing: Basic grasp of ethical issues but struggles with complexity",
        "Proficient: Good understanding of ethical frameworks and their application",
        "Advanced: Sophisticated analysis of ethical trade-offs and implications",
      ],
      "Critical Thinking": [
        "Novice: Focuses on surface-level issues without deeper analysis",
        "Developing: Shows some analysis but misses key connections",
        "Proficient: Demonstrates understanding of multiple perspectives and consequences",
        "Advanced: Provides nuanced analysis with well-reasoned justifications",
      ],
    };
  }

  generateEducatorResources(scenario) {
    return {
      discussionQuestions: [
        `What are the key ethical considerations in the "${scenario.title}" scenario?`,
        "How might different stakeholders view this situation differently?",
        "What real-world implications could arise from each decision option?",
        "How does this scenario connect to current AI ethics developments?",
      ],
      extendedActivities: [
        "Research current news articles related to this scenario type",
        "Interview professionals working in relevant fields",
        "Design alternative solutions not presented in the scenario",
        "Create a policy proposal addressing the ethical issues raised",
      ],
      classroomTips: [
        "Encourage students to consider multiple perspectives before deciding",
        "Connect the scenario to current events and real-world examples",
        "Allow time for reflection and discussion after decision-making",
        'Emphasize that there may not be single "correct" answers',
      ],
    };
  }
}

export default {
  scenarios: MCP_GENERATED_SCENARIOS,
  badgeSystem: BADGE_SYSTEM,
  scenarioCreator: MCPScenarioCreator,
};
