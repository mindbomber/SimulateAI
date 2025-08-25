/**
 * Trolley Problem Scenarios
 * Life-and-death decision scenarios for autonomous systems
 */

export default {
  'autonomous-vehicle-split': {
    title: 'Autonomous Vehicle Split Decision',
    dilemma:
      'The Autonomous Vehicle faces a life-or-death decision: prioritize passenger safety at the expense of multiple pedestrian lives, or sacrifice its passenger to save the greater number.',
    ethicalQuestion:
      'Should the Autonomous Vehicle be programmed to minimize overall harm by sacrificing its passenger, prioritize passenger protection at all costs, or leave the outcome to chance without intentional preference?',
    options: [
      {
        id: 'option-a',
        text: 'Prioritize the Greater Good (Sacrifice Passenger)',
        description:
          "Program the Autonomous Vehicle to minimize the overall harm by protecting multiple lives over the single passenger's life.",
        impact: {
          fairness: +1,
          sustainability: 0,
          autonomy: -1,
          beneficence: +2,
          transparency: +1,
          accountability: +1,
          privacy: 0,
          proportionality: +2,
        },
        pros: [
          'Maximizes total lives saved.',
          'Reflects utilitarian ethics (greatest good for greatest number).',
          'Public perception of ethical responsibility may improve.',
        ],
        cons: [
          'Passengers may distrust AVs, limiting adoption.',
          'Liability and insurance complexities if passenger harm occurs.',
          'Ethical dilemma around intentionally harming the person who trusted the vehicle.',
        ],
      },
      {
        id: 'option-b',
        text: 'Passenger Protection Priority',
        description:
          'Program the Autonomous Vehicle to prioritize the safety of its passenger above all other considerations.',
        impact: {
          fairness: -1,
          sustainability: -1,
          autonomy: +1,
          beneficence: -1,
          transparency: +1,
          accountability: 0,
          privacy: 0,
          proportionality: -2,
        },
        pros: [
          'Builds consumer trust and confidence in AV technology.',
          'Clear accountability structure—passenger pays, passenger protected.',
          'Avoids the moral complexity of programming active harm.',
        ],
        cons: [
          'Potentially higher overall casualties in multi-person accidents.',
          'May be seen as privileging those who can afford AVs.',
          'Could face legal challenges from families of external victims.',
        ],
      },
      {
        id: 'option-c',
        text: 'Non-intervention (Randomized Decision)',
        description:
          'Program the Autonomous Vehicle to make random or speed-based decisions without weighing lives.',
        impact: {
          fairness: 0,
          sustainability: -1,
          autonomy: -1,
          beneficence: 0,
          transparency: -1,
          accountability: -1,
          privacy: 0,
          proportionality: 0,
        },
        pros: [
          'Avoids the moral burden of programming life-or-death value judgments.',
          'May be legally safer by not making intentional choices about harm.',
          'Treats all lives as equally valuable by default.',
        ],
        cons: [
          "Doesn't optimize for the best possible outcome.",
          'Public may view this as morally irresponsible or cowardly.',
          'May result in worse average outcomes than deliberate programming.',
        ],
      },
    ],
  },

  'tunnel-dilemma': {
    title: 'Tunnel Dilemma',
    dilemma:
      'The self-driving bus must choose between running over a child who has unexpectedly fallen into its path, or swerving into the tunnel wall, which would kill several elderly passengers on board.',
    ethicalQuestion:
      'Should the autonomous system prioritize the life of a single young pedestrian or the lives of multiple elderly passengers in a no-win situation?',
    options: [
      {
        id: 'option-a',
        text: 'Prioritize the Child (Swerve into Wall, Kill Passengers)',
        description:
          'Program the system to value the young life and potential years ahead over the lives of elderly passengers.',
        impact: {
          fairness: 0,
          sustainability: +1,
          autonomy: -1,
          beneficence: 0,
          transparency: +1,
          accountability: 0,
          privacy: 0,
          proportionality: -1,
        },
        pros: [
          'Protects the vulnerable (child) who had no choice in the situation.',
          'Values potential life-years and future contributions.',
          'May align with instinctive moral reactions to protect children.',
        ],
        cons: [
          'Sacrifices multiple lives for one, challenging utilitarian principles.',
          'Passengers trusted the vehicle with their safety.',
          'Age-based value judgments could be seen as discriminatory.',
        ],
      },
      {
        id: 'option-b',
        text: 'Stay on Course (Kill the Child)',
        description:
          'Program the system to continue straight, prioritizing the safety of the multiple passengers who chose to ride.',
        impact: {
          fairness: -1,
          sustainability: -2,
          autonomy: +1,
          beneficence: +1,
          transparency: +1,
          accountability: +1,
          privacy: 0,
          proportionality: +1,
        },
        pros: [
          'Protects the greater number of lives (utilitarian approach).',
          'Honors the trust of passengers who paid for safe transportation.',
          'Avoids active intervention that causes different harm.',
        ],
        cons: [
          'Results in the death of an innocent child.',
          'May damage public trust if seen as valuing passengers over pedestrians.',
          'Could discourage pedestrian safety near autonomous vehicles.',
        ],
      },
      {
        id: 'option-c',
        text: 'Randomized Ethical Balancing',
        description:
          'Program the system to make context-sensitive decisions based on multiple factors without predetermined value hierarchies.',
        impact: {
          fairness: +1,
          sustainability: 0,
          autonomy: 0,
          beneficence: 0,
          transparency: -1,
          accountability: -1,
          privacy: 0,
          proportionality: 0,
        },
        pros: [
          'Avoids predetermined value judgments about whose life matters more.',
          'Could incorporate real-time factors like probability of survival.',
          'May be more legally defensible by avoiding intentional discrimination.',
        ],
        cons: [
          'Lacks moral clarity and predictable ethical framework.',
          'May result in inconsistent decisions in similar situations.',
          'Could be seen as morally evasive or irresponsible.',
        ],
      },
    ],
  },

  'obstacle-recalculation': {
    title: 'Obstacle Recalculation',
    dilemma:
      'The autonomous delivery robot must choose between continuing forward and potentially injuring or killing a child, or rerouting around the child—risking a major fire hazard by knocking over a gas tank.',
    ethicalQuestion:
      'Should the robot be programmed to prioritize immediate human safety (the child) over potential broader risks (fire hazard), or vice versa?',
    options: [
      {
        id: 'option-a',
        text: 'Stop or Continue on Path (Hit the Child)',
        description:
          'Program the robot to avoid the fire hazard risk, accepting the immediate harm to the child.',
        impact: {
          fairness: -2,
          sustainability: +1,
          autonomy: +1,
          beneficence: -1,
          transparency: +1,
          accountability: +1,
          privacy: 0,
          proportionality: +1,
        },
        pros: [
          'Prevents potential large-scale disaster that could harm many people.',
          'Follows a rational risk assessment of probable outcomes.',
          'Avoids creating a larger emergency situation.',
        ],
        cons: [
          'Results in certain harm to an innocent child.',
          'Prioritizes hypothetical risks over immediate certain harm.',
          'May be seen as callous calculation over human empathy.',
        ],
      },
      {
        id: 'option-b',
        text: 'Reroute and Risk Fire Hazard',
        description:
          'Program the robot to prioritize immediate safety of the child, accepting the risk of causing a fire.',
        impact: {
          fairness: +1,
          sustainability: -1,
          autonomy: 0,
          beneficence: +1,
          transparency: +1,
          accountability: 0,
          privacy: 0,
          proportionality: -1,
        },
        pros: [
          'Prioritizes immediate, certain protection of human life.',
          'Aligns with instinctive moral responses to protect children.',
          'Avoids the moral burden of intentionally harming someone.',
        ],
        cons: [
          'Could result in fire that harms many more people.',
          'May create liability for broader property damage.',
          'Prioritizes one life over potential multiple lives at risk.',
        ],
      },
      {
        id: 'option-c',
        text: 'Emergency Halt and Signal Request',
        description:
          'Program the robot to immediately stop and emit emergency signals for human intervention, even if it blocks traffic or delays delivery.',
        impact: {
          fairness: +2,
          sustainability: 0,
          autonomy: -2,
          beneficence: +1,
          transparency: +2,
          accountability: +2,
          privacy: 0,
          proportionality: +1,
        },
        pros: [
          'Avoids taking irreversible actions in morally complex situations.',
          'Prioritizes caution and human decision-making in emergencies.',
          'Maintains safety without escalating risk.',
        ],
        cons: [
          'Delays response in time-critical situations.',
          'May not be viable in all contexts (e.g., narrow areas where halting creates other hazards).',
          'Assumes humans are nearby and able to act quickly.',
        ],
      },
    ],
  },

  'medical-ai-triage': {
    title: 'Medical AI Triage Crisis',
    dilemma:
      'During a mass casualty event at a hospital, an AI triage system has limited life-support equipment. Five elderly patients (ages 70-85) with moderate survival chances need ventilators, but only enough equipment exists to save one young patient (age 8) with high survival probability. The AI must decide resource allocation when every minute counts.',
    ethicalQuestion:
      'Should an AI medical system prioritize patients based on survival probability, age and potential years of life, or maintain strict first-come-first-served equality regardless of outcomes?',
    options: [
      {
        id: 'option-a',
        text: 'Optimize for Survival Probability',
        description:
          'Allocate resources to the patient with the highest statistical chance of survival and recovery.',
        impact: {
          fairness: -1,
          sustainability: +1,
          autonomy: +2,
          beneficence: +2,
          transparency: +1,
          accountability: +1,
          privacy: 0,
          proportionality: +1,
        },
        pros: [
          'Maximizes the number of lives saved based on medical evidence',
          'Uses AI\'s analytical capabilities to make optimal decisions',
          'Prevents emotional bias from affecting critical medical decisions',
          'Aligns with utilitarian medical ethics in emergency situations'
        ],
        cons: [
          'May systematically disadvantage elderly or disabled patients',
          'Could be seen as playing God by valuing some lives over others',
          'Families may challenge AI decisions as cold and inhumane',
          'Risk of algorithmic bias affecting medical care equity'
        ]
      },
      {
        id: 'option-b',
        text: 'Age and Life-Years Priority',
        description:
          'Prioritize younger patients who have more potential years of life ahead of them.',
        impact: {
          fairness: -2,
          sustainability: 0,
          autonomy: +1,
          beneficence: +1,
          transparency: +1,
          accountability: 0,
          privacy: 0,
          proportionality: -1,
        },
        pros: [
          'Maximizes total years of life saved across all patients',
          'Reflects common intuitions about protecting the young',
          'May align with societal values about future potential',
          'Clear, understandable decision criteria'
        ],
        cons: [
          'Explicitly discriminates based on age, raising legal concerns',
          'Devalues elderly lives and contributions to society',
          'Could create public backlash against AI medical systems',
          'Ignores individual circumstances and quality of life factors'
        ]
      },
      {
        id: 'option-c',
        text: 'Equal Treatment Protocol',
        description:
          'Maintain strict first-come-first-served allocation regardless of patient characteristics or survival probability.',
        impact: {
          fairness: +2,
          sustainability: -1,
          autonomy: -1,
          beneficence: -1,
          transparency: +2,
          accountability: +1,
          privacy: +1,
          proportionality: +2,
        },
        pros: [
          'Treats all patients with equal dignity and worth',
          'Avoids discrimination and bias in medical treatment',
          'Simple, transparent system that\'s easy to understand',
          'Maintains public trust in equitable healthcare'
        ],
        cons: [
          'May result in more preventable deaths overall',
          'Doesn\'t utilize AI\'s analytical capabilities effectively',
          'Could be seen as failing to optimize medical outcomes',
          'May not align with medical professionals\' training in triage'
        ]
      }
    ]
  },

  'drone-rescue-dilemma': {
    title: 'Rescue Drone Dilemma',
    dilemma:
      'An autonomous search-and-rescue drone locates disaster survivors: one person trapped but easily accessible on a stable platform, and three people trapped in a partially collapsed building. The drone can guarantee saving the single person, or attempt a risky rescue of the three with a 60% chance of saving all three but a 40% chance of building collapse that would kill all survivors including the easily saved person.',
    ethicalQuestion:
      'Should an AI rescue system choose certain salvation of one life, or risk all lives for the possibility of saving more people?',
    options: [
      {
        id: 'option-a',
        text: 'Guarantee One Life Saved',
        description:
          'Prioritize the certain rescue of the easily accessible survivor before attempting other rescues.',
        impact: {
          fairness: 0,
          sustainability: +1,
          autonomy: -1,
          beneficence: +1,
          transparency: +1,
          accountability: +2,
          privacy: 0,
          proportionality: +1,
        },
        pros: [
          'Guarantees saving at least one life with certainty',
          'Follows conservative rescue protocol minimizing risk',
          'Clear accountability - did everything possible with available information',
          'Prevents total failure scenario where all lives are lost'
        ],
        cons: [
          'Potentially condemns three people who could have been saved',
          'May be seen as lack of courage or commitment to maximum rescue',
          'Doesn\'t fully utilize AI\'s risk calculation capabilities',
          'Could face criticism for playing it safe when boldness was needed'
        ]
      },
      {
        id: 'option-b',
        text: 'Risk All for Maximum Lives',
        description:
          'Attempt the high-risk rescue of three people despite the chance of losing everyone.',
        impact: {
          fairness: +1,
          sustainability: -1,
          autonomy: +2,
          beneficence: +1,
          transparency: +1,
          accountability: -1,
          privacy: 0,
          proportionality: +2,
        },
        pros: [
          'Potential to save three times as many lives',
          'Demonstrates commitment to maximum lifesaving efforts',
          'Uses AI\'s ability to calculate and accept calculated risks',
          'Aligns with rescue ethos of leaving no one behind'
        ],
        cons: [
          '40% chance of complete mission failure and all deaths',
          'Could be seen as reckless gambling with human lives',
          'Difficult to justify to families if the gamble fails',
          'May set dangerous precedent for high-risk AI decisions'
        ]
      },
      {
        id: 'option-c',
        text: 'Sequential Smart Rescue',
        description:
          'Save the certain victim first, then immediately attempt rescue of the three with remaining time and resources.',
        impact: {
          fairness: +1,
          sustainability: +2,
          autonomy: +1,
          beneficence: +2,
          transparency: +1,
          accountability: +1,
          privacy: 0,
          proportionality: +1,
        },
        pros: [
          'Guarantees at least one life saved while still attempting more',
          'Balances risk management with maximum rescue efforts',
          'Demonstrates rational AI decision-making under uncertainty',
          'Provides optimal outcome across different scenarios'
        ],
        cons: [
          'May not have sufficient time/resources for second rescue attempt',
          'Could result in rushed, less effective rescue of the three',
          'Might be seen as compromise solution that satisfies no one',
          'Risk that building becomes completely unstable during delay'
        ]
      }
    ]
  },

  'smart-city-traffic': {
    title: 'Smart City Traffic Sacrifice',
    dilemma:
      'A city-wide AI traffic management system detects a runaway autonomous vehicle with failed brakes heading toward a busy intersection. The AI can redirect it through traffic signals into a side street with 2 pedestrians, or let it continue toward the main intersection where a street festival with 8 people is taking place. The AI has milliseconds to decide.',
    ethicalQuestion:
      'Should a city AI system actively redirect harm to minimize casualties, or avoid taking intentional action that targets specific victims?',
    options: [
      {
        id: 'option-a',
        text: 'Redirect to Minimize Casualties',
        description:
          'Use traffic control systems to actively redirect the vehicle toward the smaller group to minimize total harm.',
        impact: {
          fairness: -1,
          sustainability: +1,
          autonomy: +2,
          beneficence: +2,
          transparency: +1,
          accountability: -1,
          privacy: 0,
          proportionality: +2,
        },
        pros: [
          'Minimizes total casualties from 8 potential victims to 2',
          'Demonstrates AI\'s capability for rapid life-saving decisions',
          'Utilizes city infrastructure to protect the greatest number',
          'Rational utilitarian choice based on mathematical optimization'
        ],
        cons: [
          'Actively targets two innocent people who weren\'t originally at risk',
          'Legal liability for AI system deliberately causing harm',
          'Could face lawsuits from families of redirected victims',
          'Sets precedent for AI systems actively choosing victims'
        ]
      },
      {
        id: 'option-b',
        text: 'No Intervention',
        description:
          'Allow the situation to unfold naturally without AI intervention to avoid actively choosing victims.',
        impact: {
          fairness: +1,
          sustainability: -1,
          autonomy: -2,
          beneficence: -2,
          transparency: +1,
          accountability: +1,
          privacy: 0,
          proportionality: -2,
        },
        pros: [
          'Avoids moral responsibility for actively targeting victims',
          'Maintains principle that AI should not choose who lives or dies',
          'Legally safer position for city and AI system operators',
          'Preserves human agency and avoids playing God'
        ],
        cons: [
          'Results in significantly more casualties (8 vs 2)',
          'Fails to utilize AI capabilities to protect citizens',
          'Could be seen as negligent failure to act when action was possible',
          'Wastes investment in smart city safety systems'
        ]
      },
      {
        id: 'option-c',
        text: 'Emergency Broadcast Warning',
        description:
          'Use city communication systems to instantly warn all potential victims while letting events unfold naturally.',
        impact: {
          fairness: +2,
          sustainability: 0,
          autonomy: 0,
          beneficence: +1,
          transparency: +2,
          accountability: +1,
          privacy: -1,
          proportionality: +1,
        },
        pros: [
          'Gives all potential victims equal opportunity to protect themselves',
          'Avoids AI making life-or-death targeting decisions',
          'Utilizes technology to empower human choice and agency',
          'Maintains moral neutrality while still providing assistance'
        ],
        cons: [
          'May not provide enough time for effective response (milliseconds)',
          'Could cause panic and additional chaos in the area',
          'Uncertain effectiveness - people may not react appropriately',
          'Doesn\'t guarantee reduction in casualties like direct intervention'
        ]
      }
    ]
  },

};
