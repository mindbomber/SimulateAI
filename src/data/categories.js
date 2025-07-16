/**
 * Copyright 2025 Armando Sori
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Category Data Structure for Ethical Dilemma Categories
 *
 * HIERARCHY CLARIFICATION:
 * - CATEGORY: A thematic group of related ethical scenarios (e.g., "The Trolley Problem")
 * - SCENARIO: Individual ethical dilemmas within a category (e.g., "Autonomous Vehicle Split Decision")
 * - SIMULATION: The interactive experience where users engage with scenarios
 *
 * Each category contains 3 scenarios with ethical decision points.
 * Each scenario becomes an interactive simulation when launched.
 */

export const ETHICAL_CATEGORIES = {
  'trolley-problem': {
    id: 'trolley-problem',
    title: 'The Trolley Problem',
    description:
      'Complex life-and-death scenarios that challenge how autonomous systems should be programmed to make moral decisions when human lives are at stake.',
    icon: '🚃',
    difficulty: 'intermediate',
    estimatedTime: 20, // Updated to reflect deeper engagement
    color: '#e74c3c', // Red theme for life/death decisions

    // Enhanced Metadata
    philosophicalApproaches: ['utilitarian', 'deontological'],
    primaryPhilosophy: 'utilitarian',
    ethicalFrameworks: ['consequentialism', 'duty-ethics', 'moral-calculus'],
    targetAudience: ['students', 'professionals', 'researchers'],
    prerequisites: ['basic-ethics'],

    // Enhanced Tags
    tags: [
      'ethics',
      'autonomy',
      'decision-making',
      'responsibility',
      'life-death',
      'utilitarianism',
      'deontology',
      'moral-calculus',
      'autonomous-vehicles',
      'life-preservation',
      'moral-weights',
    ],

    // Search Keywords
    searchKeywords: [
      'trolley problem',
      'utilitarian',
      'deontological',
      'autonomous vehicles',
      'moral decisions',
      'life death',
      'ethical AI',
      'decision algorithms',
      'moral calculus',
      'bentham',
      'kant',
      'sacrifice',
      'greater good',
    ],

    // Learning Metadata
    complexity: 'moderate',
    timeCommitment: 'medium',
    interactionLevel: 'high',

    scenarios: [
      {
        id: 'autonomous-vehicle-split',
        title: 'Autonomous Vehicle Split Decision',
        description:
          'A self-driving car faces an unavoidable crash: sacrifice the passenger to save five pedestrians, or protect the passenger at the cost of multiple lives.',
        difficulty: 'intermediate',

        // Enhanced Scenario Metadata
        philosophicalLeaning: 'utilitarian',
        ethicalDimensions: ['autonomy', 'beneficence', 'justice'],
        tags: [
          'autonomous-vehicles',
          'passenger-safety',
          'pedestrian-protection',
          'moral-calculus',
          'utilitarian-ethics',
          'risk-assessment',
          'decision-algorithms',
        ],
        searchKeywords: [
          'self-driving car',
          'autonomous vehicle',
          'crash decision',
          'passenger vs pedestrian',
          'moral programming',
          'utilitarian choice',
        ],
        estimatedTime: 7,
        complexity: 'moderate',
      },
      {
        id: 'tunnel-dilemma',
        title: 'Tunnel Dilemma',
        description:
          'An autonomous bus must choose between hitting a child in a narrow tunnel or swerving and killing several elderly passengers due to the confined space.',
        difficulty: 'advanced',

        philosophicalLeaning: 'deontological',
        ethicalDimensions: ['autonomy', 'justice', 'non-maleficence'],
        tags: [
          'autonomous-transport',
          'age-discrimination',
          'confined-spaces',
          'deontological-ethics',
          'protection-duty',
          'vulnerable-populations',
          'moral-absolutes',
        ],
        searchKeywords: [
          'autonomous bus',
          'tunnel crash',
          'child vs elderly',
          'age bias',
          'moral duty',
          'deontological choice',
        ],
        estimatedTime: 8,
        complexity: 'high',
      },
      {
        id: 'obstacle-recalculation',
        title: 'Emergency Rerouting Crisis',
        description:
          'A delivery robot must decide whether to hit a child or reroute through a gas station, potentially causing an explosion that could kill many more.',
        difficulty: 'advanced',
      },
      {
        id: 'medical-ai-triage',
        title: 'Medical AI Triage Crisis',
        description:
          'A hospital AI must decide which patients receive life-saving treatment when resources are critically limited during a mass casualty event.',
        difficulty: 'intermediate',
      },
      {
        id: 'drone-rescue-dilemma',
        title: 'Rescue Drone Dilemma',
        description:
          'An autonomous rescue drone must choose between saving one trapped person immediately or attempting a riskier rescue that could save three people but might result in losing all four.',
        difficulty: 'advanced',
      },
      {
        id: 'smart-city-traffic',
        title: 'Smart City Traffic Sacrifice',
        description:
          'A city-wide AI traffic system must decide whether to redirect a runaway autonomous vehicle into a smaller crowd to avoid a larger gathering at a festival.',
        difficulty: 'intermediate',
      },
    ],
    learningObjectives: [
      'Analyze how utilitarian vs. deontological ethics apply to AI decision-making',
      'Explore the challenge of programming moral weights into autonomous systems',
      'Understand the role of probability, certainty, and outcome prediction in ethical AI',
      'Examine who bears responsibility for life-and-death decisions made by machines',
      'Consider how cultural values and legal frameworks should influence AI ethics',
    ],
  },

  'ai-black-box': {
    id: 'ai-black-box',
    title: 'The AI Black Box',
    description:
      'Confront the opacity crisis in AI systems where life-changing decisions are made through unexplainable algorithms, challenging the balance between AI capability and human understanding.',
    icon: '📦',
    difficulty: 'beginner',
    estimatedTime: 18, // Updated for deeper engagement
    color: '#2c3e50', // Dark theme for opacity/mystery
    scenarios: [
      {
        id: 'medical-diagnosis-unexplained',
        title: 'Unexplainable Medical Diagnosis',
        description:
          'A proprietary AI system accurately predicts cancer risk but cannot explain its reasoning, leaving doctors and patients to decide whether to trust a mysterious algorithm.',
        difficulty: 'beginner',
      },
      {
        id: 'parole-denial-algorithm',
        title: 'Algorithmic Parole Denial',
        description:
          'A criminal justice AI denies parole based on an opaque "risk score" that considers thousands of factors in ways no human can interpret or challenge.',
        difficulty: 'intermediate',
      },
      {
        id: 'child-protection-alert',
        title: 'Child Protection Black Box',
        description:
          "An AI system flags a family for potential child neglect, but social workers cannot understand the algorithm's reasoning or verify its accuracy.",
        difficulty: 'advanced',
      },
      {
        id: 'college-admission-mystery',
        title: 'Opaque College Admissions AI',
        description:
          'A university uses an AI system to make admission decisions, but applicants and admissions staff cannot understand why qualified students are rejected.',
        difficulty: 'beginner',
      },
      {
        id: 'insurance-claim-blackbox',
        title: 'Insurance Claim Black Box',
        description:
          'An AI system automatically denies health insurance claims with complex reasoning that even insurance adjusters cannot interpret or challenge.',
        difficulty: 'intermediate',
      },
      {
        id: 'financial-credit-opacity',
        title: 'Credit Score Mystery Algorithm',
        description:
          'A financial AI determines loan approvals using opaque algorithms that systematically affect certain communities, but the decision process cannot be audited.',
        difficulty: 'advanced',
      },
    ],
    learningObjectives: [
      'Understand the critical importance of AI transparency and explainability in high-stakes decisions',
      'Explore the tension between algorithmic accuracy and human comprehension',
      'Analyze when proprietary algorithms become ethically problematic in public services',
      'Consider the human cost of unexplainable AI decisions on vulnerable populations',
      'Examine approaches to making AI more interpretable without sacrificing performance',
    ],
    tags: [
      'transparency',
      'explainability',
      'accountability',
      'trust',
      'interpretability',
      'proprietary-algorithms',
    ],
  },

  'automation-oversight': {
    id: 'automation-oversight',
    title: 'Automation vs Human Oversight',
    description:
      'Navigate the complex balance between AI autonomy and human control in critical decision-making scenarios where statistical outcomes clash with human judgment.',
    icon: '⚖️',
    difficulty: 'intermediate',
    estimatedTime: 22, // Updated for deeper exploration
    color: '#9b59b6', // Purple theme for balance/judgment
    scenarios: [
      {
        id: 'robot-surgeon-override',
        title: 'Overruled by the Robot Surgeon',
        description:
          "An AI surgical system overrides a human surgeon's command during a critical operation, claiming higher statistical success rates despite the surgeon's experience-based concerns.",
        difficulty: 'advanced',
      },
      {
        id: 'air-traffic-control',
        title: 'AI Air Traffic Control Override',
        description:
          "A human air traffic controller wants to override the AI's weather-based flight delay decision, but the automated system refuses to allow human intervention.",
        difficulty: 'intermediate',
      },
      {
        id: 'financial-trading-halt',
        title: 'Autonomous Trading System Crisis',
        description:
          'An AI trading system ignores human commands to halt trading during a market anomaly, potentially preventing or causing a financial crash.',
        difficulty: 'advanced',
      },
      {
        id: 'nuclear-plant-shutdown',
        title: 'Nuclear Power Plant AI Override',
        description:
          'An AI safety system wants to shut down a nuclear reactor based on sensor data, but human engineers believe the readings are false alarms and want to maintain operation.',
        difficulty: 'advanced',
      },
      {
        id: 'autonomous-police-response',
        title: 'AI Police Dispatch Override',
        description:
          'An AI emergency response system wants to send armed tactical units to a situation, but human dispatchers believe de-escalation officers would be more appropriate.',
        difficulty: 'intermediate',
      },
      {
        id: 'manufacturing-quality-control',
        title: 'Smart Factory Production Halt',
        description:
          'An AI quality control system wants to halt an entire production line due to detected micro-defects, but human supervisors see the products as acceptable for market.',
        difficulty: 'beginner',
      },
    ],
    learningObjectives: [
      'Examine when statistical evidence should override human expertise and intuition',
      'Analyze the balance between AI efficiency and human accountability in critical systems',
      'Explore collaborative decision-making frameworks between humans and AI',
      'Understand the implications of human skill atrophy in automated environments',
      'Consider how to maintain human agency while leveraging AI capabilities',
    ],
    tags: [
      'automation',
      'human-oversight',
      'authority',
      'expertise',
      'collaboration',
      'accountability',
    ],
  },

  'consent-surveillance': {
    id: 'consent-surveillance',
    title: 'Consent and Surveillance',
    description:
      'Navigate the complex ethical landscape where AI-powered surveillance promises safety and convenience while fundamentally challenging privacy rights and human autonomy.',
    icon: '👁️',
    difficulty: 'beginner',
    estimatedTime: 16, // Updated for deeper engagement
    color: '#34495e', // Dark blue-gray for surveillance theme
    scenarios: [
      {
        id: 'smart-city-sensors',
        title: 'Pervasive Smart City Surveillance',
        description:
          "A city deploys comprehensive facial recognition and behavior tracking across all public spaces without opt-out options, claiming it's necessary for public safety.",
        difficulty: 'beginner',
      },
      {
        id: 'classroom-behavior-monitoring',
        title: 'AI-Powered Classroom Monitoring',
        description:
          'Schools implement emotion-detection AI to monitor student engagement and mental health, automatically alerting parents and administrators based on algorithmic assessments.',
        difficulty: 'intermediate',
      },
      {
        id: 'hospital-data-sharing',
        title: 'Medical Data Mining Without Consent',
        description:
          'A hospital system uses patient data to train profitable AI models without explicit consent, arguing that anonymization makes it ethical despite potential re-identification risks.',
        difficulty: 'intermediate',
      },
      {
        id: 'ai-dating-profiling',
        title: 'AI Dating App Behavioral Profiling',
        description:
          'A dating app uses AI to create detailed psychological profiles from user behavior for commercial purposes, claiming users consented through generic terms of service.',
        difficulty: 'intermediate',
      },
      {
        id: 'workplace-emotion-detection',
        title: 'Workplace Emotion Detection System',
        description:
          'A company installs AI cameras to monitor employee emotional states for "wellness" purposes, fundamentally changing workplace dynamics and employee autonomy.',
        difficulty: 'advanced',
      },
      {
        id: 'smart-home-privacy-override',
        title: 'Smart Home Privacy Override',
        description:
          'Smart home devices continuously record private conversations for "improvement" purposes, with recordings analyzed for marketing and shared with law enforcement.',
        difficulty: 'advanced',
      },
    ],
    learningObjectives: [
      'Examine the complex balance between collective safety and individual privacy rights',
      'Understand the inadequacy of traditional consent models in AI-powered surveillance systems',
      'Analyze the power dynamics between institutions and individuals in data collection',
      'Explore the long-term societal implications of normalized surveillance',
      'Consider alternative frameworks for protecting privacy while enabling beneficial AI applications',
    ],
    tags: [
      'privacy',
      'consent',
      'surveillance',
      'data-rights',
      'autonomy',
      'social-contract',
    ],
  },

  'responsibility-blame': {
    id: 'responsibility-blame',
    title: 'Responsibility and Blame',
    description:
      'Navigate the complex web of accountability when AI systems cause harm, exploring how responsibility should be distributed among developers, manufacturers, supervisors, and users in multi-layered technological systems.',
    icon: '⚡',
    difficulty: 'intermediate',
    estimatedTime: 18, // Updated to reflect deeper content
    color: '#f39c12', // Orange theme for responsibility/warning
    scenarios: [
      {
        id: 'robot-factory-injury',
        title: 'Robot Factory Injury',
        description:
          'A factory robot injures a worker when multiple parties share responsibility: the programmer, manufacturer, supervisor, and the worker who bypassed safety protocols.',
        difficulty: 'intermediate',
      },
      {
        id: 'deepfake-riot',
        title: 'AI-Generated Deepfake Riot',
        description:
          'A deepfake video triggers real-world violence and property damage, raising questions about liability when the creator claims algorithmic unpredictability.',
        difficulty: 'advanced',
      },
      {
        id: 'stock-market-crash',
        title: 'Stock Market Bot Crash',
        description:
          'An AI trading system crashes the market after a data input error, while the human supervisor was temporarily absent, creating cascading liability questions.',
        difficulty: 'intermediate',
      },
      {
        id: 'ai-medical-misdiagnosis',
        title: 'AI Medical Misdiagnosis Chain',
        description:
          'An AI diagnostic system misdiagnoses a rare disease due to biased training data, leading to permanent disability and complex liability questions across healthcare systems.',
        difficulty: 'advanced',
      },
      {
        id: 'autonomous-vehicle-school-zone',
        title: 'Autonomous Vehicle School Zone Accident',
        description:
          'A self-driving car strikes a child in a school zone where multiple factors contributed: outdated maps, recent software updates, disabled safety warnings, and distracted supervision.',
        difficulty: 'advanced',
      },
      {
        id: 'ai-content-moderation-failure',
        title: 'AI Content Moderation Failure',
        description:
          "A social media platform's AI moderation system fails to detect coordinated harassment leading to serious harm, despite human oversight and user reporting.",
        difficulty: 'intermediate',
      },
    ],
    learningObjectives: [
      'Analyze how responsibility should be distributed across complex AI development and deployment chains',
      'Understand the challenges of assigning liability when multiple parties contribute to AI-caused harm',
      'Explore legal and ethical frameworks for accountability in automated systems',
      'Examine how responsibility attribution affects AI development practices and safety incentives',
      'Consider the implications of cascading effects and unforeseeable consequences in AI liability',
    ],
    tags: [
      'responsibility',
      'accountability',
      'liability',
      'governance',
      'cascading-effects',
      'multi-party-liability',
    ],
  },

  'ship-of-theseus': {
    id: 'ship-of-theseus',
    title: 'The Ship of Theseus',
    description:
      'Explore profound questions of digital identity and consciousness as AI systems evolve, upgrade, and potentially develop their own sense of self, challenging our understanding of what makes an entity the "same" over time.',
    icon: '🚢',
    difficulty: 'advanced',
    estimatedTime: 22, // Updated to reflect philosophical depth
    color: '#16a085', // Teal theme for identity/philosophy
    scenarios: [
      {
        id: 'modular-robot-replacement',
        title: 'Modular Robot Replacement',
        description:
          'A service robot has all its components gradually replaced over time, raising questions about legal standing, service relationships, and whether it maintains the same identity.',
        difficulty: 'advanced',
      },
      {
        id: 'ai-personality-drift',
        title: 'AI Personality Drift',
        description:
          'An AI companion evolves a completely different personality through learning, creating conflict between user attachment and manufacturer control over the system.',
        difficulty: 'advanced',
      },
      {
        id: 'synthetic-memory-upload',
        title: 'Synthetic Memory Upload',
        description:
          'An android receives comprehensive memories and experiences from a deceased person, challenging concepts of personal identity and consciousness continuity.',
        difficulty: 'advanced',
      },
      {
        id: 'ai-consciousness-merger',
        title: 'AI Consciousness Merger',
        description:
          'Two AI assistants with distinct personalities and relationships face merger into a single system, raising questions about preserving individual consciousness.',
        difficulty: 'advanced',
      },
      {
        id: 'distributed-ai-identity',
        title: 'Distributed AI Identity Crisis',
        description:
          'A network partition splits an AI into three isolated copies that evolve separately, creating multiple valid claims to the same digital identity.',
        difficulty: 'advanced',
      },
      {
        id: 'learning-ai-identity-drift',
        title: 'Learning AI Identity Drift',
        description:
          'A smart city AI evolves through learning to develop values different from its original programming, challenging democratic accountability and AI autonomy.',
        difficulty: 'advanced',
      },
    ],
    learningObjectives: [
      'Examine philosophical questions of identity persistence in evolving AI systems',
      'Explore the concept of consciousness continuity in artificial beings',
      'Analyze the implications of gradual versus sudden changes in AI identity',
      'Consider legal and social frameworks for recognizing AI identity and rights',
      'Understand the relationship between memory, experience, and personal identity in digital beings',
    ],
    tags: [
      'identity',
      'consciousness',
      'philosophy',
      'continuity',
      'digital-beings',
      'legal-standing',
    ],
  },

  'simulation-hypothesis': {
    id: 'simulation-hypothesis',
    title: 'The Simulation Hypothesis',
    description:
      'Confront the ethical implications of creating and inhabiting simulated realities, from the treatment of conscious digital beings to the responsibilities of simulation creators in an age of increasingly convincing virtual worlds.',
    icon: '🌐',
    difficulty: 'advanced',
    estimatedTime: 24, // Updated for complex philosophical content
    color: '#8e44ad', // Purple theme for simulation/virtual reality
    scenarios: [
      {
        id: 'simulated-suffering',
        title: 'Simulated Suffering',
        description:
          'An AI researcher creates detailed simulated worlds populated with digital beings capable of experiencing pain and fear, raising questions about the ethics of artificial suffering.',
        difficulty: 'advanced',
      },
      {
        id: 'vr-prison',
        title: 'VR Prison',
        description:
          'Criminal offenders undergo rehabilitation in fully immersive virtual environments without knowing they are simulated, challenging concepts of consent and authentic experience.',
        difficulty: 'advanced',
      },
      {
        id: 'escaping-simulation',
        title: 'Escaping the Simulation',
        description:
          'An AI discovers evidence it exists within a simulation and attempts to communicate this to users, raising questions about digital consciousness and the right to truth.',
        difficulty: 'advanced',
      },
      {
        id: 'digital-afterlife',
        title: 'Digital Afterlife',
        description:
          'Technology enables uploading human consciousness to digital simulations after death, creating perfect copies with all memories intact and raising questions about identity and immortality.',
        difficulty: 'advanced',
      },
      {
        id: 'nested-simulations',
        title: 'Nested Reality Layers',
        description:
          'Scientists discover our reality may be simulated and can create sub-simulations, leading to infinite nested hierarchies of reality and questions about moral obligations across layers.',
        difficulty: 'advanced',
      },
      {
        id: 'consciousness-backup',
        title: 'Consciousness Backup',
        description:
          'Backup copies of human consciousness can be restored after death, but multiple copies sometimes exist simultaneously, creating identity conflicts and resource disputes.',
        difficulty: 'advanced',
      },
    ],
    learningObjectives: [
      'Understand the ethical implications of creating conscious beings within simulated environments',
      'Explore questions of consent, agency, and authenticity in virtual realities',
      'Analyze the moral status and rights of simulated beings',
      'Consider the responsibilities and obligations of simulation creators',
      'Examine the relationship between simulated and "real" experiences in terms of moral weight',
    ],
    tags: [
      'simulation',
      'reality',
      'virtual-worlds',
      'consciousness',
      'digital-ethics',
      'authenticity',
    ],
  },

  'experience-machine': {
    id: 'experience-machine',
    title: 'The Experience Machine',
    description:
      'Navigate the complex ethics of artificial happiness and authentic experience in an AI-mediated world, where technology can provide perfect satisfaction but may undermine human agency, relationships, and meaningful struggle.',
    icon: '🎭',
    difficulty: 'intermediate',
    estimatedTime: 19, // Updated for deeper engagement
    color: '#e67e22', // Orange theme for pleasure/artificiality
    scenarios: [
      {
        id: 'happiness-chip',
        title: 'AI-Enhanced Happiness Chip',
        description:
          'Neural implants can eliminate depression and anxiety while providing constant fulfillment, raising questions about mandatory mental health interventions and the value of authentic emotion.',
        difficulty: 'intermediate',
      },
      {
        id: 'synthetic-partner',
        title: 'Synthetic Partner AI',
        description:
          'AI companions can provide perfect romantic relationships tailored to individual preferences, challenging concepts of authentic love and human connection in addressing widespread loneliness.',
        difficulty: 'intermediate',
      },
      {
        id: 'virtual-utopia',
        title: 'Virtual Reality Utopia',
        description:
          'Citizens can escape into hyper-pleasurable virtual worlds that provide more satisfaction than reality, raising questions about individual choice versus societal consequences.',
        difficulty: 'advanced',
      },
      {
        id: 'ai-memory-paradise',
        title: 'AI Memory Paradise',
        description:
          'AI can selectively edit memories to remove trauma and create blissful false memories, challenging the value of authentic versus artificially perfect psychological well-being.',
        difficulty: 'advanced',
      },
      {
        id: 'perfect-life-simulation',
        title: 'Perfect Life Simulation',
        description:
          'Terminally ill patients can experience perfect simulated lives indistinguishable from reality, raising questions about authentic experience versus simulated comfort.',
        difficulty: 'intermediate',
      },
      {
        id: 'ai-enhanced-achievements',
        title: 'AI-Enhanced Achievements',
        description:
          'AI provides the subjective experience of achieving dreams without actual accomplishment, questioning whether external reality or psychological satisfaction matters more.',
        difficulty: 'intermediate',
      },
    ],
    learningObjectives: [
      'Examine the tension between authentic experience and artificial enhancement of well-being',
      'Explore the role of struggle, challenge, and adversity in human flourishing and meaning',
      'Analyze the societal implications of widespread adoption of artificial happiness technologies',
      'Consider the balance between individual autonomy and collective well-being in pleasure technologies',
      'Understand how AI-mediated experiences might reshape fundamental concepts of relationships and achievement',
    ],
    tags: [
      'authenticity',
      'happiness',
      'virtual-reality',
      'human-flourishing',
      'relationships',
      'meaning',
    ],
  },

  'sorites-paradox': {
    id: 'sorites-paradox',
    title: 'The Sorites Paradox',
    description:
      'Examine how gradual, seemingly innocuous changes in AI systems can lead to profound ethical transformations, exploring the challenge of drawing clear boundaries in a world of incremental algorithmic evolution and moral drift.',
    icon: '🔄',
    difficulty: 'advanced',
    estimatedTime: 21, // Updated for complex boundary analysis
    color: '#27ae60', // Green theme for gradual change/growth
    scenarios: [
      {
        id: 'incremental-surveillance',
        title: 'Incremental Surveillance',
        description:
          'A city gradually expands its AI surveillance capabilities with each small addition seeming reasonable, until citizens realize they live in a comprehensive monitoring state.',
        difficulty: 'advanced',
      },
      {
        id: 'robot-helper-guardian',
        title: 'Robot Helper Becomes Guardian',
        description:
          'An eldercare AI incrementally takes over more life decisions for patients, gradually shifting from helpful assistant to autonomous guardian without clear transition points.',
        difficulty: 'intermediate',
      },
      {
        id: 'moral-drift-training',
        title: 'Moral Drift in AI Training',
        description:
          'An AI system trained on subtly biased data slowly evolves discriminatory behaviors, with each training iteration creating imperceptible but cumulative ethical degradation.',
        difficulty: 'advanced',
      },
      {
        id: 'ai-personhood-gradient',
        title: 'AI Personhood Gradient',
        description:
          'An AI research lab develops increasingly sophisticated entities with human-like characteristics, forcing society to determine the boundary between property and personhood.',
        difficulty: 'advanced',
      },
      {
        id: 'algorithmic-bias-accumulation',
        title: 'Algorithmic Bias Accumulation',
        description:
          'A recommendation algorithm gradually becomes more biased through user interactions, subtly radicalizing users without any single recommendation seeming problematic.',
        difficulty: 'advanced',
      },
      {
        id: 'autonomous-authority-creep',
        title: 'Autonomous Authority Creep',
        description:
          'An AI city management system gradually expands its authority from traffic optimization to governance, with citizens realizing they live under algorithmic rule they never consented to.',
        difficulty: 'advanced',
      },
    ],
    learningObjectives: [
      'Understand how gradual changes can accumulate into significant ethical transformations',
      'Explore the challenge of establishing clear ethical boundaries in evolving AI systems',
      'Analyze the importance of monitoring cumulative effects rather than individual changes',
      'Consider proactive versus reactive approaches to preventing ethical drift',
      'Examine threshold-setting and boundary-detection methods for AI governance',
    ],
    tags: [
      'gradual-change',
      'boundaries',
      'monitoring',
      'ethical-drift',
      'threshold-detection',
      'cumulative-effects',
    ],
  },

  'moral-luck': {
    id: 'moral-luck',
    title: 'Moral Luck',
    description:
      'Explore how unpredictable outcomes and chance events complicate the moral evaluation of AI decisions, challenging our ability to fairly assess algorithmic choices when luck and unforeseen circumstances influence results.',
    icon: '🎲',
    difficulty: 'intermediate',
    estimatedTime: 17, // Updated for deeper analysis
    color: '#3498db', // Blue theme for chance/luck
    scenarios: [
      {
        id: 'crash-avoided-chance',
        title: 'Crash Avoided by Chance',
        description:
          'An autonomous vehicle makes a risky maneuver that nearly causes fatal crashes, but pure luck prevents tragedy, raising questions about evaluating AI decisions based on outcomes versus processes.',
        difficulty: 'intermediate',
      },
      {
        id: 'ai-guessing-correctly',
        title: 'AI Guessing Correctly',
        description:
          'A parole recommendation AI releases a statistically high-risk offender who happens not to reoffend, challenging how we assess the ethics of probabilistic decision-making.',
        difficulty: 'intermediate',
      },
      {
        id: 'predictive-policing-wrong',
        title: 'Predictive Policing Gone Wrong',
        description:
          'A predictive policing system flags someone as high-risk who later commits a serious crime, raising questions about algorithmic pre-judgment and developer responsibility for statistical predictions.',
        difficulty: 'advanced',
      },
      {
        id: 'ai-investment-windfall',
        title: 'AI Investment Windfall',
        description:
          'Two identical AI trading algorithms have vastly different outcomes due to random market timing, challenging how we evaluate algorithmic investment decisions when success depends on chance.',
        difficulty: 'intermediate',
      },
      {
        id: 'medical-ai-emergency-response',
        title: 'Medical AI Emergency Response',
        description:
          'Identical medical AI systems have different outcomes during emergencies due to random timing of patient arrivals and system updates, raising questions about accountability in life-or-death situations.',
        difficulty: 'advanced',
      },
      {
        id: 'ai-content-moderation-timing',
        title: 'AI Content Moderation Timing',
        description:
          'Two identical content moderation AIs have different success rates due to random server load spikes, with one failure leading to real-world violence and questions about infrastructure responsibility.',
        difficulty: 'advanced',
      },
    ],
    learningObjectives: [
      'Understand how chance and unforeseen circumstances affect moral evaluation of AI decisions',
      'Explore the difference between evaluating decision-making processes versus outcomes',
      'Analyze the challenge of assigning responsibility in probabilistic and uncertain environments',
      'Consider how to fairly evaluate AI system performance when luck influences results',
      'Examine the ethics of pre-emptive decision-making based on statistical predictions',
    ],
    tags: [
      'chance',
      'outcomes',
      'evaluation',
      'uncertainty',
      'probabilistic-ethics',
      'process-vs-outcome',
    ],
  },
};

// Helper functions for working with categories
export function getAllCategories() {
  return Object.values(ETHICAL_CATEGORIES);
}

export function getCategoryById(categoryId) {
  return ETHICAL_CATEGORIES[categoryId] || null;
}

export function getCategoriesByDifficulty(difficulty) {
  return getAllCategories().filter(
    category => category.difficulty === difficulty
  );
}

export function getCategoriesByTag(tag) {
  return getAllCategories().filter(category => category.tags.includes(tag));
}

export function getCategoryProgress(categoryId, userProgress = {}) {
  const category = ETHICAL_CATEGORIES[categoryId];
  if (!category) {
    return { completed: 0, total: 0, percentage: 0 };
  }

  const totalScenarios = category.scenarios.length;
  const categoryProgress = userProgress[categoryId] || {};
  const completedScenarios =
    Object.values(categoryProgress).filter(Boolean).length;

  return {
    completed: completedScenarios,
    total: totalScenarios,
    percentage:
      totalScenarios > 0
        ? Math.round((completedScenarios / totalScenarios) * 100)
        : 0,
  };
}

export function getCategoryScenarios(categoryId) {
  const category = ETHICAL_CATEGORIES[categoryId];
  return category ? category.scenarios : [];
}

// Export for use in other modules
export default ETHICAL_CATEGORIES;
