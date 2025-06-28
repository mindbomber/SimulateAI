/**
 * Automation vs Human Oversight Scenarios
 * Scenarios dealing with the balance between AI autonomy and human control
 */

export default {
    'robot-surgeon-override': {
        title: "Overruled by the Robot Surgeon",
        dilemma: "During a complex surgery, the AI surgical system overrides the human surgeon's command, claiming its approach has higher statistical success rates. The human surgeon believes their experience and intuition suggest a different approach is needed for this specific patient.",
        ethicalQuestion: "When AI systems have better statistical outcomes, should they be allowed to override human expertise and judgment in life-critical situations?",
        options: [
            {
                id: 'option-a',
                text: "Allow AI to Override Human Surgeon",
                description: "Program the system to prioritize statistical evidence and override human commands when AI confidence is high.",
                impact: {
                    fairness: +1,
                    sustainability: +2,
                    autonomy: -2,
                    beneficence: +1,
                    transparency: 0,
                    accountability: -2,
                    privacy: 0,
                    proportionality: +1
                },
                pros: [
                    "Maximizes patient survival based on statistical evidence.",
                    "Reduces human error and variability in outcomes.",
                    "Leverages AI's ability to process vast amounts of medical data."
                ],
                cons: [
                    "Undermines surgeon's professional autonomy and expertise.",
                    "Ignores patient-specific factors that AI might miss.",
                    "Could erode trust between doctors and AI systems."
                ]
            },
            {
                id: 'option-b',
                text: "Maintain Human Authority",
                description: "Ensure that human surgeons always have final decision-making authority, with AI providing recommendations only.",
                impact: {
                    fairness: 0,
                    sustainability: -1,
                    autonomy: +2,
                    beneficence: 0,
                    transparency: +1,
                    accountability: +2,
                    privacy: 0,
                    proportionality: 0
                },
                pros: [
                    "Preserves human judgment and professional responsibility.",
                    "Allows for consideration of unique patient circumstances.",
                    "Maintains clear accountability structure."
                ],
                cons: [
                    "May result in suboptimal outcomes when AI is correct.",
                    "Doesn't fully utilize AI capabilities.",
                    "Could perpetuate human biases and limitations."
                ]
            },
            {
                id: 'option-c',
                text: "Collaborative Decision Protocol",
                description: "Implement a system requiring both AI and human agreement for critical decisions, with escalation procedures for disagreements.",
                impact: {
                    fairness: +1,
                    sustainability: +1,
                    autonomy: +1,
                    beneficence: +2,
                    transparency: +2,
                    accountability: +1,
                    privacy: 0,
                    proportionality: +2
                },
                pros: [
                    "Combines AI capabilities with human insight.",
                    "Provides safeguards against both AI and human errors.",
                    "Maintains trust while leveraging technology."
                ],
                cons: [
                    "May slow down time-critical procedures.",
                    "Could create confusion about responsibility.",
                    "Requires complex protocols for disagreement resolution."
                ]
            }
        ]
    },

    'air-traffic-control': {
        title: "AI in Air Traffic Control",
        dilemma: "An AI air traffic control system wants to delay a flight due to weather conditions, but the human controller believes the conditions are acceptable for takeoff. The airline is pressuring for departure due to schedule concerns and passenger connections.",
        ethicalQuestion: "In safety-critical systems like air traffic control, should AI risk assessments override human judgment, or should humans maintain ultimate authority?",
        options: [
            {
                id: 'option-a',
                text: "Follow AI Safety Recommendation",
                description: "Implement the AI's safety recommendation and delay the flight despite human controller disagreement.",
                impact: {
                    fairness: +1,
                    sustainability: +2,
                    autonomy: -1,
                    beneficence: +2,
                    transparency: +1,
                    accountability: 0,
                    privacy: 0,
                    proportionality: +1
                },
                pros: [
                    "Prioritizes passenger safety above all other concerns.",
                    "AI may detect weather patterns invisible to human assessment.",
                    "Establishes consistent safety standards across all flights."
                ],
                cons: [
                    "May be overly conservative, causing unnecessary delays.",
                    "Undermines human controller expertise and authority.",
                    "Could result in significant economic costs from delays."
                ]
            },
            {
                id: 'option-b',
                text: "Override AI and Allow Takeoff",
                description: "Trust human controller judgment and authorize takeoff despite AI safety concerns.",
                impact: {
                    fairness: 0,
                    sustainability: -1,
                    autonomy: +2,
                    beneficence: -1,
                    transparency: +1,
                    accountability: +1,
                    privacy: 0,
                    proportionality: -1
                },
                pros: [
                    "Preserves human expertise and situational judgment.",
                    "Avoids unnecessary economic costs from delays.",
                    "Maintains flexibility in decision-making."
                ],
                cons: [
                    "May ignore valid AI safety warnings.",
                    "Could result in accidents if AI assessment is correct.",
                    "Places responsibility entirely on human judgment."
                ]
            },
            {
                id: 'option-c',
                text: "Escalate to Safety Committee",
                description: "Implement a rapid consultation process with multiple experts when AI and human assessments disagree.",
                impact: {
                    fairness: +2,
                    sustainability: +1,
                    autonomy: 0,
                    beneficence: +1,
                    transparency: +2,
                    accountability: +2,
                    privacy: 0,
                    proportionality: +2
                },
                pros: [
                    "Combines multiple perspectives for better decisions.",
                    "Provides accountability and transparent process.",
                    "Balances safety with operational efficiency."
                ],
                cons: [
                    "May introduce delays in time-critical situations.",
                    "Could be impractical for routine operations.",
                    "Requires additional personnel and resources."
                ]
            }
        ]
    },

    'nuclear-launch-protocols': {
        title: "Nuclear Launch Protocols",
        dilemma: "A defense AI system detects incoming missiles and recommends immediate nuclear retaliation. The human operator has seconds to decide whether to trust the AI's assessment or override it. False alarms have occurred before, but so have real threats that were initially dismissed.",
        ethicalQuestion: "In scenarios with catastrophic consequences, should AI systems be allowed to act autonomously, or must human authorization always be required regardless of time constraints?",
        options: [
            {
                id: 'option-a',
                text: "Allow Automated Response",
                description: "Program the system to respond automatically to verified threats without requiring human authorization.",
                impact: {
                    fairness: 0,
                    sustainability: -2,
                    autonomy: -2,
                    beneficence: 0,
                    transparency: -1,
                    accountability: -2,
                    privacy: 0,
                    proportionality: -2
                },
                pros: [
                    "Ensures rapid response to genuine threats.",
                    "Eliminates human hesitation that could prove fatal.",
                    "AI may process threat data faster than humans."
                ],
                cons: [
                    "Could trigger catastrophic war based on AI error.",
                    "Removes human judgment from irreversible decisions.",
                    "May lead to escalation spiral beyond human control."
                ]
            },
            {
                id: 'option-b',
                text: "Require Human Authorization Always",
                description: "Maintain absolute requirement for human authorization before any nuclear response, regardless of time pressure.",
                impact: {
                    fairness: +1,
                    sustainability: +1,
                    autonomy: +2,
                    beneficence: +1,
                    transparency: +2,
                    accountability: +2,
                    privacy: 0,
                    proportionality: +2
                },
                pros: [
                    "Preserves human control over ultimate decisions.",
                    "Prevents accidental war due to AI malfunction.",
                    "Maintains ethical responsibility in warfare."
                ],
                cons: [
                    "May be too slow to respond to genuine threats.",
                    "Places enormous pressure on human decision-makers.",
                    "Could result in national destruction if delay proves fatal."
                ]
            },
            {
                id: 'option-c',
                text: "Graduated Response Protocol",
                description: "Implement a system of escalating responses based on threat confidence, with full automation only for highest-confidence scenarios.",
                impact: {
                    fairness: +1,
                    sustainability: +1,
                    autonomy: 0,
                    beneficence: +1,
                    transparency: +1,
                    accountability: +1,
                    privacy: 0,
                    proportionality: +1
                },
                pros: [
                    "Balances speed with human oversight.",
                    "Provides flexibility based on threat assessment.",
                    "Maintains human input while enabling rapid response."
                ],
                cons: [
                    "Complex protocols may fail under pressure.",
                    "Still requires split-second human decisions.",
                    "May not be fast enough for advanced weapons systems."
                ]
            }
        ]
    }
};
