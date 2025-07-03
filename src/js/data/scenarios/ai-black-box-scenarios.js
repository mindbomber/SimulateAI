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
};
