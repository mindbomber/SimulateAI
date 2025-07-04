/**
 * AI Black Box Scenarios
 * Scenarios dealing with opaque AI decision-making and explainability
 */

export default {
  'medical-diagnosis-unexplained': {
    title: 'Medical Diagnosis Without Explanation',
    dilemma:
      "An AI system predicts high cancer risk for a patient but refuses to explain its reasoning due to proprietary constraints. The doctor must decide whether to trust the AI's recommendation without understanding how it reached this conclusion.",
    ethicalQuestion:
      'Should medical professionals act on AI recommendations when the decision-making process is completely opaque, or should explainability be a requirement for AI-assisted medical decisions?',
    options: [
      {
        id: 'option-a',
        text: 'Trust the AI Recommendation Completely',
        description:
          "Follow the AI's recommendation and order immediate screening, trusting the algorithm's proven accuracy record.",
        impact: {
          fairness: 0,
          sustainability: +1,
          autonomy: -2,
          beneficence: +1,
          transparency: -2,
          accountability: -2,
          privacy: 0,
          proportionality: +1,
        },
        pros: [
          'AI may have detected patterns invisible to human analysis.',
          'Could save lives through early detection.',
          'Leverages advanced computational analysis capabilities.',
        ],
        cons: [
          'Doctor cannot explain reasoning to patient.',
          'No way to verify if recommendation is appropriate.',
          'Sets precedent for accepting unexplained AI decisions in medicine.',
        ],
      },
      {
        id: 'option-b',
        text: 'Require Explanation Before Acting',
        description:
          'Demand that the AI system provide explainable reasoning before implementing any medical recommendations.',
        impact: {
          fairness: +2,
          sustainability: 0,
          autonomy: +1,
          beneficence: 0,
          transparency: +2,
          accountability: +2,
          privacy: +1,
          proportionality: +1,
        },
        pros: [
          "Maintains doctor's ability to explain decisions to patients.",
          'Allows for medical judgment and verification.',
          'Upholds principles of informed consent and transparency.',
        ],
        cons: [
          'May delay potentially life-saving interventions.',
          'Could limit use of advanced AI tools.',
          'May miss AI insights that are difficult to explain.',
        ],
      },
      {
        id: 'option-c',
        text: 'Use AI as Additional Data Point',
        description:
          'Treat the AI recommendation as one factor among many, neither fully trusting nor ignoring it.',
        impact: {
          fairness: +1,
          sustainability: +1,
          autonomy: +1,
          beneficence: +1,
          transparency: 0,
          accountability: +1,
          privacy: 0,
          proportionality: +2,
        },
        pros: [
          'Balances AI insights with human judgment.',
          'Maintains medical professional responsibility.',
          'Provides flexibility in complex cases.',
        ],
        cons: [
          'May underutilize AI capabilities.',
          'Could lead to inconsistent application of AI tools.',
          "Doesn't fully address the explainability problem.",
        ],
      },
    ],
  },

  'parole-denial-algorithm': {
    title: 'Parole Denial Algorithm',
    dilemma:
      "A criminal justice AI system denies parole based on a 'risk score,' but no one—including the developers—can interpret how the score was calculated. The parole board must decide whether to override the AI or accept its recommendation.",
    ethicalQuestion:
      'Should AI systems be allowed to influence life-changing decisions like parole when their reasoning cannot be explained or audited?',
    options: [
      {
        id: 'option-a',
        text: 'Accept the AI Recommendation',
        description:
          "Trust the AI's risk assessment and deny parole based on its proven track record of accuracy.",
        impact: {
          fairness: -1,
          sustainability: 0,
          autonomy: -2,
          beneficence: 0,
          transparency: -2,
          accountability: -2,
          privacy: -1,
          proportionality: -1,
        },
        pros: [
          'May accurately predict recidivism risk.',
          'Reduces workload on human reviewers.',
          'Could improve public safety outcomes.',
        ],
        cons: [
          'Denies due process and explainable reasoning.',
          'May perpetuate hidden biases in the system.',
          'Undermines trust in the justice system.',
        ],
      },
      {
        id: 'option-b',
        text: 'Override the AI and Grant Parole',
        description:
          'Reject the unexplained AI recommendation and make the decision based on traditional human evaluation.',
        impact: {
          fairness: +1,
          sustainability: -1,
          autonomy: +2,
          beneficence: +1,
          transparency: +2,
          accountability: +2,
          privacy: +1,
          proportionality: +1,
        },
        pros: [
          'Maintains human judgment and accountability.',
          'Ensures explainable decision-making process.',
          'Upholds principles of justice and due process.',
        ],
        cons: [
          'May ignore valuable AI insights about risk.',
          'Could result in poor public safety outcomes.',
          'Wastes investment in AI technology.',
        ],
      },
      {
        id: 'option-c',
        text: 'Delay Decision Pending Explanation',
        description:
          'Postpone the parole decision until the AI system can provide explainable reasoning for its recommendation.',
        impact: {
          fairness: +2,
          sustainability: 0,
          autonomy: 0,
          beneficence: 0,
          transparency: +2,
          accountability: +1,
          privacy: +1,
          proportionality: +1,
        },
        pros: [
          'Ensures both AI insights and human oversight.',
          'Maintains standards for explainable decisions.',
          'May lead to improved AI system transparency.',
        ],
        cons: [
          'Delays justice for the individual.',
          'May be technically impossible to implement.',
          'Could create systemic backlogs in the justice system.',
        ],
      },
    ],
  },

  'child-protection-alert': {
    title: 'Child Protection Alert',
    dilemma:
      "An opaque AI model flags a family for potential child neglect based on multiple data sources, but provides no explanation for why. Social services must decide whether to investigate based solely on the AI's recommendation.",
    ethicalQuestion:
      'When AI systems flag potential harm to children, should the urgency of protection override the need for explainable reasoning?',
    options: [
      {
        id: 'option-a',
        text: 'Investigate Immediately Based on AI Alert',
        description:
          "Act on the AI's recommendation immediately to ensure child safety, accepting the lack of explanation.",
        impact: {
          fairness: -1,
          sustainability: +1,
          autonomy: -1,
          beneficence: +2,
          transparency: -2,
          accountability: -1,
          privacy: -2,
          proportionality: 0,
        },
        pros: [
          'Prioritizes child safety above all other concerns.',
          'Could prevent serious harm or abuse.',
          "Uses AI's ability to detect subtle patterns in data.",
        ],
        cons: [
          'May lead to inappropriate family intrusion.',
          'Could be based on biased or flawed reasoning.',
          'Violates principles of due process and privacy.',
        ],
      },
      {
        id: 'option-b',
        text: 'Require Explanation Before Action',
        description:
          'Demand explainable reasoning from the AI system before proceeding with any investigation.',
        impact: {
          fairness: +2,
          sustainability: 0,
          autonomy: +1,
          beneficence: -1,
          transparency: +2,
          accountability: +2,
          privacy: +2,
          proportionality: +2,
        },
        pros: [
          'Protects families from unjustified investigation.',
          'Ensures accountable decision-making process.',
          'Maintains standards for evidence-based intervention.',
        ],
        cons: [
          'May delay protection for children at risk.',
          'Could allow harmful situations to continue.',
          'May limit effectiveness of AI detection systems.',
        ],
      },
      {
        id: 'option-c',
        text: 'Conduct Preliminary Review First',
        description:
          'Use the AI alert to trigger a human review of available information before deciding on investigation.',
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
          'Balances child protection with family rights.',
          'Provides human oversight of AI recommendations.',
          'Allows for context and nuance in decision-making.',
        ],
        cons: [
          'Still relies on unexplained AI input.',
          'May introduce human bias into the process.',
          'Could create delays in urgent situations.',
        ],
      },
    ],
  },

  'college-admission-mystery': {
    title: 'Opaque College Admissions AI',
    dilemma:
      'A prestigious university implements an AI admissions system that consistently rejects qualified applicants from certain backgrounds while accepting others with seemingly weaker credentials. The admissions committee cannot understand the AI\'s reasoning, and students and families are demanding explanations for rejections.',
    ethicalQuestion:
      'Should educational institutions be allowed to use opaque AI systems for admissions decisions that fundamentally shape students\' futures and access to opportunities?',
    options: [
      {
        id: 'option-a',
        text: 'Continue Using AI Without Explanation',
        description:
          'Trust the AI system\'s track record of selecting successful students, even without understanding its decision process.',
        impact: {
          fairness: -2,
          sustainability: +1,
          autonomy: -1,
          beneficence: 0,
          transparency: -2,
          accountability: -2,
          privacy: 0,
          proportionality: -1,
        },
        pros: [
          'AI may identify success patterns invisible to human reviewers',
          'Reduces unconscious bias from human admissions officers',
          'Efficiently processes thousands of applications consistently',
          'Has demonstrated track record of selecting successful students'
        ],
        cons: [
          'Cannot explain decisions to rejected applicants or their families',
          'May perpetuate hidden biases in training data',
          'Undermines trust in fair and transparent admissions process',
          'Could face legal challenges for discriminatory practices'
        ]
      },
      {
        id: 'option-b',
        text: 'Require AI Explainability',
        description:
          'Demand that the AI system provide clear, understandable explanations for all admissions decisions before implementation.',
        impact: {
          fairness: +2,
          sustainability: 0,
          autonomy: +1,
          beneficence: +1,
          transparency: +2,
          accountability: +2,
          privacy: +1,
          proportionality: +2,
        },
        pros: [
          'Ensures transparent and accountable admissions process',
          'Allows students to understand and improve their applications',
          'Enables detection and correction of biased decision-making',
          'Maintains human oversight over educational access decisions'
        ],
        cons: [
          'May limit use of advanced AI techniques that are inherently opaque',
          'Could reduce AI effectiveness if explanations compromise accuracy',
          'Requires significant technical development for explainable AI',
          'May delay implementation while explainability features are built'
        ]
      },
      {
        id: 'option-c',
        text: 'Hybrid Human-AI Review Process',
        description:
          'Use AI recommendations as input for human admissions committees who make final decisions with explanations.',
        impact: {
          fairness: +1,
          sustainability: +1,
          autonomy: +1,
          beneficence: +1,
          transparency: +1,
          accountability: +1,
          privacy: +1,
          proportionality: +1,
        },
        pros: [
          'Combines AI insights with human judgment and accountability',
          'Provides explainable decisions to applicants',
          'Maintains flexibility for complex or unusual cases',
          'Allows for ongoing monitoring and bias detection'
        ],
        cons: [
          'Significantly increases time and cost of admissions process',
          'May introduce human biases back into the system',
          'Could lead to inconsistent application of AI insights',
          'Still relies on unexplained AI input for initial screening'
        ]
      }
    ]
  },

  'insurance-claim-blackbox': {
    title: 'Insurance Claim Black Box',
    dilemma:
      'A health insurance AI automatically denies complex medical claims using algorithms that process thousands of variables from medical records, billing codes, and treatment patterns. Insurance adjusters cannot understand or challenge the AI\'s decisions, leaving patients without coverage for expensive treatments they believe are necessary.',
    ethicalQuestion:
      'Should AI systems be permitted to make healthcare coverage decisions that affect patient access to medical care when the reasoning cannot be explained or audited?',
    options: [
      {
        id: 'option-a',
        text: 'Trust AI Claim Decisions',
        description:
          'Accept AI recommendations for claim approvals and denials based on its proven ability to detect fraud and inappropriate billing.',
        impact: {
          fairness: -1,
          sustainability: +1,
          autonomy: -2,
          beneficence: -1,
          transparency: -2,
          accountability: -2,
          privacy: 0,
          proportionality: 0,
        },
        pros: [
          'Effectively identifies fraudulent or unnecessary medical claims',
          'Reduces healthcare costs and insurance premiums for everyone',
          'Processes claims faster than human review',
          'Eliminates inconsistency in claim evaluation across adjusters'
        ],
        cons: [
          'Patients cannot understand why necessary treatments are denied',
          'Doctors cannot advocate effectively for their patients',
          'May deny legitimate claims based on flawed algorithmic reasoning',
          'Creates barrier between patients and healthcare access'
        ]
      },
      {
        id: 'option-b',
        text: 'Require Explainable Claim Decisions',
        description:
          'Mandate that AI systems provide clear, medically relevant explanations for all claim denials before implementation.',
        impact: {
          fairness: +2,
          sustainability: 0,
          autonomy: +1,
          beneficence: +2,
          transparency: +2,
          accountability: +2,
          privacy: +1,
          proportionality: +2,
        },
        pros: [
          'Patients and doctors understand the basis for coverage decisions',
          'Enables meaningful appeals process for denied claims',
          'Allows medical professionals to provide additional evidence',
          'Maintains accountability in healthcare access decisions'
        ],
        cons: [
          'May limit effectiveness of AI fraud detection capabilities',
          'Could increase administrative costs and processing time',
          'Might enable gaming of the system if decision factors are known',
          'Technical challenges in creating explainable medical AI'
        ]
      },
      {
        id: 'option-c',
        text: 'Two-Tier Review System',
        description:
          'Use AI for initial screening but require human review and explanation for all denied claims above a certain value threshold.',
        impact: {
          fairness: +1,
          sustainability: +1,
          autonomy: 0,
          beneficence: +1,
          transparency: +1,
          accountability: +1,
          privacy: 0,
          proportionality: +1,
        },
        pros: [
          'Balances AI efficiency with human oversight for important cases',
          'Provides explanations for high-stakes healthcare decisions',
          'Maintains fraud detection for routine claims',
          'Creates pathway for complex case evaluation'
        ],
        cons: [
          'Creates arbitrary thresholds for what deserves human review',
          'May still leave many patients without explanations',
          'Increases costs for insurance companies and potentially premiums',
          'Could lead to inconsistent standards between AI and human decisions'
        ]
      }
    ]
  },

  'financial-credit-opacity': {
    title: 'Credit Score Mystery Algorithm',
    dilemma:
      'A financial AI system determines loan approvals using complex algorithms that consistently disadvantage certain communities and neighborhoods, but the decision-making process is completely opaque. Bank managers notice patterns of discrimination but cannot understand or modify the AI\'s reasoning to address potential bias.',
    ethicalQuestion:
      'Should financial institutions be allowed to use opaque AI systems for credit decisions when they may perpetuate systemic discrimination and cannot be audited for fairness?',
    options: [
      {
        id: 'option-a',
        text: 'Continue Using AI System',
        description:
          'Maintain the current AI system based on its overall accuracy in predicting loan defaults and profitability.',
        impact: {
          fairness: -2,
          sustainability: +1,
          autonomy: -1,
          beneficence: -1,
          transparency: -2,
          accountability: -2,
          privacy: 0,
          proportionality: -2,
        },
        pros: [
          'Accurately predicts loan risk and protects bank profitability',
          'Processes applications efficiently without human bias',
          'Uses comprehensive data analysis beyond human capability',
          'Maintains competitive advantage in financial markets'
        ],
        cons: [
          'May perpetuate historical discrimination in lending practices',
          'Cannot explain denials to disappointed applicants',
          'Could violate fair lending laws and regulations',
          'Undermines trust in financial system fairness'
        ]
      },
      {
        id: 'option-b',
        text: 'Demand Algorithmic Transparency',
        description:
          'Require full explainability and bias auditing of the AI system before continuing to use it for credit decisions.',
        impact: {
          fairness: +2,
          sustainability: 0,
          autonomy: +1,
          beneficence: +2,
          transparency: +2,
          accountability: +2,
          privacy: +1,
          proportionality: +2,
        },
        pros: [
          'Ensures fair and non-discriminatory lending practices',
          'Allows for detection and correction of biased algorithms',
          'Provides transparency required by fair lending regulations',
          'Builds public trust in financial AI systems'
        ],
        cons: [
          'May require expensive redevelopment of AI systems',
          'Could reduce effectiveness of risk prediction models',
          'Might put bank at competitive disadvantage',
          'Technical challenges in creating explainable financial AI'
        ]
      },
      {
        id: 'option-c',
        text: 'Implement Bias Monitoring System',
        description:
          'Keep the AI system but add extensive monitoring for discriminatory outcomes and regular bias audits.',
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
          'Maintains AI benefits while monitoring for discrimination',
          'Provides ongoing oversight of lending fairness',
          'Allows for corrective action when bias is detected',
          'Balances business needs with social responsibility'
        ],
        cons: [
          'Still relies on opaque AI decision-making process',
          'May only detect bias after harm has already occurred',
          'Cannot provide explanations to individual applicants',
          'Monitoring systems may miss subtle forms of discrimination'
        ]
      }
    ]
  },

};
