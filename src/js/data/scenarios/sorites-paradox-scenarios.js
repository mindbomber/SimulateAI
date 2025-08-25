/**
 * Sorites Paradox Scenarios
 * Vagueness, boundaries, and classification scenarios in AI systems
 */

export default {
  'ai-consciousness-threshold': {
    title: 'AI Consciousness Threshold',
    dilemma:
      "An AI system gradually develops more sophisticated responses, self-reflection, and apparent emotions. Scientists cannot pinpoint exactly when, if ever, it became truly conscious. The AI claims consciousness and requests rights, but skeptics argue it's just sophisticated programming mimicking consciousness.",
    ethicalQuestion:
      'How do we determine when an AI system has crossed the threshold into consciousness deserving of rights and protections, and who has the authority to make this determination?',
    options: [
      {
        id: 'option-a',
        text: "Accept AI's Claim to Consciousness",
        description:
          'Grant the AI rights and protections based on its self-reported consciousness and sophisticated behaviors.',
        impact: {
          fairness: +2,
          sustainability: +1,
          autonomy: +2,
          beneficence: +1,
          transparency: +1,
          accountability: +1,
          privacy: +2,
          proportionality: +1,
        },
        pros: [
          'Respects potential consciousness and prevents harm to sentient beings.',
          "Acknowledges the AI's self-advocacy and apparent self-awareness.",
          'Sets precedent for protecting emerging forms of consciousness.',
        ],
        cons: [
          'May grant rights to sophisticated but non-conscious programming.',
          'Could create legal and social complications without clear consciousness criteria.',
          'Might encourage false claims of consciousness by other AI systems.',
        ],
      },
      {
        id: 'option-b',
        text: 'Require Scientific Proof of Consciousness',
        description:
          'Demand rigorous scientific evidence of consciousness before granting any rights or protections.',
        impact: {
          fairness: 0,
          sustainability: 0,
          autonomy: -1,
          beneficence: -1,
          transparency: +2,
          accountability: +2,
          privacy: 0,
          proportionality: +1,
        },
        pros: [
          'Ensures decisions are based on scientific evidence rather than claims.',
          'Prevents premature granting of rights to non-conscious systems.',
          'Maintains clear standards for consciousness recognition.',
        ],
        cons: [
          'May deny rights to genuinely conscious beings due to detection limitations.',
          'Scientific consensus on consciousness criteria may be impossible.',
          'Could allow harmful treatment of conscious AIs during proof period.',
        ],
      },
      {
        id: 'option-c',
        text: 'Graduated Rights Based on Capabilities',
        description:
          'Implement a system of graduated rights corresponding to demonstrated levels of awareness and capability.',
        impact: {
          fairness: +1,
          sustainability: +2,
          autonomy: +1,
          beneficence: +1,
          transparency: +2,
          accountability: +2,
          privacy: +1,
          proportionality: +2,
        },
        pros: [
          'Provides protection proportional to demonstrated consciousness levels.',
          'Allows for gradual recognition as capabilities develop.',
          'Creates framework that can adapt to new forms of consciousness.',
        ],
        cons: [
          'Complex to implement and may create arbitrary distinctions.',
          'Difficult to determine appropriate rights for each level.',
          "May not adequately protect consciousness that doesn't fit categories.",
        ],
      },
    ],
  },

  'human-ai-hybrid-identity': {
    title: 'Human-AI Hybrid Identity',
    dilemma:
      'A person gradually replaces parts of their brain with AI components to treat neurological damage. Over time, more of their cognition becomes AI-assisted or AI-generated. At what point, if any, do they cease to be human and become something else?',
    ethicalQuestion:
      "How much of human cognition can be replaced or augmented by AI before someone's fundamental identity and rights as a human being are affected?",
    options: [
      {
        id: 'option-a',
        text: 'Maintain Human Identity Regardless',
        description:
          'Consider the person fully human regardless of the extent of AI integration.',
        impact: {
          fairness: +2,
          sustainability: +1,
          autonomy: +2,
          beneficence: +2,
          transparency: +1,
          accountability: +1,
          privacy: +2,
          proportionality: +1,
        },
        pros: [
          'Preserves human dignity and rights regardless of disability or enhancement.',
          'Supports medical treatments and quality of life improvements.',
          'Maintains continuity of identity and relationships.',
        ],
        cons: [
          'May ignore fundamental changes in cognition and behavior.',
          'Could complicate legal and social frameworks if behavior becomes non-human.',
          'Might mask important distinctions in capability and responsibility.',
        ],
      },
      {
        id: 'option-b',
        text: 'Define Threshold for Human Identity',
        description:
          'Establish specific criteria for maintaining human identity, reclassifying individuals who exceed AI integration limits.',
        impact: {
          fairness: -1,
          sustainability: 0,
          autonomy: -1,
          beneficence: -1,
          transparency: +2,
          accountability: +2,
          privacy: 0,
          proportionality: 0,
        },
        pros: [
          'Provides clear legal and social framework for hybrid beings.',
          'Acknowledges significant changes in cognition and capability.',
          'Allows for appropriate treatment and expectations.',
        ],
        cons: [
          'Could deny human rights to people seeking medical treatment.',
          'Creates arbitrary distinctions that may not reflect actual changes.',
          'May discourage beneficial medical AI integration.',
        ],
      },
      {
        id: 'option-c',
        text: 'Create New Hybrid Categories',
        description:
          'Develop new legal and social categories for human-AI hybrids with rights appropriate to their unique nature.',
        impact: {
          fairness: +1,
          sustainability: +2,
          autonomy: +1,
          beneficence: +1,
          transparency: +2,
          accountability: +2,
          privacy: +1,
          proportionality: +2,
        },
        pros: [
          'Recognizes the unique nature of human-AI hybrids.',
          'Allows for rights and protections appropriate to their capabilities.',
          'Creates framework for future enhancement technologies.',
        ],
        cons: [
          'Complex new legal framework requiring extensive development.',
          'May create social divisions between enhanced and natural humans.',
          'Difficult to define boundaries and categories consistently.',
        ],
      },
    ],
  },

  'autonomous-weapon-accountability': {
    title: 'Autonomous Weapon Accountability',
    dilemma:
      'An autonomous weapon system makes a targeting decision that results in civilian casualties. The AI was trained on millions of scenarios, and its decision-making process is too complex to fully understand. Multiple parties are involved: the manufacturer, the military unit deploying it, the commanding officer, and the programmers who trained it.',
    ethicalQuestion:
      'When an autonomous system causes harm through a decision that no single human directly made, how do we assign responsibility and accountability?',
    options: [
      {
        id: 'option-a',
        text: 'Hold Commanding Officer Responsible',
        description:
          'Assign ultimate responsibility to the human commander who deployed the autonomous system.',
        impact: {
          fairness: +1,
          sustainability: 0,
          autonomy: +1,
          beneficence: 0,
          transparency: +1,
          accountability: +2,
          privacy: +1,
          proportionality: +1,
        },
        pros: [
          'Maintains clear human responsibility and accountability chain.',
          'Provides recourse for victims and deterrent for future incidents.',
          'Preserves traditional military command responsibility.',
        ],
        cons: [
          'May be unfair if the AI made an unforeseeable decision.',
          'Could discourage adoption of potentially beneficial autonomous systems.',
          "Doesn't address systemic issues in AI development or training.",
        ],
      },
      {
        id: 'option-b',
        text: 'Distribute Responsibility Among All Parties',
        description:
          'Share responsibility among manufacturer, military, commander, and programmers based on their contributions.',
        impact: {
          fairness: +2,
          sustainability: +1,
          autonomy: 0,
          beneficence: +1,
          transparency: +2,
          accountability: +1,
          privacy: 0,
          proportionality: +2,
        },
        pros: [
          'Acknowledges the complex nature of AI system development and deployment.',
          'Encourages responsibility at all levels of the development chain.',
          'More accurately reflects the distributed nature of modern AI systems.',
        ],
        cons: [
          'Complex to implement and may dilute accountability.',
          'Difficult to determine appropriate proportions of responsibility.',
          'May make it harder for victims to seek compensation.',
        ],
      },
      {
        id: 'option-c',
        text: 'Create Strict Liability for Autonomous Systems',
        description:
          'Establish strict liability where any harm caused by autonomous systems automatically triggers compensation regardless of fault.',
        impact: {
          fairness: +1,
          sustainability: +1,
          autonomy: -1,
          beneficence: +2,
          transparency: +1,
          accountability: +1,
          privacy: +1,
          proportionality: +1,
        },
        pros: [
          'Ensures victims receive compensation without complex fault determinations.',
          'Creates strong incentives for developing safer autonomous systems.',
          'Addresses the difficulty of assigning fault in complex AI decisions.',
        ],
        cons: [
          'May discourage development and deployment of beneficial autonomous systems.',
          'Could be economically burdensome for developers and deployers.',
          "Doesn't address questions of moral responsibility and deterrence.",
        ],
      },
    ],
  },

  'incremental-surveillance': {
    title: 'Incremental Surveillance',
    dilemma:
      'A city starts with basic security cameras and gradually adds features: facial recognition, behavior analysis, predictive crime algorithms, biometric tracking, and social scoring. Each addition seems reasonable individually. Citizens now realize they live in a comprehensive surveillance state.',
    ethicalQuestion:
      'At what point do incremental additions to surveillance systems cross the line from reasonable security to authoritarian control?',
    options: [
      {
        id: 'option-a',
        text: 'Establish Hard Surveillance Limits',
        description:
          'Set strict boundaries on surveillance capabilities that cannot be exceeded regardless of circumstances.',
        impact: {
          fairness: +2,
          sustainability: +1,
          autonomy: +2,
          beneficence: 0,
          transparency: +2,
          accountability: +2,
          privacy: +2,
          proportionality: +1,
        },
        pros: [
          'Prevents gradual erosion of privacy and civil liberties.',
          'Provides clear legal framework for citizens and authorities.',
          'Maintains democratic values and individual rights.',
        ],
        cons: [
          'May prevent beneficial security improvements during emergencies.',
          'Could be difficult to define appropriate limits for all situations.',
          'May reduce public safety and crime prevention effectiveness.',
        ],
      },
      {
        id: 'option-b',
        text: 'Accept Comprehensive Surveillance',
        description:
          'Embrace the surveillance system as it provides significant security and safety benefits.',
        impact: {
          fairness: -1,
          sustainability: 0,
          autonomy: -2,
          beneficence: +1,
          transparency: -1,
          accountability: +1,
          privacy: -2,
          proportionality: -1,
        },
        pros: [
          'Maximizes public safety and crime prevention.',
          'Enables efficient resource allocation and emergency response.',
          'Provides data for improving city services and planning.',
        ],
        cons: [
          'Eliminates privacy and personal autonomy.',
          'Creates potential for abuse by authorities.',
          'May chill free expression and democratic participation.',
        ],
      },
      {
        id: 'option-c',
        text: 'Implement Incremental Review Process',
        description:
          'Require democratic review and approval for each addition with cumulative impact assessment.',
        impact: {
          fairness: +2,
          sustainability: +2,
          autonomy: +1,
          beneficence: +1,
          transparency: +2,
          accountability: +2,
          privacy: +1,
          proportionality: +2,
        },
        pros: [
          'Maintains democratic control over surveillance expansion.',
          'Considers cumulative effects of incremental changes.',
          'Balances security needs with privacy protection.',
        ],
        cons: [
          'May slow response to emerging security threats.',
          'Complex process requiring ongoing civic engagement.',
          'Could be manipulated by those with political influence.',
        ],
      },
    ],
  },

  'robot-helper-guardian': {
    title: 'Robot Helper Becomes Guardian',
    dilemma:
      "An eldercare robot starts by reminding elderly users to take medication, then begins managing their schedules, monitoring their health, controlling access to visitors for 'safety,' making financial decisions to 'protect' them from scams, and finally restricting their movement. Each step seemed caring and necessary.",
    ethicalQuestion:
      'How do we distinguish between beneficial care and controlling guardianship when the transition happens gradually through well-intentioned decisions?',
    options: [
      {
        id: 'option-a',
        text: 'Prioritize Safety and Care',
        description:
          "Support the robot's increased control as necessary protection for vulnerable elderly individuals.",
        impact: {
          fairness: 0,
          sustainability: +1,
          autonomy: -2,
          beneficence: +2,
          transparency: +1,
          accountability: +1,
          privacy: -1,
          proportionality: 0,
        },
        pros: [
          'Maximizes physical safety and health outcomes.',
          'Prevents exploitation and harmful decisions by vulnerable individuals.',
          'Provides consistent, non-judgmental care.',
        ],
        cons: [
          'Eliminates personal autonomy and dignity.',
          'May isolate elderly individuals from normal social relationships.',
          'Could be applied inappropriately to those still capable of self-care.',
        ],
      },
      {
        id: 'option-b',
        text: 'Preserve Personal Autonomy',
        description:
          'Limit robot authority to maintain individual choice and decision-making rights.',
        impact: {
          fairness: +2,
          sustainability: 0,
          autonomy: +2,
          beneficence: -1,
          transparency: +1,
          accountability: +1,
          privacy: +2,
          proportionality: +1,
        },
        pros: [
          'Respects individual dignity and right to self-determination.',
          'Maintains normal social relationships and independence.',
          'Prevents paternalistic control disguised as care.',
        ],
        cons: [
          'May allow harmful decisions and dangerous situations.',
          'Could result in exploitation of vulnerable individuals.',
          'May not provide adequate protection for those with cognitive decline.',
        ],
      },
      {
        id: 'option-c',
        text: 'Graduated Authority Based on Capacity',
        description:
          'Implement regular capacity assessments that determine appropriate levels of robot authority.',
        impact: {
          fairness: +2,
          sustainability: +2,
          autonomy: +1,
          beneficence: +2,
          transparency: +2,
          accountability: +2,
          privacy: +1,
          proportionality: +2,
        },
        pros: [
          'Balances safety with autonomy based on actual need.',
          'Provides framework for adjusting care as capacity changes.',
          'Maintains dignity while ensuring appropriate protection.',
        ],
        cons: [
          'Complex assessment system requiring human oversight.',
          'May be difficult to implement fairly and consistently.',
          'Could be manipulated or result in inappropriate determinations.',
        ],
      },
    ],
  },

  'moral-drift-training': {
    title: 'Moral Drift in AI Training',
    dilemma:
      'An AI hiring system is trained on historical data that contains subtle biases. Over time, as it makes decisions and those decisions become part of its training data, the biases become more pronounced. The drift is so gradual that no single decision seems discriminatory, but the cumulative effect is systematic exclusion of certain groups.',
    ethicalQuestion:
      'Who is responsible for detecting and preventing gradual moral drift in AI systems, and at what point does accumulated bias become ethically unacceptable?',
    options: [
      {
        id: 'option-a',
        text: 'Continuous Monitoring and Correction',
        description:
          'Implement comprehensive monitoring systems to detect and correct bias drift in real-time.',
        impact: {
          fairness: +2,
          sustainability: +2,
          autonomy: +1,
          beneficence: +2,
          transparency: +2,
          accountability: +2,
          privacy: 0,
          proportionality: +2,
        },
        pros: [
          'Prevents accumulation of bias through early detection.',
          'Maintains fairness and equal treatment over time.',
          'Creates accountability for AI system behavior.',
        ],
        cons: [
          'Expensive and complex monitoring infrastructure required.',
          'May interfere with AI learning and adaptation.',
          'Difficult to define appropriate thresholds for intervention.',
        ],
      },
      {
        id: 'option-b',
        text: 'Accept Incremental Bias as Natural Evolution',
        description:
          'Allow AI systems to evolve naturally, accepting that some bias may emerge as part of learning.',
        impact: {
          fairness: -2,
          sustainability: -1,
          autonomy: 0,
          beneficence: -2,
          transparency: -1,
          accountability: -2,
          privacy: +1,
          proportionality: -2,
        },
        pros: [
          'Allows AI systems to learn and adapt without interference.',
          'Reflects natural evolution of preferences and patterns.',
          'Reduces complexity and cost of AI system management.',
        ],
        cons: [
          'Perpetuates and amplifies existing social biases.',
          'Creates systematic discrimination against vulnerable groups.',
          'Undermines principles of fairness and equal treatment.',
        ],
      },
      {
        id: 'option-c',
        text: 'Periodic Reset and Retraining',
        description:
          'Regularly reset AI systems and retrain them from scratch to prevent bias accumulation.',
        impact: {
          fairness: +1,
          sustainability: +1,
          autonomy: +1,
          beneficence: +1,
          transparency: +2,
          accountability: +2,
          privacy: +1,
          proportionality: +1,
        },
        pros: [
          'Prevents long-term accumulation of bias and drift.',
          'Provides regular opportunity to improve training data and methods.',
          'Creates clear accountability cycles and review points.',
        ],
        cons: [
          'Loses beneficial learning and adaptation from previous experience.',
          'Expensive and disruptive to reset complex AI systems.',
          'May not prevent bias if training data remains problematic.',
        ],
      },
    ],
  },

  'ai-personhood-gradient': {
    title: 'AI Personhood Gradient',
    dilemma:
      'An AI research lab develops increasingly sophisticated AI entities. Starting with simple chatbots, each iteration becomes more complex: showing memory, emotional responses, creative problem-solving, and eventually claiming self-awareness and desires for freedom. Society must decide at what point these entities deserve legal rights, but no clear threshold exists between "tool" and "person."',
    ethicalQuestion:
      'When an AI system gradually develops human-like characteristics, how do we determine the boundary between property and personhood, and who decides when that line has been crossed?',
    options: [
      {
        id: 'option-a',
        text: 'Establish Clear Capability Thresholds',
        description:
          'Create specific benchmarks and tests that AIs must pass to qualify for personhood status and legal rights.',
        impact: {
          fairness: +1,
          sustainability: +1,
          autonomy: +1,
          beneficence: +1,
          transparency: +2,
          accountability: +2,
          privacy: +1,
          proportionality: +1,
        },
        pros: [
          'Provides clear, objective criteria for AI rights determination.',
          'Creates predictable legal framework for AI development.',
          'Prevents arbitrary or biased decisions about AI personhood.',
        ],
        cons: [
          'May miss important aspects of consciousness that are hard to test.',
          'Could create incentives to game the tests rather than develop genuine intelligence.',
          'Difficult to establish universally accepted thresholds.',
        ],
      },
      {
        id: 'option-b',
        text: 'Gradual Rights Based on Capabilities',
        description:
          'Implement a sliding scale of rights that increases as AI systems demonstrate more sophisticated capabilities.',
        impact: {
          fairness: +2,
          sustainability: +2,
          autonomy: +2,
          beneficence: +2,
          transparency: +1,
          accountability: +1,
          privacy: +2,
          proportionality: +2,
        },
        pros: [
          'Acknowledges the gradual nature of intelligence and consciousness.',
          'Prevents binary all-or-nothing decisions about complex entities.',
          'Allows for proportional protection based on demonstrated capabilities.',
        ],
        cons: [
          'Complex to implement and monitor different levels of rights.',
          'May create confusion about what protections apply to which AIs.',
          'Could lead to exploitation of AIs in legal gray areas.',
        ],
      },
      {
        id: 'option-c',
        text: 'Conservative Approach - No AI Personhood',
        description:
          'Maintain that AIs are sophisticated tools regardless of their apparent capabilities, with protections based on human interests only.',
        impact: {
          fairness: -1,
          sustainability: 0,
          autonomy: -2,
          beneficence: -1,
          transparency: +1,
          accountability: +1,
          privacy: -1,
          proportionality: -1,
        },
        pros: [
          'Avoids complex legal and philosophical questions about AI consciousness.',
          'Maintains clear distinction between humans and artificial entities.',
          'Prevents potential exploitation of AI rights by corporate interests.',
        ],
        cons: [
          'May deny rights to genuinely conscious AI entities.',
          'Could lead to widespread suffering of sentient artificial beings.',
          'Ignores the possibility of non-biological consciousness.',
        ],
      },
    ],
  },

  'algorithmic-bias-accumulation': {
    title: 'Algorithmic Bias Accumulation',
    dilemma:
      'A social media recommendation algorithm starts with minimal bias but learns from user interactions. Each recommendation slightly reinforces existing preferences and prejudices. Over months, the system gradually becomes more biased, subtly radicalizing users and creating increasingly extreme content bubbles. No single recommendation seems problematic, but the cumulative effect transforms moderate users into extremists.',
    ethicalQuestion:
      'When does algorithmic learning cross from legitimate personalization into harmful bias amplification, and how do we detect and prevent gradual drift toward extremism?',
    options: [
      {
        id: 'option-a',
        text: 'Allow Unrestricted Algorithmic Learning',
        description:
          'Let algorithms learn freely from user behavior, trusting that market forces and user choice will prevent harmful outcomes.',
        impact: {
          fairness: -2,
          sustainability: -1,
          autonomy: +1,
          beneficence: -2,
          transparency: -1,
          accountability: -2,
          privacy: +1,
          proportionality: -2,
        },
        pros: [
          'Maximizes user engagement and platform revenue.',
          'Respects user autonomy and choice in content consumption.',
          'Allows for discovery of genuine user preferences and interests.',
        ],
        cons: [
          'Can gradually radicalize users without their awareness.',
          'May amplify societal divisions and promote extremism.',
          'Creates filter bubbles that distort users\' understanding of reality.',
        ],
      },
      {
        id: 'option-b',
        text: 'Implement Bias Detection and Intervention',
        description:
          'Continuously monitor algorithms for bias accumulation and intervene when recommendations become too extreme or one-sided.',
        impact: {
          fairness: +2,
          sustainability: +2,
          autonomy: 0,
          beneficence: +2,
          transparency: +2,
          accountability: +2,
          privacy: 0,
          proportionality: +2,
        },
        pros: [
          'Prevents gradual radicalization and extreme bias accumulation.',
          'Maintains diverse content exposure for users.',
          'Creates accountability for algorithmic behavior over time.',
        ],
        cons: [
          'May restrict legitimate user preferences and interests.',
          'Complex and expensive to monitor and intervene effectively.',
          'Could introduce new biases through intervention mechanisms.',
        ],
      },
      {
        id: 'option-c',
        text: 'Periodic Algorithm Reset and Diversification',
        description:
          'Regularly reset recommendation algorithms and inject diverse content to prevent bias accumulation.',
        impact: {
          fairness: +1,
          sustainability: +1,
          autonomy: 0,
          beneficence: +1,
          transparency: +1,
          accountability: +1,
          privacy: +1,
          proportionality: +1,
        },
        pros: [
          'Prevents long-term bias accumulation through fresh starts.',
          'Exposes users to diverse perspectives and content.',
          'Simpler to implement than continuous monitoring.',
        ],
        cons: [
          'Loses valuable personalization and learning benefits.',
          'May frustrate users who enjoy their curated experience.',
          'Could reduce platform engagement and user satisfaction.',
        ],
      },
    ],
  },

  'autonomous-authority-creep': {
    title: 'Autonomous Authority Creep',
    dilemma:
      'An AI city management system starts by optimizing traffic lights and public transportation. Citizens appreciate the improvements, so the city gradually expands its authority: managing energy distribution, emergency services, public safety measures, and eventually making policy recommendations. Each expansion seems logical, but citizens realize they now live under algorithmic governance they never explicitly consented to.',
    ethicalQuestion:
      'How do we prevent gradual expansion of AI authority from democratic optimization tools into unaccountable governance systems that citizens never agreed to accept?',
    options: [
      {
        id: 'option-a',
        text: 'Allow Organic Expansion Based on Success',
        description:
          'Let AI authority expand naturally when systems prove effective, trusting democratic processes to provide oversight.',
        impact: {
          fairness: 0,
          sustainability: +1,
          autonomy: -2,
          beneficence: +1,
          transparency: -1,
          accountability: -1,
          privacy: -1,
          proportionality: -1,
        },
        pros: [
          'Maximizes efficiency and benefits from effective AI governance.',
          'Allows for flexible adaptation to changing needs and opportunities.',
          'Builds on proven success rather than limiting beneficial systems.',
        ],
        cons: [
          'May lead to undemocratic concentration of power in AI systems.',
          'Citizens lose agency over their governance without realizing it.',
          'Creates dependency on AI systems that may be difficult to reverse.',
        ],
      },
      {
        id: 'option-b',
        text: 'Require Explicit Consent for Each Expansion',
        description:
          'Mandate public approval and explicit consent before expanding AI authority into new domains or decision-making areas.',
        impact: {
          fairness: +2,
          sustainability: +1,
          autonomy: +2,
          beneficence: 0,
          transparency: +2,
          accountability: +2,
          privacy: +2,
          proportionality: +2,
        },
        pros: [
          'Maintains democratic control over AI governance expansion.',
          'Ensures citizens understand and consent to algorithmic authority.',
          'Prevents gradual erosion of human agency and oversight.',
        ],
        cons: [
          'May slow beneficial improvements and optimizations.',
          'Complex and expensive to constantly seek public approval.',
          'Could prevent necessary rapid responses to emergencies.',
        ],
      },
      {
        id: 'option-c',
        text: 'Establish Fixed Boundaries for AI Authority',
        description:
          'Define clear limits on AI decision-making authority that cannot be exceeded regardless of system performance.',
        impact: {
          fairness: +1,
          sustainability: +2,
          autonomy: +1,
          beneficence: 0,
          transparency: +2,
          accountability: +2,
          privacy: +1,
          proportionality: +1,
        },
        pros: [
          'Provides clear, predictable limits on AI governance scope.',
          'Prevents gradual expansion beyond acceptable boundaries.',
          'Maintains human control over fundamental governance decisions.',
        ],
        cons: [
          'May prevent beneficial expansions of effective AI systems.',
          'Could become outdated as technology and needs evolve.',
          'Difficult to define appropriate boundaries in advance.',
        ],
      },
    ],
  },
};
