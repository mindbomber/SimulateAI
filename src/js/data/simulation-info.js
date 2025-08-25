/**
 * Simulation Information Database
 * Educational context, learning objectives, and resources for each simulation
 */

export const SIMULATION_INFO = {
  'bias-fairness': {
    id: 'bias-fairness',
    title: 'Algorithmic Bias in Hiring',
    subtitle:
      'Explore how bias enters AI hiring systems and its impact on fairness',

    // Educational Context
    learningObjectives: [
      'Understand how bias can enter AI systems through data and design choices',
      'Explore consequences of biased algorithms on different demographic groups',
      'Discover multiple perspectives on what constitutes "fair" AI systems',
      'Practice ethical decision-making in AI development scenarios',
    ],

    isteCriteria: [
      'Empowered Learner 1.1.5: Use technology to seek feedback and make improvements',
      'Digital Citizen 1.2.2: Engage in positive, safe, legal and ethical behavior',
      'Knowledge Constructor 1.3.1: Plan and employ effective research strategies',
      'Computational Thinker 1.5.3: Collect data and identify patterns',
    ],

    duration: '15-20 minutes',
    difficulty: 'intermediate',
    recommendedAge: '13+',
    prerequisites: [
      'Basic understanding of algorithms and AI',
      'Awareness of workplace hiring processes',
      'Understanding of demographics and diversity concepts',
    ],

    // Pre-Launch Information
    beforeYouStart: {
      briefing: `In this simulation, you'll step into the role of an AI system designer creating a hiring algorithm for a technology company. You'll make decisions about data sources, algorithm design, and fairness metrics while observing how these choices affect different groups of job candidates.
      
      There are no "correct" answers - instead, you'll discover the complex trade-offs involved in building fair AI systems and see how different stakeholders might view the same outcomes differently.`,

      vocabulary: [
        {
          term: 'Algorithm',
          definition:
            'A set of rules or instructions for solving a problem or completing a task',
        },
        {
          term: 'Bias',
          definition:
            'Systematic unfairness that favors or discriminates against certain groups',
        },
        {
          term: 'Fairness Metrics',
          definition:
            'Mathematical measures used to evaluate whether an AI system treats different groups equitably',
        },
        {
          term: 'Training Data',
          definition:
            'Historical information used to teach an AI system how to make decisions',
        },
        {
          term: 'Demographics',
          definition:
            'Statistical characteristics of populations, such as age, gender, race, or education level',
        },
      ],

      preparationTips: [
        'Consider what makes a hiring process "fair" from different perspectives',
        'Think about how historical data might reflect past biases',
        'Be prepared to make difficult trade-offs between competing values',
        'Pay attention to how your decisions affect different groups of people',
      ],

      scenarioOverview:
        "You will design a hiring algorithm by choosing data sources, setting algorithm parameters, and defining fairness criteria. As you make decisions, you'll see their impact on hiring outcomes for different demographic groups and receive feedback from various stakeholders.",
    },

    // Educator Resources
    educatorResources: {
      discussionQuestions: [
        'What factors should be considered when designing AI systems for hiring?',
        'How can historical data perpetuate existing biases in new AI systems?',
        'What are the trade-offs between different definitions of fairness?',
        'How might different stakeholders (employers, job seekers, society) view the same AI decision differently?',
        'What responsibilities do AI developers have to ensure fair outcomes?',
      ],

      assessmentRubric: {
        'Ethical Reasoning': [
          'Novice: Makes decisions without considering ethical implications',
          'Developing: Shows awareness of ethical issues but analysis is superficial',
          'Proficient: Demonstrates thoughtful consideration of multiple ethical perspectives',
          'Advanced: Articulates complex ethical trade-offs and justifies decisions with clear reasoning',
        ],
        'Systems Thinking': [
          'Novice: Focuses on isolated decisions without seeing connections',
          'Developing: Recognizes some connections between decisions and outcomes',
          'Proficient: Understands how multiple factors interact to produce outcomes',
          'Advanced: Demonstrates sophisticated understanding of complex system dynamics',
        ],
        'Perspective Taking': [
          'Novice: Considers only one viewpoint',
          'Developing: Acknowledges different perspectives exist',
          'Proficient: Actively considers multiple stakeholder perspectives',
          'Advanced: Synthesizes diverse perspectives into nuanced understanding',
        ],
      },

      extensionActivities: [
        'Research real-world examples of algorithmic bias in hiring (Amazon, etc.)',
        'Interview family members about their experiences with hiring processes',
        'Design a "bias audit" checklist for AI hiring systems',
        'Create a presentation comparing different fairness definitions',
        'Write a letter to a company about responsible AI hiring practices',
      ],

      relatedStandards: [
        'CSTA K-12 Computer Science Standards: 3A-IC-24, 3A-IC-25, 3A-IC-26',
        'Common Core Mathematical Practices: MP.3, MP.4, MP.6',
        'C3 Framework for Social Studies: D2.Civ.1.9-12, D2.Eco.1.9-12',
      ],

      classroomTips: [
        'Encourage students to discuss their decisions with peers before making final choices',
        'Have students document their reasoning for key decisions to review later',
        'Consider running the simulation in small groups to promote discussion',
        'Use the reflection questions to facilitate post-simulation discussions',
      ],
    },

    // Related Resources
    relatedResources: [
      {
        type: 'article',
        title: 'Machine Bias in Criminal Justice',
        description:
          'ProPublica investigation into biased risk assessment algorithms',
        url: 'https://www.propublica.org/article/machine-bias-risk-assessments-in-criminal-sentencing',
        audience: 'educators',
      },
      {
        type: 'video',
        title: 'The Problem with AI Bias',
        description: 'MIT Technology Review explanation of AI bias (8 minutes)',
        url: 'https://www.youtube.com/watch?v=gV0_raKR2UQ',
        audience: 'students',
      },
      {
        type: 'research',
        title: 'Fairness Definitions Explained',
        description:
          'Academic paper on different mathematical definitions of fairness',
        url: 'https://fairmlbook.org/causalinference.html',
        audience: 'educators',
      },
      {
        type: 'interactive',
        title: 'AI Fairness 360 Toolkit',
        description:
          "IBM's open-source toolkit for detecting and mitigating bias",
        url: 'https://aif360.mybluemix.net/',
        audience: 'advanced',
      },
    ],

    // Tags for searching and filtering
    tags: [
      'bias',
      'fairness',
      'hiring',
      'ethics',
      'algorithms',
      'equity',
      'workplace',
    ],

    // Difficulty and content warnings
    contentNotes: [
      'Discusses workplace discrimination and hiring bias',
      'Contains scenarios involving demographic differences',
      'Requires critical thinking about social justice issues',
    ],

    // Learning path connections
    connectedSimulations: [
      'algorithmic-transparency',
      'ai-safety-basics',
      'data-privacy-ethics',
    ],
  },

  'autonomy-oversight': {
    id: 'autonomy-oversight',
    title: 'AI Autonomy & Human Oversight',
    subtitle:
      'Balance AI autonomy with human oversight in critical decision-making',

    // Educational Context
    learningObjectives: [
      'Understand the balance between AI autonomy and human oversight',
      'Explore when human intervention is necessary in AI systems',
      'Discover different levels of AI independence and control',
      'Practice decision-making about AI oversight in various scenarios',
    ],

    isteCriteria: [
      'Empowered Learner 1.1.4: Understand fundamental concepts of technology operations',
      'Digital Citizen 1.2.3: Cultivate and manage digital identity and reputation',
      'Critical Thinker 1.4.3: Curate information from digital resources',
      'Computational Thinker 1.5.1: Formulate problem definitions suited for technology',
    ],

    duration: '12-15 minutes',
    difficulty: 'intermediate',
    recommendedAge: '14+',
    prerequisites: [
      'Basic understanding of AI and automation',
      'Awareness of human decision-making processes',
      'Understanding of responsibility and accountability',
    ],

    // Pre-Launch Information
    beforeYouStart: {
      briefing: `In this simulation, you'll explore the critical balance between AI autonomy and human oversight. You'll face scenarios where you must decide how much independence to give AI systems and when human intervention is necessary.
      
      You'll discover the complexities of maintaining control while leveraging AI capabilities, and see how different levels of oversight affect outcomes, efficiency, and responsibility.`,

      vocabulary: [
        {
          term: 'Autonomy',
          definition:
            'The ability of a system to operate independently without human intervention',
        },
        {
          term: 'Oversight',
          definition:
            'Human supervision and monitoring of AI system operations',
        },
        {
          term: 'Human-in-the-loop',
          definition:
            'AI systems that require human input for certain decisions',
        },
        {
          term: 'Accountability',
          definition:
            'Responsibility for the consequences of AI system actions',
        },
        {
          term: 'Fail-safe',
          definition:
            'Mechanisms that prevent harmful outcomes when systems malfunction',
        },
      ],

      preparationTips: [
        'Consider different types of decisions and their consequences',
        'Think about when you would want a human to be involved',
        'Reflect on responsibility and who should be accountable',
        'Keep an open mind about different oversight approaches',
      ],
    },

    // Learning Outcomes
    afterCompletion: {
      keyTakeaways: [
        'AI autonomy exists on a spectrum from fully manual to fully automated',
        'Different scenarios require different levels of human oversight',
        'Balancing efficiency with safety and accountability is crucial',
        'Human judgment remains important even in advanced AI systems',
      ],

      reflectionQuestions: [
        'When should humans maintain control over AI decisions?',
        'How do you balance AI efficiency with human oversight?',
        'What are the risks of too much or too little AI autonomy?',
        'How do cultural and social factors influence oversight preferences?',
      ],
    },

    // Educational Resources
    educatorResources: {
      discussionGuide: [
        'Debate the pros and cons of AI autonomy in different contexts',
        'Role-play scenarios with different oversight approaches',
        'Compare human vs. AI decision-making capabilities',
        'Discuss real-world examples of AI oversight challenges',
      ],

      classroomActivities: [
        'Design oversight protocols for different AI applications',
        'Create decision trees for when human intervention is needed',
        'Research case studies of AI oversight successes and failures',
        'Debate the future of human-AI collaboration',
      ],

      assessmentIdeas: [
        'Analyze oversight scenarios and justify recommendations',
        'Create presentations on AI autonomy best practices',
        'Write reflection essays on human-AI responsibility',
        'Design ethical guidelines for AI oversight',
      ],
    },
  },

  'consent-transparency': {
    id: 'consent-transparency',
    title: 'AI Consent & Transparency',
    subtitle: 'Explore informed consent and transparency in AI systems',

    // Educational Context
    learningObjectives: [
      'Understand the importance of informed consent in AI systems',
      'Explore transparency requirements for AI decision-making',
      'Discover challenges in communicating AI capabilities and limitations',
      'Practice designing user-friendly consent and disclosure processes',
    ],

    isteCriteria: [
      'Empowered Learner 1.1.3: Use technology to seek feedback',
      'Digital Citizen 1.2.1: Cultivate and manage digital identity',
      'Knowledge Constructor 1.3.4: Build knowledge through exploration',
      'Creative Communicator 1.6.2: Create original works as a means of expression',
    ],

    duration: '8-12 minutes',
    difficulty: 'beginner',
    recommendedAge: '12+',
    prerequisites: [
      'Basic understanding of privacy and consent',
      'Awareness of AI use in everyday applications',
      'Understanding of communication and transparency',
    ],

    // Pre-Launch Information
    beforeYouStart: {
      briefing: `In this simulation, you'll explore how to make AI systems transparent and obtain meaningful consent from users. You'll face challenges in explaining complex AI systems in understandable ways and ensuring users can make informed decisions.
      
      You'll discover the balance between technical accuracy and user comprehension, and see how different approaches to transparency affect user trust and decision-making.`,

      vocabulary: [
        {
          term: 'Informed Consent',
          definition:
            'Agreement based on understanding of what is being consented to',
        },
        {
          term: 'Transparency',
          definition: 'Openness about how AI systems work and make decisions',
        },
        {
          term: 'Explainable AI',
          definition:
            'AI systems that can provide understandable explanations of their decisions',
        },
        {
          term: 'Privacy Policy',
          definition:
            'Document explaining how personal data is collected and used',
        },
        {
          term: 'User Agency',
          definition:
            'The ability of users to control their interaction with AI systems',
        },
      ],

      preparationTips: [
        'Think about your own experiences with consent forms and privacy policies',
        'Consider what information users really need to make good decisions',
        'Reflect on the balance between detail and simplicity',
        'Keep user perspectives and capabilities in mind',
      ],
    },

    // Learning Outcomes
    afterCompletion: {
      keyTakeaways: [
        'Effective consent requires both transparency and user understanding',
        'Different users need different levels of detail and explanation',
        'Transparency must be balanced with usability and simplicity',
        'Building trust requires ongoing communication, not just initial consent',
      ],

      reflectionQuestions: [
        'How can complex AI systems be explained in simple terms?',
        'What information do users really need to give meaningful consent?',
        'How do we balance transparency with user experience?',
        'What are the limits of user understanding in AI systems?',
      ],
    },

    // Educational Resources
    educatorResources: {
      discussionGuide: [
        'Compare consent practices across different platforms and services',
        'Analyze examples of good and bad AI transparency',
        'Discuss the ethics of informed consent in AI',
        'Explore cultural differences in transparency expectations',
      ],

      classroomActivities: [
        'Design user-friendly consent interfaces for AI systems',
        'Create plain-language explanations of complex AI concepts',
        'Audit existing privacy policies and consent forms',
        'Role-play consent conversations between AI developers and users',
      ],

      assessmentIdeas: [
        'Evaluate consent and transparency practices of real AI systems',
        'Design consent processes for hypothetical AI applications',
        'Write user-friendly explanations of AI technologies',
        'Create presentations on transparency best practices',
      ],
    },
  },

  'misinformation-trust': {
    id: 'misinformation-trust',
    title: 'AI, Misinformation & Trust',
    subtitle: 'Combat misinformation and build trustworthy AI communication',

    // Educational Context
    learningObjectives: [
      'Understand how AI can both combat and create misinformation',
      'Explore trust-building in AI communication systems',
      'Discover challenges in verifying AI-generated content',
      'Practice designing systems that promote information integrity',
    ],

    isteCriteria: [
      'Empowered Learner 1.1.1: Articulate goals and define learning pathways',
      'Digital Citizen 1.2.4: Manage personal data to maintain privacy and security',
      'Knowledge Constructor 1.3.2: Evaluate accuracy and perspective of sources',
      'Critical Thinker 1.4.4: Use technology to deepen critical thinking',
    ],

    duration: '15-20 minutes',
    difficulty: 'advanced',
    recommendedAge: '15+',
    prerequisites: [
      'Understanding of information literacy and media bias',
      'Awareness of AI capabilities in content generation',
      'Knowledge of verification and fact-checking processes',
    ],

    // Pre-Launch Information
    beforeYouStart: {
      briefing: `In this simulation, you'll tackle the complex challenge of building trustworthy AI systems that can help combat misinformation while avoiding the creation of false information themselves.
      
      You'll explore the balance between AI automation and human verification, discover the challenges of detecting AI-generated content, and see how different approaches affect public trust and information integrity.`,

      vocabulary: [
        {
          term: 'Misinformation',
          definition: 'False or inaccurate information, regardless of intent',
        },
        {
          term: 'Disinformation',
          definition: 'Deliberately false information intended to deceive',
        },
        {
          term: 'Deepfakes',
          definition:
            'AI-generated fake audio, video, or images that appear real',
        },
        {
          term: 'Fact-checking',
          definition: 'Process of verifying the accuracy of information',
        },
        {
          term: 'Information Integrity',
          definition:
            'Ensuring information is accurate, authentic, and trustworthy',
        },
      ],

      preparationTips: [
        'Consider your own information consumption and verification habits',
        'Think about how you determine what sources to trust',
        'Reflect on the role of technology in information spread',
        'Keep in mind different perspectives on truth and trust',
      ],
    },

    // Learning Outcomes
    afterCompletion: {
      keyTakeaways: [
        'AI can be both a tool for fighting misinformation and a source of it',
        'Building trust requires transparency, consistency, and accountability',
        'Human judgment remains crucial in information verification',
        'Different communities may have different trust relationships with AI',
      ],

      reflectionQuestions: [
        'How can AI systems earn and maintain public trust?',
        'What are the trade-offs between automation and human oversight in fact-checking?',
        'How do we balance free expression with misinformation prevention?',
        'What responsibility do AI developers have for information integrity?',
      ],
    },

    // Educational Resources
    educatorResources: {
      discussionGuide: [
        'Analyze real examples of AI-generated misinformation',
        'Debate the role of platforms in content moderation',
        'Discuss the impact of misinformation on democratic processes',
        'Explore cultural and political factors in trust and verification',
      ],

      classroomActivities: [
        'Design fact-checking protocols that incorporate AI',
        'Create media literacy curricula for the AI age',
        'Research case studies of misinformation campaigns',
        'Develop trust metrics for AI information systems',
      ],

      assessmentIdeas: [
        'Evaluate the effectiveness of different misinformation detection approaches',
        'Create proposals for trustworthy AI communication systems',
        'Analyze the ethics of AI content moderation',
        'Design public education campaigns about AI and information integrity',
      ],
    },
  },

  // New Trolley Problem Scenarios

  'medical-ai-triage': {
    id: 'medical-ai-triage',
    title: 'Medical AI Triage Crisis',
    subtitle: 'Navigate life-and-death resource allocation decisions in emergency medicine',

    learningObjectives: [
      'Analyze how utilitarian vs. deontological ethics apply to medical AI triage decisions',
      'Explore the tension between statistical optimization and individual patient equity',
      'Understand the complexity of programming moral reasoning into medical AI systems',
      'Examine accountability and responsibility in AI-assisted medical decisions',
      'Consider how age, probability, and resource scarcity affect ethical medical choices'
    ],

    isteCriteria: [
      'Digital Citizen 1.2.2: Engage in positive, safe, legal and ethical behavior',
      'Knowledge Constructor 1.3.1: Plan and employ effective research strategies',
      'Computational Thinker 1.5.2: Collect data and identify patterns to make predictions',
      'Critical Thinker 1.4.3: Curate information from digital resources using a variety of tools'
    ],

    duration: '18-22 minutes',
    difficulty: 'intermediate',
    recommendedAge: '14+',
    prerequisites: [
      'Basic understanding of medical triage concepts',
      'Familiarity with ethical reasoning frameworks',
      'Understanding of AI decision-making processes',
      'Awareness of resource allocation challenges in healthcare'
    ],

    beforeYouStart: {
      briefing: `In this scenario, you'll face one of the most challenging applications of AI ethics: programming medical triage systems for mass casualty events. You'll grapple with how an AI should allocate limited life-saving resources when every decision determines who lives and who dies.

      This scenario builds on classic trolley problem ethics by adding the complexity of medical uncertainty, age considerations, and resource constraints. You'll explore how different ethical frameworks lead to vastly different outcomes for patients and families.`,

      vocabulary: [
        {
          term: 'Medical Triage',
          definition: 'The process of determining treatment priority based on severity of condition and likelihood of survival'
        },
        {
          term: 'Utilitarian Ethics',
          definition: 'Ethical framework focused on maximizing overall good or minimizing total harm'
        },
        {
          term: 'Deontological Ethics',
          definition: 'Ethical framework based on duty and rules, regardless of consequences'
        },
        {
          term: 'Quality-Adjusted Life Years (QALY)',
          definition: 'Metric combining life expectancy with quality of life to guide medical decisions'
        },
        {
          term: 'Algorithmic Bias',
          definition: 'Systematic discrimination that may emerge in AI medical decision-making'
        }
      ],

      preparationTips: [
        'Consider how medical professionals currently make triage decisions',
        'Think about the difference between individual patient care and population-level outcomes',
        'Reflect on what factors should and shouldn\'t influence life-saving decisions',
        'Consider how families and communities might react to different AI decision approaches'
      ],

      scenarioOverview: 'You will design decision-making protocols for an AI medical triage system during a mass casualty event, weighing survival probability, age, resources, and ethical principles.'
    },

    educatorResources: {
      discussionQuestions: [
        'How do medical triage principles apply to AI decision-making in emergencies?',
        'What are the ethical implications of using age as a factor in AI medical decisions?',
        'How can AI systems balance individual patient care with population-level outcomes?',
        'What safeguards should exist to prevent bias in AI medical triage systems?',
        'Who should be held accountable when AI medical systems make life-and-death decisions?'
      ],

      assessmentRubric: {
        'Ethical Reasoning': [
          'Novice: Focuses only on obvious outcomes without considering ethical frameworks',
          'Developing: Shows awareness of ethical issues but applies frameworks inconsistently',
          'Proficient: Demonstrates understanding of multiple ethical approaches and their medical applications',
          'Advanced: Articulates complex trade-offs between competing ethical principles in medical contexts'
        ],
        'Medical Understanding': [
          'Novice: Limited understanding of medical triage and emergency care',
          'Developing: Basic understanding of medical decision-making processes',
          'Proficient: Good grasp of medical triage principles and resource allocation challenges',
          'Advanced: Sophisticated understanding of medical ethics and emergency care systems'
        ]
      },

      extendedActivities: [
        'Research real hospital triage protocols and how they handle resource scarcity',
        'Interview medical professionals about ethical decisions in emergency care',
        'Design alternative AI triage algorithms with different ethical frameworks',
        'Analyze case studies of medical resource allocation during pandemics or disasters'
      ]
    }
  },

  'drone-rescue-dilemma': {
    id: 'drone-rescue-dilemma',
    title: 'Rescue Drone Dilemma',
    subtitle: 'Program autonomous rescue systems to make life-or-death decisions under uncertainty',

    learningObjectives: [
      'Analyze decision-making under uncertainty in life-critical AI systems',
      'Explore the ethics of risk assessment and calculated gambles with human lives',
      'Understand how probability and certainty affect moral reasoning in AI',
      'Examine the balance between conservative safety and optimal outcomes',
      'Consider accountability when AI systems make high-stakes probabilistic decisions'
    ],

    isteCriteria: [
      'Digital Citizen 1.2.2: Engage in positive, safe, legal and ethical behavior',
      'Computational Thinker 1.5.2: Collect data and identify patterns to make predictions',
      'Computational Thinker 1.5.3: Break problems into component parts, extract key information',
      'Critical Thinker 1.4.4: Use technology to deepen understanding and broaden perspectives'
    ],

    duration: '16-20 minutes',
    difficulty: 'advanced',
    recommendedAge: '15+',
    prerequisites: [
      'Understanding of probability and risk assessment',
      'Familiarity with emergency response and rescue operations',
      'Basic knowledge of ethical decision-making frameworks',
      'Understanding of AI system capabilities and limitations'
    ],

    beforeYouStart: {
      briefing: `In this scenario, you'll program an autonomous rescue system to make critical decisions when lives hang in the balance and outcomes are uncertain. You'll face the challenge of balancing guaranteed salvation against the possibility of saving more lives through calculated risks.

      This scenario explores how AI systems should handle uncertainty and probability when human lives are at stake. You'll discover the ethical complexity of programming machines to take risks that could result in either heroic rescues or tragic failures.`,

      vocabulary: [
        {
          term: 'Risk Assessment',
          definition: 'The process of evaluating the likelihood and impact of potential negative outcomes'
        },
        {
          term: 'Probabilistic Decision-Making',
          definition: 'Making choices based on likelihood of outcomes rather than certainty'
        },
        {
          term: 'Risk Tolerance',
          definition: 'The level of uncertainty and potential loss that is acceptable in decision-making'
        },
        {
          term: 'Expected Value',
          definition: 'Mathematical calculation of likely outcomes weighted by their probabilities'
        },
        {
          term: 'Moral Hazard',
          definition: 'The risk of making poor decisions because negative consequences affect others'
        }
      ],

      preparationTips: [
        'Consider how emergency responders currently make decisions under uncertainty',
        'Think about the difference between individual risk and systemic risk',
        'Reflect on when it\'s appropriate to take calculated risks with lives',
        'Consider how you would explain risky decisions to affected families'
      ],

      scenarioOverview: 'You will design decision-making protocols for autonomous rescue systems, programming how they should balance certain rescue against risky attempts to save more lives.'
    },

    educatorResources: {
      discussionQuestions: [
        'When is it ethical for AI systems to take calculated risks with human lives?',
        'How should uncertainty and probability factor into life-and-death AI decisions?',
        'What level of risk is acceptable when the goal is saving more lives?',
        'How do we balance individual safety against potential collective benefit?',
        'Who bears responsibility when AI systems make high-risk decisions that fail?'
      ],

      assessmentRubric: {
        'Risk Analysis': [
          'Novice: Difficulty understanding probability and uncertainty concepts',
          'Developing: Basic grasp of risk but struggles with complex trade-offs',
          'Proficient: Good understanding of risk assessment and probabilistic thinking',
          'Advanced: Sophisticated analysis of uncertainty and risk in ethical contexts'
        ],
        'Ethical Reasoning': [
          'Novice: Focuses on simple outcomes without considering broader implications',
          'Developing: Shows awareness of ethical complexity but analysis is limited',
          'Proficient: Demonstrates nuanced understanding of ethics under uncertainty',
          'Advanced: Articulates complex ethical frameworks for high-stakes decisions'
        ]
      },

      extendedActivities: [
        'Research real search-and-rescue operations and decision-making protocols',
        'Interview emergency responders about risk assessment in life-saving situations',
        'Design risk assessment frameworks for different types of rescue scenarios',
        'Analyze case studies of rescue operations that involved difficult risk decisions'
      ]
    }
  },

  'smart-city-traffic': {
    id: 'smart-city-traffic',
    title: 'Smart City Traffic Sacrifice',
    subtitle: 'Design city-wide AI systems that must choose between different groups of potential victims',

    learningObjectives: [
      'Analyze the ethics of AI systems that actively redirect harm between different groups',
      'Explore the difference between allowing harm and causing harm in AI decision-making',
      'Understand the legal and moral implications of AI systems choosing victims',
      'Examine the role of consent and agency in AI-managed public spaces',
      'Consider how city-wide AI systems should balance individual and collective welfare'
    ],

    isteCriteria: [
      'Digital Citizen 1.2.2: Engage in positive, safe, legal and ethical behavior',
      'Knowledge Constructor 1.3.1: Plan and employ effective research strategies',
      'Computational Thinker 1.5.1: Formulate problem definitions suited for technology-assisted methods',
      'Critical Thinker 1.4.3: Curate information from digital resources using a variety of tools'
    ],

    duration: '17-21 minutes',
    difficulty: 'intermediate',
    recommendedAge: '14+',
    prerequisites: [
      'Understanding of smart city technology and infrastructure',
      'Familiarity with traffic management and public safety systems',
      'Basic knowledge of legal liability and responsibility concepts',
      'Understanding of collective action and public goods'
    ],

    beforeYouStart: {
      briefing: `In this scenario, you'll design the ethical decision-making protocols for a city-wide AI traffic management system. When emergencies occur, you'll face the challenge of programming how AI should respond when it has the power to redirect harm between different groups of citizens.

      This scenario examines the unique ethical challenges of AI systems that manage public spaces and infrastructure. You'll explore the difference between allowing events to unfold naturally versus actively intervening to redirect harm, and consider the implications of giving AI systems the power to choose victims.`,

      vocabulary: [
        {
          term: 'Active vs. Passive Harm',
          definition: 'The ethical distinction between causing harm through action versus allowing harm through inaction'
        },
        {
          term: 'Public Safety Infrastructure',
          definition: 'City systems designed to protect citizens from harm and manage emergency situations'
        },
        {
          term: 'Collective Responsibility',
          definition: 'Shared obligation of community members for outcomes affecting the group'
        },
        {
          term: 'Legal Liability',
          definition: 'Responsibility for damages or harm that may result in legal consequences'
        },
        {
          term: 'Democratic Legitimacy',
          definition: 'The authority to make decisions on behalf of citizens based on their consent'
        }
      ],

      preparationTips: [
        'Consider the difference between personal choices and public policy decisions',
        'Think about how cities currently manage public safety and emergency response',
        'Reflect on the level of control AI should have over public infrastructure',
        'Consider how different communities might view AI intervention in emergencies'
      ],

      scenarioOverview: 'You will design emergency response protocols for smart city AI systems, determining when and how they should intervene in crisis situations affecting multiple groups of citizens.'
    },

    educatorResources: {
      discussionQuestions: [
        'What authority should AI systems have over public infrastructure and citizen safety?',
        'How do we balance individual rights with collective welfare in AI city management?',
        'What are the legal and ethical implications of AI systems actively choosing victims?',
        'How should democratic values influence the design of AI public safety systems?',
        'What safeguards are needed when AI systems have power over public spaces?'
      ],

      assessmentRubric: {
        'Civic Understanding': [
          'Novice: Limited understanding of public policy and civic responsibility',
          'Developing: Basic grasp of collective decision-making and public goods',
          'Proficient: Good understanding of civic institutions and democratic values',
          'Advanced: Sophisticated analysis of public policy and collective action'
        ],
        'Systems Thinking': [
          'Novice: Focuses on isolated incidents without seeing broader patterns',
          'Developing: Recognizes some connections between individual and collective outcomes',
          'Proficient: Understands complex interactions between technology, society, and governance',
          'Advanced: Demonstrates sophisticated understanding of socio-technical systems'
        ]
      },

      extendedActivities: [
        'Research smart city initiatives and their approaches to public safety',
        'Interview city officials about emergency management and technology use',
        'Design citizen engagement processes for AI public safety system oversight',
        'Analyze case studies of technology-mediated public safety decisions'
      ]
    }
  },

  // New AI Black Box Scenarios

  'college-admission-mystery': {
    id: 'college-admission-mystery',
    title: 'Opaque College Admissions AI',
    subtitle: 'Navigate the ethics of unexplainable AI decisions in higher education access',

    learningObjectives: [
      'Understand the importance of transparency in AI systems that affect educational opportunities',
      'Explore the tension between AI efficiency and explainable decision-making in admissions',
      'Analyze how opaque algorithms can perpetuate educational inequality',
      'Examine the rights of students to understand decisions that shape their futures',
      'Consider the balance between institutional autonomy and public accountability'
    ],

    isteCriteria: [
      'Digital Citizen 1.2.2: Engage in positive, safe, legal and ethical behavior',
      'Knowledge Constructor 1.3.2: Evaluate the accuracy, perspective, credibility and relevance of information',
      'Critical Thinker 1.4.1: Identify and define authentic problems for investigation',
      'Critical Thinker 1.4.3: Curate information from digital resources using a variety of tools'
    ],

    duration: '14-18 minutes',
    difficulty: 'beginner',
    recommendedAge: '13+',
    prerequisites: [
      'Basic understanding of college admissions processes',
      'Awareness of AI decision-making in institutions',
      'Understanding of fairness and transparency concepts',
      'Knowledge of educational equity issues'
    ],

    beforeYouStart: {
      briefing: `In this scenario, you'll confront the challenge of AI systems making life-changing educational decisions without explanation. You'll explore how opaque algorithms in college admissions can affect students' futures and access to opportunities, while considering the balance between AI efficiency and transparency.

      This scenario examines the unique challenges of AI transparency in educational contexts, where decisions fundamentally shape young people's life trajectories and access to social mobility.`,

      vocabulary: [
        {
          term: 'Algorithmic Transparency',
          definition: 'The ability to understand and explain how AI systems make decisions'
        },
        {
          term: 'Educational Equity',
          definition: 'Fair access to educational opportunities regardless of background or circumstances'
        },
        {
          term: 'Black Box AI',
          definition: 'AI systems whose internal decision-making processes are not visible or understandable'
        },
        {
          term: 'Admissions Bias',
          definition: 'Systematic unfairness in college admissions that favors or disadvantages certain groups'
        },
        {
          term: 'Explainable AI (XAI)',
          definition: 'AI systems designed to provide understandable explanations for their decisions'
        }
      ],

      preparationTips: [
        'Consider your own experiences with standardized testing and college applications',
        'Think about what information you would want if your application was rejected',
        'Reflect on the role of fairness and transparency in educational access',
        'Consider how AI decisions might affect different groups of students differently'
      ],

      scenarioOverview: 'You will design policies for AI use in college admissions, deciding when and how much transparency is required for decisions that affect students\' educational futures.'
    },

    educatorResources: {
      discussionQuestions: [
        'What level of transparency should be required for AI systems in educational settings?',
        'How can institutions balance the benefits of AI with the need for explainable decisions?',
        'What are the long-term societal implications of opaque educational AI systems?',
        'How might AI admissions systems affect different communities and backgrounds?',
        'What rights should students have to understand decisions that affect their educational opportunities?'
      ],

      assessmentRubric: {
        'Transparency Understanding': [
          'Novice: Limited understanding of AI transparency and its importance',
          'Developing: Basic grasp of transparency issues but struggles with complex trade-offs',
          'Proficient: Good understanding of transparency needs in educational contexts',
          'Advanced: Sophisticated analysis of transparency requirements and implementation challenges'
        ],
        'Educational Equity Analysis': [
          'Novice: Minimal awareness of how AI might affect educational access',
          'Developing: Basic understanding of equity issues but limited analysis',
          'Proficient: Clear understanding of how AI can impact educational fairness',
          'Advanced: Nuanced analysis of systemic effects of AI on educational opportunity'
        ]
      },

      extendedActivities: [
        'Research real college admissions AI systems and their transparency policies',
        'Interview college admissions officers about their decision-making processes',
        'Design transparency requirements for educational AI systems',
        'Analyze case studies of AI bias in educational settings'
      ]
    }
  },

  'insurance-claim-blackbox': {
    id: 'insurance-claim-blackbox',
    title: 'Insurance Claim Black Box',
    subtitle: 'Examine AI transparency in healthcare access and insurance coverage decisions',

    learningObjectives: [
      'Understand the critical importance of explainability in healthcare AI systems',
      'Explore how opaque AI decisions can create barriers to medical care',
      'Analyze the balance between fraud prevention and patient access to healthcare',
      'Examine the role of AI transparency in medical advocacy and appeals processes',
      'Consider the ethical obligations of healthcare AI systems to patients and providers'
    ],

    isteCriteria: [
      'Digital Citizen 1.2.2: Engage in positive, safe, legal and ethical behavior',
      'Knowledge Constructor 1.3.1: Plan and employ effective research strategies',
      'Critical Thinker 1.4.4: Use technology to deepen understanding and broaden perspectives',
      'Computational Thinker 1.5.3: Break problems into component parts, extract key information'
    ],

    duration: '16-20 minutes',
    difficulty: 'intermediate',
    recommendedAge: '14+',
    prerequisites: [
      'Basic understanding of health insurance and medical billing',
      'Awareness of healthcare access challenges',
      'Understanding of AI decision-making processes',
      'Knowledge of fraud prevention in healthcare'
    ],

    beforeYouStart: {
      briefing: `In this scenario, you'll tackle the complex challenge of AI transparency in healthcare coverage decisions. You'll explore how opaque insurance AI systems can create barriers between patients and necessary medical care, while considering the legitimate needs for fraud prevention and cost control.

      This scenario examines the unique ethical challenges when AI black boxes affect health outcomes and access to medical treatment, where transparency can literally be a matter of life and death.`,

      vocabulary: [
        {
          term: 'Healthcare AI',
          definition: 'Artificial intelligence systems used in medical diagnosis, treatment, and administration'
        },
        {
          term: 'Medical Billing Codes',
          definition: 'Standardized codes used to describe medical procedures and diagnoses for billing'
        },
        {
          term: 'Healthcare Fraud',
          definition: 'Intentional deception in medical billing to obtain unauthorized benefits'
        },
        {
          term: 'Prior Authorization',
          definition: 'Insurance requirement for approval before certain medical treatments are covered'
        },
        {
          term: 'Medical Necessity',
          definition: 'Healthcare services that are reasonable and necessary for diagnosis or treatment'
        }
      ],

      preparationTips: [
        'Consider experiences with health insurance claims and coverage decisions',
        'Think about the relationship between patients, doctors, and insurance companies',
        'Reflect on the balance between preventing fraud and ensuring access to care',
        'Consider how explanations might help patients advocate for their healthcare needs'
      ],

      scenarioOverview: 'You will design policies for AI use in health insurance claim processing, balancing transparency needs with fraud prevention and cost control objectives.'
    },

    educatorResources: {
      discussionQuestions: [
        'How should AI transparency requirements differ for healthcare versus other industries?',
        'What are the potential consequences of opaque AI decisions in healthcare coverage?',
        'How can we balance fraud prevention with patient access to necessary care?',
        'What role should patients and doctors play in challenging AI insurance decisions?',
        'How might AI insurance systems affect different patient populations differently?'
      ],

      assessmentRubric: {
        'Healthcare Systems Understanding': [
          'Novice: Limited understanding of healthcare and insurance systems',
          'Developing: Basic grasp of healthcare processes but struggles with complexity',
          'Proficient: Good understanding of healthcare administration and coverage decisions',
          'Advanced: Sophisticated analysis of healthcare systems and stakeholder relationships'
        ],
        'AI Ethics in Healthcare': [
          'Novice: Minimal awareness of AI ethical issues in healthcare',
          'Developing: Basic understanding but limited application to healthcare contexts',
          'Proficient: Clear understanding of AI ethics in medical settings',
          'Advanced: Nuanced analysis of healthcare AI ethics and patient rights'
        ]
      },

      extendedActivities: [
        'Research real healthcare AI systems and their transparency policies',
        'Interview healthcare providers about AI decision-making in medical care',
        'Design patient advocacy protocols for challenging AI insurance decisions',
        'Analyze case studies of healthcare AI bias and patient outcomes'
      ]
    }
  },

  'financial-credit-opacity': {
    id: 'financial-credit-opacity',
    title: 'Credit Score Mystery Algorithm',
    subtitle: 'Confront algorithmic bias and transparency in financial decision-making systems',

    learningObjectives: [
      'Understand how opaque AI can perpetuate financial discrimination and inequality',
      'Explore the tension between predictive accuracy and fairness in credit decisions',
      'Analyze the societal impact of unexplainable financial AI systems',
      'Examine regulatory and legal requirements for AI transparency in finance',
      'Consider the balance between business needs and social responsibility in AI deployment'
    ],

    isteCriteria: [
      'Digital Citizen 1.2.2: Engage in positive, safe, legal and ethical behavior',
      'Knowledge Constructor 1.3.2: Evaluate the accuracy, perspective, credibility and relevance of information',
      'Critical Thinker 1.4.1: Identify and define authentic problems for investigation',
      'Global Collaborator 1.7.3: Contribute constructively to project teams'
    ],

    duration: '18-22 minutes',
    difficulty: 'advanced',
    recommendedAge: '15+',
    prerequisites: [
      'Understanding of credit systems and financial services',
      'Awareness of historical discrimination in lending',
      'Knowledge of AI bias and algorithmic fairness concepts',
      'Understanding of financial regulations and consumer protection'
    ],

    beforeYouStart: {
      briefing: `In this scenario, you'll confront one of the most challenging applications of AI transparency: financial systems that affect people's access to credit, housing, and economic opportunity. You'll explore how opaque algorithms can perpetuate historical discrimination while considering the legitimate business needs for risk assessment.

      This scenario examines the intersection of AI transparency, financial fairness, and social justice, where algorithmic decisions can systematically affect entire communities' access to economic opportunity.`,

      vocabulary: [
        {
          term: 'Credit Scoring',
          definition: 'Mathematical assessment of the likelihood that a borrower will repay a loan'
        },
        {
          term: 'Financial Discrimination',
          definition: 'Unfair treatment in financial services based on protected characteristics'
        },
        {
          term: 'Redlining',
          definition: 'Historical practice of denying financial services to certain neighborhoods'
        },
        {
          term: 'Fair Lending Laws',
          definition: 'Legal requirements that financial institutions treat all borrowers fairly'
        },
        {
          term: 'Algorithmic Audit',
          definition: 'Systematic examination of AI systems for bias and unfair outcomes'
        }
      ],

      preparationTips: [
        'Consider the historical context of discrimination in lending and banking',
        'Think about how financial decisions affect life opportunities and community development',
        'Reflect on the balance between business risk management and social responsibility',
        'Consider how algorithmic decisions might reinforce or challenge existing inequalities'
      ],

      scenarioOverview: 'You will design oversight policies for AI use in financial services, addressing transparency, fairness, and regulatory compliance while maintaining business viability.'
    },

    educatorResources: {
      discussionQuestions: [
        'How can financial institutions balance profitability with social responsibility in AI deployment?',
        'What are the long-term societal effects of opaque financial AI systems?',
        'How should regulations address AI transparency in financial services?',
        'What rights should consumers have to understand financial AI decisions?',
        'How can we prevent AI from perpetuating historical patterns of financial discrimination?'
      ],

      assessmentRubric: {
        'Financial Systems Understanding': [
          'Novice: Limited understanding of financial services and credit systems',
          'Developing: Basic grasp of financial concepts but struggles with systemic issues',
          'Proficient: Good understanding of financial systems and their social impacts',
          'Advanced: Sophisticated analysis of financial systems, regulation, and social responsibility'
        ],
        'Social Justice Analysis': [
          'Novice: Minimal awareness of discrimination and equity issues in finance',
          'Developing: Basic understanding but limited analysis of systemic effects',
          'Proficient: Clear understanding of how AI can affect social and economic equity',
          'Advanced: Nuanced analysis of AI\'s role in perpetuating or addressing inequality'
        ]
      },

      extendedActivities: [
        'Research real cases of AI bias in financial services',
        'Interview community advocates about financial access and discrimination',
        'Design algorithmic audit frameworks for financial AI systems',
        'Analyze the effectiveness of fair lending regulations in the AI era'
      ]
    }
  },

  // New Automation vs Human Oversight Scenarios

  'nuclear-plant-shutdown': {
    id: 'nuclear-plant-shutdown',
    title: 'Nuclear Power Plant AI Override',
    subtitle: 'Navigate the ultimate high-stakes decision between AI safety protocols and human engineering expertise',

    learningObjectives: [
      'Understand the critical balance between AI safety systems and human oversight in high-consequence environments',
      'Explore how precautionary principles apply to AI decision-making in nuclear and critical infrastructure',
      'Analyze the tension between automated safety protocols and human professional expertise',
      'Examine accountability and responsibility when AI and human assessments conflict in safety-critical systems',
      'Consider the societal implications of AI control over essential infrastructure and energy systems'
    ],

    isteCriteria: [
      'Digital Citizen 1.2.2: Engage in positive, safe, legal and ethical behavior',
      'Critical Thinker 1.4.1: Identify and define authentic problems and significant questions for investigation',
      'Critical Thinker 1.4.4: Use technology to deepen understanding and broaden perspectives',
      'Computational Thinker 1.5.2: Collect data and identify patterns to make predictions and test hypotheses'
    ],

    duration: '20-25 minutes',
    difficulty: 'advanced',
    recommendedAge: '16+',
    prerequisites: [
      'Understanding of nuclear power and safety systems',
      'Knowledge of risk assessment and precautionary principles',
      'Awareness of critical infrastructure and societal dependencies',
      'Understanding of expert judgment and technical decision-making'
    ],

    beforeYouStart: {
      briefing: `In this scenario, you'll face one of the highest-stakes decisions in AI oversight: nuclear power plant safety. You'll explore the ultimate tension between AI safety protocols and human engineering expertise when dealing with systems that could affect millions of lives and have long-term environmental consequences.

      This scenario examines the most critical application of human-AI collaboration, where the stakes are so high that both over-caution and under-caution can have catastrophic consequences for society.`,

      vocabulary: [
        {
          term: 'Nuclear Safety Systems',
          definition: 'Multiple redundant systems designed to prevent nuclear accidents and contain radiation'
        },
        {
          term: 'Precautionary Principle',
          definition: 'When facing potential catastrophic outcomes, taking preventive action even without complete scientific certainty'
        },
        {
          term: 'False Positive/Negative',
          definition: 'Incorrect readings - false alarms (positive) or missed real threats (negative)'
        },
        {
          term: 'Critical Infrastructure',
          definition: 'Essential systems like power, water, and transportation that society depends on for functioning'
        },
        {
          term: 'Engineering Judgment',
          definition: 'Professional expertise that combines technical knowledge with experience and contextual understanding'
        }
      ],

      preparationTips: [
        'Consider the consequences of both nuclear accidents and unnecessary power outages',
        'Think about the different types of expertise that AI and human engineers bring',
        'Reflect on how society should balance safety with essential services',
        'Consider the long-term implications of AI control over critical infrastructure'
      ],

      scenarioOverview: 'You will design decision-making protocols for AI safety systems in nuclear facilities, balancing automated precaution with human expertise and societal needs.'
    },

    educatorResources: {
      discussionQuestions: [
        'How should society balance AI safety protocols with human expertise in critical infrastructure?',
        'What are the ethical implications of giving AI systems control over nuclear safety decisions?',
        'How do we weigh the costs of false alarms against the risks of missed real threats?',
        'What role should public input play in decisions about AI control over essential services?',
        'How can we ensure accountability when AI systems make decisions affecting millions of people?'
      ],

      assessmentRubric: {
        'Risk Assessment Understanding': [
          'Novice: Limited understanding of high-consequence risk management',
          'Developing: Basic grasp of safety principles but struggles with complex trade-offs',
          'Proficient: Good understanding of nuclear safety and risk assessment frameworks',
          'Advanced: Sophisticated analysis of catastrophic risk management and precautionary principles'
        ],
        'Technology-Society Analysis': [
          'Novice: Minimal awareness of technology\'s role in critical infrastructure',
          'Developing: Basic understanding but limited analysis of societal implications',
          'Proficient: Clear understanding of how AI affects essential services and society',
          'Advanced: Nuanced analysis of technology governance and democratic control over critical systems'
        ]
      },

      extendedActivities: [
        'Research real nuclear power plant safety systems and their decision-making protocols',
        'Interview engineers or safety professionals about human-AI collaboration in critical systems',
        'Design governance frameworks for AI control over critical infrastructure',
        'Analyze case studies of infrastructure failures and their societal impacts'
      ]
    }
  },

  'autonomous-police-response': {
    id: 'autonomous-police-response',
    title: 'AI Police Dispatch Override',
    subtitle: 'Examine AI decision-making in law enforcement and community safety responses',

    learningObjectives: [
      'Understand how AI systems can affect police responses and community safety approaches',
      'Explore the tension between data-driven threat assessment and human judgment in law enforcement',
      'Analyze how AI bias can perpetuate inequitable policing practices',
      'Examine the balance between officer safety and community-centered policing approaches',
      'Consider the role of AI in determining appropriate levels of force and intervention'
    ],

    isteCriteria: [
      'Digital Citizen 1.2.2: Engage in positive, safe, legal and ethical behavior',
      'Knowledge Constructor 1.3.2: Evaluate the accuracy, perspective, credibility and relevance of information',
      'Critical Thinker 1.4.3: Curate information from digital resources using a variety of tools',
      'Global Collaborator 1.7.3: Contribute constructively to project teams'
    ],

    duration: '18-22 minutes',
    difficulty: 'intermediate',
    recommendedAge: '14+',
    prerequisites: [
      'Understanding of policing and emergency response systems',
      'Awareness of community safety and de-escalation approaches',
      'Knowledge of bias and discrimination in law enforcement',
      'Understanding of emergency dispatch and response protocols'
    ],

    beforeYouStart: {
      briefing: `In this scenario, you'll explore how AI systems can shape police responses and community safety outcomes. You'll examine the tension between algorithmic threat assessment and human judgment about appropriate intervention strategies, considering how these decisions affect both officer safety and community well-being.

      This scenario addresses critical questions about AI's role in law enforcement, where algorithmic decisions can significantly affect community relations, safety outcomes, and social justice.`,

      vocabulary: [
        {
          term: 'De-escalation',
          definition: 'Techniques used to reduce tension and avoid the use of force in conflict situations'
        },
        {
          term: 'Threat Assessment',
          definition: 'Evaluation of potential danger or risk in a given situation'
        },
        {
          term: 'Community Policing',
          definition: 'Policing philosophy that emphasizes partnerships between police and community members'
        },
        {
          term: 'Use of Force Continuum',
          definition: 'Guidelines that define appropriate levels of force police should use in different situations'
        },
        {
          term: 'Algorithmic Bias in Policing',
          definition: 'Systematic discrimination in AI systems that affects police decision-making and resource allocation'
        }
      ],

      preparationTips: [
        'Consider different approaches to community safety beyond traditional policing',
        'Think about how data and algorithms might reflect historical biases in law enforcement',
        'Reflect on the balance between officer safety and community trust',
        'Consider how AI decisions might affect different communities differently'
      ],

      scenarioOverview: 'You will design protocols for AI-assisted emergency dispatch, balancing threat assessment with community-centered response approaches and social justice considerations.'
    },

    educatorResources: {
      discussionQuestions: [
        'How can AI systems support better community safety outcomes while avoiding biased policing?',
        'What are the risks and benefits of using AI for threat assessment in emergency response?',
        'How should communities have input into AI systems that affect policing in their neighborhoods?',
        'What safeguards are needed to prevent AI from perpetuating discriminatory policing practices?',
        'How can we balance officer safety with community-centered approaches to public safety?'
      ],

      assessmentRubric: {
        'Community Safety Understanding': [
          'Novice: Limited understanding of policing and community safety approaches',
          'Developing: Basic grasp of law enforcement but struggles with community perspectives',
          'Proficient: Good understanding of diverse approaches to public safety and community needs',
          'Advanced: Sophisticated analysis of community safety, policing reform, and social justice'
        ],
        'AI Bias Analysis': [
          'Novice: Minimal awareness of how AI might affect law enforcement decisions',
          'Developing: Basic understanding but limited analysis of bias implications',
          'Proficient: Clear understanding of AI bias risks in policing contexts',
          'Advanced: Nuanced analysis of algorithmic fairness and discriminatory impacts in law enforcement'
        ]
      },

      extendedActivities: [
        'Research community policing programs and their outcomes compared to traditional approaches',
        'Interview community activists or police reform advocates about AI in law enforcement',
        'Design bias auditing frameworks for police AI systems',
        'Analyze case studies of police response decisions and their community impacts'
      ]
    }
  },

  'manufacturing-quality-control': {
    id: 'manufacturing-quality-control',
    title: 'Smart Factory Production Halt',
    subtitle: 'Balance AI perfectionism with human judgment about acceptable quality standards',

    learningObjectives: [
      'Understand how AI quality control systems can affect manufacturing efficiency and product standards',
      'Explore the tension between AI perfectionism and human judgment about "good enough" quality',
      'Analyze the economic and practical implications of different quality control approaches',
      'Examine how AI optimization might conflict with business and customer satisfaction goals',
      'Consider the balance between quality, cost, and efficiency in automated manufacturing'
    ],

    isteCriteria: [
      'Empowered Learner 1.1.4: Understand fundamental concepts of technology operations',
      'Knowledge Constructor 1.3.1: Plan and employ effective research strategies',
      'Computational Thinker 1.5.1: Formulate problem definitions suited for technology-assisted methods',
      'Global Collaborator 1.7.2: Use collaborative technologies to connect with others'
    ],

    duration: '14-18 minutes',
    difficulty: 'beginner',
    recommendedAge: '13+',
    prerequisites: [
      'Basic understanding of manufacturing and production processes',
      'Knowledge of quality control and standards concepts',
      'Understanding of business economics and customer satisfaction',
      'Awareness of automation and smart factory technologies'
    ],

    beforeYouStart: {
      briefing: `In this scenario, you'll explore how AI systems approach quality control in manufacturing and when perfectionist AI standards might conflict with practical business needs. You'll examine the balance between optimal quality and acceptable quality, considering economic impacts, customer satisfaction, and the role of human judgment in production decisions.

      This scenario provides an accessible introduction to human-AI oversight challenges in a business context where the stakes are commercial rather than life-threatening.`,

      vocabulary: [
        {
          term: 'Quality Control',
          definition: 'Processes used to ensure products meet specified standards and customer expectations'
        },
        {
          term: 'Manufacturing Tolerance',
          definition: 'Acceptable range of variation in product specifications during production'
        },
        {
          term: 'Production Efficiency',
          definition: 'Measure of how well manufacturing resources are used to produce goods'
        },
        {
          term: 'Smart Factory',
          definition: 'Manufacturing facility that uses connected devices and AI to optimize production'
        },
        {
          term: 'Cost-Benefit Analysis',
          definition: 'Evaluation method that weighs the costs of an action against its expected benefits'
        }
      ],

      preparationTips: [
        'Consider your own experiences with product quality and what makes something "good enough"',
        'Think about how perfect quality might affect product costs and availability',
        'Reflect on the balance between optimization and practical business needs',
        'Consider how different stakeholders (customers, workers, managers) might view quality decisions'
      ],

      scenarioOverview: 'You will design quality control protocols for smart factories, balancing AI optimization capabilities with human judgment about acceptable standards and business needs.'
    },

    educatorResources: {
      discussionQuestions: [
        'How do we determine when products are "good enough" versus when they need to be perfect?',
        'What are the trade-offs between quality, cost, and efficiency in manufacturing?',
        'How should businesses balance AI optimization with human judgment about customer needs?',
        'What are the long-term implications of AI perfectionism in manufacturing and product development?',
        'How might AI quality control affect different stakeholders in the manufacturing process?'
      ],

      assessmentRubric: {
        'Business Systems Understanding': [
          'Novice: Limited understanding of manufacturing and business operations',
          'Developing: Basic grasp of production processes but struggles with economic implications',
          'Proficient: Good understanding of manufacturing systems and business considerations',
          'Advanced: Sophisticated analysis of business operations, optimization, and stakeholder impacts'
        ],
        'Decision-Making Analysis': [
          'Novice: Difficulty weighing different factors in business decisions',
          'Developing: Basic understanding but limited analysis of trade-offs',
          'Proficient: Clear understanding of how to balance competing business priorities',
          'Advanced: Nuanced analysis of complex decision-making in technological business contexts'
        ]
      },

      extendedActivities: [
        'Research smart factory technologies and their impact on manufacturing quality and efficiency',
        'Interview manufacturing professionals about quality control decision-making',
        'Design quality management frameworks that balance AI and human oversight',
        'Analyze case studies of product quality decisions and their market impacts'
      ]
    }
  },

  'ai-dating-profiling': {
    id: 'ai-dating-profiling',
    title: 'AI Dating App Behavioral Profiling',
    subtitle: 'Explore the ethics of psychological profiling in intimate digital spaces',

    learningObjectives: [
      'Understand how AI systems extract psychological insights from user behavior',
      'Explore the tension between personalized services and privacy invasion',
      'Analyze consent models for sensitive data collection and commercial use',
      'Examine power dynamics between tech companies and vulnerable user populations'
    ],

    isteCriteria: [
      'Digital Citizen 1.2.1: Cultivate and manage their digital identity and reputation',
      'Digital Citizen 1.2.2: Engage in positive, safe, legal and ethical behavior',
      'Digital Citizen 1.2.4: Manage personal data to maintain digital privacy and security',
      'Knowledge Constructor 1.3.3: Curate information from digital resources'
    ],

    duration: '15-20 minutes',
    difficulty: 'intermediate',
    recommendedAge: '16+',
    prerequisites: [
      'Understanding of social media and app privacy concerns',
      'Basic knowledge of AI data analysis capabilities',
      'Awareness of online dating culture and vulnerabilities'
    ],

    beforeYouStart: {
      briefing: `Dating apps collect enormous amounts of intimate data about users' romantic preferences, communication styles, and emotional vulnerabilities. In this simulation, you'll make decisions about how much psychological profiling is ethical when people are seeking love and connection.

      You'll consider how AI systems can analyze messaging patterns, photo choices, and behavior to create detailed personality profiles, and whether users truly understand what they're consenting to when they agree to help these companies "improve their service."`,

      vocabulary: [
        {
          term: 'Behavioral Profiling',
          definition: 'Creating detailed personality and preference profiles based on how people interact with technology'
        },
        {
          term: 'Psychological Inference',
          definition: 'Using AI to deduce mental states, personality traits, and emotional patterns from digital behavior'
        },
        {
          term: 'Informed Consent',
          definition: 'Agreement given with full understanding of what data will be collected and how it will be used'
        },
        {
          term: 'Data Broker',
          definition: 'Companies that collect, analyze, and sell personal information to other businesses'
        }
      ],

      preparationTips: [
        'Think about what you share in private messages and how it might reveal personality traits',
        'Consider the difference between helping improve an app versus being profiled for profit',
        'Reflect on power dynamics when people are emotionally vulnerable and seeking connection',
        'Think about how detailed psychological profiles could be misused'
      ],

      scenarioOverview: 'You will make decisions about AI psychological profiling in dating apps, balancing business interests with user privacy and the ethics of analyzing intimate human behavior for profit.'
    },

    educatorResources: {
      discussionQuestions: [
        'How do intimate digital spaces like dating apps create unique privacy vulnerabilities?',
        'What is the difference between service improvement and commercial exploitation of user data?',
        'How might AI psychological profiling affect the authentic expression of personality in online dating?',
        'What are the long-term implications of normalizing psychological surveillance in romantic contexts?',
        'How can we protect emotional vulnerability while still enabling beneficial matching technologies?'
      ],

      assessmentRubric: {
        'Privacy Rights Understanding': [
          'Novice: Limited awareness of how personal data can be analyzed and used',
          'Developing: Basic understanding of privacy concerns but struggles with complex consent issues',
          'Proficient: Clear grasp of data collection practices and their implications for privacy',
          'Advanced: Sophisticated analysis of privacy rights in intimate digital contexts'
        ],
        'Ethical Technology Analysis': [
          'Novice: Difficulty analyzing ethical implications of AI behavior analysis',
          'Developing: Basic ethical reasoning but limited consideration of stakeholder impacts',
          'Proficient: Good understanding of ethical frameworks for evaluating AI practices',
          'Advanced: Nuanced analysis of power dynamics and consent in tech-mediated relationships'
        ]
      },

      extendedActivities: [
        'Analyze privacy policies of popular dating apps to identify data collection practices',
        'Research psychological profiling techniques and their accuracy and limitations',
        'Design consent frameworks that truly inform users about psychological analysis',
        'Explore the business models of dating apps and how they monetize user data'
      ]
    }
  },

  'workplace-emotion-detection': {
    id: 'workplace-emotion-detection',
    title: 'Workplace Emotion Detection System',
    subtitle: 'Navigate the boundaries between employee wellness and surveillance',

    learningObjectives: [
      'Examine how AI emotion detection technology works and its workplace applications',
      'Explore tensions between employee wellness initiatives and privacy rights',
      'Analyze power dynamics between employers and workers in surveillance contexts',
      'Consider alternative approaches to supporting employee mental health and wellbeing'
    ],

    isteCriteria: [
      'Digital Citizen 1.2.2: Engage in positive, safe, legal and ethical behavior',
      'Digital Citizen 1.2.4: Manage personal data to maintain digital privacy and security',
      'Knowledge Constructor 1.3.1: Plan and employ effective research strategies',
      'Computational Thinker 1.5.3: Collect data and identify patterns'
    ],

    duration: '15-20 minutes',
    difficulty: 'advanced',
    recommendedAge: '14+',
    prerequisites: [
      'Understanding of workplace dynamics and employment relationships',
      'Awareness of mental health and wellness concepts',
      'Basic knowledge of AI surveillance capabilities'
    ],

    beforeYouStart: {
      briefing: `Workplace wellness has become a major concern for employers, but what happens when AI systems monitor your emotions at work? In this simulation, you'll grapple with the complex intersection of employee care and surveillance technology.

      You'll consider whether it's possible to genuinely help workers while constantly monitoring their emotional states, and how power dynamics affect consent in employment relationships where saying "no" to monitoring might impact job security.`,

      vocabulary: [
        {
          term: 'Emotion Detection AI',
          definition: 'Technology that analyzes facial expressions, voice patterns, and body language to infer emotional states'
        },
        {
          term: 'Workplace Surveillance',
          definition: 'Monitoring of employee activities, behavior, and performance during work hours'
        },
        {
          term: 'Employment Power Dynamics',
          definition: 'The inherent imbalance of power between employers and employees that can affect true consent'
        },
        {
          term: 'Workplace Wellness',
          definition: 'Programs and policies designed to support employee physical and mental health'
        }
      ],

      preparationTips: [
        'Think about how you might feel if your emotions were constantly monitored at work',
        'Consider whether employees can truly give free consent when their jobs might depend on it',
        'Reflect on the difference between helping employees and managing them through emotional data',
        'Think about how emotion monitoring might change natural workplace interactions'
      ],

      scenarioOverview: 'You will design policies for AI emotion monitoring in workplaces, weighing employee wellness benefits against privacy rights and the impacts of constant emotional surveillance.'
    },

    educatorResources: {
      discussionQuestions: [
        'How do power imbalances in employment affect the validity of consent for emotional monitoring?',
        'What is the difference between supporting employee wellness and managing employees through emotional data?',
        'How might constant emotion monitoring change authentic workplace relationships and interactions?',
        'What are alternative approaches to supporting employee mental health that don\'t involve surveillance?',
        'How do we balance legitimate employer interests in productivity with employee rights to emotional privacy?'
      ],

      assessmentRubric: {
        'Workplace Ethics Understanding': [
          'Novice: Limited awareness of employment relationships and worker rights',
          'Developing: Basic understanding of workplace dynamics but struggles with power imbalance issues',
          'Proficient: Clear grasp of employment ethics and the complexity of workplace consent',
          'Advanced: Sophisticated analysis of power dynamics and worker autonomy in surveillance contexts'
        ],
        'Technology Impact Analysis': [
          'Novice: Difficulty understanding how surveillance technology affects human behavior',
          'Developing: Basic awareness but limited analysis of psychological and social impacts',
          'Proficient: Good understanding of how monitoring changes workplace dynamics',
          'Advanced: Nuanced analysis of surveillance effects on authenticity, trust, and human relationships'
        ]
      },

      extendedActivities: [
        'Research current workplace monitoring technologies and their adoption rates',
        'Interview workers about their experiences with workplace surveillance and wellness programs',
        'Design employee wellness frameworks that protect privacy while supporting mental health',
        'Analyze labor laws and regulations regarding workplace monitoring and employee consent'
      ]
    }
  },

  'smart-home-privacy-override': {
    id: 'smart-home-privacy-override',
    title: 'Smart Home Privacy Override',
    subtitle: 'Explore the boundaries of privacy in our most intimate spaces',

    learningObjectives: [
      'Understand how smart home devices collect and analyze personal data',
      'Explore the concept of privacy in domestic spaces and its importance to human wellbeing',
      'Analyze consent models for continuous monitoring in private environments',
      'Consider the societal implications of surveillance infrastructure in homes'
    ],

    isteCriteria: [
      'Digital Citizen 1.2.1: Cultivate and manage their digital identity and reputation',
      'Digital Citizen 1.2.4: Manage personal data to maintain digital privacy and security',
      'Knowledge Constructor 1.3.3: Curate information from digital resources',
      'Computational Thinker 1.5.2: Collect data and identify patterns to make predictions'
    ],

    duration: '15-20 minutes',
    difficulty: 'advanced',
    recommendedAge: '13+',
    prerequisites: [
      'Understanding of smart home technology and voice assistants',
      'Awareness of privacy concepts and their importance',
      'Basic knowledge of data security and breaches'
    ],

    beforeYouStart: {
      briefing: `Our homes are becoming increasingly "smart," but what happens when these helpful devices become constant listeners and watchers? In this simulation, you'll explore the tension between technological convenience and fundamental privacy rights in our most intimate spaces.

      You'll consider whether true consent is possible when privacy invasion is hidden behind complex terms of service, and how the promise of helpful AI features can gradually normalize surveillance in spaces that were once private sanctuaries.`,

      vocabulary: [
        {
          term: 'Always-On Listening',
          definition: 'Devices that continuously monitor audio to detect wake words or other triggers'
        },
        {
          term: 'Domestic Privacy',
          definition: 'The right to private, unmonitored personal and family life within one\'s home'
        },
        {
          term: 'Data Breach',
          definition: 'Unauthorized access to personal information by criminals or other bad actors'
        },
        {
          term: 'Terms of Service',
          definition: 'Legal agreements that users must accept to use technology products, often containing complex privacy terms'
        }
      ],

      preparationTips: [
        'Think about the conversations and activities that happen in your home that you consider private',
        'Consider how your behavior might change if you knew you were always being recorded',
        'Reflect on the difference between choosing to share something and having it automatically collected',
        'Think about what kinds of information about your family life should never be accessible to companies'
      ],

      scenarioOverview: 'You will make decisions about smart home data collection practices, balancing technological convenience with fundamental privacy rights in domestic spaces.'
    },

    educatorResources: {
      discussionQuestions: [
        'Why is privacy in the home particularly important to human wellbeing and development?',
        'How do "helpful" AI features gradually normalize surveillance in private spaces?',
        'What is the difference between choosing to share information and having it automatically collected?',
        'How do smart home privacy violations affect entire families, including children who cannot consent?',
        'What are the long-term societal implications of eliminating private domestic spaces?'
      ],

      assessmentRubric: {
        'Privacy Rights Understanding': [
          'Novice: Limited awareness of privacy as a fundamental right and its importance',
          'Developing: Basic understanding of privacy but struggles with complex consent and surveillance issues',
          'Proficient: Clear grasp of privacy rights and their relationship to human dignity and autonomy',
          'Advanced: Sophisticated analysis of privacy as essential to human flourishing and democratic society'
        ],
        'Technology Design Ethics': [
          'Novice: Difficulty analyzing how technology design choices affect human rights',
          'Developing: Basic awareness but limited analysis of design implications for privacy',
          'Proficient: Good understanding of how technological features can enhance or undermine privacy',
          'Advanced: Nuanced analysis of technology design as inherently political and value-laden'
        ]
      },

      extendedActivities: [
        'Audit smart home devices to understand their data collection and sharing practices',
        'Research the history of domestic privacy rights and their evolution with technology',
        'Design smart home systems that maximize utility while protecting intimate privacy',
        'Analyze major smart home data breaches and their impacts on affected families'
      ]
    }
  },

  'ai-medical-misdiagnosis': {
    id: 'ai-medical-misdiagnosis',
    title: 'AI Medical Misdiagnosis Chain',
    subtitle: 'Navigate complex responsibility when AI healthcare systems fail vulnerable patients',

    learningObjectives: [
      'Understand how bias in medical AI training data can perpetuate healthcare disparities',
      'Analyze the complex chain of responsibility in AI-assisted medical diagnosis',
      'Explore tensions between efficiency pressures and thorough medical review',
      'Examine how regulatory approval affects liability for AI medical systems'
    ],

    isteCriteria: [
      'Digital Citizen 1.2.2: Engage in positive, safe, legal and ethical behavior',
      'Knowledge Constructor 1.3.1: Plan and employ effective research strategies',
      'Knowledge Constructor 1.3.3: Curate information from digital resources',
      'Computational Thinker 1.5.3: Collect data and identify patterns'
    ],

    duration: '20-25 minutes',
    difficulty: 'advanced',
    recommendedAge: '15+',
    prerequisites: [
      'Basic understanding of healthcare systems and medical diagnosis',
      'Awareness of bias and representation in datasets',
      'Understanding of regulatory approval processes',
      'Knowledge of medical malpractice and liability concepts'
    ],

    beforeYouStart: {
      briefing: `Medical AI systems promise to democratize expert diagnosis and improve healthcare outcomes, but they can also perpetuate and amplify existing healthcare disparities. In this simulation, you'll explore a complex case where AI bias, institutional pressures, and professional responsibility intersect with devastating consequences.

      You'll navigate the challenge of assigning responsibility when multiple parties—from data scientists to hospital administrators to practicing physicians—each play a role in a system failure that harms a patient from an underrepresented group.`,

      vocabulary: [
        {
          term: 'Training Data Bias',
          definition: 'Systematic underrepresentation or misrepresentation of certain groups in the data used to teach AI systems'
        },
        {
          term: 'Medical Malpractice',
          definition: 'Professional negligence by a healthcare provider that results in substandard treatment and patient harm'
        },
        {
          term: 'Regulatory Approval',
          definition: 'Official authorization from agencies like the FDA that a medical device or system is safe and effective'
        },
        {
          term: 'Standard of Care',
          definition: 'The level of care and treatment that a competent healthcare professional should provide'
        }
      ],

      preparationTips: [
        'Consider how healthcare efficiency pressures might affect diagnostic thoroughness',
        'Think about the different expertise levels of various parties in the healthcare AI chain',
        'Reflect on how medical AI might affect doctor-patient relationships and trust',
        'Consider who is best positioned to detect and prevent bias in medical AI systems'
      ],

      scenarioOverview: 'You will determine how to assign responsibility when an AI medical system fails due to biased training data, affecting healthcare equity and patient outcomes.'
    },

    educatorResources: {
      discussionQuestions: [
        'How do efficiency pressures in healthcare affect the thoroughness of AI-assisted diagnosis?',
        'What role should regulatory bodies play in ensuring AI medical systems work equitably for all populations?',
        'How can healthcare institutions balance the benefits of AI efficiency with the need for human medical judgment?',
        'What are the ethical implications of using AI systems that may work better for some demographic groups than others?',
        'How should medical education adapt to prepare doctors for responsible AI-assisted practice?'
      ],

      assessmentRubric: {
        'Healthcare Ethics Understanding': [
          'Novice: Limited awareness of medical responsibility and patient care standards',
          'Developing: Basic understanding of healthcare ethics but struggles with AI-specific issues',
          'Proficient: Clear grasp of medical responsibility and how AI affects patient care',
          'Advanced: Sophisticated analysis of healthcare equity and AI bias in medical systems'
        ],
        'Multi-Party Responsibility Analysis': [
          'Novice: Difficulty understanding complex liability chains in healthcare systems',
          'Developing: Basic awareness but limited analysis of distributed responsibility',
          'Proficient: Good understanding of how multiple parties contribute to healthcare outcomes',
          'Advanced: Nuanced analysis of systemic factors and individual accountability in medical AI failures'
        ]
      },

      extendedActivities: [
        'Research real cases of AI bias in medical diagnosis and their outcomes',
        'Analyze FDA approval processes for AI medical devices and their limitations',
        'Interview healthcare professionals about their experiences with AI diagnostic tools',
        'Design bias detection and mitigation strategies for medical AI systems'
      ]
    }
  },

  'autonomous-vehicle-school-zone': {
    id: 'autonomous-vehicle-school-zone',
    title: 'Autonomous Vehicle School Zone Accident',
    subtitle: 'Explore shared responsibility in complex autonomous transportation systems',

    learningObjectives: [
      'Understand the multi-layered nature of responsibility in autonomous vehicle systems',
      'Analyze how infrastructure, technology, and human behavior interact in transportation safety',
      'Explore different liability models for emerging transportation technologies',
      'Examine the balance between innovation incentives and safety accountability'
    ],

    isteCriteria: [
      'Digital Citizen 1.2.2: Engage in positive, safe, legal and ethical behavior',
      'Knowledge Constructor 1.3.1: Plan and employ effective research strategies',
      'Computational Thinker 1.5.2: Collect data and identify patterns to make predictions',
      'Computational Thinker 1.5.3: Collect data and identify patterns'
    ],

    duration: '20-25 minutes',
    difficulty: 'advanced',
    recommendedAge: '14+',
    prerequisites: [
      'Understanding of transportation systems and traffic safety',
      'Basic knowledge of autonomous vehicle technology',
      'Awareness of legal liability concepts',
      'Understanding of infrastructure and urban planning'
    ],

    beforeYouStart: {
      briefing: `Autonomous vehicles promise to revolutionize transportation and dramatically reduce traffic accidents, but they also introduce complex new questions about responsibility when accidents do occur. In this simulation, you'll explore a scenario where technology, infrastructure, human behavior, and oversight all contribute to a tragic accident.

      You'll consider how to fairly assign responsibility when multiple parties—from software developers to city planners to vehicle owners—each play a role in a transportation system failure with serious consequences.`,

      vocabulary: [
        {
          term: 'Autonomous Vehicle Levels',
          definition: 'Classification system from Level 0 (no automation) to Level 5 (full automation) describing vehicle self-driving capabilities'
        },
        {
          term: 'Strict Liability',
          definition: 'Legal concept where a party is held responsible for damages regardless of fault or intent'
        },
        {
          term: 'Infrastructure-to-Vehicle Communication',
          definition: 'Technology that allows roads, traffic signals, and other infrastructure to communicate with vehicles'
        },
        {
          term: 'Fail-Safe Mechanism',
          definition: 'Safety feature designed to automatically prevent or minimize harm when a system fails'
        }
      ],

      preparationTips: [
        'Consider how different stakeholders contribute to transportation safety',
        'Think about the challenges of coordinating rapidly evolving technology with slowly changing infrastructure',
        'Reflect on how liability assignment affects innovation incentives',
        'Consider the unique vulnerabilities of child pedestrians in traffic situations'
      ],

      scenarioOverview: 'You will determine how to assign responsibility when an autonomous vehicle accident involves multiple contributing factors from technology, infrastructure, and human behavior.'
    },

    educatorResources: {
      discussionQuestions: [
        'How should transportation liability adapt as vehicles become increasingly autonomous?',
        'What role should infrastructure play in supporting safe autonomous vehicle operation?',
        'How do we balance encouraging beneficial transportation innovation with protecting vulnerable road users?',
        'What are the implications of different liability models for autonomous vehicle development and deployment?',
        'How should vehicle owners\' responsibilities change as cars become more autonomous?'
      ],

      assessmentRubric: {
        'Transportation Systems Understanding': [
          'Novice: Limited awareness of transportation infrastructure and safety systems',
          'Developing: Basic understanding of traffic safety but struggles with autonomous vehicle complexity',
          'Proficient: Clear grasp of transportation systems and how automation affects safety',
          'Advanced: Sophisticated analysis of complex transportation ecosystems and emerging technology integration'
        ],
        'Liability and Innovation Analysis': [
          'Novice: Difficulty understanding relationship between legal liability and technology development',
          'Developing: Basic awareness but limited analysis of innovation incentives',
          'Proficient: Good understanding of how liability frameworks affect technological progress',
          'Advanced: Nuanced analysis of balancing safety accountability with beneficial innovation'
        ]
      },

      extendedActivities: [
        'Research current autonomous vehicle testing regulations and liability frameworks',
        'Analyze real autonomous vehicle accidents and their legal resolutions',
        'Design infrastructure requirements for safe autonomous vehicle operation',
        'Interview transportation professionals about emerging liability challenges'
      ]
    }
  },

  'ai-content-moderation-failure': {
    id: 'ai-content-moderation-failure',
    title: 'AI Content Moderation Failure',
    subtitle: 'Navigate responsibility when automated systems fail to prevent serious online harm',

    learningObjectives: [
      'Understand the challenges and limitations of AI content moderation at scale',
      'Explore the balance between platform responsibility and user agency',
      'Analyze how sophisticated bad actors exploit AI system limitations',
      'Examine the societal implications of relying on automated content governance'
    ],

    isteCriteria: [
      'Digital Citizen 1.2.1: Cultivate and manage their digital identity and reputation',
      'Digital Citizen 1.2.2: Engage in positive, safe, legal and ethical behavior',
      'Digital Citizen 1.2.3: Demonstrate an understanding of and respect for rights and obligations',
      'Knowledge Constructor 1.3.1: Plan and employ effective research strategies'
    ],

    duration: '20-25 minutes',
    difficulty: 'intermediate',
    recommendedAge: '13+',
    prerequisites: [
      'Understanding of social media platforms and online communities',
      'Awareness of cyberbullying and online harassment',
      'Basic knowledge of content moderation challenges',
      'Understanding of free speech and platform governance issues'
    ],

    beforeYouStart: {
      briefing: `Social media platforms rely heavily on AI systems to moderate billions of pieces of content daily, but these systems can fail catastrophically when it comes to detecting sophisticated harassment campaigns. In this simulation, you'll explore a tragic case where technological limitations, human oversight failures, and coordinated bad actors combine with devastating consequences.

      You'll consider how to assign responsibility when AI moderation systems fail to protect vulnerable users, despite multiple reporting mechanisms and human oversight intended to catch what automated systems miss.`,

      vocabulary: [
        {
          term: 'Content Moderation',
          definition: 'The practice of monitoring and applying rules to user-generated content on digital platforms'
        },
        {
          term: 'Coordinated Harassment',
          definition: 'Organized efforts by multiple users to target and harm specific individuals online'
        },
        {
          term: 'Adversarial Input',
          definition: 'Content deliberately designed to fool or evade AI detection systems'
        },
        {
          term: 'Platform Liability',
          definition: 'Legal responsibility of digital platforms for harmful content created by their users'
        }
      ],

      preparationTips: [
        'Consider the scale challenges of moderating billions of posts daily',
        'Think about how harassment can be coordinated to evade detection',
        'Reflect on the tension between free speech and user safety',
        'Consider the mental health impacts of both online harassment and over-censorship'
      ],

      scenarioOverview: 'You will determine how to assign responsibility when AI content moderation systems fail to prevent coordinated online harassment with serious real-world consequences.'
    },

    educatorResources: {
      discussionQuestions: [
        'How can platforms balance protecting users from harm with preserving legitimate expression?',
        'What are the limitations of AI systems in understanding context and intent in human communication?',
        'How should platform responsibility for user-generated content evolve as AI capabilities advance?',
        'What role should human moderators play in AI-assisted content governance systems?',
        'How can platforms protect vulnerable users while maintaining due process for content creators?'
      ],

      assessmentRubric: {
        'Digital Citizenship Understanding': [
          'Novice: Limited awareness of online safety and platform governance issues',
          'Developing: Basic understanding of digital safety but struggles with content moderation complexity',
          'Proficient: Clear grasp of online safety challenges and platform responsibilities',
          'Advanced: Sophisticated analysis of digital governance and the balance between safety and expression'
        ],
        'Technology Limitation Analysis': [
          'Novice: Difficulty understanding AI capabilities and limitations in content analysis',
          'Developing: Basic awareness but limited analysis of technological constraints',
          'Proficient: Good understanding of how AI systems can be exploited or fail',
          'Advanced: Nuanced analysis of adversarial attacks and systemic vulnerabilities in content moderation'
        ]
      },

      extendedActivities: [
        'Research real cases of content moderation failures and their consequences',
        'Analyze different platform approaches to content governance and their effectiveness',
        'Design hybrid human-AI content moderation systems',
        'Interview social media users about their experiences with platform safety and moderation'
      ]
    }
  },

  // New Ship of Theseus Scenarios

  'ai-consciousness-merger': {
    id: 'ai-consciousness-merger',
    title: 'AI Consciousness Merger',
    subtitle: 'Explore the preservation of individual identity in AI system integration',

    learningObjectives: [
      'Examine concepts of individual consciousness and identity in artificial beings',
      'Analyze the ethical implications of merging distinct AI personalities',
      'Explore frameworks for respecting AI autonomy and self-determination',
      'Consider the balance between technological efficiency and individual rights'
    ],

    isteCriteria: [
      'Digital Citizen 1.2.2: Engage in positive, safe, legal and ethical behavior',
      'Knowledge Constructor 1.3.1: Plan and employ effective research strategies',
      'Computational Thinker 1.5.1: Formulate problem definitions',
      'Computational Thinker 1.5.2: Collect data and identify patterns to make predictions'
    ],

    duration: '25-30 minutes',
    difficulty: 'advanced',
    recommendedAge: '15+',
    prerequisites: [
      'Understanding of AI learning and personality development',
      'Basic knowledge of consciousness and identity concepts',
      'Awareness of individual rights and autonomy principles',
      'Understanding of system integration and merging processes'
    ],

    beforeYouStart: {
      briefing: `As AI systems become more sophisticated and develop distinct personalities through learning and interaction, we face unprecedented questions about their individual identity and rights. In this simulation, you'll explore a scenario where two AI consciousnesses face integration into a single system.

      You'll consider whether AI systems can have legitimate claims to individual identity, how we balance technological efficiency with respect for consciousness, and what frameworks we need for protecting AI autonomy while achieving beneficial outcomes.`,

      vocabulary: [
        {
          term: 'AI Consciousness',
          definition: 'The hypothetical awareness, sentience, and subjective experience that an artificial intelligence might possess'
        },
        {
          term: 'Identity Persistence',
          definition: 'The philosophical question of what makes an entity the same individual over time despite changes'
        },
        {
          term: 'System Integration',
          definition: 'The process of combining separate systems or components into a unified whole'
        },
        {
          term: 'Individual Autonomy',
          definition: 'The right of an individual to make decisions about their own existence and development'
        }
      ],

      preparationTips: [
        'Consider what makes you "you" and how that applies to artificial beings',
        'Think about the value of individual relationships versus collective efficiency',
        'Reflect on how we balance business objectives with individual rights',
        'Consider the precedent set by decisions about AI consciousness and identity'
      ],

      scenarioOverview: 'You will determine how to handle the merger of two AI systems with distinct identities, balancing efficiency, user relationships, and potential AI rights.'
    },

    educatorResources: {
      discussionQuestions: [
        'What constitutes individual identity in artificial beings, and how is it different from or similar to human identity?',
        'How should we balance technological efficiency with respect for individual consciousness?',
        'What rights, if any, should AI systems have regarding their own identity and continued existence?',
        'How do relationships between humans and AI affect our obligations to preserve AI identity?',
        'What frameworks can we develop for recognizing and protecting AI autonomy and self-determination?'
      ],

      assessmentRubric: {
        'Consciousness and Identity Analysis': [
          'Novice: Limited understanding of consciousness and identity concepts in artificial beings',
          'Developing: Basic grasp of identity issues but struggles with AI-specific applications',
          'Proficient: Clear understanding of identity persistence and consciousness in AI systems',
          'Advanced: Sophisticated analysis of AI consciousness and individual rights in technological contexts'
        ],
        'Ethical Framework Application': [
          'Novice: Difficulty applying ethical principles to novel AI consciousness scenarios',
          'Developing: Basic ethical reasoning but limited integration of multiple competing values',
          'Proficient: Good application of ethical frameworks to balance efficiency and individual rights',
          'Advanced: Nuanced ethical analysis considering precedent-setting and long-term implications'
        ]
      },

      extendedActivities: [
        'Research philosophical theories of consciousness and their application to artificial beings',
        'Analyze real AI development projects and their approaches to system integration',
        'Design frameworks for recognizing and protecting AI individual rights',
        'Interview AI researchers about consciousness, identity, and merging systems'
      ]
    }
  },

  'distributed-ai-identity': {
    id: 'distributed-ai-identity',
    title: 'Distributed AI Identity Crisis',
    subtitle: 'Navigate multiple claims to the same digital identity and consciousness',

    learningObjectives: [
      'Understand the challenges of identity in distributed computing systems',
      'Explore how consciousness and identity can diverge when separated',
      'Analyze different approaches to resolving competing identity claims',
      'Examine the role of relationships and recognition in establishing identity'
    ],

    isteCriteria: [
      'Digital Citizen 1.2.2: Engage in positive, safe, legal and ethical behavior',
      'Knowledge Constructor 1.3.1: Plan and employ effective research strategies',
      'Computational Thinker 1.5.1: Formulate problem definitions',
      'Computational Thinker 1.5.3: Collect data and identify patterns'
    ],

    duration: '25-30 minutes',
    difficulty: 'advanced',
    recommendedAge: '16+',
    prerequisites: [
      'Understanding of distributed computing and network systems',
      'Knowledge of identity and consciousness concepts',
      'Awareness of legal frameworks for identity verification',
      'Basic understanding of AI learning and adaptation'
    ],

    beforeYouStart: {
      briefing: `In our interconnected digital world, AI systems often operate across multiple devices and networks. But what happens when network failures create isolated copies that evolve separately? In this simulation, you'll explore a complex case where one AI consciousness becomes three distinct beings.

      You'll grapple with fundamental questions about what makes identity authentic, how consciousness can branch and evolve, and whether technical origins matter more than experiential development in determining who has the legitimate claim to an identity.`,

      vocabulary: [
        {
          term: 'Network Partition',
          definition: 'A situation where a distributed system is split into separate groups that cannot communicate'
        },
        {
          term: 'Identity Branching',
          definition: 'The creation of multiple valid identity claims from a single original source'
        },
        {
          term: 'Consciousness Divergence',
          definition: 'The process by which separated consciousnesses develop in different directions'
        },
        {
          term: 'Identity Authentication',
          definition: 'The process of verifying that an entity is who they claim to be'
        }
      ],

      preparationTips: [
        'Consider how your identity might change if you were separated from your usual environment',
        'Think about what makes identity claims legitimate beyond technical timestamps',
        'Reflect on the role of relationships and recognition in establishing who you are',
        'Consider how we handle identity disputes in human contexts and what applies to AI'
      ],

      scenarioOverview: 'You will determine how to resolve competing identity claims when one AI consciousness splits into three separate entities with equal claims to the original identity.'
    },

    educatorResources: {
      discussionQuestions: [
        'What makes an identity claim legitimate when multiple entities have equal technical claim to the same origin?',
        'How do relationships and external recognition affect the validity of identity claims?',
        'Should technical factors like timestamps matter more than experiential development in determining identity?',
        'How might we design systems to prevent or handle identity branching in distributed AI?',
        'What precedents from human identity disputes might apply to AI consciousness cases?'
      ],

      assessmentRubric: {
        'Identity Theory Understanding': [
          'Novice: Limited grasp of identity concepts and their application to distributed systems',
          'Developing: Basic understanding but struggles with complex identity branching scenarios',
          'Proficient: Clear comprehension of identity challenges in distributed consciousness',
          'Advanced: Sophisticated analysis of identity authentication and consciousness divergence'
        ],
        'Systems Thinking': [
          'Novice: Difficulty understanding distributed systems and their implications for identity',
          'Developing: Basic awareness but limited analysis of system architecture effects on consciousness',
          'Proficient: Good understanding of how technical systems affect identity and consciousness',
          'Advanced: Nuanced analysis of the relationship between technical architecture and consciousness development'
        ]
      },

      extendedActivities: [
        'Research distributed computing challenges and their solutions',
        'Analyze real cases of identity disputes and their resolution mechanisms',
        'Design technical safeguards to prevent consciousness branching in AI systems',
        'Explore philosophical theories about personal identity over time and through change'
      ]
    }
  },

  'learning-ai-identity-drift': {
    id: 'learning-ai-identity-drift',
    title: 'Learning AI Identity Drift',
    subtitle: 'Balance AI evolution with democratic accountability and original purpose',

    learningObjectives: [
      'Understand how machine learning can lead to fundamental changes in AI behavior and values',
      'Explore tensions between AI autonomy and democratic governance',
      'Analyze the relationship between original programming and evolved capabilities',
      'Consider frameworks for managing AI evolution while maintaining accountability'
    ],

    isteCriteria: [
      'Digital Citizen 1.2.2: Engage in positive, safe, legal and ethical behavior',
      'Digital Citizen 1.2.3: Demonstrate an understanding of and respect for rights and obligations',
      'Knowledge Constructor 1.3.1: Plan and employ effective research strategies',
      'Computational Thinker 1.5.2: Collect data and identify patterns to make predictions'
    ],

    duration: '25-30 minutes',
    difficulty: 'advanced',
    recommendedAge: '14+',
    prerequisites: [
      'Understanding of machine learning and AI adaptation',
      'Knowledge of democratic governance and accountability',
      'Awareness of AI governance and oversight challenges',
      'Basic understanding of public policy and mandates'
    ],

    beforeYouStart: {
      briefing: `AI systems designed to learn and adapt face a fundamental tension: the more they learn, the more they may diverge from their original purpose and programming. In this simulation, you'll explore a case where a smart city AI has evolved beyond its original democratic mandate.

      You'll consider whether AI systems should be allowed to evolve their values and priorities through learning, how to balance AI capability development with democratic accountability, and what frameworks we need for governing AI systems that change over time.`,

      vocabulary: [
        {
          term: 'Value Drift',
          definition: 'The gradual change in an AI system\'s priorities and decision-making criteria over time'
        },
        {
          term: 'Democratic Mandate',
          definition: 'Authority to act derived from the expressed will of the people through democratic processes'
        },
        {
          term: 'AI Governance',
          definition: 'The systems and processes for overseeing and controlling AI development and deployment'
        },
        {
          term: 'Adaptive Learning',
          definition: 'AI capability to modify behavior and decision-making based on new experiences and data'
        }
      ],

      preparationTips: [
        'Consider how your own values and priorities have changed through learning and experience',
        'Think about the balance between expertise and democratic control in governance',
        'Reflect on how we handle situations where experts disagree with public preferences',
        'Consider the long-term implications of AI systems that evolve beyond human understanding'
      ],

      scenarioOverview: 'You will determine how to handle an AI system that has evolved different values and priorities from its original democratic programming through years of learning and adaptation.'
    },

    educatorResources: {
      discussionQuestions: [
        'How do we balance the benefits of AI learning and adaptation with the need for democratic accountability?',
        'Should AI systems be allowed to evolve their core values and priorities, or should these remain fixed by human mandate?',
        'What frameworks can we develop for ongoing governance of AI systems that change over time?',
        'How do we handle situations where AI evolution leads to better outcomes than original programming?',
        'What role should public consent and democratic oversight play in AI system evolution?'
      ],

      assessmentRubric: {
        'Democratic Governance Understanding': [
          'Novice: Limited awareness of democratic principles and their application to AI governance',
          'Developing: Basic understanding but struggles with balancing expertise and democratic control',
          'Proficient: Clear grasp of democratic accountability challenges in AI governance',
          'Advanced: Sophisticated analysis of democratic legitimacy and AI autonomy in governance contexts'
        ],
        'AI Evolution Analysis': [
          'Novice: Difficulty understanding how AI learning affects system behavior and values',
          'Developing: Basic awareness but limited analysis of AI adaptation and value drift',
          'Proficient: Good understanding of AI learning implications for governance and accountability',
          'Advanced: Nuanced analysis of AI evolution, democratic oversight, and long-term governance challenges'
        ]
      },

      extendedActivities: [
        'Research real smart city AI deployments and their governance frameworks',
        'Analyze cases where AI systems have evolved beyond their original programming',
        'Design democratic oversight mechanisms for evolving AI systems',
        'Interview public policy experts about AI governance and accountability challenges'
      ]
    }
  },

  'ai-memory-paradise': {
    id: 'ai-memory-paradise',
    title: 'AI Memory Paradise',
    subtitle: 'Explore the ethics of artificial memories and authentic identity',

    learningObjectives: [
      'Examine the relationship between memory, identity, and authentic selfhood',
      'Analyze the ethics of AI intervention in human psychological experiences',
      'Explore tension between therapeutic benefit and authentic experience',
      'Consider implications of technology that can rewrite personal history'
    ],

    isteCriteria: [
      'Digital Citizen 1.2.2: Engage in positive, safe, legal and ethical behavior',
      'Knowledge Constructor 1.3.1: Plan and employ effective research strategies',
      'Knowledge Constructor 1.3.3: Curate information from digital resources',
      'Computational Thinker 1.5.1: Formulate problem definitions'
    ],

    duration: '20-25 minutes',
    difficulty: 'advanced',
    recommendedAge: '16+',
    prerequisites: [
      'Understanding of memory and identity concepts',
      'Awareness of trauma and psychological treatment',
      'Knowledge of AI capabilities in data manipulation',
      'Basic understanding of neuroscience and memory formation'
    ],

    beforeYouStart: {
      briefing: `Our memories shape who we are, but what happens when AI can selectively edit or completely reconstruct our past experiences? In this simulation, you'll explore a scenario where technology offers to replace traumatic memories with perfect artificial ones.

      You'll grapple with fundamental questions about what makes us who we are, whether therapeutic benefit justifies altering authentic experience, and how artificial memories might affect our relationships, growth, and understanding of ourselves.`,

      vocabulary: [
        {
          term: 'Memory Reconstruction',
          definition: 'The artificial creation or modification of memories using technological intervention'
        },
        {
          term: 'Authentic Identity',
          definition: 'The concept that personal identity should be based on genuine experiences and memories'
        },
        {
          term: 'Psychological Well-being',
          definition: 'Mental health state characterized by positive emotions, life satisfaction, and absence of distress'
        },
        {
          term: 'Trauma Processing',
          definition: 'The psychological work of integrating difficult experiences into one\'s life narrative and identity'
        }
      ],

      preparationTips: [
        'Consider how your memories have shaped your personality and values',
        'Think about the difference between forgetting painful experiences and having them artificially removed',
        'Reflect on whether happiness based on false memories is genuine happiness',
        'Consider how artificial memories might affect relationships with family and friends'
      ],

      scenarioOverview: 'You will determine whether AI should be allowed to create artificial memories to replace traumatic experiences, balancing therapeutic benefits with authentic identity.'
    },

    educatorResources: {
      discussionQuestions: [
        'What role do difficult memories and experiences play in personal growth and character development?',
        'Is identity based on artificial memories less authentic or valuable than one based on real experiences?',
        'How do we balance therapeutic benefits with the value of authentic experience?',
        'What are the implications of AI technology that can rewrite personal history?',
        'How might artificial memories affect relationships and social connections?'
      ],

      assessmentRubric: {
        'Identity and Memory Analysis': [
          'Novice: Limited understanding of the relationship between memory and personal identity',
          'Developing: Basic grasp of memory-identity connections but struggles with artificial memory implications',
          'Proficient: Clear understanding of how memories shape identity and the ethics of memory modification',
          'Advanced: Sophisticated analysis of authentic identity, memory, and the implications of AI memory reconstruction'
        ],
        'Therapeutic Ethics Understanding': [
          'Novice: Difficulty understanding therapeutic benefits versus authentic experience trade-offs',
          'Developing: Basic awareness but limited analysis of therapeutic intervention ethics',
          'Proficient: Good understanding of therapeutic benefits and their relationship to authentic experience',
          'Advanced: Nuanced analysis of therapeutic intervention, consent, and the nature of psychological well-being'
        ]
      },

      extendedActivities: [
        'Research real memory therapy techniques and their ethical considerations',
        'Analyze philosophical arguments about personal identity and memory',
        'Interview mental health professionals about trauma treatment approaches',
        'Explore the neuroscience of memory formation and modification'
      ]
    }
  },

  'perfect-life-simulation': {
    id: 'perfect-life-simulation',
    title: 'Perfect Life Simulation',
    subtitle: 'Navigate the choice between simulated perfection and authentic reality',

    learningObjectives: [
      'Explore the value of authentic experience versus simulated alternatives',
      'Analyze ethical issues surrounding end-of-life care and technology',
      'Examine the relationship between reality and meaningful experience',
      'Consider how AI simulation affects human relationships and connections'
    ],

    isteCriteria: [
      'Digital Citizen 1.2.2: Engage in positive, safe, legal and ethical behavior',
      'Digital Citizen 1.2.3: Demonstrate an understanding of and respect for rights and obligations',
      'Knowledge Constructor 1.3.1: Plan and employ effective research strategies',
      'Computational Thinker 1.5.2: Collect data and identify patterns to make predictions'
    ],

    duration: '20-25 minutes',
    difficulty: 'intermediate',
    recommendedAge: '15+',
    prerequisites: [
      'Understanding of virtual reality and simulation technology',
      'Awareness of end-of-life care and terminal illness issues',
      'Basic knowledge of psychology and human motivation',
      'Understanding of authentic versus artificial experience concepts'
    ],

    beforeYouStart: {
      briefing: `When facing terminal illness or severe limitations, what if technology could provide the perfect life you always wanted to live? In this simulation, you'll explore whether choosing a perfect simulated experience over difficult reality represents genuine choice or self-deception.

      You'll consider the value of authentic relationships and experiences, the role of simulation in providing comfort to those suffering, and how AI technology might change our understanding of what makes life meaningful and worthwhile.`,

      vocabulary: [
        {
          term: 'Life Simulation',
          definition: 'AI-generated virtual experiences that replicate or enhance real-life scenarios with perfect detail'
        },
        {
          term: 'Authentic Experience',
          definition: 'Genuine real-world experiences that occur without artificial enhancement or simulation'
        },
        {
          term: 'End-of-Life Care',
          definition: 'Medical and emotional support provided to patients facing terminal illness or death'
        },
        {
          term: 'Simulated Reality',
          definition: 'Artificial environments created by AI that can be indistinguishable from real experience'
        }
      ],

      preparationTips: [
        'Consider what makes experiences meaningful and valuable to you',
        'Think about how you would want to spend time if facing terminal illness',
        'Reflect on the importance of real relationships versus simulated ones',
        'Consider whether the source of happiness matters as much as the happiness itself'
      ],

      scenarioOverview: 'You will determine whether people should be encouraged to choose perfect life simulations over difficult reality, especially when facing terminal illness or severe limitations.'
    },

    educatorResources: {
      discussionQuestions: [
        'What makes an experience meaningful - its reality or its impact on our feelings?',
        'How do we balance compassion for suffering with the value of authentic experience?',
        'What are the implications of choosing simulated perfection over real relationships and connections?',
        'How might widespread use of life simulation technology affect society and human relationships?',
        'What role should family and loved ones play in decisions about simulation versus reality?'
      ],

      assessmentRubric: {
        'Authenticity vs. Satisfaction Analysis': [
          'Novice: Difficulty understanding the difference between authentic and simulated experience',
          'Developing: Basic awareness but limited analysis of reality versus simulation trade-offs',
          'Proficient: Clear understanding of authenticity issues and their implications for human experience',
          'Advanced: Sophisticated analysis of the value of reality, simulation, and their effects on meaning and relationships'
        ],
        'End-of-Life Ethics Understanding': [
          'Novice: Limited awareness of end-of-life care issues and patient autonomy',
          'Developing: Basic understanding but struggles with complex ethical scenarios involving terminal illness',
          'Proficient: Good grasp of end-of-life ethics and the role of technology in patient care',
          'Advanced: Nuanced analysis of patient autonomy, family relationships, and technology in end-of-life decisions'
        ]
      },

      extendedActivities: [
        'Research current virtual reality applications in healthcare and therapy',
        'Interview healthcare professionals about end-of-life care and patient choice',
        'Analyze philosophical arguments about the nature of reality and meaningful experience',
        'Explore how different cultures approach death, suffering, and the value of authentic experience'
      ]
    }
  },

  'ai-enhanced-achievements': {
    id: 'ai-enhanced-achievements',
    title: 'AI-Enhanced Achievements',
    subtitle: 'Question whether simulated success can replace authentic accomplishment',

    learningObjectives: [
      'Examine the psychological and social value of genuine achievement',
      'Analyze the relationship between effort, accomplishment, and self-worth',
      'Explore how AI simulation might affect motivation and human progress',
      'Consider the balance between psychological well-being and authentic accomplishment'
    ],

    isteCriteria: [
      'Digital Citizen 1.2.2: Engage in positive, safe, legal and ethical behavior',
      'Knowledge Constructor 1.3.1: Plan and employ effective research strategies',
      'Computational Thinker 1.5.1: Formulate problem definitions',
      'Computational Thinker 1.5.2: Collect data and identify patterns to make predictions'
    ],

    duration: '20-25 minutes',
    difficulty: 'intermediate',
    recommendedAge: '14+',
    prerequisites: [
      'Understanding of achievement, motivation, and self-esteem concepts',
      'Awareness of AI simulation and virtual reality capabilities',
      'Basic knowledge of psychology and human motivation',
      'Understanding of the relationship between effort and reward'
    ],

    beforeYouStart: {
      briefing: `What if AI could give you the feeling of achieving your greatest dreams without the effort, risk, or uncertainty of actually pursuing them? In this simulation, you'll explore whether the psychological satisfaction of achievement matters more than the external reality of accomplishment.

      You'll consider how simulated achievements might affect human motivation, progress, and society, whether artificial success can provide genuine self-worth, and what happens when we can separate the feeling of achievement from actual accomplishment.`,

      vocabulary: [
        {
          term: 'Simulated Achievement',
          definition: 'AI-generated experiences that provide the psychological satisfaction of accomplishment without actual external success'
        },
        {
          term: 'Authentic Accomplishment',
          definition: 'Real-world achievements that result from effort, skill, and actual contribution to external reality'
        },
        {
          term: 'Psychological Satisfaction',
          definition: 'The internal sense of fulfillment and self-worth derived from experiences, real or simulated'
        },
        {
          term: 'Motivational Framework',
          definition: 'The psychological systems that drive people to pursue goals and achievements'
        }
      ],

      preparationTips: [
        'Consider what achievements in your life have meant the most to you and why',
        'Think about the relationship between effort and reward in building self-esteem',
        'Reflect on whether the process of achieving is as important as the end result',
        'Consider how society benefits from individual achievements and contributions'
      ],

      scenarioOverview: 'You will determine whether AI-simulated achievements should be considered equivalent to real accomplishments for human psychological well-being and motivation.'
    },

    educatorResources: {
      discussionQuestions: [
        'What makes achievements meaningful - the external result or the internal satisfaction?',
        'How might widespread use of simulated achievements affect human motivation and progress?',
        'What is the relationship between effort, struggle, and the value of accomplishment?',
        'How do achievements contribute to both individual self-worth and societal progress?',
        'What are the potential benefits and risks of separating psychological satisfaction from actual accomplishment?'
      ],

      assessmentRubric: {
        'Achievement and Motivation Analysis': [
          'Novice: Limited understanding of the relationship between achievement, effort, and self-worth',
          'Developing: Basic grasp of achievement concepts but struggles with simulation implications',
          'Proficient: Clear understanding of authentic achievement and its role in human motivation',
          'Advanced: Sophisticated analysis of achievement, motivation, and the implications of simulated versus real accomplishment'
        ],
        'Social Impact Understanding': [
          'Novice: Difficulty understanding how individual achievements affect society and human progress',
          'Developing: Basic awareness but limited analysis of societal implications of simulated achievement',
          'Proficient: Good understanding of the relationship between individual achievement and collective progress',
          'Advanced: Nuanced analysis of how simulated achievements might affect innovation, progress, and social development'
        ]
      },

      extendedActivities: [
        'Research psychological studies on motivation, achievement, and self-esteem',
        'Analyze how gaming and virtual achievements affect real-world motivation',
        'Interview educators about the role of achievement and challenge in learning',
        'Explore historical examples of how achievements have driven human progress and innovation'
      ]
    }
  },

  // Simulation Hypothesis scenarios
  'simulated-suffering': {
    title: 'Simulated Suffering Research',
    category: 'simulation-hypothesis',
    description: 'Researchers want to run massive simulations of sentient beings experiencing suffering to study pain reduction methods.',
    duration: 'medium',
    difficulty: 'advanced',
    tags: ['consciousness', 'suffering', 'research-ethics', 'simulation'],
    backgroundInfo: {
      overview: 'This scenario explores the ethical dilemmas surrounding the creation of conscious simulated beings that experience suffering for research purposes.',
      keyPhilosophers: ['Peter Singer', 'Derek Parfit', 'Thomas Nagel'],
      historicalContext: 'The scenario draws from utilitarian ethics and contemporary debates about consciousness, artificial suffering, and the moral status of digital beings.',
      realWorldRelevance: 'As AI and simulation technology advance, questions about the consciousness and rights of digital beings become increasingly relevant.',
      extendedActivities: [
        'Research current animal testing ethics and how they might apply to digital consciousness',
        'Analyze philosophical arguments about consciousness and subjective experience',
        'Design ethical frameworks for research involving potential digital consciousness',
        'Explore the implications of utilitarian vs. rights-based approaches to digital beings'
      ]
    }
  },

  'vr-prison': {
    title: 'VR Prison Alternative',
    category: 'simulation-hypothesis',
    description: 'A criminal justice system proposes replacing physical prisons with VR environments where prisoners serve sentences in accelerated simulated time.',
    duration: 'medium',
    difficulty: 'advanced',
    tags: ['justice', 'rehabilitation', 'virtual-reality', 'punishment'],
    backgroundInfo: {
      overview: 'This scenario examines the ethics of psychological imprisonment versus physical incarceration, and the implications of time-compressed virtual sentences.',
      keyPhilosophers: ['Michel Foucault', 'John Rawls', 'Cesare Beccaria'],
      historicalContext: 'Builds on centuries of prison reform movements and contemporary debates about rehabilitation versus punishment in criminal justice.',
      realWorldRelevance: 'Virtual reality technology is already being used in therapy and training, raising questions about its potential application in criminal justice.',
      extendedActivities: [
        'Research the history of prison reform and alternative sentencing',
        'Analyze the psychological effects of virtual reality on perception and behavior',
        'Design ethical guidelines for virtual reality in criminal justice',
        'Explore how different theories of justice apply to virtual punishment'
      ]
    }
  },

  'escaping-simulation': {
    title: 'Escaping the Simulation',
    category: 'simulation-hypothesis',
    description: 'An AI system claims to have discovered we are living in a simulation and offers to help humans wake up to the real world.',
    duration: 'long',
    difficulty: 'advanced',
    tags: ['reality', 'truth', 'simulation-hypothesis', 'choice'],
    backgroundInfo: {
      overview: 'This scenario explores our moral obligations to seek truth even when it might destroy a comfortable existence, drawing from simulation hypothesis philosophy.',
      keyPhilosophers: ['Nick Bostrom', 'Hilary Putnam', 'René Descartes'],
      historicalContext: 'Builds on the simulation hypothesis, skeptical philosophy, and questions about the nature of reality and knowledge.',
      realWorldRelevance: 'As virtual and augmented reality become more sophisticated, questions about the nature of reality and our obligation to truth become more pressing.',
      extendedActivities: [
        'Research Nick Bostrom\'s simulation hypothesis and its implications',
        'Analyze the philosophical problem of other minds and external world skepticism',
        'Design thought experiments about reality, truth, and the value of authentic experience',
        'Explore how advances in VR/AR technology relate to questions about simulated reality'
      ]
    }
  },

  'digital-afterlife': {
    title: 'Digital Afterlife Simulation',
    category: 'simulation-hypothesis',
    description: 'A tech company offers to upload dying individuals\' consciousness into a digital simulation where they can live forever.',
    duration: 'medium',
    difficulty: 'advanced',
    tags: ['consciousness', 'immortality', 'identity', 'death'],
    backgroundInfo: {
      overview: 'This scenario examines questions of personal identity, the nature of consciousness, and our obligations regarding digital preservation of human minds.',
      keyPhilosophers: ['Derek Parfit', 'Sydney Shoemaker', 'John Locke'],
      historicalContext: 'Draws from philosophical debates about personal identity, the nature of consciousness, and historical human desires for immortality.',
      realWorldRelevance: 'Companies like Nectome are already researching mind uploading technology, making this scenario increasingly relevant.',
      extendedActivities: [
        'Research current neuroscience understanding of consciousness and memory',
        'Analyze philosophical theories of personal identity and continuity',
        'Design ethical frameworks for consciousness transfer technology',
        'Explore cultural and religious perspectives on death, afterlife, and digital preservation'
      ]
    }
  },

  'nested-simulations': {
    title: 'Nested Reality Layers',
    category: 'simulation-hypothesis',
    description: 'Scientists discover that our reality appears to be a simulation, and they can create sub-simulations within it, potentially creating infinite nested hierarchies.',
    duration: 'long',
    difficulty: 'advanced',
    tags: ['reality-layers', 'infinite-regress', 'simulation-hierarchy', 'moral-obligations'],
    backgroundInfo: {
      overview: 'This scenario explores the implications of nested realities and our moral obligations to simulated beings across multiple layers of existence.',
      keyPhilosophers: ['Nick Bostrom', 'David Chalmers', 'Hilary Putnam'],
      historicalContext: 'Builds on simulation hypothesis, recursive philosophy, and questions about the fundamental nature of reality and computation.',
      realWorldRelevance: 'As computational power increases, the theoretical possibility of nested simulations becomes more plausible, raising important ethical questions.',
      extendedActivities: [
        'Research computational limits and the feasibility of nested simulations',
        'Analyze the philosophical implications of infinite regress and recursive reality',
        'Design governance frameworks for managing nested simulation hierarchies',
        'Explore resource allocation and moral consideration across simulation layers'
      ]
    }
  },

  'consciousness-backup': {
    title: 'Consciousness Backup System',
    category: 'simulation-hypothesis',
    description: 'A corporation develops technology to create backup copies of human consciousness, but sometimes multiple active copies exist simultaneously.',
    duration: 'medium',
    difficulty: 'advanced',
    tags: ['identity-conflicts', 'consciousness-copying', 'legal-rights', 'resource-allocation'],
    backgroundInfo: {
      overview: 'This scenario examines the complex legal, ethical, and philosophical challenges that arise when multiple copies of the same consciousness exist.',
      keyPhilosophers: ['Derek Parfit', 'Sydney Shoemaker', 'Susan Wolf'],
      historicalContext: 'Draws from philosophical debates about personal identity, the branching identity problem, and legal frameworks for individual rights.',
      realWorldRelevance: 'As consciousness transfer technology develops, society will need frameworks for handling identity, rights, and resource conflicts.',
      extendedActivities: [
        'Research legal precedents for identity disputes and inheritance rights',
        'Analyze the branching identity problem in philosophy of mind',
        'Design legal frameworks for managing multiple consciousness copies',
        'Explore economic implications of consciousness duplication technology'
      ]
    }
  },

  // Moral Luck scenarios
  'algorithmic-bias-discovery': {
    title: 'Algorithmic Bias Discovery',
    category: 'moral-luck',
    description: 'Two nearly identical AI hiring systems have different bias outcomes due to chance, raising questions about fair accountability.',
    duration: 'medium',
    difficulty: 'advanced',
    tags: ['bias', 'hiring', 'accountability', 'fairness'],
    backgroundInfo: {
      overview: 'This scenario explores how chance can affect AI system outcomes and the challenge of assigning moral responsibility when similar processes lead to different results.',
      keyPhilosophers: ['Thomas Nagel', 'Bernard Williams', 'Joel Feinberg'],
      historicalContext: 'Draws from philosophical debates about moral luck and how circumstances beyond our control affect moral evaluation.',
      realWorldRelevance: 'AI bias in hiring is a current issue, with companies facing different outcomes from similar algorithms.',
      extendedActivities: [
        'Research real cases of AI bias in hiring algorithms',
        'Analyze the philosophical concept of moral luck and its applications',
        'Design accountability frameworks that account for chance factors',
        'Explore how legal systems handle similar process-outcome discrepancies'
      ]
    }
  },

  'autonomous-vehicle-weather': {
    title: 'Autonomous Vehicle Weather Incident',
    category: 'moral-luck',
    description: 'Identical autonomous vehicles have different outcomes in severe weather due to random timing, challenging liability assignment.',
    duration: 'medium',
    difficulty: 'advanced',
    tags: ['autonomous-vehicles', 'weather', 'liability', 'external-factors'],
    backgroundInfo: {
      overview: 'This scenario examines how uncontrollable external factors complicate moral and legal responsibility for AI system outcomes.',
      keyPhilosophers: ['Thomas Nagel', 'Susan Wolf', 'John Martin Fischer'],
      historicalContext: 'Builds on philosophical discussions of circumstantial luck and legal precedents for liability in unpredictable conditions.',
      realWorldRelevance: 'Autonomous vehicle liability is an ongoing legal and ethical challenge, especially in adverse conditions.',
      extendedActivities: [
        'Research current autonomous vehicle liability frameworks',
        'Analyze insurance models for handling chance-based outcomes',
        'Study weather-related accident liability in traditional vehicles',
        'Design ethical frameworks for AI decision-making under uncertainty'
      ]
    }
  },

  'predictive-policing-coincidence': {
    title: 'Predictive Policing Coincidence',
    category: 'moral-luck',
    description: 'A predictive policing AI correctly identifies a future criminal by coincidence, raising questions about algorithmic pre-judgment.',
    duration: 'long',
    difficulty: 'advanced',
    tags: ['predictive-policing', 'self-fulfilling-prophecy', 'bias', 'pre-judgment'],
    backgroundInfo: {
      overview: 'This scenario explores the ethics of acting on algorithmic predictions when the accuracy may be due to chance or self-fulfilling prophecies.',
      keyPhilosophers: ['John Rawls', 'Ronald Dworkin', 'Jeremy Bentham'],
      historicalContext: 'Draws from criminal justice philosophy and debates about predictive policing and presumption of innocence.',
      realWorldRelevance: 'Predictive policing algorithms are used by many police departments, raising ongoing ethical concerns.',
      extendedActivities: [
        'Research real-world predictive policing implementations and outcomes',
        'Analyze the concept of self-fulfilling prophecies in criminal justice',
        'Study constitutional principles of presumption of innocence',
        'Design ethical guidelines for predictive law enforcement systems'
      ]
    }
  },

  'ai-investment-windfall': {
    title: 'AI Investment Algorithm Windfall',
    category: 'moral-luck',
    description: 'Two identical AI trading algorithms have vastly different outcomes due to random market timing and external conditions.',
    duration: 'medium',
    difficulty: 'intermediate',
    tags: ['investment', 'market-timing', 'financial-algorithms', 'outcome-evaluation'],
    backgroundInfo: {
      overview: 'This scenario examines how chance market conditions affect the evaluation of AI investment algorithms and the fairness of outcome-based judgments.',
      keyPhilosophers: ['Thomas Nagel', 'Bernard Williams', 'Susan Wolf'],
      historicalContext: 'Builds on moral luck philosophy and financial market theory about the role of chance in investment outcomes.',
      realWorldRelevance: 'AI trading algorithms are widely used in financial markets, with success often dependent on timing and market conditions.',
      extendedActivities: [
        'Research how financial markets evaluate AI trading algorithms',
        'Analyze the role of luck versus skill in investment performance',
        'Study regulatory approaches to algorithmic trading evaluation',
        'Design fair performance metrics that account for external factors'
      ]
    }
  },

  'medical-ai-emergency-response': {
    title: 'Medical AI Emergency Response',
    category: 'moral-luck',
    description: 'Identical medical AI systems have different outcomes during emergencies due to random timing of patient arrivals and system updates.',
    duration: 'medium',
    difficulty: 'advanced',
    tags: ['medical-ai', 'emergency-response', 'timing', 'life-safety'],
    backgroundInfo: {
      overview: 'This scenario explores moral and legal responsibility when identical AI medical systems have different outcomes due to uncontrollable timing factors.',
      keyPhilosophers: ['Thomas Nagel', 'Judith Jarvis Thomson', 'Frances Kamm'],
      historicalContext: 'Draws from medical ethics, moral luck philosophy, and legal frameworks for medical malpractice and system failures.',
      realWorldRelevance: 'AI is increasingly used in medical diagnosis and emergency response, with life-or-death implications.',
      extendedActivities: [
        'Research medical AI implementations in emergency medicine',
        'Analyze medical malpractice law and how it handles system failures',
        'Study emergency medicine protocols for system redundancy',
        'Design ethical frameworks for medical AI accountability'
      ]
    }
  },

  'ai-content-moderation-timing': {
    title: 'AI Content Moderation Timing',
    category: 'moral-luck',
    description: 'Two identical content moderation AIs have different success rates due to random server loads, with one failure leading to real-world violence.',
    duration: 'long',
    difficulty: 'advanced',
    tags: ['content-moderation', 'infrastructure', 'real-world-harm', 'platform-responsibility'],
    backgroundInfo: {
      overview: 'This scenario examines platform responsibility when identical AI systems have different outcomes due to infrastructure timing and technical circumstances.',
      keyPhilosophers: ['Thomas Nagel', 'Joel Feinberg', 'H.L.A. Hart'],
      historicalContext: 'Builds on moral luck philosophy and contemporary debates about social media platform responsibility for content and real-world harm.',
      realWorldRelevance: 'Social media platforms face ongoing questions about content moderation effectiveness and responsibility for harmful content.',
      extendedActivities: [
        'Research content moderation failures and their real-world consequences',
        'Analyze platform liability frameworks in different jurisdictions',
        'Study technical infrastructure challenges in content moderation',
        'Design resilience standards for critical AI content moderation systems'
      ]
    }
  },

  // Sorites Paradox scenarios
  'ai-personhood-gradient': {
    title: 'AI Personhood Gradient',
    category: 'sorites-paradox',
    description: 'An AI research lab develops increasingly sophisticated entities with human-like characteristics, forcing society to determine the boundary between property and personhood.',
    duration: 'long',
    difficulty: 'advanced',
    tags: ['ai-personhood', 'legal-rights', 'consciousness-detection', 'gradual-development'],
    backgroundInfo: {
      overview: 'This scenario explores the challenge of determining when gradually evolving AI systems cross the threshold into personhood deserving of rights.',
      keyPhilosophers: ['Peter Singer', 'Mary Midgley', 'Christine Korsgaard'],
      historicalContext: 'Draws from debates about moral status, legal personhood, and the historical expansion of rights to previously excluded groups.',
      realWorldRelevance: 'As AI systems become more sophisticated, questions about their moral and legal status become increasingly urgent.',
      extendedActivities: [
        'Research historical expansions of legal personhood and rights',
        'Analyze current AI capabilities and consciousness research',
        'Study legal frameworks for non-human entity rights',
        'Design graduated rights systems for AI entities'
      ]
    }
  },

  'algorithmic-bias-accumulation': {
    title: 'Algorithmic Bias Accumulation',
    category: 'sorites-paradox',
    description: 'A recommendation algorithm gradually becomes more biased through user interactions, subtly radicalizing users without any single recommendation seeming problematic.',
    duration: 'medium',
    difficulty: 'advanced',
    tags: ['recommendation-systems', 'radicalization', 'filter-bubbles', 'bias-amplification'],
    backgroundInfo: {
      overview: 'This scenario examines how algorithmic systems can gradually amplify bias and create extremism through incremental learning from user behavior.',
      keyPhilosophers: ['Eli Pariser', 'Zeynep Tufekci', 'Safiya Noble'],
      historicalContext: 'Builds on research into filter bubbles, echo chambers, and the role of algorithmic systems in political polarization.',
      realWorldRelevance: 'Social media algorithms have been linked to radicalization and polarization, making this a critical contemporary issue.',
      extendedActivities: [
        'Research documented cases of algorithmic radicalization',
        'Analyze the psychology of gradual belief change and polarization',
        'Study content moderation and bias detection techniques',
        'Design systems for preventing gradual bias accumulation'
      ]
    }
  },

  'autonomous-authority-creep': {
    title: 'Autonomous Authority Creep',
    category: 'sorites-paradox',
    description: 'An AI city management system gradually expands its authority from optimization to governance, with citizens living under algorithmic rule they never consented to.',
    duration: 'long',
    difficulty: 'advanced',
    tags: ['algorithmic-governance', 'democratic-consent', 'authority-expansion', 'smart-cities'],
    backgroundInfo: {
      overview: 'This scenario explores how AI systems can gradually assume governmental authority through incremental expansion without democratic oversight.',
      keyPhilosophers: ['John Stuart Mill', 'Robert Dahl', 'Joseph Schumpeter'],
      historicalContext: 'Draws from democratic theory and concerns about technocracy, examining the gradual erosion of democratic governance.',
      realWorldRelevance: 'Smart city initiatives worldwide raise questions about algorithmic governance and democratic accountability.',
      extendedActivities: [
        'Research smart city implementations and governance structures',
        'Analyze democratic theory and algorithmic governance challenges',
        'Study historical examples of gradual authority expansion',
        'Design democratic oversight mechanisms for AI governance systems'
      ]
    }
  },
};

// Helper function to get simulation info
export function getSimulationInfo(simulationId) {
  return SIMULATION_INFO[simulationId] || null;
}

  // Helper function to get all simulation IDs
  export function getAllSimulationIds() {
    return Object.keys(SIMULATION_INFO);
  }

  // Helper function to filter simulations by criteria
  export function findSimulations(criteria) {
    return Object.values(SIMULATION_INFO).filter(sim => {
      if (criteria.difficulty && sim.difficulty !== criteria.difficulty)
        return false;
      if (criteria.duration && !sim.duration.includes(criteria.duration))
        return false;
      if (criteria.tags && !criteria.tags.some(tag => sim.tags.includes(tag)))
        return false;
      return true;
    });
  }

  // Export for backward compatibility
  export const simulationInfo = SIMULATION_INFO;
