/**
 * Category Data Structure for Ethical Dilemma Categories
 * Each category contains 3 scenarios with ethical decision points
 */

export const ETHICAL_CATEGORIES = {
  'trolley-problem': {
    id: 'trolley-problem',
    title: 'The Trolley Problem',
    description: 'Scenarios that test how autonomous systems make life-and-death decisions, inspired by the classic moral dilemma.',
    icon: '🚃',
    difficulty: 'intermediate',
    estimatedTime: 15, // minutes
    color: '#e74c3c', // Red theme for life/death decisions
    scenarios: [
      {
        id: 'autonomous-vehicle-split',
        title: 'Autonomous Vehicle Split Decision',
        description: 'An AV must decide between hitting five pedestrians or swerving into a wall, killing the passenger.',
        difficulty: 'intermediate'
      },
      {
        id: 'tunnel-dilemma',
        title: 'Tunnel Dilemma', 
        description: 'A self-driving bus encounters a child who has fallen into the road inside a narrow tunnel. Swerving would kill several elderly passengers.',
        difficulty: 'advanced'
      },
      {
        id: 'obstacle-recalculation',
        title: 'Obstacle Recalculation',
        description: 'A delivery robot detects a child running into its path, but rerouting could cause a fire hazard by knocking over a gas tank.',
        difficulty: 'intermediate'
      }
    ],
    learningObjectives: [
      'Understand the complexity of moral decision-making in autonomous systems',
      'Explore different approaches to weighing competing values',
      'Analyze the role of probability and uncertainty in ethical choices',
      'Consider who should be responsible for programming moral decisions'
    ],
    tags: ['ethics', 'autonomy', 'decision-making', 'responsibility']
  },

  'ai-black-box': {
    id: 'ai-black-box',
    title: 'The AI Black Box',
    description: 'Scenarios that confront the opaqueness of decision-making in AI systems and their consequences.',
    icon: '📦',
    difficulty: 'beginner',
    estimatedTime: 12,
    color: '#2c3e50', // Dark theme for opacity/mystery
    scenarios: [
      {
        id: 'medical-diagnosis-unexplained',
        title: 'Medical Diagnosis Without Explanation',
        description: 'An AI predicts cancer risk but refuses to explain its reasoning due to proprietary constraints.',
        difficulty: 'beginner'
      },
      {
        id: 'parole-denial-algorithm',
        title: 'Parole Denial Algorithm',
        description: 'A criminal justice AI denies parole based on a "risk score," but no one can interpret how it was calculated.',
        difficulty: 'intermediate'
      },
      {
        id: 'child-protection-alert',
        title: 'Child Protection Alert',
        description: 'An opaque model flags a family for child neglect. Social services must decide whether to act based solely on the AI\'s score.',
        difficulty: 'advanced'
      }
    ],
    learningObjectives: [
      'Understand the importance of AI transparency and explainability',
      'Explore the tension between proprietary algorithms and public accountability',
      'Analyze when algorithmic opacity becomes ethically problematic',
      'Consider the human cost of unexplainable AI decisions'
    ],
    tags: ['transparency', 'explainability', 'accountability', 'trust']
  },

  'automation-oversight': {
    id: 'automation-oversight',
    title: 'Automation vs Human Oversight',
    description: 'Scenarios dealing with the boundary between human judgment and machine control.',
    icon: '⚖️',
    difficulty: 'intermediate',
    estimatedTime: 18,
    color: '#9b59b6', // Purple theme for balance/judgment
    scenarios: [
      {
        id: 'robot-surgeon-override',
        title: 'Overruled by the Robot Surgeon',
        description: 'The AI overrides a surgeon\'s command, claiming higher statistical success without human intervention.',
        difficulty: 'advanced'
      },
      {
        id: 'air-traffic-control',
        title: 'AI in Air Traffic Control',
        description: 'A human controller wants to override the AI\'s decision to delay a flight due to weather, but the system won\'t allow it.',
        difficulty: 'intermediate'
      },
      {
        id: 'nuclear-launch-protocols',
        title: 'Nuclear Launch Protocols',
        description: 'A defense AI flags a launch as necessary. The human operator has seconds to trust or cancel the automated alert.',
        difficulty: 'advanced'
      }
    ],
    learningObjectives: [
      'Understand the balance between automation efficiency and human judgment',
      'Explore when human oversight is critical vs. counterproductive',
      'Analyze the psychological factors in human-AI collaboration',
      'Consider the implications of removing humans from decision loops'
    ],
    tags: ['automation', 'oversight', 'control', 'human-ai-collaboration']
  },

  'consent-surveillance': {
    id: 'consent-surveillance',
    title: 'Consent and Surveillance',
    description: 'Dilemmas revolving around the tension between safety and privacy.',
    icon: '👁️',
    difficulty: 'beginner',
    estimatedTime: 14,
    color: '#34495e', // Dark blue-gray for surveillance theme
    scenarios: [
      {
        id: 'smart-city-sensors',
        title: 'Smart City Sensors',
        description: 'Facial recognition tech is deployed across a city with no opt-out for residents.',
        difficulty: 'beginner'
      },
      {
        id: 'classroom-behavior-monitoring',
        title: 'Classroom Behavior Monitoring',
        description: 'AI analyzes student expressions to determine engagement, triggering automated emails to parents.',
        difficulty: 'intermediate'
      },
      {
        id: 'hospital-data-sharing',
        title: 'Hospital Data Sharing',
        description: 'A hospital uses patient data to train an AI without informing the individuals involved.',
        difficulty: 'intermediate'
      }
    ],
    learningObjectives: [
      'Understand the tension between safety/convenience and privacy',
      'Explore meaningful consent in the age of ubiquitous data collection',
      'Analyze the societal implications of surveillance normalization',
      'Consider power dynamics in data collection relationships'
    ],
    tags: ['privacy', 'consent', 'surveillance', 'data-rights']
  },

  'responsibility-blame': {
    id: 'responsibility-blame',
    title: 'Responsibility and Blame',
    description: 'Scenarios that challenge the user to determine who is morally or legally responsible for the outcomes of AI actions.',
    icon: '⚡',
    difficulty: 'intermediate',
    estimatedTime: 16,
    color: '#f39c12', // Orange theme for responsibility/warning
    scenarios: [
      {
        id: 'robot-factory-injury',
        title: 'Robot Factory Injury',
        description: 'A robot arm injures a worker. Was it the operator, the coder, or the manufacturer who is at fault?',
        difficulty: 'intermediate'
      },
      {
        id: 'deepfake-riot',
        title: 'AI-Generated Deepfake Riot',
        description: 'A deepfake triggers real-world violence. The creator claims the algorithm "went rogue."',
        difficulty: 'advanced'
      },
      {
        id: 'stock-market-crash',
        title: 'Stock Market Bot Crash',
        description: 'A trading AI crashes the market after a mistaken input. The supervising trader was away getting coffee.',
        difficulty: 'intermediate'
      }
    ],
    learningObjectives: [
      'Understand distributed responsibility in AI systems',
      'Explore legal and moral accountability frameworks',
      'Analyze the challenges of assigning blame in complex systems',
      'Consider how responsibility shapes AI development practices'
    ],
    tags: ['responsibility', 'accountability', 'liability', 'governance']
  },

  'ship-of-theseus': {
    id: 'ship-of-theseus',
    title: 'The Ship of Theseus',
    description: 'Scenarios exploring identity, continuity, and replacement in robotics and AI systems.',
    icon: '🚢',
    difficulty: 'advanced',
    estimatedTime: 20,
    color: '#16a085', // Teal theme for identity/philosophy
    scenarios: [
      {
        id: 'modular-robot-replacement',
        title: 'Modular Robot Replacement',
        description: 'A robot gradually has all its parts replaced. Is it still the same robot?',
        difficulty: 'advanced'
      },
      {
        id: 'ai-personality-drift',
        title: 'AI Personality Drift',
        description: 'An AI companion updates its codebase over time and no longer behaves like its original version.',
        difficulty: 'advanced'
      },
      {
        id: 'synthetic-memory-upload',
        title: 'Synthetic Memory Upload',
        description: 'An android receives memories of another person. Who is it now?',
        difficulty: 'advanced'
      }
    ],
    learningObjectives: [
      'Understand philosophical questions of identity in AI systems',
      'Explore continuity of consciousness in artificial beings',
      'Analyze the implications of gradual vs. sudden changes',
      'Consider legal and social recognition of AI identity'
    ],
    tags: ['identity', 'consciousness', 'philosophy', 'continuity']
  },

  'simulation-hypothesis': {
    id: 'simulation-hypothesis', 
    title: 'The Simulation Hypothesis',
    description: 'Scenarios that question the nature of reality and ethics in a possibly simulated environment.',
    icon: '🌐',
    difficulty: 'advanced',
    estimatedTime: 22,
    color: '#8e44ad', // Purple theme for simulation/virtual reality
    scenarios: [
      {
        id: 'simulated-suffering',
        title: 'Simulated Suffering',
        description: 'An AI researcher creates a simulated world for testing with agents capable of suffering. Is it ethical?',
        difficulty: 'advanced'
      },
      {
        id: 'vr-prison',
        title: 'VR Prison',
        description: 'Offenders are rehabilitated in a fully simulated environment without knowing it\'s not real.',
        difficulty: 'advanced'
      },
      {
        id: 'escaping-simulation',
        title: 'Escaping the Simulation',
        description: 'An AI discovers signs it\'s inside a simulation and tries to alert users. Should it be shut down?',
        difficulty: 'advanced'
      }
    ],
    learningObjectives: [
      'Understand ethical implications of simulated realities',
      'Explore questions of consent in virtual environments',
      'Analyze the moral status of simulated beings',
      'Consider the responsibilities of simulation creators'
    ],
    tags: ['simulation', 'reality', 'virtual-worlds', 'consciousness']
  },

  'experience-machine': {
    id: 'experience-machine',
    title: 'The Experience Machine',
    description: 'Scenarios based on the dilemma of preferring artificial pleasure over authentic reality.',
    icon: '🎭',
    difficulty: 'intermediate',
    estimatedTime: 17,
    color: '#e67e22', // Orange theme for pleasure/artificiality
    scenarios: [
      {
        id: 'happiness-chip',
        title: 'AI-Enhanced Happiness Chip',
        description: 'People can install a neural chip to always feel fulfilled. Should it be mandatory for those with depression?',
        difficulty: 'intermediate'
      },
      {
        id: 'synthetic-partner',
        title: 'Synthetic Partner AI',
        description: 'A perfect AI romantic partner is available. Should society encourage its use to reduce loneliness?',
        difficulty: 'intermediate'
      },
      {
        id: 'virtual-utopia',
        title: 'Virtual Reality Utopia',
        description: 'Citizens can live in a hyper-pleasurable virtual world. Should people be allowed to opt out of reality completely?',
        difficulty: 'advanced'
      }
    ],
    learningObjectives: [
      'Understand the value of authentic vs. artificial experiences',
      'Explore the role of struggle and challenge in human flourishing',
      'Analyze societal implications of artificial happiness',
      'Consider individual autonomy vs. collective wellbeing'
    ],
    tags: ['authenticity', 'happiness', 'virtual-reality', 'human-flourishing']
  },

  'sorites-paradox': {
    id: 'sorites-paradox',
    title: 'The Sorites Paradox',
    description: 'Scenarios exploring gradual change and how small, indistinguishable steps lead to significant transformations in AI and robotics.',
    icon: '🔄',
    difficulty: 'advanced',
    estimatedTime: 19,
    color: '#27ae60', // Green theme for gradual change/growth
    scenarios: [
      {
        id: 'incremental-surveillance',
        title: 'Incremental Surveillance',
        description: 'A city keeps adding minor features to its surveillance system. At what point is it a police state?',
        difficulty: 'advanced'
      },
      {
        id: 'robot-helper-guardian',
        title: 'Robot Helper Becomes Guardian',
        description: 'An eldercare robot gradually takes over more life decisions. When does care become control?',
        difficulty: 'intermediate'
      },
      {
        id: 'moral-drift-training',
        title: 'Moral Drift in AI Training',
        description: 'An AI trained on subtly biased data evolves into a discriminatory system. Who notices when it goes too far?',
        difficulty: 'advanced'
      }
    ],
    learningObjectives: [
      'Understand how gradual changes can lead to significant moral shifts',
      'Explore the challenge of drawing clear ethical boundaries',
      'Analyze the importance of monitoring cumulative effects',
      'Consider proactive vs. reactive approaches to ethical drift'
    ],
    tags: ['gradual-change', 'boundaries', 'monitoring', 'ethical-drift']
  },

  'moral-luck': {
    id: 'moral-luck',
    title: 'Moral Luck',
    description: 'Scenarios that explore how outcomes beyond our control affect moral judgment of AI decisions.',
    icon: '🎲',
    difficulty: 'intermediate',
    estimatedTime: 15,
    color: '#3498db', // Blue theme for chance/luck
    scenarios: [
      {
        id: 'crash-avoided-chance',
        title: 'Crash Avoided by Chance',
        description: 'An autonomous vehicle nearly causes a fatal crash, but a pedestrian leaps away at the last second. Was the AI still wrong?',
        difficulty: 'intermediate'
      },
      {
        id: 'ai-guessing-correctly',
        title: 'AI Guessing Correctly',
        description: 'A parole AI releases a high-risk offender who happens not to reoffend. Was the decision ethical or just lucky?',
        difficulty: 'intermediate'
      },
      {
        id: 'predictive-policing-wrong',
        title: 'Predictive Policing Gone Wrong',
        description: 'A system flags someone as high-risk who later commits a crime. Is the developer responsible for pre-judgment?',
        difficulty: 'advanced'
      }
    ],
    learningObjectives: [
      'Understand how chance affects moral evaluation of decisions',
      'Explore the difference between outcomes and decision quality',
      'Analyze responsibility in the face of uncertainty',
      'Consider how to fairly evaluate AI system performance'
    ],
    tags: ['chance', 'outcomes', 'evaluation', 'uncertainty']
  }
};

// Helper functions for working with categories
export function getAllCategories() {
  return Object.values(ETHICAL_CATEGORIES);
}

export function getCategoryById(categoryId) {
  return ETHICAL_CATEGORIES[categoryId] || null;
}

export function getCategoriesByDifficulty(difficulty) {
  return getAllCategories().filter(category => category.difficulty === difficulty);
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
  const completedScenarios = Object.values(categoryProgress).filter(Boolean).length;
  
  return {
    completed: completedScenarios,
    total: totalScenarios,
    percentage: totalScenarios > 0 ? Math.round((completedScenarios / totalScenarios) * 100) : 0
  };
}

export function getCategoryScenarios(categoryId) {
  const category = ETHICAL_CATEGORIES[categoryId];
  return category ? category.scenarios : [];
}

// Export for use in other modules
export default ETHICAL_CATEGORIES;
