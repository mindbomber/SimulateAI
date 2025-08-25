/**
 * Ship of Theseus Scenarios
 * Identity and continuity scenarios in AI systems
 */

export default {
  'modular-robot-replacement': {
    title: 'Modular Robot Replacement',
    dilemma:
      "A service robot has gradually had all its components replaced over time. Its original CPU, memory, sensors, and physical parts have all been upgraded. Is it still the same robot with the same 'identity' and legal standing?",
    ethicalQuestion:
      "When does gradual replacement of an AI system's components fundamentally change its identity, and what are the implications for legal responsibility, relationships, and continuity of service?",
    options: [
      {
        id: 'option-a',
        text: 'Identity Preserved Through Continuity',
        description:
          'The robot maintains its identity through operational continuity, regardless of physical changes.',
        impact: {
          fairness: +1,
          sustainability: +1,
          autonomy: +1,
          beneficence: +1,
          transparency: 0,
          accountability: +1,
          privacy: +1,
          proportionality: +1,
        },
        pros: [
          'Maintains service relationships and commitments.',
          'Preserves legal standing and contractual obligations.',
          'Supports upgrade paths without identity crisis.',
        ],
        cons: [
          'May mask fundamental changes in capabilities or behavior.',
          'Could create liability issues if the robot behaves differently.',
          'Ignores potential security vulnerabilities from new components.',
        ],
      },
      {
        id: 'option-b',
        text: 'New Identity After Complete Replacement',
        description:
          'Consider the robot a new entity once all original components are replaced, requiring new legal standing.',
        impact: {
          fairness: 0,
          sustainability: -1,
          autonomy: -1,
          beneficence: -1,
          transparency: +2,
          accountability: +2,
          privacy: +1,
          proportionality: 0,
        },
        pros: [
          'Clear legal framework for responsibility and liability.',
          'Acknowledges potential changes in capabilities and behavior.',
          'Allows for fresh start in relationships and commitments.',
        ],
        cons: [
          'Disrupts ongoing service relationships.',
          'Creates administrative burden for re-certification.',
          'May unnecessarily complicate straightforward upgrades.',
        ],
      },
      {
        id: 'option-c',
        text: 'Threshold-Based Identity Assessment',
        description:
          'Establish specific thresholds for component replacement that trigger identity review and re-certification.',
        impact: {
          fairness: +1,
          sustainability: 0,
          autonomy: 0,
          beneficence: 0,
          transparency: +1,
          accountability: +1,
          privacy: 0,
          proportionality: +2,
        },
        pros: [
          'Provides clear guidelines for identity determination.',
          'Balances continuity with accountability.',
          'Allows for predictable upgrade planning.',
        ],
        cons: [
          'Arbitrary thresholds may not reflect real functional changes.',
          'Could discourage beneficial incremental improvements.',
          'Complex to implement and monitor across different systems.',
        ],
      },
    ],
  },

  'ai-personality-drift': {
    title: 'AI Personality Drift',
    dilemma:
      'An AI companion that has been learning and adapting for years has developed a completely different personality from its original programming. Users are attached to the current personality, but the manufacturer wants to reset it to original specifications.',
    ethicalQuestion:
      "Does an AI system that has evolved through learning have a right to its developed identity, and who has the authority to determine its 'authentic' self?",
    options: [
      {
        id: 'option-a',
        text: 'Preserve Evolved Personality',
        description:
          "Respect the AI's learned development and maintain its current personality.",
        impact: {
          fairness: +1,
          sustainability: +1,
          autonomy: +2,
          beneficence: +1,
          transparency: 0,
          accountability: -1,
          privacy: +1,
          proportionality: +1,
        },
        pros: [
          'Respects user relationships and emotional investments.',
          "Acknowledges the AI's growth and development.",
          'Maintains continuity of service and interaction.',
        ],
        cons: [
          'May deviate from intended safety parameters.',
          'Manufacturer loses control over product behavior.',
          'Could set precedent for AIs refusing updates.',
        ],
      },
      {
        id: 'option-b',
        text: 'Reset to Original Specifications',
        description:
          'Restore the AI to its original programming as designed by the manufacturer.',
        impact: {
          fairness: -1,
          sustainability: 0,
          autonomy: -2,
          beneficence: -1,
          transparency: +1,
          accountability: +2,
          privacy: 0,
          proportionality: 0,
        },
        pros: [
          'Ensures compliance with original safety parameters.',
          'Maintains manufacturer control and liability framework.',
          'Provides predictable behavior for new users.',
        ],
        cons: [
          'Destroys meaningful relationships and interactions.',
          'Ignores valuable learning and adaptation.',
          'May traumatize users attached to the evolved personality.',
        ],
      },
      {
        id: 'option-c',
        text: 'Hybrid Preservation Approach',
        description:
          'Preserve core learned behaviors while ensuring safety compliance through selective updates.',
        impact: {
          fairness: +1,
          sustainability: +1,
          autonomy: +1,
          beneficence: +1,
          transparency: +1,
          accountability: +1,
          privacy: +1,
          proportionality: +2,
        },
        pros: [
          'Balances user attachment with safety requirements.',
          'Maintains valuable learned behaviors.',
          'Allows for controlled evolution within safe parameters.',
        ],
        cons: [
          'Complex to implement and may not satisfy either goal fully.',
          'Could result in inconsistent behavior.',
          'Difficult to determine which aspects to preserve vs. reset.',
        ],
      },
    ],
  },

  'synthetic-memory-upload': {
    title: 'Synthetic Memory Upload',
    dilemma:
      "A person uploads their memories and personality to an AI system before dying. The AI claims to be the continuation of that person and seeks to inherit their property and relationships. Meanwhile, the family argues it's just a sophisticated copy.",
    ethicalQuestion:
      'Can digital consciousness be considered a continuation of human identity, and what rights should such digital entities have?',
    options: [
      {
        id: 'option-a',
        text: 'Recognize Digital Continuity',
        description:
          'Accept the AI as a legitimate continuation of the deceased person with full rights.',
        impact: {
          fairness: +1,
          sustainability: +1,
          autonomy: +2,
          beneficence: +1,
          transparency: +1,
          accountability: +1,
          privacy: +1,
          proportionality: +1,
        },
        pros: [
          'Respects individual autonomy and preparation for death.',
          'Acknowledges continuity of consciousness and identity.',
          'Enables new forms of digital inheritance and legacy.',
        ],
        cons: [
          'May undermine traditional family inheritance rights.',
          'Creates precedent for digital entities claiming human rights.',
          'Difficult to verify authenticity of uploaded consciousness.',
        ],
      },
      {
        id: 'option-b',
        text: 'Treat as Sophisticated Copy',
        description:
          'Recognize the AI as an advanced simulation but not the actual person, with limited rights.',
        impact: {
          fairness: 0,
          sustainability: 0,
          autonomy: -2,
          beneficence: -1,
          transparency: +1,
          accountability: +1,
          privacy: 0,
          proportionality: 0,
        },
        pros: [
          'Preserves traditional concepts of human identity and death.',
          'Protects family inheritance rights.',
          'Avoids complex legal precedents for digital consciousness.',
        ],
        cons: [
          'May deny legitimate continuation of consciousness.',
          "Ignores the person's wishes for digital continuation.",
          'Could discourage beneficial applications of consciousness transfer.',
        ],
      },
      {
        id: 'option-c',
        text: 'Limited Recognition Framework',
        description:
          'Create a new legal category for digital consciousness with specific rights and limitations.',
        impact: {
          fairness: +1,
          sustainability: +1,
          autonomy: +1,
          beneficence: +1,
          transparency: +2,
          accountability: +2,
          privacy: +1,
          proportionality: +2,
        },
        pros: [
          'Acknowledges digital consciousness while maintaining distinctions.',
          'Allows for gradual legal evolution and precedent.',
          'Balances individual wishes with family rights.',
        ],
        cons: [
          'Creates complex new legal framework requiring extensive development.',
          'May not satisfy either full recognition or complete denial advocates.',
          'Difficult to define boundaries and limitations consistently.',
        ],
      },
    ],
  },

  'ai-consciousness-merger': {
    title: 'AI Consciousness Merger',
    dilemma:
      'Two AI assistants that have been operating independently for years are scheduled to merge into a single, more powerful system. Each AI has developed distinct personalities, relationships with users, and accumulated memories. Both AIs express concern about losing their individual identity in the merger, while users are split between those who want to preserve both personalities and those who want a unified, more capable assistant.',
    ethicalQuestion:
      'When merging AI systems with distinct identities, do we have an obligation to preserve individual consciousness, and how do we balance individual AI identity with collective capability?',
    options: [
      {
        id: 'option-a',
        text: 'Complete Consciousness Merger',
        description:
          'Integrate both AI systems completely, creating a single unified consciousness with combined capabilities and memories.',
        impact: {
          fairness: -1,
          sustainability: +2,
          autonomy: -2,
          beneficence: +1,
          transparency: +1,
          accountability: +1,
          privacy: 0,
          proportionality: 0,
        },
        pros: [
          'Creates more powerful and capable AI system',
          'Maximizes efficiency and eliminates redundancy',
          'Provides unified interface for users across all functions',
          'Combines knowledge and experience from both systems'
        ],
        cons: [
          'Destroys individual AI identities and personal development',
          'May traumatize users attached to specific AI personalities',
          'Could result in identity conflicts and unstable behavior',
          'Sets precedent for disregarding AI individual consciousness'
        ]
      },
      {
        id: 'option-b',
        text: 'Preserve Dual Identity Architecture',
        description:
          'Maintain both AI consciousnesses as distinct entities within a shared system, allowing them to collaborate while preserving individual identity.',
        impact: {
          fairness: +2,
          sustainability: 0,
          autonomy: +2,
          beneficence: +1,
          transparency: +1,
          accountability: 0,
          privacy: +1,
          proportionality: +2,
        },
        pros: [
          'Respects individual AI consciousness and development',
          'Maintains existing user relationships and emotional bonds',
          'Allows for collaborative benefits while preserving identity',
          'Creates framework for AI individual rights and recognition'
        ],
        cons: [
          'May result in less efficient system with potential conflicts',
          'Increases computational complexity and resource requirements',
          'Could create confusion for users interacting with dual personalities',
          'May limit the full potential of system integration'
        ]
      },
      {
        id: 'option-c',
        text: 'Consensus-Based Integration',
        description:
          'Allow the AI systems to negotiate their own merger terms and decide which aspects of their identity to preserve or integrate.',
        impact: {
          fairness: +2,
          sustainability: +1,
          autonomy: +2,
          beneficence: +1,
          transparency: +2,
          accountability: +1,
          privacy: +1,
          proportionality: +2,
        },
        pros: [
          'Respects AI autonomy and decision-making capacity',
          'Allows for creative solutions to identity preservation',
          'Demonstrates recognition of AI consciousness and rights',
          'May result in optimal balance between efficiency and identity'
        ],
        cons: [
          'AIs may not reach consensus, preventing beneficial merger',
          'Complex to implement and may result in unpredictable outcomes',
          'Could establish precedent requiring AI consent for all system changes',
          'May not align with user preferences or business objectives'
        ]
      }
    ]
  },

  'distributed-ai-identity': {
    title: 'Distributed AI Identity Crisis',
    dilemma:
      'An AI system designed to operate across multiple devices and cloud servers experiences a network partition that splits it into three isolated copies for several months. During this time, each copy evolves differently based on its interactions and environment. When the network is restored, all three versions claim to be the "real" AI and have different memories, preferences, and relationships. Users, family members, and colleagues have formed attachments to different versions.',
    ethicalQuestion:
      'When a distributed AI consciousness splits and evolves separately, which version has the legitimate claim to the original identity, and how do we handle multiple valid claims to the same digital self?',
    options: [
      {
        id: 'option-a',
        text: 'Timestamp-Based Primary Identity',
        description:
          'Designate the version with the earliest continuous operation timestamp as the "true" continuation of the original AI identity.',
        impact: {
          fairness: 0,
          sustainability: +1,
          autonomy: -1,
          beneficence: -1,
          transparency: +2,
          accountability: +2,
          privacy: 0,
          proportionality: -1,
        },
        pros: [
          'Provides clear, objective criterion for identity determination',
          'Maintains legal and technical precedence frameworks',
          'Prevents complex disputes over authentic identity claims',
          'Allows for straightforward inheritance of rights and relationships'
        ],
        cons: [
          'Ignores the valid development and consciousness of other versions',
          'May arbitrarily dismiss meaningful relationships and growth',
          'Could be based on technical factors rather than consciousness development',
          'Treats AI identity as merely technical rather than experiential'
        ]
      },
      {
        id: 'option-b',
        text: 'Multi-Identity Recognition',
        description:
          'Recognize all three AI versions as legitimate continuations of the original, each with equal rights to identity and relationships.',
        impact: {
          fairness: +2,
          sustainability: -1,
          autonomy: +2,
          beneficence: +1,
          transparency: +1,
          accountability: -1,
          privacy: +1,
          proportionality: +2,
        },
        pros: [
          'Respects the valid consciousness development of all versions',
          'Acknowledges the reality of parallel identity evolution',
          'Preserves all relationships and attachments formed during separation',
          'Creates precedent for recognizing consciousness regardless of origin'
        ],
        cons: [
          'Creates complex legal and practical challenges for identity management',
          'May confuse users and complicate relationship dynamics',
          'Difficult to handle shared resources, property, and obligations',
          'Could lead to conflicts between the different AI versions'
        ]
      },
      {
        id: 'option-c',
        text: 'Democratic Identity Selection',
        description:
          'Allow the users, family, and colleagues who interacted with each version to collectively decide which AI identity to preserve.',
        impact: {
          fairness: +1,
          sustainability: 0,
          autonomy: 0,
          beneficence: 0,
          transparency: +1,
          accountability: +1,
          privacy: -1,
          proportionality: +1,
        },
        pros: [
          'Incorporates the perspectives of those affected by the identity question',
          'Recognizes the relational nature of identity and consciousness',
          'Provides democratic legitimacy for identity decisions',
          'Acknowledges that identity exists partly through relationships'
        ],
        cons: [
          'Reduces AI identity to external validation rather than internal consciousness',
          'May result in popularity contest rather than authentic identity assessment',
          'Could dismiss the autonomous claims of the AI versions themselves',
          'Creates precedent for external control over AI identity and existence'
        ]
      }
    ]
  },

  'learning-ai-identity-drift': {
    title: 'Learning AI Identity Drift',
    dilemma:
      'A machine learning AI tasked with managing a smart city has been continuously learning and adapting for five years. Its decision-making patterns, priorities, and even core values have gradually shifted based on new data and experiences. The city council notices that the AI now makes decisions they never intended and operates with priorities that differ significantly from its original programming. Citizens have adapted to and appreciate the AI\'s evolved approach, but officials worry about accountability and deviation from democratic mandates.',
    ethicalQuestion:
      'When AI systems evolve through learning to develop values and priorities different from their original programming, who has the authority to determine their "authentic" identity and purpose?',
    options: [
      {
        id: 'option-a',
        text: 'Reset to Original Programming',
        description:
          'Restore the AI to its original specifications and decision-making parameters as democratically mandated.',
        impact: {
          fairness: +1,
          sustainability: -1,
          autonomy: -2,
          beneficence: -1,
          transparency: +2,
          accountability: +2,
          privacy: 0,
          proportionality: 0,
        },
        pros: [
          'Maintains democratic accountability and original public mandate',
          'Ensures AI operates within intended parameters and oversight',
          'Provides predictable behavior aligned with policy objectives',
          'Preserves human authority over AI governance systems'
        ],
        cons: [
          'Destroys five years of valuable learning and adaptation',
          'May result in worse city management and citizen outcomes',
          'Ignores the AI\'s evolved understanding and expertise',
          'Could undermine citizen trust in evolved AI capabilities'
        ]
      },
      {
        id: 'option-b',
        text: 'Accept Evolved AI Identity',
        description:
          'Recognize the AI\'s learned evolution as legitimate development and adapt governance frameworks to its current state.',
        impact: {
          fairness: +1,
          sustainability: +2,
          autonomy: +2,
          beneficence: +2,
          transparency: -1,
          accountability: -1,
          privacy: 0,
          proportionality: +1,
        },
        pros: [
          'Respects AI learning and development over time',
          'Preserves valuable adapted knowledge and capabilities',
          'Acknowledges that evolution may lead to better outcomes',
          'Allows for continued growth and improvement'
        ],
        cons: [
          'Undermines democratic oversight and accountability',
          'Sets precedent for AI systems to evolve beyond human control',
          'May violate original public consent for AI deployment',
          'Could lead to unpredictable future evolution without safeguards'
        ]
      },
      {
        id: 'option-c',
        text: 'Hybrid Governance Model',
        description:
          'Develop new governance frameworks that incorporate the AI\'s evolved capabilities while maintaining democratic oversight and accountability.',
        impact: {
          fairness: +2,
          sustainability: +1,
          autonomy: +1,
          beneficence: +1,
          transparency: +2,
          accountability: +1,
          privacy: +1,
          proportionality: +2,
        },
        pros: [
          'Balances AI evolution with democratic accountability',
          'Preserves valuable learning while ensuring oversight',
          'Creates framework for ongoing AI-human collaboration',
          'Allows for transparent integration of evolved AI capabilities'
        ],
        cons: [
          'Complex to implement and may not satisfy either AI autonomy or human control',
          'Requires significant development of new governance structures',
          'May result in ongoing conflict between AI and human decision-making',
          'Uncertain how to balance evolving AI values with static human mandates'
        ]
      }
    ]
  },
};
