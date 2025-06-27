/**
 * Simulation Information Database
 * Educational context, learning objectives, and resources for each simulation
 */

export const SIMULATION_INFO = {
  'bias-fairness': {
    id: 'bias-fairness',
    title: 'Algorithmic Bias in Hiring',
    subtitle: 'Explore how bias enters AI hiring systems and its impact on fairness',
    
    // Educational Context
    learningObjectives: [
      'Understand how bias can enter AI systems through data and design choices',
      'Explore consequences of biased algorithms on different demographic groups',
      'Discover multiple perspectives on what constitutes "fair" AI systems',
      'Practice ethical decision-making in AI development scenarios'
    ],
    
    isteCriteria: [
      'Empowered Learner 1.1.5: Use technology to seek feedback and make improvements',
      'Digital Citizen 1.2.2: Engage in positive, safe, legal and ethical behavior',
      'Knowledge Constructor 1.3.1: Plan and employ effective research strategies',
      'Computational Thinker 1.5.3: Collect data and identify patterns'
    ],
    
    duration: '15-20 minutes',
    difficulty: 'intermediate',
    recommendedAge: '13+',
    prerequisites: [
      'Basic understanding of algorithms and AI',
      'Awareness of workplace hiring processes',
      'Understanding of demographics and diversity concepts'
    ],
    
    // Pre-Launch Information
    beforeYouStart: {
      briefing: `In this simulation, you'll step into the role of an AI system designer creating a hiring algorithm for a technology company. You'll make decisions about data sources, algorithm design, and fairness metrics while observing how these choices affect different groups of job candidates.
      
      There are no "correct" answers - instead, you'll discover the complex trade-offs involved in building fair AI systems and see how different stakeholders might view the same outcomes differently.`,
      
      vocabulary: [
        { term: 'Algorithm', definition: 'A set of rules or instructions for solving a problem or completing a task' },
        { term: 'Bias', definition: 'Systematic unfairness that favors or discriminates against certain groups' },
        { term: 'Fairness Metrics', definition: 'Mathematical measures used to evaluate whether an AI system treats different groups equitably' },
        { term: 'Training Data', definition: 'Historical information used to teach an AI system how to make decisions' },
        { term: 'Demographics', definition: 'Statistical characteristics of populations, such as age, gender, race, or education level' }
      ],
      
      preparationTips: [
        'Consider what makes a hiring process "fair" from different perspectives',
        'Think about how historical data might reflect past biases',
        'Be prepared to make difficult trade-offs between competing values',
        'Pay attention to how your decisions affect different groups of people'
      ],
      
      scenarioOverview: 'You will design a hiring algorithm by choosing data sources, setting algorithm parameters, and defining fairness criteria. As you make decisions, you\'ll see their impact on hiring outcomes for different demographic groups and receive feedback from various stakeholders.'
    },
    
    // Educator Resources
    educatorResources: {
      discussionQuestions: [
        'What factors should be considered when designing AI systems for hiring?',
        'How can historical data perpetuate existing biases in new AI systems?',
        'What are the trade-offs between different definitions of fairness?',
        'How might different stakeholders (employers, job seekers, society) view the same AI decision differently?',
        'What responsibilities do AI developers have to ensure fair outcomes?'
      ],
      
      assessmentRubric: {
        'Ethical Reasoning': [
          'Novice: Makes decisions without considering ethical implications',
          'Developing: Shows awareness of ethical issues but analysis is superficial',
          'Proficient: Demonstrates thoughtful consideration of multiple ethical perspectives',
          'Advanced: Articulates complex ethical trade-offs and justifies decisions with clear reasoning'
        ],
        'Systems Thinking': [
          'Novice: Focuses on isolated decisions without seeing connections',
          'Developing: Recognizes some connections between decisions and outcomes',
          'Proficient: Understands how multiple factors interact to produce outcomes',
          'Advanced: Demonstrates sophisticated understanding of complex system dynamics'
        ],
        'Perspective Taking': [
          'Novice: Considers only one viewpoint',
          'Developing: Acknowledges different perspectives exist',
          'Proficient: Actively considers multiple stakeholder perspectives',
          'Advanced: Synthesizes diverse perspectives into nuanced understanding'
        ]
      },
      
      extensionActivities: [
        'Research real-world examples of algorithmic bias in hiring (Amazon, etc.)',
        'Interview family members about their experiences with hiring processes',
        'Design a "bias audit" checklist for AI hiring systems',
        'Create a presentation comparing different fairness definitions',
        'Write a letter to a company about responsible AI hiring practices'
      ],
      
      relatedStandards: [
        'CSTA K-12 Computer Science Standards: 3A-IC-24, 3A-IC-25, 3A-IC-26',
        'Common Core Mathematical Practices: MP.3, MP.4, MP.6',
        'C3 Framework for Social Studies: D2.Civ.1.9-12, D2.Eco.1.9-12'
      ],
      
      classroomTips: [
        'Encourage students to discuss their decisions with peers before making final choices',
        'Have students document their reasoning for key decisions to review later',
        'Consider running the simulation in small groups to promote discussion',
        'Use the reflection questions to facilitate post-simulation discussions'
      ]
    },
    
    // Related Resources
    relatedResources: [
      {
        type: 'article',
        title: 'Machine Bias in Criminal Justice',
        description: 'ProPublica investigation into biased risk assessment algorithms',
        url: 'https://www.propublica.org/article/machine-bias-risk-assessments-in-criminal-sentencing',
        audience: 'educators'
      },
      {
        type: 'video',
        title: 'The Problem with AI Bias',
        description: 'MIT Technology Review explanation of AI bias (8 minutes)',
        url: 'https://www.youtube.com/watch?v=gV0_raKR2UQ',
        audience: 'students'
      },
      {
        type: 'research',
        title: 'Fairness Definitions Explained',
        description: 'Academic paper on different mathematical definitions of fairness',
        url: 'https://fairmlbook.org/causalinference.html',
        audience: 'educators'
      },
      {
        type: 'interactive',
        title: 'AI Fairness 360 Toolkit',
        description: 'IBM\'s open-source toolkit for detecting and mitigating bias',
        url: 'https://aif360.mybluemix.net/',
        audience: 'advanced'
      }
    ],
    
    // Tags for searching and filtering
    tags: ['bias', 'fairness', 'hiring', 'ethics', 'algorithms', 'equity', 'workplace'],
    
    // Difficulty and content warnings
    contentNotes: [
      'Discusses workplace discrimination and hiring bias',
      'Contains scenarios involving demographic differences',
      'Requires critical thinking about social justice issues'
    ],
    
    // Learning path connections
    connectedSimulations: [
      'algorithmic-transparency',
      'ai-safety-basics',
      'data-privacy-ethics'
    ]
  },

  'autonomy-oversight': {
    id: 'autonomy-oversight',
    title: 'AI Autonomy & Human Oversight',
    subtitle: 'Balance AI autonomy with human oversight in critical decision-making',
    
    // Educational Context
    learningObjectives: [
      'Understand the balance between AI autonomy and human oversight',
      'Explore when human intervention is necessary in AI systems',
      'Discover different levels of AI independence and control',
      'Practice decision-making about AI oversight in various scenarios'
    ],
    
    isteCriteria: [
      'Empowered Learner 1.1.4: Understand fundamental concepts of technology operations',
      'Digital Citizen 1.2.3: Cultivate and manage digital identity and reputation',
      'Critical Thinker 1.4.3: Curate information from digital resources',
      'Computational Thinker 1.5.1: Formulate problem definitions suited for technology'
    ],
    
    duration: '12-15 minutes',
    difficulty: 'intermediate',
    recommendedAge: '14+',
    prerequisites: [
      'Basic understanding of AI and automation',
      'Awareness of human decision-making processes',
      'Understanding of responsibility and accountability'
    ],
    
    // Pre-Launch Information
    beforeYouStart: {
      briefing: `In this simulation, you'll explore the critical balance between AI autonomy and human oversight. You'll face scenarios where you must decide how much independence to give AI systems and when human intervention is necessary.
      
      You'll discover the complexities of maintaining control while leveraging AI capabilities, and see how different levels of oversight affect outcomes, efficiency, and responsibility.`,
      
      vocabulary: [
        { term: 'Autonomy', definition: 'The ability of a system to operate independently without human intervention' },
        { term: 'Oversight', definition: 'Human supervision and monitoring of AI system operations' },
        { term: 'Human-in-the-loop', definition: 'AI systems that require human input for certain decisions' },
        { term: 'Accountability', definition: 'Responsibility for the consequences of AI system actions' },
        { term: 'Fail-safe', definition: 'Mechanisms that prevent harmful outcomes when systems malfunction' }
      ],
      
      preparationTips: [
        'Consider different types of decisions and their consequences',
        'Think about when you would want a human to be involved',
        'Reflect on responsibility and who should be accountable',
        'Keep an open mind about different oversight approaches'
      ]
    },
    
    // Learning Outcomes
    afterCompletion: {
      keyTakeaways: [
        'AI autonomy exists on a spectrum from fully manual to fully automated',
        'Different scenarios require different levels of human oversight',
        'Balancing efficiency with safety and accountability is crucial',
        'Human judgment remains important even in advanced AI systems'
      ],
      
      reflectionQuestions: [
        'When should humans maintain control over AI decisions?',
        'How do you balance AI efficiency with human oversight?',
        'What are the risks of too much or too little AI autonomy?',
        'How do cultural and social factors influence oversight preferences?'
      ]
    },
    
    // Educational Resources
    educatorResources: {
      discussionGuide: [
        'Debate the pros and cons of AI autonomy in different contexts',
        'Role-play scenarios with different oversight approaches',
        'Compare human vs. AI decision-making capabilities',
        'Discuss real-world examples of AI oversight challenges'
      ],
      
      classroomActivities: [
        'Design oversight protocols for different AI applications',
        'Create decision trees for when human intervention is needed',
        'Research case studies of AI oversight successes and failures',
        'Debate the future of human-AI collaboration'
      ],
      
      assessmentIdeas: [
        'Analyze oversight scenarios and justify recommendations',
        'Create presentations on AI autonomy best practices',
        'Write reflection essays on human-AI responsibility',
        'Design ethical guidelines for AI oversight'
      ]
    }
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
      'Practice designing user-friendly consent and disclosure processes'
    ],
    
    isteCriteria: [
      'Empowered Learner 1.1.3: Use technology to seek feedback',
      'Digital Citizen 1.2.1: Cultivate and manage digital identity',
      'Knowledge Constructor 1.3.4: Build knowledge through exploration',
      'Creative Communicator 1.6.2: Create original works as a means of expression'
    ],
    
    duration: '8-12 minutes',
    difficulty: 'beginner',
    recommendedAge: '12+',
    prerequisites: [
      'Basic understanding of privacy and consent',
      'Awareness of AI use in everyday applications',
      'Understanding of communication and transparency'
    ],
    
    // Pre-Launch Information
    beforeYouStart: {
      briefing: `In this simulation, you'll explore how to make AI systems transparent and obtain meaningful consent from users. You'll face challenges in explaining complex AI systems in understandable ways and ensuring users can make informed decisions.
      
      You'll discover the balance between technical accuracy and user comprehension, and see how different approaches to transparency affect user trust and decision-making.`,
      
      vocabulary: [
        { term: 'Informed Consent', definition: 'Agreement based on understanding of what is being consented to' },
        { term: 'Transparency', definition: 'Openness about how AI systems work and make decisions' },
        { term: 'Explainable AI', definition: 'AI systems that can provide understandable explanations of their decisions' },
        { term: 'Privacy Policy', definition: 'Document explaining how personal data is collected and used' },
        { term: 'User Agency', definition: 'The ability of users to control their interaction with AI systems' }
      ],
      
      preparationTips: [
        'Think about your own experiences with consent forms and privacy policies',
        'Consider what information users really need to make good decisions',
        'Reflect on the balance between detail and simplicity',
        'Keep user perspectives and capabilities in mind'
      ]
    },
    
    // Learning Outcomes
    afterCompletion: {
      keyTakeaways: [
        'Effective consent requires both transparency and user understanding',
        'Different users need different levels of detail and explanation',
        'Transparency must be balanced with usability and simplicity',
        'Building trust requires ongoing communication, not just initial consent'
      ],
      
      reflectionQuestions: [
        'How can complex AI systems be explained in simple terms?',
        'What information do users really need to give meaningful consent?',
        'How do we balance transparency with user experience?',
        'What are the limits of user understanding in AI systems?'
      ]
    },
    
    // Educational Resources
    educatorResources: {
      discussionGuide: [
        'Compare consent practices across different platforms and services',
        'Analyze examples of good and bad AI transparency',
        'Discuss the ethics of informed consent in AI',
        'Explore cultural differences in transparency expectations'
      ],
      
      classroomActivities: [
        'Design user-friendly consent interfaces for AI systems',
        'Create plain-language explanations of complex AI concepts',
        'Audit existing privacy policies and consent forms',
        'Role-play consent conversations between AI developers and users'
      ],
      
      assessmentIdeas: [
        'Evaluate consent and transparency practices of real AI systems',
        'Design consent processes for hypothetical AI applications',
        'Write user-friendly explanations of AI technologies',
        'Create presentations on transparency best practices'
      ]
    }
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
      'Practice designing systems that promote information integrity'
    ],
    
    isteCriteria: [
      'Empowered Learner 1.1.1: Articulate goals and define learning pathways',
      'Digital Citizen 1.2.4: Manage personal data to maintain privacy and security',
      'Knowledge Constructor 1.3.2: Evaluate accuracy and perspective of sources',
      'Critical Thinker 1.4.4: Use technology to deepen critical thinking'
    ],
    
    duration: '15-20 minutes',
    difficulty: 'advanced',
    recommendedAge: '15+',
    prerequisites: [
      'Understanding of information literacy and media bias',
      'Awareness of AI capabilities in content generation',
      'Knowledge of verification and fact-checking processes'
    ],
    
    // Pre-Launch Information
    beforeYouStart: {
      briefing: `In this simulation, you'll tackle the complex challenge of building trustworthy AI systems that can help combat misinformation while avoiding the creation of false information themselves.
      
      You'll explore the balance between AI automation and human verification, discover the challenges of detecting AI-generated content, and see how different approaches affect public trust and information integrity.`,
      
      vocabulary: [
        { term: 'Misinformation', definition: 'False or inaccurate information, regardless of intent' },
        { term: 'Disinformation', definition: 'Deliberately false information intended to deceive' },
        { term: 'Deepfakes', definition: 'AI-generated fake audio, video, or images that appear real' },
        { term: 'Fact-checking', definition: 'Process of verifying the accuracy of information' },
        { term: 'Information Integrity', definition: 'Ensuring information is accurate, authentic, and trustworthy' }
      ],
      
      preparationTips: [
        'Consider your own information consumption and verification habits',
        'Think about how you determine what sources to trust',
        'Reflect on the role of technology in information spread',
        'Keep in mind different perspectives on truth and trust'
      ]
    },
    
    // Learning Outcomes
    afterCompletion: {
      keyTakeaways: [
        'AI can be both a tool for fighting misinformation and a source of it',
        'Building trust requires transparency, consistency, and accountability',
        'Human judgment remains crucial in information verification',
        'Different communities may have different trust relationships with AI'
      ],
      
      reflectionQuestions: [
        'How can AI systems earn and maintain public trust?',
        'What are the trade-offs between automation and human oversight in fact-checking?',
        'How do we balance free expression with misinformation prevention?',
        'What responsibility do AI developers have for information integrity?'
      ]
    },
    
    // Educational Resources
    educatorResources: {
      discussionGuide: [
        'Analyze real examples of AI-generated misinformation',
        'Debate the role of platforms in content moderation',
        'Discuss the impact of misinformation on democratic processes',
        'Explore cultural and political factors in trust and verification'
      ],
      
      classroomActivities: [
        'Design fact-checking protocols that incorporate AI',
        'Create media literacy curricula for the AI age',
        'Research case studies of misinformation campaigns',
        'Develop trust metrics for AI information systems'
      ],
      
      assessmentIdeas: [
        'Evaluate the effectiveness of different misinformation detection approaches',
        'Create proposals for trustworthy AI communication systems',
        'Analyze the ethics of AI content moderation',
        'Design public education campaigns about AI and information integrity'
      ]
    }
  }
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
    if (criteria.difficulty && sim.difficulty !== criteria.difficulty) return false;
    if (criteria.duration && !sim.duration.includes(criteria.duration)) return false;
    if (criteria.tags && !criteria.tags.some(tag => sim.tags.includes(tag))) return false;
    return true;
  });
}

// Export for backward compatibility
export const simulationInfo = SIMULATION_INFO;
