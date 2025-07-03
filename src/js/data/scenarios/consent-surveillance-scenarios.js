/**
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
};
