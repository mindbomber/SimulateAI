/**
 * Philosophical Taxonomy for AI Ethics Education
 * Comprehensive framework of philosophical domains for ethical analysis
 */

export const PHILOSOPHICAL_DOMAINS = {
  metaethics: {
    name: 'Metaethics',
    description:
      'Examines the nature, meaning, and foundations of ethical claims',
    subcategories: {
      moral_realism: {
        name: 'Moral Realism',
        description:
          'Belief that moral facts exist independently of what people think about them',
      },
      moral_relativism: {
        name: 'Moral Relativism',
        description:
          'View that moral judgments are true relative to particular standpoints',
      },
      emotivism: {
        name: 'Emotivism',
        description:
          'Theory that moral statements express emotions rather than facts',
      },
    },
  },

  normative_ethics: {
    name: 'Normative Ethics',
    description:
      'Studies what makes actions right or wrong, and what we ought to do',
    subcategories: {
      consequentialism: {
        name: 'Consequentialism',
        description: 'Actions are right based solely on their consequences',
        frameworks: [
          'utilitarianism',
          'ethical_egoism',
          'rule_consequentialism',
        ],
      },
      deontology: {
        name: 'Deontological Ethics',
        description: 'Actions are right based on adherence to rules and duties',
        frameworks: [
          'kantian_ethics',
          'rights_based_ethics',
          'divine_command_theory',
        ],
      },
      virtue_ethics: {
        name: 'Virtue Ethics',
        description:
          'Focus on character traits and moral virtues rather than actions',
        frameworks: ['aristotelian_virtue', 'care_ethics', 'confucian_ethics'],
      },
    },
  },

  applied_ethics: {
    name: 'Applied Ethics',
    description: 'Application of ethical theories to specific practical issues',
    subcategories: {
      bioethics: {
        name: 'Bioethics',
        description: 'Ethical issues in medicine, biology, and healthcare',
      },
      environmental_ethics: {
        name: 'Environmental Ethics',
        description:
          'Moral relationship between humans and the natural environment',
      },
      business_ethics: {
        name: 'Business Ethics',
        description: 'Ethical principles in commercial enterprise',
      },
      technology_ethics: {
        name: 'Technology Ethics',
        description: 'Moral implications of technological development and use',
      },
    },
  },

  political_philosophy: {
    name: 'Political Philosophy',
    description:
      'Examines concepts of government, politics, and social organization',
    subcategories: {
      distributive_justice: {
        name: 'Distributive Justice',
        description:
          'How resources, opportunities, and burdens should be distributed',
      },
      liberty_authority: {
        name: 'Liberty and Authority',
        description:
          'Balance between individual freedom and governmental power',
      },
      social_contract: {
        name: 'Social Contract Theory',
        description: 'How legitimate political authority arises from consent',
      },
    },
  },

  epistemology: {
    name: 'Epistemology',
    description: 'Study of knowledge, justified belief, and rationality',
    subcategories: {
      empiricism: {
        name: 'Empiricism',
        description: 'Knowledge comes primarily from sensory experience',
      },
      rationalism: {
        name: 'Rationalism',
        description: 'Reason is the primary source of knowledge',
      },
      skepticism: {
        name: 'Skepticism',
        description: 'Questioning the possibility of certain knowledge',
      },
    },
  },

  philosophy_of_mind: {
    name: 'Philosophy of Mind',
    description:
      'Nature of consciousness, mental states, and the mind-body relationship',
    subcategories: {
      consciousness: {
        name: 'Consciousness Studies',
        description: 'Nature and origins of conscious experience',
      },
      personal_identity: {
        name: 'Personal Identity',
        description: 'What makes a person the same person over time',
      },
      free_will: {
        name: 'Free Will and Determinism',
        description: 'Whether humans have genuine freedom of choice',
      },
    },
  },
};

/**
 * AI Ethics Specific Philosophical Frameworks
 */
export const AI_ETHICS_FRAMEWORKS = {
  principle_based: {
    name: 'Principle-Based AI Ethics',
    description: 'Framework based on core ethical principles',
    principles: {
      beneficence: 'AI should benefit humanity',
      non_maleficence: 'AI should not cause harm',
      autonomy: 'Respect for human agency and decision-making',
      justice: 'Fair distribution of AI benefits and risks',
      explicability: 'AI decisions should be understandable',
      accountability: 'Clear responsibility for AI actions',
    },
  },

  value_sensitive_design: {
    name: 'Value Sensitive Design',
    description: 'Incorporating human values throughout the design process',
    values: [
      'privacy',
      'accessibility',
      'environmental_sustainability',
      'human_welfare',
      'fairness',
      'democratic_participation',
    ],
  },

  capabilities_approach: {
    name: 'Capabilities Approach',
    description: 'Focus on what people are able to do and be',
    core_capabilities: [
      'life',
      'bodily_health',
      'senses_imagination_thought',
      'emotions',
      'practical_reason',
      'affiliation',
      'play',
      'control_environment',
    ],
  },
};

/**
 * Ethical Dilemma Categories for Educational Scenarios
 */
export const ETHICAL_DILEMMA_TYPES = {
  trolley_problems: {
    name: 'Trolley Problem Variants',
    description: 'Life-and-death decisions involving trade-offs',
    scenarios: ['classic_trolley', 'fat_man', 'loop_track', 'transplant_case'],
  },

  transparency_vs_privacy: {
    name: 'Transparency vs Privacy',
    description: 'Balancing openness with personal data protection',
    tensions: [
      'algorithmic_transparency',
      'data_minimization',
      'consent_mechanisms',
    ],
  },

  automation_vs_human_control: {
    name: 'Automation vs Human Control',
    description: 'When machines should override or defer to humans',
    contexts: [
      'medical_diagnosis',
      'autonomous_vehicles',
      'criminal_justice',
      'hiring_decisions',
    ],
  },

  individual_vs_collective: {
    name: 'Individual vs Collective Benefits',
    description: 'Balancing personal rights with societal good',
    examples: [
      'contact_tracing',
      'predictive_policing',
      'personalized_medicine',
    ],
  },
};

/**
 * Philosophical Thought Experiments Relevant to AI
 */
export const THOUGHT_EXPERIMENTS = {
  ship_of_theseus: {
    name: 'Ship of Theseus',
    description: 'Identity persistence through gradual replacement',
    ai_relevance: 'AI consciousness and identity through updates',
  },

  chinese_room: {
    name: 'Chinese Room',
    description: 'Understanding vs simulation of understanding',
    ai_relevance: 'Whether AI can truly understand or just simulate',
  },

  experience_machine: {
    name: 'Experience Machine',
    description: 'Value of authentic vs artificial experiences',
    ai_relevance:
      'Virtual reality, artificial relationships, simulated environments',
  },

  veil_of_ignorance: {
    name: 'Veil of Ignorance',
    description: 'Designing fair systems without knowing your position',
    ai_relevance: 'Designing fair AI systems for unknown future impacts',
  },

  simulation_hypothesis: {
    name: 'Simulation Hypothesis',
    description: 'Whether reality might be artificially simulated',
    ai_relevance: 'Ethics of creating simulated beings and environments',
  },
};

/**
 * Export utility functions for working with philosophical taxonomy
 */
export const PhilosophicalTaxonomyUtils = {
  /**
   * Get all philosophical domains
   */
  getAllDomains() {
    return Object.keys(PHILOSOPHICAL_DOMAINS);
  },

  /**
   * Get subcategories for a specific domain
   */
  getSubcategories(domain) {
    return PHILOSOPHICAL_DOMAINS[domain]?.subcategories || {};
  },

  /**
   * Find relevant philosophical frameworks for an ethical dilemma
   */
  getRelevantFrameworks(dilemmaType) {
    // Map dilemma types to relevant philosophical approaches
    const mappings = {
      life_death_decisions: ['consequentialism', 'deontology', 'virtue_ethics'],
      privacy_surveillance: ['liberty_authority', 'rights_based_ethics'],
      ai_consciousness: ['philosophy_of_mind', 'personal_identity'],
      fairness_bias: ['distributive_justice', 'capabilities_approach'],
      transparency_explainability: ['epistemology', 'democratic_participation'],
    };

    return mappings[dilemmaType] || [];
  },

  /**
   * Generate educational content for a philosophical concept
   */
  getEducationalContent(concept) {
    // This would be enhanced by MCP to generate rich educational content
    return {
      definition: this.getConceptDefinition(concept),
      examples: this.getConceptExamples(concept),
      questions: this.getSocraticQuestions(concept),
      applications: this.getAIApplications(concept),
    };
  },

  getConceptDefinition(concept) {
    // Placeholder - would be enhanced by MCP web research
    return `Definition and explanation of ${concept}`;
  },

  getConceptExamples(concept) {
    // Placeholder - would be enhanced by MCP content generation
    return [`Example 1 of ${concept}`, `Example 2 of ${concept}`];
  },

  getSocraticQuestions(concept) {
    // Placeholder - would be enhanced by MCP pedagogical content
    return [
      `What do you think ${concept} means?`,
      `How might ${concept} apply to AI systems?`,
      `What are the implications of ${concept} for society?`,
    ];
  },

  getAIApplications(concept) {
    // Placeholder - would be enhanced by MCP research capabilities
    return [`AI application 1 of ${concept}`, `AI application 2 of ${concept}`];
  },
};

export default {
  PHILOSOPHICAL_DOMAINS,
  AI_ETHICS_FRAMEWORKS,
  ETHICAL_DILEMMA_TYPES,
  THOUGHT_EXPERIMENTS,
  PhilosophicalTaxonomyUtils,
};
