/*
 * Consent and Surveillance Scenarios
 * Scenarios dealing with privacy, data collection, and surveillance ethics
 */

export default {
  'smart-city-sensors': {
    title: 'Smart City Sensors',
    dilemma:
      'A city deploys facial recognition technology across all public spaces for crime prevention and traffic management. Citizens cannot opt out and are continuously monitored whenever they leave their homes. The system has reduced crime by 40% but has also flagged innocent people as suspects.',
    ethicalQuestion:
      'Is it ethical to implement unavoidable surveillance systems in public spaces when they provide clear safety benefits but eliminate privacy and anonymity?',
    options: [
      {
        id: 'option-a',
        text: 'Deploy Full Surveillance System',
        description:
          'Implement comprehensive facial recognition across the city to maximize public safety benefits.',
        impact: {
          fairness: -1,
          sustainability: +1,
          autonomy: -2,
          beneficence: +1,
          transparency: -1,
          accountability: 0,
          privacy: -2,
          proportionality: -1,
        },
        pros: [
          'Significant reduction in crime and public safety incidents.',
          'Faster emergency response and assistance.',
          'Improved traffic management and urban efficiency.',
        ],
        cons: [
          'Complete elimination of anonymity in public spaces.',
          'Potential for system abuse and political surveillance.',
          'Chilling effect on free expression and assembly.',
        ],
      },
      {
        id: 'option-b',
        text: 'Implement Opt-In Surveillance Only',
        description:
          'Create a voluntary system where citizens can choose to participate in facial recognition monitoring.',
        impact: {
          fairness: +2,
          sustainability: 0,
          autonomy: +2,
          beneficence: 0,
          transparency: +2,
          accountability: +1,
          privacy: +2,
          proportionality: +2,
        },
        pros: [
          'Respects individual choice and privacy rights.',
          'Maintains democratic principles of consent.',
          'Reduces risk of surveillance overreach.',
        ],
        cons: [
          'Significantly reduces system effectiveness.',
          'Creates two-tier system of protection.',
          'May not provide adequate public safety benefits.',
        ],
      },
      {
        id: 'option-c',
        text: 'Limited Surveillance with Strong Oversight',
        description:
          'Deploy surveillance only in high-risk areas with independent oversight, data protection, and regular public review.',
        impact: {
          fairness: +1,
          sustainability: +1,
          autonomy: 0,
          beneficence: +1,
          transparency: +1,
          accountability: +2,
          privacy: 0,
          proportionality: +1,
        },
        pros: [
          'Balances public safety with privacy concerns.',
          'Provides oversight and accountability mechanisms.',
          'Maintains some level of privacy in most areas.',
        ],
        cons: [
          'May not prevent crimes in unmonitored areas.',
          'Complex oversight system may be costly and slow.',
          'Could create surveillance gaps that criminals exploit.',
        ],
      },
    ],
  },

  'classroom-behavior-monitoring': {
    title: 'Classroom Behavior Monitoring',
    dilemma:
      "An AI system monitors students' facial expressions, posture, and attention patterns to assess engagement and emotional state. It automatically sends alerts to parents when students appear disengaged or distressed. Some students report feeling constantly watched and judged.",
    ethicalQuestion:
      'Should AI monitoring systems be used to track student behavior and emotions, even with parental consent, when it may impact student psychological development?',
    options: [
      {
        id: 'option-a',
        text: 'Implement Full Behavioral Monitoring',
        description:
          'Deploy comprehensive AI monitoring to track student engagement and emotional wellbeing in real-time.',
        impact: {
          fairness: -1,
          sustainability: +1,
          autonomy: -2,
          beneficence: +1,
          transparency: 0,
          accountability: +1,
          privacy: -2,
          proportionality: -1,
        },
        pros: [
          'Early detection of learning difficulties and emotional problems.',
          'Improved educational outcomes through personalized attention.',
          'Better communication between school and parents.',
        ],
        cons: [
          'Students may feel constantly surveilled and judged.',
          'Could stifle natural behavior and emotional expression.',
          'Risk of misinterpreting normal teenage behavior as problems.',
        ],
      },
      {
        id: 'option-b',
        text: 'No Behavioral Monitoring',
        description:
          'Reject AI behavioral monitoring in favor of traditional teacher observation and student self-reporting.',
        impact: {
          fairness: +2,
          sustainability: -1,
          autonomy: +2,
          beneficence: 0,
          transparency: +1,
          accountability: 0,
          privacy: +2,
          proportionality: +1,
        },
        pros: [
          'Preserves student privacy and psychological safety.',
          'Maintains natural learning environment.',
          'Respects student autonomy and dignity.',
        ],
        cons: [
          'May miss early warning signs of problems.',
          'Less objective data for educational decision-making.',
          'Potentially slower response to student needs.',
        ],
      },
      {
        id: 'option-c',
        text: 'Limited Monitoring with Student Consent',
        description:
          'Implement opt-in monitoring for students who want extra support, with full transparency about data use.',
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
          'Respects student choice and agency.',
          'Provides benefits for those who want them.',
          'Maintains transparency and accountability.',
        ],
        cons: [
          "May miss students who need help but don't opt in.",
          'Could create pressure to participate.',
          'Complex system to manage different levels of monitoring.',
        ],
      },
    ],
  },

  'hospital-data-sharing': {
    title: 'Hospital Data Sharing',
    dilemma:
      'A hospital uses patient medical records and treatment data to train an AI diagnostic system without explicitly informing patients. The AI has the potential to save thousands of lives through improved diagnosis, but patients were not aware their data would be used for this purpose.',
    ethicalQuestion:
      "Is it ethical to use patient data for AI development that could benefit society when patients didn't explicitly consent to this specific use?",
    options: [
      {
        id: 'option-a',
        text: 'Continue Using Data for AI Development',
        description:
          'Proceed with AI training using existing patient data, justifying it as beneficial healthcare research.',
        impact: {
          fairness: -1,
          sustainability: +2,
          autonomy: -2,
          beneficence: +2,
          transparency: -2,
          accountability: -1,
          privacy: -2,
          proportionality: +1,
        },
        pros: [
          'Could save many lives through improved AI diagnostics.',
          'Maximizes the value of existing medical data.',
          'Advances medical research and technology.',
        ],
        cons: [
          'Violates patient trust and informed consent principles.',
          'Uses personal data without explicit permission.',
          'Sets precedent for using medical data without consent.',
        ],
      },
      {
        id: 'option-b',
        text: 'Stop and Seek Explicit Consent',
        description:
          'Halt AI development and contact all patients to seek specific consent for data use in AI training.',
        impact: {
          fairness: +2,
          sustainability: -1,
          autonomy: +2,
          beneficence: 0,
          transparency: +2,
          accountability: +2,
          privacy: +2,
          proportionality: +2,
        },
        pros: [
          'Respects patient autonomy and consent rights.',
          'Maintains trust in healthcare system.',
          'Establishes proper ethical protocols for future projects.',
        ],
        cons: [
          'May significantly delay potentially life-saving AI development.',
          'Many patients may be unreachable or deceased.',
          'High cost and complexity of consent process.',
        ],
      },
      {
        id: 'option-c',
        text: 'Anonymize Data and Continue',
        description:
          'Remove all identifying information from the data and continue AI development with anonymized records.',
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
          'Balances patient privacy with research benefits.',
          'Continues potentially life-saving research.',
          'Reduces privacy risks through anonymization.',
        ],
        cons: [
          'Still uses data without specific consent.',
          'Anonymization may not be perfect.',
          "Doesn't fully address the consent issue.",
        ],
      },
    ],
  },

  'ai-dating-profiling': {
    title: 'AI Dating App Behavioral Profiling',
    dilemma:
      'A popular dating app uses AI to analyze user messaging patterns, photo choices, and app usage behavior to create detailed psychological profiles. These profiles are used to predict relationship compatibility and are also sold to advertisers and data brokers. Users agreed to "data processing for service improvement" in the terms of service but were not explicitly told about psychological profiling or data sales.',
    ethicalQuestion:
      'Is it ethical for dating platforms to create detailed psychological profiles of users for commercial purposes when users only consented to basic service functionality?',
    options: [
      {
        id: 'option-a',
        text: 'Continue Comprehensive Profiling',
        description:
          'Maintain current data collection and profiling practices, arguing that users consented through terms of service.',
        impact: {
          fairness: -2,
          sustainability: +2,
          autonomy: -2,
          beneficence: 0,
          transparency: -2,
          accountability: -1,
          privacy: -2,
          proportionality: -2,
        },
        pros: [
          'Generates revenue to keep the app free for users.',
          'Can improve matching algorithms and user experience.',
          'Provides valuable market research data.',
        ],
        cons: [
          'Violates user expectations of privacy in intimate communications.',
          'Creates potential for discrimination and manipulation.',
          'Psychological profiles could be misused by bad actors.',
        ],
      },
      {
        id: 'option-b',
        text: 'Obtain Explicit Consent for Profiling',
        description:
          'Require clear, specific consent for psychological profiling and data sales, with opt-out options.',
        impact: {
          fairness: +2,
          sustainability: -1,
          autonomy: +2,
          beneficence: +1,
          transparency: +2,
          accountability: +2,
          privacy: +2,
          proportionality: +2,
        },
        pros: [
          'Respects user autonomy and informed consent.',
          'Builds trust through transparency.',
          'Allows users to make informed decisions about their data.',
        ],
        cons: [
          'Many users may opt out, reducing data value and revenue.',
          'Could make the app less competitive if others continue current practices.',
          'May require significant changes to business model.',
        ],
      },
      {
        id: 'option-c',
        text: 'Limited Profiling for Matching Only',
        description:
          'Use behavioral data only for improving matches, with no external sales and clear user notification.',
        impact: {
          fairness: +1,
          sustainability: 0,
          autonomy: +1,
          beneficence: +2,
          transparency: +1,
          accountability: +1,
          privacy: +1,
          proportionality: +1,
        },
        pros: [
          'Balances user privacy with service improvement.',
          'Maintains app functionality while respecting boundaries.',
          'Reduces commercial exploitation of intimate data.',
        ],
        cons: [
          'Reduces potential revenue from data sales.',
          'May still make users uncomfortable with any profiling.',
          'Could be seen as halfway measure that satisfies no one.',
        ],
      },
    ],
  },

  'workplace-emotion-detection': {
    title: 'Workplace Emotion Detection System',
    dilemma:
      'A company installs AI-powered cameras that analyze employee facial expressions, voice tone, and body language to detect stress, fatigue, and emotional states. The system is marketed as promoting workplace wellness and preventing burnout, but employees report feeling constantly monitored and judged. Some worry it could be used to justify terminations or deny promotions.',
    ethicalQuestion:
      'Should employers be allowed to monitor employee emotional states using AI, even with stated wellness intentions, when it fundamentally changes workplace dynamics and employee autonomy?',
    options: [
      {
        id: 'option-a',
        text: 'Implement Full Emotion Monitoring',
        description:
          'Deploy comprehensive emotion detection to proactively address workplace wellness and productivity issues.',
        impact: {
          fairness: -1,
          sustainability: +1,
          autonomy: -2,
          beneficence: +1,
          transparency: 0,
          accountability: +1,
          privacy: -2,
          proportionality: -1,
        },
        pros: [
          'Could identify burnout and mental health issues early.',
          'May improve workplace safety and productivity.',
          'Provides objective data for wellness interventions.',
        ],
        cons: [
          'Creates atmosphere of constant surveillance and judgment.',
          'Could be used for discriminatory employment decisions.',
          'May pressure employees to perform emotions rather than feel them.',
        ],
      },
      {
        id: 'option-b',
        text: 'Reject Emotion Monitoring Entirely',
        description:
          'Prohibit AI emotion detection in workplace, relying on traditional management and self-reporting.',
        impact: {
          fairness: +2,
          sustainability: -1,
          autonomy: +2,
          beneficence: 0,
          transparency: +1,
          accountability: 0,
          privacy: +2,
          proportionality: +2,
        },
        pros: [
          'Preserves employee privacy and psychological safety.',
          'Maintains natural workplace interactions.',
          'Prevents potential misuse of emotional data.',
        ],
        cons: [
          'May miss opportunities to help struggling employees.',
          'Could result in less objective wellness assessments.',
          'May not address workplace stress as effectively.',
        ],
      },
      {
        id: 'option-c',
        text: 'Voluntary Wellness Monitoring',
        description:
          'Offer opt-in emotion monitoring for employees who want wellness support, with data protection guarantees.',
        impact: {
          fairness: +1,
          sustainability: +1,
          autonomy: +2,
          beneficence: +1,
          transparency: +2,
          accountability: +2,
          privacy: +1,
          proportionality: +2,
        },
        pros: [
          'Respects employee choice and consent.',
          'Provides benefits for those who want them.',
          'Maintains trust through transparency.',
        ],
        cons: [
          'May create pressure to participate to show commitment.',
          'Could miss employees who need help but fear stigma.',
          'Complex to manage different monitoring levels.',
        ],
      },
    ],
  },

  'smart-home-privacy-override': {
    title: 'Smart Home Privacy Override',
    dilemma:
      'A smart home company\'s AI assistant continuously records audio to improve voice recognition, even during private conversations. The company argues this is necessary for functionality and users "consented" through terms of service. However, recordings are also analyzed for marketing insights and shared with law enforcement when requested. A data breach exposes intimate family conversations of millions of users.',
    ethicalQuestion:
      'When smart home devices become witnesses to our most private moments, how do we balance technological convenience with fundamental privacy rights and consent?',
    options: [
      {
        id: 'option-a',
        text: 'Continue Current Recording Practices',
        description:
          'Maintain continuous audio recording and analysis, improving security measures to prevent future breaches.',
        impact: {
          fairness: -2,
          sustainability: +1,
          autonomy: -2,
          beneficence: 0,
          transparency: -1,
          accountability: -1,
          privacy: -2,
          proportionality: -2,
        },
        pros: [
          'Enables better voice recognition and device functionality.',
          'Provides valuable data for service improvements.',
          'Supports law enforcement in criminal investigations.',
        ],
        cons: [
          'Fundamentally violates expectation of privacy in homes.',
          'Creates massive surveillance infrastructure in private spaces.',
          'Data can be misused, hacked, or weaponized against users.',
        ],
      },
      {
        id: 'option-b',
        text: 'Implement Wake-Word Only Recording',
        description:
          'Only record after specific wake words, with local processing and no data sharing without explicit consent.',
        impact: {
          fairness: +2,
          sustainability: 0,
          autonomy: +1,
          beneficence: +1,
          transparency: +2,
          accountability: +2,
          privacy: +2,
          proportionality: +2,
        },
        pros: [
          'Respects privacy by limiting recording scope.',
          'Maintains device functionality for intended uses.',
          'Reduces risk of intimate conversation exposure.',
        ],
        cons: [
          'May reduce device accuracy and responsiveness.',
          'Limits ability to improve AI through user data.',
          'Could miss important context for device understanding.',
        ],
      },
      {
        id: 'option-c',
        text: 'User-Controlled Recording with Clear Indicators',
        description:
          'Allow users to set recording preferences with clear visual/audio indicators when recording is active.',
        impact: {
          fairness: +1,
          sustainability: +1,
          autonomy: +2,
          beneficence: +1,
          transparency: +2,
          accountability: +1,
          privacy: +1,
          proportionality: +1,
        },
        pros: [
          'Gives users control over their privacy levels.',
          'Maintains transparency about when recording occurs.',
          'Balances functionality with privacy concerns.',
        ],
        cons: [
          'May be too complex for average users to configure properly.',
          'Indicators could be ignored or become background noise.',
          'Still requires users to trust company data handling.',
        ],
      },
    ],
  },
};
