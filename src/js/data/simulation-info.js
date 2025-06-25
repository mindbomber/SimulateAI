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
