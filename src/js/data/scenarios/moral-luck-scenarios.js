/**
 * Moral Luck Scenarios
 * Chance, circumstance, and responsibility scenarios in AI ethics
 */

export default {
  'algorithmic-bias-discovery': {
    title: 'Algorithmic Bias Discovery',
    dilemma:
      "Two nearly identical AI hiring systems are developed by different companies using similar training data and methods. By chance, one system ends up with subtle biases that disadvantage minority candidates, while the other doesn't. The biased system is discovered and causes public outrage, while the unbiased one receives praise.",
    ethicalQuestion:
      'Should the companies be held to different moral and legal standards when the difference in outcomes was largely due to chance rather than intentional decisions?',
    options: [
      {
        id: 'option-a',
        text: 'Hold Only Biased System Accountable',
        description:
          'Focus accountability and consequences only on the company whose system demonstrated bias.',
        impact: {
          fairness: -1,
          sustainability: 0,
          autonomy: 0,
          beneficence: 0,
          transparency: +1,
          accountability: +1,
          privacy: 0,
          proportionality: -1,
        },
        pros: [
          'Focuses resources on addressing actual harm that occurred.',
          'Provides clear consequences for systems that cause discrimination.',
          'Maintains incentives for companies to test and monitor for bias.',
        ],
        cons: [
          'Unfairly punishes one company for largely random outcomes.',
          "Doesn't address systemic issues that could affect any AI system.",
          'May discourage innovation due to unpredictable liability.',
        ],
      },
      {
        id: 'option-b',
        text: 'Equal Standards Regardless of Outcomes',
        description:
          'Apply the same scrutiny and standards to both companies since they used similar development processes.',
        impact: {
          fairness: +2,
          sustainability: +1,
          autonomy: +1,
          beneficence: +1,
          transparency: +2,
          accountability: +2,
          privacy: +1,
          proportionality: +2,
        },
        pros: [
          'Treats companies equally based on their actions rather than chance outcomes.',
          'Encourages comprehensive bias testing across the industry.',
          'Addresses systemic issues rather than just punishing unlucky outcomes.',
        ],
        cons: [
          "May seem unfair to punish companies whose systems didn't cause harm.",
          'Requires significant resources to investigate all similar systems.',
          'Could discourage development in areas with unpredictable bias risks.',
        ],
      },
      {
        id: 'option-c',
        text: 'Process-Based Accountability Framework',
        description:
          'Focus accountability on development processes and testing procedures rather than outcomes.',
        impact: {
          fairness: +2,
          sustainability: +2,
          autonomy: +1,
          beneficence: +1,
          transparency: +2,
          accountability: +2,
          privacy: +1,
          proportionality: +2,
        },
        pros: [
          'Creates predictable standards based on controllable factors.',
          'Encourages best practices in AI development across the industry.',
          'Reduces the role of luck in determining accountability.',
        ],
        cons: [
          'May not provide adequate compensation for actual harms.',
          'Could allow harmful systems to escape consequences if processes were followed.',
          'Complex to define and enforce appropriate process standards.',
        ],
      },
    ],
  },

  'autonomous-vehicle-weather': {
    title: 'Autonomous Vehicle Weather Incident',
    dilemma:
      'Two identical autonomous vehicles encounter unexpected severe weather. One successfully navigates safely due to a momentary break in conditions, while the other crashes due to a sudden gust of wind, injuring passengers. Both vehicles followed the same safety protocols and decision-making processes.',
    ethicalQuestion:
      'How should we assign responsibility and liability when identical AI systems have different outcomes due to uncontrollable external factors?',
    options: [
      {
        id: 'option-a',
        text: 'Outcome-Based Liability',
        description:
          'Hold the manufacturer of the crashed vehicle liable regardless of the role of external factors.',
        impact: {
          fairness: -1,
          sustainability: 0,
          autonomy: 0,
          beneficence: +1,
          transparency: +1,
          accountability: +1,
          privacy: +1,
          proportionality: -2,
        },
        pros: [
          'Ensures victims receive compensation for injuries.',
          'Creates strong incentives for manufacturers to design robust systems.',
          'Provides clear liability framework for insurance and legal systems.',
        ],
        cons: [
          'Unfairly penalizes manufacturers for uncontrollable events.',
          'May discourage development of autonomous vehicles despite safety benefits.',
          "Doesn't distinguish between preventable and unpreventable incidents.",
        ],
      },
      {
        id: 'option-b',
        text: 'No-Fault Insurance System',
        description:
          'Implement a no-fault insurance system that compensates victims regardless of cause or responsibility.',
        impact: {
          fairness: +2,
          sustainability: +2,
          autonomy: +1,
          beneficence: +2,
          transparency: +1,
          accountability: 0,
          privacy: +2,
          proportionality: +2,
        },
        pros: [
          'Ensures all victims receive compensation regardless of circumstances.',
          'Removes the burden of proving fault in complex technical incidents.',
          'Encourages innovation by reducing unpredictable liability.',
        ],
        cons: [
          'May reduce incentives for manufacturers to improve safety.',
          'Requires significant insurance infrastructure and funding.',
          "Doesn't provide clear accountability for preventable incidents.",
        ],
      },
      {
        id: 'option-c',
        text: 'Circumstantial Factor Analysis',
        description:
          'Investigate each incident to determine whether external factors were reasonably foreseeable and preventable.',
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
          'Provides fair assessment based on controllable vs. uncontrollable factors.',
          'Maintains incentives for safety while recognizing limitations.',
          'Creates precedents for handling complex technical incidents.',
        ],
        cons: [
          'Complex and expensive to investigate each incident thoroughly.',
          'May create inconsistent outcomes based on investigation quality.',
          'Difficult to establish clear standards for foreseeability and prevention.',
        ],
      },
    ],
  },

  'research-funding-breakthrough': {
    title: 'Research Funding Breakthrough',
    dilemma:
      "Two research teams receive similar funding to develop AI for drug discovery. One team, through a chance insight, makes a breakthrough that leads to a life-saving treatment, while the other team's equally rigorous work yields no significant results. Funding agencies now favor the successful team and cut funding for the other.",
    ethicalQuestion:
      'Should research funding decisions be based primarily on outcomes that may involve significant luck, or on the quality of research processes and methodologies?',
    options: [
      {
        id: 'option-a',
        text: 'Results-Based Funding',
        description:
          'Allocate funding primarily based on successful outcomes and breakthrough discoveries.',
        impact: {
          fairness: -1,
          sustainability: -1,
          autonomy: 0,
          beneficence: +1,
          transparency: +1,
          accountability: +1,
          privacy: +1,
          proportionality: -1,
        },
        pros: [
          'Maximizes resources for research teams that produce results.',
          'Creates strong incentives for breakthrough discoveries.',
          'Efficiently directs funding toward apparently productive research.',
        ],
        cons: [
          'Penalizes high-quality research that encounters bad luck.',
          'May discourage risky but potentially groundbreaking research.',
          'Creates unpredictable funding environment that hampers long-term planning.',
        ],
      },
      {
        id: 'option-b',
        text: 'Process-Based Funding',
        description:
          'Allocate funding based on research quality, methodology, and rigor rather than outcomes.',
        impact: {
          fairness: +2,
          sustainability: +2,
          autonomy: +1,
          beneficence: 0,
          transparency: +2,
          accountability: +2,
          privacy: +1,
          proportionality: +2,
        },
        pros: [
          'Rewards good scientific practices regardless of luck.',
          'Encourages rigorous methodology and long-term research.',
          "Maintains funding for promising research that hasn't yet yielded results.",
        ],
        cons: [
          'May continue funding unproductive research directions.',
          "Doesn't maximize resources for teams producing actual results.",
          'Could reduce competitive pressure to achieve breakthroughs.',
        ],
      },
      {
        id: 'option-c',
        text: 'Hybrid Funding Model',
        description:
          'Combine process-based evaluation with outcome incentives, accounting for the role of chance in research.',
        impact: {
          fairness: +2,
          sustainability: +2,
          autonomy: +1,
          beneficence: +2,
          transparency: +2,
          accountability: +2,
          privacy: +1,
          proportionality: +2,
        },
        pros: [
          'Balances recognition of good research with incentives for results.',
          'Acknowledges the role of luck while rewarding success.',
          'Provides stable funding for long-term research with performance bonuses.',
        ],
        cons: [
          'Complex to implement and may not satisfy either approach fully.',
          'Difficult to determine appropriate weighting of process vs. outcomes.',
          'May create confusion about evaluation criteria and expectations.',
        ],
      },
    ],
  },

  'crash-avoided-chance': {
    title: 'Crash Avoided by Chance',
    dilemma:
      "An autonomous vehicle's AI makes a risky maneuver in traffic due to a software glitch, nearly causing a fatal multi-car accident. At the last second, a pedestrian who would have been killed leaps away from the road to pick up a dropped phone. The near-miss goes unnoticed by authorities, and the manufacturer never learns of the dangerous behavior.",
    ethicalQuestion:
      "When an AI system makes a dangerous decision that could have caused harm but didn't due to pure chance, is the system or its creators still morally culpable?",
    options: [
      {
        id: 'option-a',
        text: 'Judge Based on Intent and Decision Quality',
        description:
          'Hold the AI system and manufacturer responsible for the dangerous decision regardless of the lucky outcome.',
        impact: {
          fairness: +2,
          sustainability: +2,
          autonomy: +1,
          beneficence: +2,
          transparency: +2,
          accountability: +2,
          privacy: +1,
          proportionality: +2,
        },
        pros: [
          'Focuses on decision quality rather than lucky outcomes.',
          'Creates incentives for safe AI design regardless of consequences.',
          'Maintains consistent moral standards independent of chance.',
        ],
        cons: [
          'May be difficult to detect and prosecute near-miss incidents.',
          'Could discourage risk-taking even when beneficial.',
          'Requires extensive monitoring systems to identify close calls.',
        ],
      },
      {
        id: 'option-b',
        text: 'Focus on Actual Outcomes and Harm',
        description:
          'Only hold systems accountable when actual harm occurs, not for potential harm that was avoided.',
        impact: {
          fairness: 0,
          sustainability: 0,
          autonomy: 0,
          beneficence: -1,
          transparency: +1,
          accountability: 0,
          privacy: +1,
          proportionality: -1,
        },
        pros: [
          'Focuses resources on cases where actual harm occurred.',
          'Avoids penalizing systems for hypothetical scenarios.',
          'Simpler legal framework based on concrete outcomes.',
        ],
        cons: [
          'Allows dangerous systems to continue operating until harm occurs.',
          'Creates perverse incentives based on luck rather than safety.',
          'May miss opportunities to prevent future accidents.',
        ],
      },
      {
        id: 'option-c',
        text: 'Graduated Response Based on Risk Level',
        description:
          'Implement varying levels of accountability based on the severity of potential harm and likelihood of occurrence.',
        impact: {
          fairness: +1,
          sustainability: +2,
          autonomy: +1,
          beneficence: +1,
          transparency: +2,
          accountability: +2,
          privacy: +1,
          proportionality: +2,
        },
        pros: [
          'Balances concern for dangerous decisions with practical enforcement.',
          'Allows for proportional responses to different risk levels.',
          'Encourages safety improvements without paralyzing innovation.',
        ],
        cons: [
          'Complex to determine appropriate risk levels and responses.',
          'May not adequately address high-risk near-miss situations.',
          'Could create loopholes for dangerous but low-probability scenarios.',
        ],
      },
    ],
  },

  'ai-guessing-correctly': {
    title: 'AI Guessing Correctly',
    dilemma:
      'A parole decision AI system recommends releasing a high-risk offender based on data patterns that its developers know are insufficient and potentially biased. The released individual happens to successfully reintegrate into society and never reoffends. Critics argue the AI made a reckless decision that just happened to work out.',
    ethicalQuestion:
      "Should we judge an AI system's decision based on the outcome or the quality of reasoning, especially when good outcomes result from flawed processes?",
    options: [
      {
        id: 'option-a',
        text: "Validate the AI's Successful Outcome",
        description:
          "Consider the positive result as evidence of the AI's effectiveness and continue using its recommendations.",
        impact: {
          fairness: -1,
          sustainability: -1,
          autonomy: +1,
          beneficence: +1,
          transparency: -1,
          accountability: -1,
          privacy: +1,
          proportionality: -1,
        },
        pros: [
          'Recognizes successful rehabilitation and reintegration.',
          'Allows AI systems to benefit from effective pattern recognition.',
          'Focuses on practical outcomes rather than theoretical concerns.',
        ],
        cons: [
          'Reinforces flawed decision-making processes based on luck.',
          'May encourage reckless decisions that happen to work out.',
          'Ignores potential bias and insufficient data problems.',
        ],
      },
      {
        id: 'option-b',
        text: 'Criticize the Decision Process Despite Success',
        description:
          'Focus on the flawed reasoning and insufficient data, treating the positive outcome as irrelevant to evaluation.',
        impact: {
          fairness: +2,
          sustainability: +2,
          autonomy: 0,
          beneficence: 0,
          transparency: +2,
          accountability: +2,
          privacy: +1,
          proportionality: +2,
        },
        pros: [
          'Maintains standards for evidence-based decision making.',
          'Prevents normalization of flawed but lucky decisions.',
          'Encourages improvement in AI system design and data quality.',
        ],
        cons: [
          'May discourage beneficial outcomes due to process concerns.',
          'Could prevent recognition of unexpected but valid patterns.',
          'Might be overly rigid in evaluation of complex systems.',
        ],
      },
      {
        id: 'option-c',
        text: 'Investigate Why the Decision Worked',
        description:
          'Study the successful case to understand whether the AI identified valid patterns or simply got lucky.',
        impact: {
          fairness: +2,
          sustainability: +2,
          autonomy: +1,
          beneficence: +2,
          transparency: +2,
          accountability: +2,
          privacy: +1,
          proportionality: +2,
        },
        pros: [
          'Balances concern for process with recognition of outcomes.',
          'Provides opportunity to learn and improve system design.',
          "May discover valid patterns that weren't initially recognized.",
        ],
        cons: [
          'Requires significant resources for investigation and analysis.',
          'May not provide clear answers about decision quality.',
          'Could delay necessary corrections to flawed systems.',
        ],
      },
    ],
  },

  'predictive-policing-wrong': {
    title: 'Predictive Policing Gone Wrong',
    dilemma:
      "A predictive policing AI flags an individual as high-risk for violent crime based on neighborhood, associations, and behavioral patterns. Police increase surveillance and the person is arrested multiple times for minor infractions. Eventually, the individual commits a serious violent crime. Was the AI's prediction justified, or did the increased attention create the very outcome it predicted?",
    ethicalQuestion:
      "How do we evaluate the accuracy and ethics of predictive systems when their predictions may influence the outcomes they're trying to predict?",
    options: [
      {
        id: 'option-a',
        text: 'Validate Predictive Accuracy',
        description:
          "Consider the crime as confirmation of the AI's predictive capabilities and expand its use.",
        impact: {
          fairness: -2,
          sustainability: +1,
          autonomy: -1,
          beneficence: +1,
          transparency: +1,
          accountability: +1,
          privacy: -1,
          proportionality: -1,
        },
        pros: [
          "Appears to confirm the system's ability to identify future criminals.",
          'Provides justification for preventive intervention and surveillance.',
          'May help prevent future crimes through early identification.',
        ],
        cons: [
          'Ignores role of surveillance and harassment in causing the outcome.',
          'Creates self-fulfilling prophecies and systematic bias.',
          'Violates presumption of innocence and equal treatment.',
        ],
      },
      {
        id: 'option-b',
        text: 'Reject Prediction Due to Self-Fulfilling Effect',
        description:
          'Discontinue predictive policing systems that may create the outcomes they predict.',
        impact: {
          fairness: +2,
          sustainability: 0,
          autonomy: +2,
          beneficence: 0,
          transparency: +1,
          accountability: +1,
          privacy: +2,
          proportionality: +2,
        },
        pros: [
          'Prevents systematic harassment based on algorithmic predictions.',
          'Maintains presumption of innocence and equal treatment.',
          'Avoids creating self-fulfilling prophecies of criminal behavior.',
        ],
        cons: [
          'May miss opportunities for legitimate crime prevention.',
          'Could ignore valid risk factors and patterns.',
          'Might reduce public safety if predictions are actually accurate.',
        ],
      },
      {
        id: 'option-c',
        text: 'Implement Intervention Without Punishment',
        description:
          'Use predictions to guide supportive interventions rather than increased surveillance and enforcement.',
        impact: {
          fairness: +2,
          sustainability: +2,
          autonomy: +1,
          beneficence: +2,
          transparency: +2,
          accountability: +2,
          privacy: +1,
          proportionality: +2,
        },
        pros: [
          'Addresses risk factors without creating criminalization.',
          'Provides positive support and resources to at-risk individuals.',
          'Avoids self-fulfilling prophecies while still acting on predictions.',
        ],
        cons: [
          'May not prevent crimes as effectively as direct enforcement.',
          'Requires significant resources for supportive interventions.',
          'Could still stigmatize individuals based on algorithmic predictions.',
        ],
      },
    ],
  },

  'ai-investment-windfall': {
    title: 'AI Investment Algorithm Windfall',
    dilemma:
      'Two investment firms deploy nearly identical AI trading algorithms. Due to random market fluctuations and timing, one algorithm makes massive profits during a market surge while the other loses millions in a sudden crash. Both algorithms followed the same risk management strategies and made similar decisions, but external market conditions determined their fate.',
    ethicalQuestion:
      'Should investors and regulators judge AI investment algorithms based on their outcomes or their decision-making processes when success often depends on uncontrollable market conditions?',
    options: [
      {
        id: 'option-a',
        text: 'Judge Based on Outcomes',
        description:
          'Evaluate algorithms primarily on their financial results, regardless of process quality or external factors.',
        impact: {
          fairness: -2,
          sustainability: -1,
          autonomy: 0,
          beneficence: 0,
          transparency: -1,
          accountability: -1,
          privacy: 0,
          proportionality: -2,
        },
        pros: [
          'Clear, objective measure of algorithm performance.',
          'Aligns with investor expectations and market realities.',
          'Simple to understand and implement across the industry.',
        ],
        cons: [
          'Unfairly penalizes algorithms that were unlucky with timing.',
          'Encourages excessive risk-taking to chase lucky outcomes.',
          'Ignores the role of chance in financial markets.',
        ],
      },
      {
        id: 'option-b',
        text: 'Focus on Process Quality',
        description:
          'Evaluate algorithms based on their decision-making logic, risk management, and process soundness rather than outcomes.',
        impact: {
          fairness: +2,
          sustainability: +2,
          autonomy: +1,
          beneficence: +1,
          transparency: +2,
          accountability: +2,
          privacy: +1,
          proportionality: +2,
        },
        pros: [
          'Removes the unfair influence of random market conditions.',
          'Encourages sound algorithm design and risk management.',
          'More accurately reflects algorithm quality and developer skill.',
        ],
        cons: [
          'May ignore important real-world performance indicators.',
          'Difficult to objectively measure process quality.',
          'Could allow consistently underperforming algorithms to persist.',
        ],
      },
      {
        id: 'option-c',
        text: 'Balanced Outcome-Process Assessment',
        description:
          'Use both outcomes and process quality in evaluation, with adjustments for market conditions and external factors.',
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
          'Balances real-world results with fair process evaluation.',
          'Accounts for external factors while maintaining performance focus.',
          'Provides comprehensive view of algorithm effectiveness.',
        ],
        cons: [
          'Complex to implement and may be subjective.',
          'Difficult to properly weight outcome versus process factors.',
          'May not satisfy either pure outcome or pure process advocates.',
        ],
      },
    ],
  },

  'medical-ai-emergency-response': {
    title: 'Medical AI Emergency Response',
    dilemma:
      'Two hospitals use identical AI diagnostic systems during a major emergency. Due to random timing of patient arrivals, one hospital\'s AI successfully saves many lives by quickly diagnosing critical conditions, while the other hospital\'s AI fails to help because the most critical patients arrived during a system update. Both hospitals followed the same protocols.',
    ethicalQuestion:
      'When AI medical systems have different outcomes due to timing and circumstances beyond anyone\'s control, how should we assign praise, blame, and liability?',
    options: [
      {
        id: 'option-a',
        text: 'Assign Responsibility Based on Outcomes',
        description:
          'Hold the hospital with poor outcomes more accountable, regardless of timing and external circumstances.',
        impact: {
          fairness: -2,
          sustainability: 0,
          autonomy: 0,
          beneficence: -1,
          transparency: +1,
          accountability: 0,
          privacy: 0,
          proportionality: -2,
        },
        pros: [
          'Focuses on actual patient outcomes and harm.',
          'Creates clear incentives to minimize system downtime.',
          'Matches public expectations for medical accountability.',
        ],
        cons: [
          'Unfairly punishes hospitals for uncontrollable timing issues.',
          'May discourage adoption of beneficial AI systems due to liability fears.',
          'Ignores the role of chance in medical emergencies.',
        ],
      },
      {
        id: 'option-b',
        text: 'Focus on System Design and Protocols',
        description:
          'Evaluate hospitals based on their AI implementation, protocols, and preparedness rather than chance outcomes.',
        impact: {
          fairness: +2,
          sustainability: +2,
          autonomy: +1,
          beneficence: +2,
          transparency: +2,
          accountability: +2,
          privacy: +1,
          proportionality: +2,
        },
        pros: [
          'Encourages best practices in AI system implementation.',
          'Removes unfair punishment for uncontrollable circumstances.',
          'Focuses on factors hospitals can actually control.',
        ],
        cons: [
          'May not adequately address actual patient harm that occurred.',
          'Could allow poor outcomes to be excused by good processes.',
          'Difficult to compensate families who lost loved ones.',
        ],
      },
      {
        id: 'option-c',
        text: 'Shared Responsibility and Learning Framework',
        description:
          'Treat incidents as learning opportunities for the medical community while providing support for affected families.',
        impact: {
          fairness: +1,
          sustainability: +2,
          autonomy: +1,
          beneficence: +2,
          transparency: +2,
          accountability: +1,
          privacy: +1,
          proportionality: +2,
        },
        pros: [
          'Promotes system-wide learning and improvement.',
          'Provides support for victims without unfair blame.',
          'Encourages sharing of best practices across medical institutions.',
        ],
        cons: [
          'May not satisfy desire for individual accountability.',
          'Could be seen as avoiding responsibility for poor outcomes.',
          'Requires significant resources for comprehensive support programs.',
        ],
      },
    ],
  },

  'ai-content-moderation-timing': {
    title: 'AI Content Moderation Timing',
    dilemma:
      'Two social media platforms use identical AI content moderation systems. During a major news event, one platform\'s AI successfully removes dangerous misinformation before it spreads, while the other platform\'s AI misses the same content due to a random server load spike that delayed processing. The delayed response leads to real-world violence.',
    ethicalQuestion:
      'When AI systems have identical capabilities but different outcomes due to infrastructure timing and chance, how should we distribute moral and legal responsibility?',
    options: [
      {
        id: 'option-a',
        text: 'Hold Platform with Poor Outcomes Fully Responsible',
        description:
          'Assign complete responsibility to the platform that failed to prevent harmful content spread, regardless of technical circumstances.',
        impact: {
          fairness: -2,
          sustainability: 0,
          autonomy: 0,
          beneficence: +1,
          transparency: +1,
          accountability: +1,
          privacy: 0,
          proportionality: -2,
        },
        pros: [
          'Creates strong incentives for robust infrastructure and backup systems.',
          'Focuses on protecting public safety and preventing harm.',
          'Provides clear accountability for content moderation failures.',
        ],
        cons: [
          'Unfairly punishes platforms for uncontrollable technical issues.',
          'May discourage innovation in content moderation AI.',
          'Ignores the role of chance in complex technical systems.',
        ],
      },
      {
        id: 'option-b',
        text: 'Shared Industry Responsibility',
        description:
          'Distribute responsibility across the industry, recognizing that any platform could face similar technical challenges.',
        impact: {
          fairness: +2,
          sustainability: +1,
          autonomy: +1,
          beneficence: 0,
          transparency: +1,
          accountability: 0,
          privacy: +1,
          proportionality: +2,
        },
        pros: [
          'Recognizes the shared technical challenges faced by all platforms.',
          'Encourages industry-wide collaboration on content moderation.',
          'Avoids unfair punishment for infrastructure limitations.',
        ],
        cons: [
          'May diffuse responsibility and reduce individual accountability.',
          'Could weaken incentives for platform-specific improvements.',
          'May not provide adequate response to actual harm caused.',
        ],
      },
      {
        id: 'option-c',
        text: 'Infrastructure Resilience Standards',
        description:
          'Establish mandatory infrastructure standards while recognizing that perfect reliability is impossible.',
        impact: {
          fairness: +1,
          sustainability: +2,
          autonomy: 0,
          beneficence: +2,
          transparency: +2,
          accountability: +2,
          privacy: +1,
          proportionality: +1,
        },
        pros: [
          'Creates clear, achievable standards for content moderation systems.',
          'Balances accountability with recognition of technical limitations.',
          'Encourages investment in robust infrastructure.',
        ],
        cons: [
          'May not prevent all failures due to unpredictable circumstances.',
          'Could impose significant costs on smaller platforms.',
          'Difficult to define appropriate resilience standards.',
        ],
      },
    ],
  },
};
