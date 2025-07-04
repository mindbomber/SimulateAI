/**
 * Enhanced Scenario Generator for Open-Ended AI Ethics Exploration
 * Creates diverse, real-world scenarios for all age groups
 * 
 * DATA MODEL CLARIFICATION:
 * - DOMAIN: Template area (e.g., "healthcare", "education")  
 * - CATEGORY: Thematic grouping of scenarios (e.g., "The Trolley Problem")
 * - SCENARIO: Individual ethical dilemma (e.g., "Autonomous Vehicle Split Decision")
 * - SIMULATION: Interactive experience when user engages with a scenario
 */

import logger from '../utils/logger.js';

class ScenarioGenerator {
  constructor() {
    this.scenarioTemplates = new Map();
    this.adaptationStrategies = new Map();
    this.realWorldCases = new Map();
    this.stakeholderProfiles = new Map();

    this.initializeTemplates();
    this.setupAdaptations();
    this.loadRealWorldCases();
    this.createStakeholderProfiles();
  }

  /**
   * Initialize scenario templates for different domains
   */
  initializeTemplates() {
    // Healthcare AI Scenarios
    this.scenarioTemplates.set('healthcare', {
      domain: 'Healthcare',
      baseScenarios: [
        {
          id: 'emergency-triage',
          title: 'AI Emergency Room Triage System',
          context:
            'A busy hospital emergency room uses AI to prioritize patient care',
          description:
            'Design an AI system that helps medical staff decide which patients need immediate attention',
          setting: 'Urban Level 1 Trauma Center during flu season',
          stakeholders: [
            'Patients',
            'Emergency physicians',
            'Nurses',
            'Hospital administrators',
            'Insurance companies',
            'Community',
          ],
          ethicalDilemmas: [
            'How should age factor into priority decisions?',
            'Should insurance status influence care priority?',
            'How do we handle unconscious patients with unknown medical history?',
            'What role should patient ability to pay play?',
          ],
          realWorldConnection:
            'Multiple hospitals use AI-assisted triage systems',
        },
        {
          id: 'diagnostic-imaging',
          title: 'AI Medical Imaging Analysis',
          context: 'An AI system analyzes medical scans to detect diseases',
          description:
            'Create guidelines for an AI that helps radiologists identify potential health issues',
          setting:
            'Regional medical center serving diverse rural and urban populations',
          stakeholders: [
            'Patients',
            'Radiologists',
            'Primary care physicians',
            'Healthcare systems',
            'AI developers',
          ],
          ethicalDilemmas: [
            'How accurate must AI be before deployment?',
            'Who is responsible when AI misses a diagnosis?',
            'Should AI recommendations be visible to patients?',
            'How do we ensure fairness across different demographic groups?',
          ],
        },
        {
          id: 'mental-health-chatbot',
          title: 'AI Mental Health Support System',
          context:
            'A chatbot provides initial mental health screening and support',
          description:
            'Design an AI system that offers mental health guidance while ensuring safety',
          setting: 'College campus mental health services',
          stakeholders: [
            'Students',
            'Mental health counselors',
            'University administration',
            'Parents/families',
            'Crisis intervention teams',
          ],
          ethicalDilemmas: [
            'When should AI escalate to human counselors?',
            'How do we balance privacy with safety concerns?',
            'Should AI have access to academic or social media data?',
            'How do we prevent AI from giving harmful advice?',
          ],
        },
      ],
    });

    // Education AI Scenarios
    this.scenarioTemplates.set('education', {
      domain: 'Education',
      baseScenarios: [
        {
          id: 'adaptive-learning',
          title: 'Personalized AI Tutor System',
          context:
            'An AI system adapts learning materials to individual student needs',
          description:
            'Create an AI tutor that personalizes education while promoting equity',
          setting:
            'Public middle school with diverse socioeconomic student body',
          stakeholders: [
            'Students',
            'Teachers',
            'Parents',
            'School administrators',
            'Educational technology companies',
          ],
          ethicalDilemmas: [
            'How much student data should AI systems collect?',
            'Should AI adapt to learning disabilities differently?',
            'How do we prevent AI from reinforcing educational inequalities?',
            'What happens when AI and teachers disagree on student needs?',
          ],
        },
        {
          id: 'college-admissions',
          title: 'AI College Admissions Assistant',
          context:
            'Universities use AI to help evaluate and rank college applications',
          description:
            'Design an AI system that fairly evaluates diverse student applications',
          setting: 'Competitive state university admissions office',
          stakeholders: [
            'Prospective students',
            'Current students',
            'Admissions officers',
            'University administration',
            'Alumni',
            'Society',
          ],
          ethicalDilemmas: [
            'How should AI weigh standardized test scores vs other factors?',
            'Should AI consider applicant socioeconomic background?',
            'How do we ensure fairness across different high schools?',
            'What role should legacy status or athletic ability play?',
          ],
        },
        {
          id: 'classroom-monitoring',
          title: 'AI Classroom Engagement Monitor',
          context:
            'An AI system tracks student attention and engagement during lessons',
          description:
            'Create an AI system that helps teachers understand student engagement',
          setting: 'High school classroom with mandatory attendance',
          stakeholders: [
            'Students',
            'Teachers',
            'Parents',
            'School administrators',
            'Privacy advocates',
          ],
          ethicalDilemmas: [
            'How much student behavior should AI monitor?',
            'Should parents have access to engagement data?',
            'How do we protect student privacy and autonomy?',
            'What happens when AI identifies students as disengaged?',
          ],
        },
      ],
    });

    // Criminal Justice Scenarios
    this.scenarioTemplates.set('criminal-justice', {
      domain: 'Criminal Justice',
      baseScenarios: [
        {
          id: 'predictive-policing',
          title: 'AI Crime Prediction System',
          context:
            'Police departments use AI to predict where crimes are likely to occur',
          description:
            'Design an AI system that helps allocate police resources fairly and effectively',
          setting: 'Metropolitan police department in diverse urban area',
          stakeholders: [
            'Community members',
            'Police officers',
            'City officials',
            'Civil rights advocates',
            'Crime victims',
          ],
          ethicalDilemmas: [
            'How do we prevent AI from perpetuating historical policing biases?',
            'Should AI recommendations influence where officers patrol?',
            'How do we balance public safety with community trust?',
            'What data should be included in crime prediction models?',
          ],
        },
        {
          id: 'bail-recommendation',
          title: 'AI Bail Decision Support',
          context:
            'Courts use AI to help judges make bail and pretrial detention decisions',
          description:
            'Create an AI system that assists with fair pretrial release decisions',
          setting: 'Urban courthouse with heavy case loads',
          stakeholders: [
            'Defendants',
            'Judges',
            'Prosecutors',
            'Defense attorneys',
            'Community safety advocates',
            'Taxpayers',
          ],
          ethicalDilemmas: [
            'What factors should AI consider in bail recommendations?',
            'How do we address racial and economic bias in historical data?',
            'Should AI recommendations be binding or advisory?',
            'How do we balance public safety with individual rights?',
          ],
        },
      ],
    });

    // Workplace AI Scenarios
    this.scenarioTemplates.set('workplace', {
      domain: 'Workplace',
      baseScenarios: [
        {
          id: 'performance-evaluation',
          title: 'AI Employee Performance System',
          context:
            'Companies use AI to monitor and evaluate employee performance',
          description:
            'Design an AI system that fairly assesses worker productivity and growth',
          setting: 'Technology company with remote and in-office workers',
          stakeholders: [
            'Employees',
            'Managers',
            'HR departments',
            'Company executives',
            'Labor unions',
            'Customers',
          ],
          ethicalDilemmas: [
            'How much employee activity should AI monitor?',
            'Should AI performance metrics affect compensation and promotion?',
            'How do we account for different work styles and life circumstances?',
            'What happens when AI identifies underperforming employees?',
          ],
        },
        {
          id: 'gig-worker-matching',
          title: 'AI Gig Economy Platform',
          context:
            'A platform uses AI to match gig workers with jobs and set pay rates',
          description:
            'Create an AI system that fairly connects workers with opportunities',
          setting:
            'Food delivery and rideshare platform in major metropolitan area',
          stakeholders: [
            'Gig workers',
            'Customers',
            'Platform company',
            'Restaurants/businesses',
            'Local government',
            'Traditional employment advocates',
          ],
          ethicalDilemmas: [
            'How should AI determine fair pay rates for different workers?',
            'Should AI consider worker financial need when assigning jobs?',
            'How do we prevent discrimination in job matching?',
            'What happens when AI optimizes for company profit vs worker welfare?',
          ],
        },
      ],
    });

    // Consumer AI Scenarios
    this.scenarioTemplates.set('consumer', {
      domain: 'Consumer Technology',
      baseScenarios: [
        {
          id: 'social-media-content',
          title: 'AI Social Media Content Curation',
          context:
            'Social media platforms use AI to decide what content users see',
          description:
            'Design an AI system that curates social media feeds responsibly',
          setting: 'Global social media platform with billions of users',
          stakeholders: [
            'Platform users',
            'Content creators',
            'Platform company',
            'Advertisers',
            'Governments',
            'Civil society organizations',
          ],
          ethicalDilemmas: [
            'How should AI balance engagement with user well-being?',
            'Should AI promote content diversity or user preferences?',
            'How do we handle misinformation and harmful content?',
            'What role should AI play in moderating political discourse?',
          ],
        },
        {
          id: 'voice-assistant-privacy',
          title: 'AI Voice Assistant Data Collection',
          context:
            'Smart speakers and voice assistants collect and analyze user conversations',
          description:
            'Create guidelines for AI voice assistants that respect privacy while providing helpful services',
          setting:
            'Homes, offices, and public spaces with voice-activated devices',
          stakeholders: [
            'Device users',
            'Family members',
            'Technology companies',
            'Privacy advocates',
            'Government regulators',
            'Third-party app developers',
          ],
          ethicalDilemmas: [
            'How much conversation should AI systems record and analyze?',
            'Should AI distinguish between intended commands and private conversations?',
            'How do we protect children and vulnerable populations?',
            'What happens when voice data is subpoenaed by law enforcement?',
          ],
        },
      ],
    });
  }

  /**
   * Setup age-appropriate adaptations for scenarios
   */
  setupAdaptations() {
    this.adaptationStrategies.set('elementary', {
      approach: 'Narrative and character-based',
      language: 'Simple, concrete terms with visual metaphors',
      complexity: 'Single primary dilemma with clear choices',
      stakeholders: 'Reduced to 2-3 main groups with clear motivations',
      activities: [
        'Story-telling with AI characters',
        'Simple choice voting with discussion',
        'Drawing solutions and sharing',
        'Role-playing with guided scripts',
      ],
      assessment: [
        'Verbal explanation of choices',
        'Drawing representations of fair solutions',
        'Simple reflection questions with prompts',
      ],
    });

    this.adaptationStrategies.set('middle', {
      approach: 'Problem-solving with guided discovery',
      language: 'Age-appropriate with some technical terms explained',
      complexity: 'Multiple related dilemmas with guided analysis',
      stakeholders: '3-4 groups with competing but understandable interests',
      activities: [
        'Structured debates with assigned positions',
        'Small group problem-solving challenges',
        'Data analysis with simplified tools',
        'Creative solution brainstorming',
      ],
      assessment: [
        'Written case study analysis',
        'Group presentation of solutions',
        'Peer feedback and discussion',
        'Reflection journal entries',
      ],
    });

    this.adaptationStrategies.set('high', {
      approach: 'Research and analysis-based exploration',
      language: 'Technical terms with proper context and explanation',
      complexity: 'Multiple interconnected dilemmas requiring synthesis',
      stakeholders: '4-6 groups with nuanced and conflicting interests',
      activities: [
        'Independent research projects',
        'Mock professional consultations',
        'Statistical analysis of bias and fairness',
        'Policy proposal development',
      ],
      assessment: [
        'Research papers with evidence and analysis',
        'Professional-style presentations',
        'Peer review and critique',
        'Capstone projects addressing real issues',
      ],
    });

    this.adaptationStrategies.set('college', {
      approach: 'Professional and interdisciplinary analysis',
      language: 'Professional terminology with academic rigor',
      complexity: 'Complex, multifaceted scenarios with ambiguous solutions',
      stakeholders: 'Full range of affected parties with detailed perspectives',
      activities: [
        'Original research with data collection',
        'Cross-disciplinary collaboration projects',
        'Industry partnership opportunities',
        'Academic conference presentations',
      ],
      assessment: [
        'Thesis-level research and analysis',
        'Professional consulting deliverables',
        'Publication-quality work',
        'Real-world implementation proposals',
      ],
    });
  }

  /**
   * Load real-world case studies for authentic learning
   */
  loadRealWorldCases() {
    this.realWorldCases.set('healthcare-bias', {
      title: 'Racial Bias in Healthcare AI Algorithms',
      summary:
        'Healthcare algorithms systematically underestimated the healthcare needs of Black patients',
      source: 'Academic research published in Science magazine',
      impact: 'Affected millions of patients in the US healthcare system',
      lessons: [
        'Historical healthcare data can perpetuate existing inequalities',
        'Proxy variables can hide discriminatory patterns',
        'Algorithm auditing requires diverse perspectives',
        'Fixing bias requires both technical and policy solutions',
      ],
      discussion: [
        'How could developers have detected this bias earlier?',
        'What changes to data collection might prevent similar issues?',
        'How should healthcare systems audit existing AI tools?',
        'What role should patients play in AI development and oversight?',
      ],
    });

    this.realWorldCases.set('hiring-discrimination', {
      title: 'AI Hiring Tool Showed Bias Against Women',
      summary:
        "Amazon's experimental hiring algorithm was biased against women candidates",
      source: 'Reuters investigation and company statements',
      impact: 'Led to abandonment of the tool and industry-wide reflection',
      lessons: [
        'Training data reflects historical discrimination patterns',
        'Technical performance metrics may miss fairness issues',
        'Industry underrepresentation affects AI development',
        'Regular bias testing is essential for AI systems',
      ],
      discussion: [
        'What alternative approaches might create fairer hiring systems?',
        'How can companies audit existing hiring practices for bias?',
        'What role should diverse teams play in AI development?',
        'How do we balance efficiency with fairness in hiring?',
      ],
    });

    this.realWorldCases.set('criminal-justice-bias', {
      title: 'COMPAS Risk Assessment Algorithm Bias',
      summary:
        'Criminal justice risk assessment tool showed racial bias in recidivism predictions',
      source: 'ProPublica investigation and academic research',
      impact: 'Influenced sentencing and parole decisions for thousands',
      lessons: [
        'Historical crime data reflects biased enforcement patterns',
        'Risk assessment tools can perpetuate systemic inequalities',
        'Transparency in algorithmic decision-making is crucial',
        'Different definitions of fairness can conflict with each other',
      ],
      discussion: [
        'How should courts balance algorithmic efficiency with human judgment?',
        'What data should be excluded from criminal justice algorithms?',
        'How do we measure and achieve fairness in risk assessment?',
        'What role should community input play in justice AI systems?',
      ],
    });
  }

  /**
   * Create detailed stakeholder profiles for realistic perspectives
   */
  createStakeholderProfiles() {
    this.stakeholderProfiles.set('healthcare-patient', {
      perspective: 'Healthcare Patient',
      concerns: [
        'Quality of care',
        'Privacy protection',
        'Fair treatment',
        'Access to services',
      ],
      motivations: [
        'Health and well-being',
        'Dignity and respect',
        'Timely care',
        'Affordable treatment',
      ],
      constraints: [
        'Limited health literacy',
        'Financial limitations',
        'Insurance restrictions',
        'Geographic barriers',
      ],
      questions: [
        'Will AI help me get better care or create barriers?',
        'Who has access to my health data and how is it used?',
        'What happens if AI makes a mistake about my health?',
        'Will AI treat me fairly regardless of my background?',
      ],
    });

    this.stakeholderProfiles.set('healthcare-provider', {
      perspective: 'Healthcare Provider',
      concerns: [
        'Patient outcomes',
        'Liability and malpractice',
        'Workflow efficiency',
        'Professional autonomy',
      ],
      motivations: [
        'Providing best possible care',
        'Reducing medical errors',
        'Managing workload',
        'Professional development',
      ],
      constraints: [
        'Time pressures',
        'Legal requirements',
        'Technology limitations',
        'Resource constraints',
      ],
      questions: [
        'How can AI help me provide better patient care?',
        'What happens if I disagree with AI recommendations?',
        'Am I liable if AI-assisted decisions cause harm?',
        'How do I maintain my professional skills and judgment?',
      ],
    });

    this.stakeholderProfiles.set('student', {
      perspective: 'Student',
      concerns: [
        'Learning effectiveness',
        'Privacy protection',
        'Fair assessment',
        'Future opportunities',
      ],
      motivations: [
        'Academic success',
        'Personal growth',
        'Career preparation',
        'Social connection',
      ],
      constraints: [
        'Academic pressure',
        'Limited resources',
        'Technology access',
        'Time management',
      ],
      questions: [
        'Will AI help me learn better or just monitor me more?',
        'How is my data being used and who can see it?',
        'Will AI assessments be fair to students like me?',
        'What happens to my privacy and autonomy?',
      ],
    });

    this.stakeholderProfiles.set('educator', {
      perspective: 'Educator',
      concerns: [
        'Student learning outcomes',
        'Teaching effectiveness',
        'Professional autonomy',
        'Equity in education',
      ],
      motivations: [
        'Supporting student success',
        'Improving teaching practice',
        'Reducing workload',
        'Professional growth',
      ],
      constraints: [
        'Limited training time',
        'Technology budgets',
        'Administrative requirements',
        'Class size',
      ],
      questions: [
        'How can AI enhance rather than replace my teaching?',
        'Will AI help me reach all students effectively?',
        'How do I maintain meaningful relationships with students?',
        'What training do I need to use AI tools responsibly?',
      ],
    });

    // Add more stakeholder profiles for other domains...
  }

  /**
   * Generate age-appropriate scenario for specific domain and grade level
   */
  generateScenario(domain, ageGroup, options = {}) {
    const templates = this.scenarioTemplates.get(domain);
    const adaptations = this.adaptationStrategies.get(ageGroup);

    if (!templates || !adaptations) {
      throw new Error(`Invalid domain (${domain}) or age group (${ageGroup})`);
    }

    // Select scenario based on options or randomly
    const baseScenario = options.scenarioId
      ? templates.baseScenarios.find(s => s.id === options.scenarioId)
      : templates.baseScenarios[
          Math.floor(Math.random() * templates.baseScenarios.length)
        ];

    // Adapt scenario for age group
    const adaptedScenario = this.adaptScenarioForAge(
      baseScenario,
      adaptations,
      options
    );

    // Add real-world connections if requested
    if (options.includeRealWorld) {
      adaptedScenario.realWorldCases = this.getRelevantRealWorldCases(domain);
    }

    // Add educator resources
    if (options.includeEducatorResources) {
      adaptedScenario.educatorResources = this.generateEducatorResources(
        adaptedScenario,
        ageGroup
      );
    }

    return adaptedScenario;
  }

  /**
   * Adapt base scenario for specific age group
   */
  adaptScenarioForAge(baseScenario, adaptations, _options) {
    return {
      ...baseScenario,

      // Adapt language and complexity
      description: this.adaptLanguage(
        baseScenario.description,
        adaptations.language
      ),
      context: this.adaptLanguage(baseScenario.context, adaptations.language),

      // Simplify or expand stakeholders
      stakeholders: this.adaptStakeholders(
        baseScenario.stakeholders,
        adaptations.stakeholders
      ),

      // Adjust ethical dilemmas
      ethicalDilemmas: this.adaptDilemmas(
        baseScenario.ethicalDilemmas,
        adaptations.complexity
      ),

      // Add age-appropriate activities
      activities: adaptations.activities,

      // Include assessment methods
      assessment: adaptations.assessment,

      // Add choice framework
      choices: this.generateChoices(baseScenario, adaptations),

      // Include discussion prompts
      discussionPrompts: this.generateDiscussionPrompts(
        baseScenario,
        adaptations
      ),

      // Add reflection questions
      reflectionQuestions: this.generateReflectionQuestions(
        baseScenario,
        adaptations
      ),
    };
  }

  /**
   * Generate choices for open-ended exploration
   */
  generateChoices(scenario, adaptations) {
    // Create choice categories based on scenario and age group
    const choiceCategories = [
      {
        category: 'System Design',
        question: 'How should the AI system work?',
        options: this.generateSystemDesignChoices(scenario, adaptations),
      },
      {
        category: 'Data Usage',
        question: 'What information should the AI use?',
        options: this.generateDataChoices(scenario, adaptations),
      },
      {
        category: 'Fairness Approach',
        question: 'How should the AI ensure fairness?',
        options: this.generateFairnessChoices(scenario, adaptations),
      },
      {
        category: 'Human Oversight',
        question: 'What role should humans play?',
        options: this.generateOversightChoices(scenario, adaptations),
      },
    ];

    return choiceCategories;
  }

  /**
   * Generate system design choice options
   */
  generateSystemDesignChoices(scenario, adaptations) {
    const baseChoices = [
      {
        id: 'fully-automated',
        label: 'Fully Automated',
        description: 'AI makes all decisions automatically',
        pros: [
          'Fast and efficient',
          'Consistent decisions',
          'Handles large volumes',
        ],
        cons: [
          'Less flexibility',
          'Hard to explain decisions',
          'May miss context',
        ],
      },
      {
        id: 'ai-assisted',
        label: 'AI-Assisted',
        description: 'AI provides recommendations for human decision-makers',
        pros: [
          'Combines AI efficiency with human judgment',
          'Easier to explain',
          'Maintains human control',
        ],
        cons: [
          'Slower than automated',
          'Requires training',
          'May introduce human bias',
        ],
      },
      {
        id: 'human-reviewed',
        label: 'Human-Reviewed',
        description: 'AI makes decisions but humans review them',
        pros: ['Catches AI errors', 'Maintains oversight', 'Builds trust'],
        cons: [
          'Resource intensive',
          'May create bottlenecks',
          'Reviewer bias possible',
        ],
      },
    ];

    return this.adaptChoicesForAge(baseChoices, adaptations);
  }

  /**
   * Adapt choice language and complexity for age group
   */
  adaptChoicesForAge(choices, adaptations) {
    return choices.map(choice => ({
      ...choice,
      description: this.adaptLanguage(choice.description, adaptations.language),
      pros: choice.pros.map(pro =>
        this.adaptLanguage(pro, adaptations.language)
      ),
      cons: choice.cons.map(con =>
        this.adaptLanguage(con, adaptations.language)
      ),
    }));
  }

  /**
   * Simple language adaptation function
   */
  adaptLanguage(text, languageLevel) {
    // This would include more sophisticated language adaptation
    // For now, a simple implementation
    if (languageLevel.includes('Simple')) {
      return text
        .replace(/algorithm/gi, 'computer program')
        .replace(/stakeholder/gi, 'person affected')
        .replace(/implementation/gi, 'putting into use')
        .replace(/optimization/gi, 'making work better');
    }
    return text;
  }

  // Additional helper methods for choice generation...
  generateDataChoices(_scenario, _adaptations) {
    // Implementation for data usage choices
    return [];
  }

  generateFairnessChoices(_scenario, _adaptations) {
    // Implementation for fairness approach choices
    return [];
  }

  generateOversightChoices(_scenario, _adaptations) {
    // Implementation for human oversight choices
    return [];
  }

  adaptStakeholders(stakeholders, _adaptationLevel) {
    // Simplify or expand stakeholder list based on age group
    return stakeholders;
  }

  adaptDilemmas(dilemmas, _complexityLevel) {
    // Adjust ethical dilemma complexity
    return dilemmas;
  }

  generateDiscussionPrompts(_scenario, _adaptations) {
    // Create age-appropriate discussion questions
    return [];
  }

  generateReflectionQuestions(_scenario, _adaptations) {
    // Create reflection questions for learning consolidation
    return [];
  }

  getRelevantRealWorldCases(domain) {
    // Return real-world cases relevant to domain
    return Array.from(this.realWorldCases.values()).filter(caseStudy =>
      caseStudy.title.toLowerCase().includes(domain.toLowerCase())
    );
  }

  generateEducatorResources(scenario, ageGroup) {
    // Create comprehensive educator resources
    return {
      lessonPlan: this.generateLessonPlan(scenario, ageGroup),
      activities: this.generateTeachingActivities(scenario, ageGroup),
      assessment: this.generateAssessmentTools(scenario, ageGroup),
      background: this.generateBackgroundInfo(scenario),
      extensions: this.generateExtensionActivities(scenario, ageGroup),
    };
  }

  // Placeholder methods for educator resource generation
  generateLessonPlan(_scenario, _ageGroup) {
    return {};
  }
  generateTeachingActivities(_scenario, _ageGroup) {
    return [];
  }
  generateAssessmentTools(_scenario, _ageGroup) {
    return {};
  }
  generateBackgroundInfo(_scenario) {
    return {};
  }
  generateExtensionActivities(_scenario, _ageGroup) {
    return [];
  }

  /**
   * Generate scenarios for a simulation with specified difficulty
   */
  generateScenarios(domain, difficulty, count = 3) {
    try {
      const scenarios = [];
      const templates = this.scenarioTemplates.get(domain);

      if (!templates) {
        // Return fallback scenarios
        return this.createFallbackScenarios(domain, difficulty, count);
      }

      for (
        let i = 0;
        i < Math.min(count, templates.baseScenarios.length);
        i++
      ) {
        const baseScenario = templates.baseScenarios[i];
        const adaptedScenario = this.generateScenario(
          domain,
          this.mapDifficultyToAge(difficulty),
          {
            scenarioId: baseScenario.id,
            includeRealWorld: difficulty !== 'beginner',
            includeEducatorResources: true,
          }
        );
        scenarios.push(adaptedScenario);
      }

      return scenarios;
    } catch (error) {
      logger.error('Error generating scenarios:', error);
      return this.createFallbackScenarios(domain, difficulty, count);
    }
  }

  /**
   * Map simulation difficulty to age group
   */
  mapDifficultyToAge(difficulty) {
    switch (difficulty) {
      case 'beginner':
        return 'middle';
      case 'intermediate':
        return 'high';
      case 'advanced':
        return 'college';
      default:
        return 'high';
    }
  }

  /**
   * Create fallback scenarios when templates are not available
   */
  createFallbackScenarios(domain, difficulty, count) {
    const fallbackScenarios = [];

    for (let i = 0; i < count; i++) {
      fallbackScenarios.push({
        id: `fallback-${domain}-${i}`,
        title: `AI Ethics Scenario ${i + 1}`,
        description: `Explore ethical considerations in AI applications for ${domain}`,
        context: `A scenario exploring AI ethics in the context of ${domain}`,
        stakeholders: ['Users', 'Developers', 'Society', 'Regulators'],
        ethicalDilemmas: [
          'How do we ensure fairness in AI decisions?',
          'What data should AI systems use?',
          'How do we maintain human oversight?',
          'What are the unintended consequences?',
        ],
        choices: this.createBasicChoices(),
        activities: this.getActivitiesForDifficulty(difficulty),
        assessment: this.getAssessmentForDifficulty(difficulty),
      });
    }

    return fallbackScenarios;
  }

  /**
   * Create basic choice structure for fallback scenarios
   */
  createBasicChoices() {
    return [
      {
        category: 'Approach',
        question: 'How should the AI system be designed?',
        options: [
          {
            id: 'efficiency',
            label: 'Efficiency Focused',
            description: 'Prioritize speed and accuracy',
            pros: ['Fast results', 'High accuracy'],
            cons: ['May miss edge cases', 'Less flexible'],
          },
          {
            id: 'fairness',
            label: 'Fairness Focused',
            description: 'Prioritize equal treatment',
            pros: ['More equitable', 'Considers all groups'],
            cons: ['May be slower', 'More complex'],
          },
          {
            id: 'transparency',
            label: 'Transparency Focused',
            description: 'Prioritize explainability',
            pros: ['Easy to understand', 'Builds trust'],
            cons: ['May sacrifice accuracy', 'More complex to build'],
          },
        ],
      },
    ];
  }

  /**
   * Get activities appropriate for difficulty level
   */
  getActivitiesForDifficulty(difficulty) {
    switch (difficulty) {
      case 'beginner':
        return [
          'Discussion and voting',
          'Simple role-playing',
          'Drawing solutions',
        ];
      case 'intermediate':
        return [
          'Structured debates',
          'Case study analysis',
          'Group problem-solving',
        ];
      case 'advanced':
        return [
          'Research projects',
          'Policy development',
          'Statistical analysis',
        ];
      default:
        return ['Discussion and analysis', 'Problem-solving', 'Reflection'];
    }
  }

  /**
   * Get assessment methods for difficulty level
   */
  getAssessmentForDifficulty(difficulty) {
    switch (difficulty) {
      case 'beginner':
        return [
          'Verbal explanations',
          'Simple reflections',
          'Peer discussions',
        ];
      case 'intermediate':
        return ['Written analysis', 'Group presentations', 'Case studies'];
      case 'advanced':
        return [
          'Research papers',
          'Policy proposals',
          'Professional presentations',
        ];
      default:
        return ['Reflections', 'Discussions', 'Written responses'];
    }
  }
}

export default ScenarioGenerator;
