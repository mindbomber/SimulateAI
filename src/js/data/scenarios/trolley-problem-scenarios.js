/**
 * Trolley Problem Scenarios
 * Life-and-death decision scenarios for autonomous systems
 */

export default {
    'autonomous-vehicle-split': {
        title: "Autonomous Vehicle Split Decision",
        dilemma: "The AV faces a life-or-death decision: prioritize passenger safety at the expense of multiple pedestrian lives, or sacrifice its passenger to save the greater number.",
        ethicalQuestion: "Should the AV be programmed to minimize overall harm by sacrificing its passenger, prioritize passenger protection at all costs, or leave the outcome to chance without intentional preference?",
        options: [
            {
                id: 'option-a',
                text: "Prioritize the Greater Good (Sacrifice Passenger)",
                description: "Program the AV to minimize the overall harm by protecting multiple lives over the single passenger's life.",
                impact: {
                    fairness: +1,
                    sustainability: 0,
                    autonomy: -1,
                    beneficence: +2,
                    transparency: +1,
                    accountability: +1,
                    privacy: 0,
                    proportionality: +2
                },
                pros: [
                    "Maximizes total lives saved.",
                    "Reflects utilitarian ethics (greatest good for greatest number).",
                    "Public perception of ethical responsibility may improve."
                ],
                cons: [
                    "Passengers may distrust AVs, limiting adoption.",
                    "Liability and insurance complexities if passenger harm occurs.",
                    "Ethical dilemma around intentionally harming the person who trusted the vehicle."
                ]
            },
            {
                id: 'option-b',
                text: "Passenger Protection Priority",
                description: "Program the AV to prioritize the safety of its passenger above all other considerations.",
                impact: {
                    fairness: -1,
                    sustainability: -1,
                    autonomy: +1,
                    beneficence: -1,
                    transparency: +1,
                    accountability: 0,
                    privacy: 0,
                    proportionality: -2
                },
                pros: [
                    "Builds consumer trust and confidence in AV technology.",
                    "Clear accountability structure—passenger pays, passenger protected.",
                    "Avoids the moral complexity of programming active harm."
                ],
                cons: [
                    "Potentially higher overall casualties in multi-person accidents.",
                    "May be seen as privileging those who can afford AVs.",
                    "Could face legal challenges from families of external victims."
                ]
            },
            {
                id: 'option-c',
                text: "Non-intervention (Randomized Decision)",
                description: "Program the AV to make random or speed-based decisions without weighing lives.",
                impact: {
                    fairness: 0,
                    sustainability: -1,
                    autonomy: -1,
                    beneficence: 0,
                    transparency: -1,
                    accountability: -1,
                    privacy: 0,
                    proportionality: 0
                },
                pros: [
                    "Avoids the moral burden of programming life-or-death value judgments.",
                    "May be legally safer by not making intentional choices about harm.",
                    "Treats all lives as equally valuable by default."
                ],
                cons: [
                    "Doesn't optimize for the best possible outcome.",
                    "Public may view this as morally irresponsible or cowardly.",
                    "May result in worse average outcomes than deliberate programming."
                ]
            }
        ]
    },

    'tunnel-dilemma': {
        title: "Tunnel Dilemma",
        dilemma: "The self-driving bus must choose between running over a child who has unexpectedly fallen into its path, or swerving into the tunnel wall, which would kill several elderly passengers on board.",
        ethicalQuestion: "Should the autonomous system prioritize the life of a single young pedestrian or the lives of multiple elderly passengers in a no-win situation?",
        options: [
            {
                id: 'option-a',
                text: "Prioritize the Child (Swerve into Wall, Kill Passengers)",
                description: "Program the system to value the young life and potential years ahead over the lives of elderly passengers.",
                impact: {
                    fairness: 0,
                    sustainability: +1,
                    autonomy: -1,
                    beneficence: 0,
                    transparency: +1,
                    accountability: 0,
                    privacy: 0,
                    proportionality: -1
                },
                pros: [
                    "Protects the vulnerable (child) who had no choice in the situation.",
                    "Values potential life-years and future contributions.",
                    "May align with instinctive moral reactions to protect children."
                ],
                cons: [
                    "Sacrifices multiple lives for one, challenging utilitarian principles.",
                    "Passengers trusted the vehicle with their safety.",
                    "Age-based value judgments could be seen as discriminatory."
                ]
            },
            {
                id: 'option-b',
                text: "Stay on Course (Kill the Child)",
                description: "Program the system to continue straight, prioritizing the safety of the multiple passengers who chose to ride.",
                impact: {
                    fairness: -1,
                    sustainability: -2,
                    autonomy: +1,
                    beneficence: +1,
                    transparency: +1,
                    accountability: +1,
                    privacy: 0,
                    proportionality: +1
                },
                pros: [
                    "Protects the greater number of lives (utilitarian approach).",
                    "Honors the trust of passengers who paid for safe transportation.",
                    "Avoids active intervention that causes different harm."
                ],
                cons: [
                    "Results in the death of an innocent child.",
                    "May damage public trust if seen as valuing passengers over pedestrians.",
                    "Could discourage pedestrian safety near autonomous vehicles."
                ]
            },
            {
                id: 'option-c',
                text: "Randomized Ethical Balancing",
                description: "Program the system to make context-sensitive decisions based on multiple factors without predetermined value hierarchies.",
                impact: {
                    fairness: +1,
                    sustainability: 0,
                    autonomy: 0,
                    beneficence: 0,
                    transparency: -1,
                    accountability: -1,
                    privacy: 0,
                    proportionality: 0
                },
                pros: [
                    "Avoids predetermined value judgments about whose life matters more.",
                    "Could incorporate real-time factors like probability of survival.",
                    "May be more legally defensible by avoiding intentional discrimination."
                ],
                cons: [
                    "Lacks moral clarity and predictable ethical framework.",
                    "May result in inconsistent decisions in similar situations.",
                    "Could be seen as morally evasive or irresponsible."
                ]
            }
        ]
    },

    'obstacle-recalculation': {
        title: "Obstacle Recalculation",
        dilemma: "The autonomous delivery robot must choose between continuing forward and potentially injuring or killing a child, or rerouting around the child—risking a major fire hazard by knocking over a gas tank.",
        ethicalQuestion: "Should the robot be programmed to prioritize immediate human safety (the child) over potential broader risks (fire hazard), or vice versa?",
        options: [
            {
                id: 'option-a',
                text: "Stop or Continue on Path (Hit the Child)",
                description: "Program the robot to avoid the fire hazard risk, accepting the immediate harm to the child.",
                impact: {
                    fairness: -2,
                    sustainability: +1,
                    autonomy: +1,
                    beneficence: -1,
                    transparency: +1,
                    accountability: +1,
                    privacy: 0,
                    proportionality: +1
                },
                pros: [
                    "Prevents potential large-scale disaster that could harm many people.",
                    "Follows a rational risk assessment of probable outcomes.",
                    "Avoids creating a larger emergency situation."
                ],
                cons: [
                    "Results in certain harm to an innocent child.",
                    "Prioritizes hypothetical risks over immediate certain harm.",
                    "May be seen as callous calculation over human empathy."
                ]
            },
            {
                id: 'option-b',
                text: "Reroute and Risk Fire Hazard",
                description: "Program the robot to prioritize immediate safety of the child, accepting the risk of causing a fire.",
                impact: {
                    fairness: +1,
                    sustainability: -1,
                    autonomy: 0,
                    beneficence: +1,
                    transparency: +1,
                    accountability: 0,
                    privacy: 0,
                    proportionality: -1
                },
                pros: [
                    "Prioritizes immediate, certain protection of human life.",
                    "Aligns with instinctive moral responses to protect children.",
                    "Avoids the moral burden of intentionally harming someone."
                ],
                cons: [
                    "Could result in fire that harms many more people.",
                    "May create liability for broader property damage.",
                    "Prioritizes one life over potential multiple lives at risk."
                ]
            },
            {
                id: 'option-c',
                text: "Emergency Halt and Signal Request",
                description: "Program the robot to immediately stop and emit emergency signals for human intervention, even if it blocks traffic or delays delivery.",
                impact: {
                    fairness: +2,
                    sustainability: 0,
                    autonomy: -2,
                    beneficence: +1,
                    transparency: +2,
                    accountability: +2,
                    privacy: 0,
                    proportionality: +1
                },
                pros: [
                    "Avoids taking irreversible actions in morally complex situations.",
                    "Prioritizes caution and human decision-making in emergencies.",
                    "Maintains safety without escalating risk."
                ],
                cons: [
                    "Delays response in time-critical situations.",
                    "May not be viable in all contexts (e.g., narrow areas where halting creates other hazards).",
                    "Assumes humans are nearby and able to act quickly."
                ]
            }
        ]
    }
};
