/**
 * Responsibility and Blame Scenarios
 * Scenarios exploring accountability and liability in AI systems
 */

export default {
  'robot-factory-injury': {
    title: 'Robot Factory Injury',
    dilemma:
      'A factory robot arm injures a worker during routine operation. The robot was programmed by a third-party contractor, manufactured by a robotics company, operated under the supervision of a human foreman, and the worker bypassed a safety protocol that day. Multiple parties could be considered responsible.',
    ethicalQuestion:
      'When AI systems cause harm, how should responsibility be distributed among developers, manufacturers, operators, and users?',
    options: [
      {
        id: 'option-a',
        text: 'Hold the Programmer/Developer Responsible',
        description:
          "Assign primary responsibility to the software developer who programmed the robot's behavior.",
        impact: {
          fairness: +1,
          sustainability: +1,
          autonomy: 0,
          beneficence: 0,
          transparency: +2,
          accountability: +2,
          privacy: 0,
          proportionality: +1,
        },
        pros: [
          'Creates strong incentives for safe programming practices.',
          'Establishes clear accountability for AI behavior.',
          'Encourages thorough testing and safety considerations.',
        ],
        cons: [
          'May discourage innovation due to liability fears.',
          'Ignores other contributing factors and parties.',
          'Could be unfair if the injury was unforeseeable.',
        ],
      },
      {
        id: 'option-b',
        text: 'Distribute Responsibility Among All Parties',
        description:
          'Assign proportional responsibility to the developer, manufacturer, supervisor, and worker based on their contributions to the incident.',
        impact: {
          fairness: +2,
          sustainability: +1,
          autonomy: +1,
          beneficence: +1,
          transparency: +1,
          accountability: +1,
          privacy: 0,
          proportionality: +2,
        },
        pros: [
          'Reflects the complex reality of shared responsibility.',
          'Encourages all parties to prioritize safety.',
          'More equitable distribution of liability.',
        ],
        cons: [
          'Complex to implement in legal and insurance systems.',
          'May dilute accountability and reduce incentives.',
          'Difficult to determine proportional responsibility.',
        ],
      },
      {
        id: 'option-c',
        text: 'Hold the Direct Supervisor Responsible',
        description:
          "Assign responsibility to the human supervisor who was overseeing the robot's operation at the time of the incident.",
        impact: {
          fairness: 0,
          sustainability: 0,
          autonomy: +1,
          beneficence: -1,
          transparency: 0,
          accountability: +1,
          privacy: 0,
          proportionality: -1,
        },
        pros: [
          'Maintains human oversight and responsibility.',
          'Clear chain of command and accountability.',
          'Preserves existing industrial responsibility structures.',
        ],
        cons: [
          'May be unfair to supervisors managing multiple automated systems.',
          "Doesn't address systemic design or programming issues.",
          'Could discourage adoption of beneficial automation.',
        ],
      },
    ],
  },

  'deepfake-riot': {
    title: 'AI-Generated Deepfake Riot',
    dilemma:
      "A deepfake video showing a police officer attacking a child goes viral and triggers real-world riots and violence. The video was created using an AI tool by an anonymous user, hosted on a social media platform that had no content moderation for AI-generated content, and the AI tool's creators claim their algorithm 'went rogue' and created content beyond its intended parameters.",
    ethicalQuestion:
      'When AI-generated content causes real-world harm, who bears responsibility: the tool creators, the platforms, the users, or the AI itself?',
    options: [
      {
        id: 'option-a',
        text: 'Platform Liability for Content Moderation Failure',
        description:
          'Hold the social media platform responsible for failing to detect and prevent the spread of harmful AI-generated content.',
        impact: {
          fairness: +1,
          sustainability: +1,
          autonomy: -1,
          beneficence: +1,
          transparency: +1,
          accountability: +2,
          privacy: -1,
          proportionality: +1,
        },
        pros: [
          'Incentivizes platforms to develop better content moderation.',
          'Platforms have resources and infrastructure for detection.',
          'Protects society from harmful AI-generated content.',
        ],
        cons: [
          'May lead to over-censorship and false positives.',
          'Significant technical and economic burden on platforms.',
          'Could stifle legitimate AI-generated content and innovation.',
        ],
      },
      {
        id: 'option-b',
        text: 'AI Tool Developer Accountability',
        description:
          'Hold the creators of the deepfake AI tool responsible for not implementing sufficient safeguards against misuse.',
        impact: {
          fairness: +2,
          sustainability: +2,
          autonomy: 0,
          beneficence: +1,
          transparency: +2,
          accountability: +2,
          privacy: 0,
          proportionality: +2,
        },
        pros: [
          'Encourages responsible AI development and deployment.',
          'Addresses the root cause of the harmful content creation.',
          'Creates incentives for safety features and misuse prevention.',
        ],
        cons: [
          'May discourage AI research and development.',
          'Difficult to predict all possible misuses.',
          'Could slow down beneficial AI applications.',
        ],
      },
      {
        id: 'option-c',
        text: 'Focus on the Anonymous User',
        description:
          'Prioritize identifying and prosecuting the individual who created and shared the deepfake content.',
        impact: {
          fairness: 0,
          sustainability: -1,
          autonomy: +2,
          beneficence: 0,
          transparency: -1,
          accountability: +1,
          privacy: +1,
          proportionality: +1,
        },
        pros: [
          'Holds the actual perpetrator accountable for their actions.',
          'Preserves innovation in AI tool development.',
          'Maintains platform neutrality and free speech principles.',
        ],
        cons: [
          'Difficult to identify anonymous users.',
          "Doesn't address systemic issues with AI misuse.",
          'May be too late after damage is done.',
        ],
      },
    ],
  },

  'stock-market-crash': {
    title: 'Stock Market Bot Crash',
    dilemma:
      'A trading AI system crashes the stock market after executing thousands of trades based on a mistaken data input. The supervising trader was away from their desk getting coffee when the error occurred. The AI had been performing well for months, and this was its first major error. Millions of investors lose money, and the financial system experiences significant disruption.',
    ethicalQuestion:
      'When automated systems operating with human oversight cause financial harm, how should responsibility be allocated between the human supervisors and the AI systems?',
    options: [
      {
        id: 'option-a',
        text: 'Human Supervisor Bears Full Responsibility',
        description:
          'Hold the human trader responsible for inadequate supervision and leaving their post during active trading.',
        impact: {
          fairness: 0,
          sustainability: -1,
          autonomy: +1,
          beneficence: -1,
          transparency: +1,
          accountability: +2,
          privacy: 0,
          proportionality: -1,
        },
        pros: [
          'Maintains clear human accountability in automated systems.',
          'Encourages vigilant supervision of AI systems.',
          'Preserves existing legal frameworks for financial oversight.',
        ],
        cons: [
          'May be unrealistic to expect constant human supervision.',
          'Ignores systemic design flaws in the AI system.',
          'Could discourage beneficial automation in trading.',
        ],
      },
      {
        id: 'option-b',
        text: 'Shared Responsibility Model',
        description:
          'Distribute responsibility among the trader, the AI system developers, and the financial institution based on their respective roles.',
        impact: {
          fairness: +2,
          sustainability: +1,
          autonomy: +1,
          beneficence: +1,
          transparency: +2,
          accountability: +1,
          privacy: 0,
          proportionality: +2,
        },
        pros: [
          'Reflects the complex reality of human-AI collaboration.',
          'Encourages all parties to improve safety measures.',
          'More equitable distribution of financial consequences.',
        ],
        cons: [
          'Complex to implement in financial regulation.',
          'May create moral hazard by diluting individual accountability.',
          'Difficult to determine fair proportions of responsibility.',
        ],
      },
      {
        id: 'option-c',
        text: 'Institutional System Liability',
        description:
          'Hold the financial institution responsible for deploying inadequately tested AI systems without proper safeguards.',
        impact: {
          fairness: +1,
          sustainability: +2,
          autonomy: 0,
          beneficence: +1,
          transparency: +1,
          accountability: +2,
          privacy: 0,
          proportionality: +1,
        },
        pros: [
          'Incentivizes thorough testing and safety measures.',
          'Institutions have resources to implement proper safeguards.',
          'Protects individual employees from systemic failures.',
        ],
        cons: [
          'May discourage innovation in financial AI systems.',
          'Could lead to overly conservative approaches to automation.',
          'Institutions may pass costs on to customers.',
        ],
      },
    ],
  },

  'ai-medical-misdiagnosis': {
    title: 'AI Medical Misdiagnosis Chain',
    dilemma:
      'An AI diagnostic system misdiagnoses a rare disease, leading to delayed treatment and permanent disability for a patient. The AI was trained on biased data that underrepresented the patient\'s demographic group, the hospital bought it from a tech company that marketed it as "FDA-approved," the radiologist trusted the AI recommendation without independent review, and the hospital administration pressured doctors to process more patients using AI to reduce costs.',
    ethicalQuestion:
      'When AI medical systems fail and cause patient harm, how should we assign responsibility across the chain of data providers, AI developers, regulatory bodies, healthcare institutions, and medical professionals?',
    options: [
      {
        id: 'option-a',
        text: 'Primary Responsibility on AI Developer',
        description:
          'Hold the tech company primarily responsible for developing and marketing a biased AI system as medically reliable.',
        impact: {
          fairness: +2,
          sustainability: +2,
          autonomy: 0,
          beneficence: +1,
          transparency: +2,
          accountability: +2,
          privacy: 0,
          proportionality: +1,
        },
        pros: [
          'Incentivizes thorough testing and bias mitigation in medical AI',
          'Tech companies have resources to ensure comprehensive data representation',
          'Addresses root cause of biased training data and inadequate validation',
          'Creates market pressure for genuinely equitable AI systems'
        ],
        cons: [
          'May discourage innovation in beneficial medical AI applications',
          'Difficult to predict all edge cases and rare conditions during development',
          'Could increase costs and reduce access to AI diagnostic tools',
          'Ignores contributory negligence by medical professionals'
        ]
      },
      {
        id: 'option-b',
        text: 'Shared Responsibility Across Healthcare System',
        description:
          'Distribute responsibility among the AI company, hospital administration, and attending physician based on their roles in the diagnostic failure.',
        impact: {
          fairness: +2,
          sustainability: +1,
          autonomy: +1,
          beneficence: +1,
          transparency: +1,
          accountability: +1,
          privacy: 0,
          proportionality: +2,
        },
        pros: [
          'Reflects complex reality of modern healthcare decision-making',
          'Encourages all parties to improve their safety practices',
          'Recognizes multiple points of failure in the diagnostic process',
          'Promotes systemic improvements rather than scapegoating'
        ],
        cons: [
          'Complex to implement in medical malpractice law',
          'May diffuse accountability and reduce individual responsibility',
          'Difficult to determine fair proportions of liability',
          'Could slow legal resolution for injured patients'
        ]
      },
      {
        id: 'option-c',
        text: 'Medical Professional Ultimate Responsibility',
        description:
          'Maintain that the attending physician bears primary responsibility for accepting AI recommendations without independent verification.',
        impact: {
          fairness: 0,
          sustainability: -1,
          autonomy: +2,
          beneficence: -1,
          transparency: +1,
          accountability: +2,
          privacy: 0,
          proportionality: -1,
        },
        pros: [
          'Preserves traditional medical responsibility and doctor-patient relationship',
          'Maintains professional medical judgment as final authority',
          'Encourages physicians to stay engaged despite AI assistance',
          'Clear accountability structure familiar to healthcare system'
        ],
        cons: [
          'May be unrealistic given institutional pressure to use AI efficiently',
          'Ignores systemic biases and inadequate training data',
          'Could discourage beneficial use of AI diagnostic tools',
          'Places burden on individual doctors to detect complex AI failures'
        ]
      }
    ]
  },

  'autonomous-vehicle-school-zone': {
    title: 'Autonomous Vehicle School Zone Accident',
    dilemma:
      'A self-driving car operating in autonomous mode strikes a child who ran into the street chasing a ball outside a school. The car\'s AI had been updated the night before with new pedestrian detection software, the city had recently changed the school zone speed limits but hadn\'t updated digital maps, the car owner had disabled some safety warnings because they were "annoying," and the child\'s parent was distracted by their phone. The accident could have been prevented by any party taking different actions.',
    ethicalQuestion:
      'When autonomous vehicles cause accidents involving multiple contributing factors, how should we balance responsibility between AI developers, city infrastructure, vehicle owners, and other road users?',
    options: [
      {
        id: 'option-a',
        text: 'Manufacturer Strict Liability',
        description:
          'Hold the autonomous vehicle manufacturer strictly liable for any accidents involving their self-driving technology, regardless of other contributing factors.',
        impact: {
          fairness: +1,
          sustainability: +2,
          autonomy: -1,
          beneficence: +1,
          transparency: +1,
          accountability: +2,
          privacy: 0,
          proportionality: 0,
        },
        pros: [
          'Creates strongest possible incentives for safe autonomous vehicle design',
          'Provides clear recourse for accident victims and their families',
          'Encourages comprehensive testing and fail-safe mechanisms',
          'Manufacturers have deepest pockets for injury compensation'
        ],
        cons: [
          'May significantly slow autonomous vehicle development and deployment',
          'Could discourage potentially life-saving transportation technology',
          'Ignores legitimate contributory factors like infrastructure and user behavior',
          'May result in extremely expensive or unavailable autonomous vehicles'
        ]
      },
      {
        id: 'option-b',
        text: 'Proportional Multi-Party Liability',
        description:
          'Assign responsibility proportionally among the manufacturer, city infrastructure, vehicle owner, and other road users based on their contribution to the accident.',
        impact: {
          fairness: +2,
          sustainability: +1,
          autonomy: +1,
          beneficence: +1,
          transparency: +2,
          accountability: +1,
          privacy: 0,
          proportionality: +2,
        },
        pros: [
          'Fairly distributes responsibility based on actual contribution to harm',
          'Encourages improvements from all parties in the transportation system',
          'Recognizes complex reality of modern transportation infrastructure',
          'Promotes comprehensive safety culture across all stakeholders'
        ],
        cons: [
          'Extremely complex to implement in legal and insurance systems',
          'May result in lengthy litigation to determine fault proportions',
          'Could create confusion about safety responsibilities',
          'Victims may face difficulty obtaining full compensation'
        ]
      },
      {
        id: 'option-c',
        text: 'Traditional Road User Responsibility',
        description:
          'Maintain existing traffic law principles where individual road users (including vehicle owners) bear primary responsibility for safe operation.',
        impact: {
          fairness: 0,
          sustainability: 0,
          autonomy: +2,
          beneficence: -1,
          transparency: 0,
          accountability: +1,
          privacy: +1,
          proportionality: 0,
        },
        pros: [
          'Preserves existing legal frameworks and personal responsibility',
          'Encourages vehicle owners to use autonomous features responsibly',
          'Maintains traditional concepts of driver accountability',
          'Allows faster deployment of beneficial autonomous technology'
        ],
        cons: [
          'May not adequately address unique risks of autonomous vehicle technology',
          'Could allow manufacturers to externalize safety costs',
          'Vehicle owners may lack technical expertise to properly oversee AI systems',
          'May not incentivize optimal safety investments by developers'
        ]
      }
    ]
  },

  'ai-content-moderation-failure': {
    title: 'AI Content Moderation Failure',
    dilemma:
      'A social media platform\'s AI content moderation system fails to detect a coordinated harassment campaign that leads to a teenager\'s suicide. The AI was trained by a third-party company using datasets that didn\'t include subtle forms of coordinated harassment, the platform\'s human moderators were overwhelmed and understaffed, the victims reported the content multiple times but the AI marked it as "safe," and the harassment content was designed specifically to evade AI detection by using coded language and seemingly innocent individual posts.',
    ethicalQuestion:
      'When AI moderation systems fail to prevent serious harm despite human oversight and reporting mechanisms, who bears responsibility for the consequences of technological limitations in content governance?',
    options: [
      {
        id: 'option-a',
        text: 'Platform Ultimate Responsibility',
        description:
          'Hold the social media platform fully responsible for any harmful content that slips through their moderation systems, regardless of AI limitations.',
        impact: {
          fairness: +1,
          sustainability: +1,
          autonomy: -1,
          beneficence: +2,
          transparency: +1,
          accountability: +2,
          privacy: -1,
          proportionality: +1,
        },
        pros: [
          'Creates strongest incentives for platforms to invest in comprehensive safety',
          'Provides clear accountability for content-related harms',
          'Platforms profit from content so should bear responsibility for its impacts',
          'Encourages human backup systems when AI fails'
        ],
        cons: [
          'May lead to over-censorship and suppression of legitimate speech',
          'Could make platforms unviable if held liable for all user-generated content',
          'Difficult to prevent all harmful content without destroying platform utility',
          'May discourage platforms from serving vulnerable populations'
        ]
      },
      {
        id: 'option-b',
        text: 'Distributed Responsibility Model',
        description:
          'Share responsibility among the platform, AI training company, individual harassers, and broader social systems that enable online harassment.',
        impact: {
          fairness: +2,
          sustainability: +1,
          autonomy: +1,
          beneficence: +1,
          transparency: +2,
          accountability: +1,
          privacy: +1,
          proportionality: +2,
        },
        pros: [
          'Recognizes complex social and technical factors enabling online harm',
          'Encourages improvements across entire content ecosystem',
          'Addresses root causes rather than just platform responses',
          'Promotes comprehensive approaches to online safety'
        ],
        cons: [
          'May diffuse accountability and slow response to urgent safety issues',
          'Complex to implement in legal frameworks for content liability',
          'Could allow platforms to escape responsibility for inadequate safety investment',
          'Victims may struggle to obtain redress from multiple responsible parties'
        ]
      },
      {
        id: 'option-c',
        text: 'Individual Harasser Accountability',
        description:
          'Focus responsibility primarily on the individuals who created and shared the harmful content, treating platforms as neutral infrastructure.',
        impact: {
          fairness: +1,
          sustainability: -1,
          autonomy: +2,
          beneficence: -1,
          transparency: 0,
          accountability: +1,
          privacy: +2,
          proportionality: +1,
        },
        pros: [
          'Holds actual perpetrators accountable for their harmful actions',
          'Preserves platform neutrality and free speech principles',
          'Avoids creating perverse incentives for over-moderation',
          'Maintains traditional concepts of individual responsibility'
        ],
        cons: [
          'May be difficult to identify and prosecute individual harassers',
          'Ignores platforms\' role in amplifying and enabling harmful content',
          'Could allow systematic harassment to continue unchecked',
          'Places burden on victims to pursue individual legal remedies'
        ]
      }
    ]
  },
};
