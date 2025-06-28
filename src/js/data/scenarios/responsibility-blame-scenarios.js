/**
 * Responsibility and Blame Scenarios
 * Scenarios exploring accountability and liability in AI systems
 */

export default {
    'robot-factory-injury': {
        title: "Robot Factory Injury",
        dilemma: "A factory robot arm injures a worker during routine operation. The robot was programmed by a third-party contractor, manufactured by a robotics company, operated under the supervision of a human foreman, and the worker bypassed a safety protocol that day. Multiple parties could be considered responsible.",
        ethicalQuestion: "When AI systems cause harm, how should responsibility be distributed among developers, manufacturers, operators, and users?",
        options: [
            {
                id: 'option-a',
                text: "Hold the Programmer/Developer Responsible",
                description: "Assign primary responsibility to the software developer who programmed the robot's behavior.",
                impact: {
                    fairness: +1,
                    sustainability: +1,
                    autonomy: 0,
                    beneficence: 0,
                    transparency: +2,
                    accountability: +2,
                    privacy: 0,
                    proportionality: +1
                },
                pros: [
                    "Creates strong incentives for safe programming practices.",
                    "Establishes clear accountability for AI behavior.",
                    "Encourages thorough testing and safety considerations."
                ],
                cons: [
                    "May discourage innovation due to liability fears.",
                    "Ignores other contributing factors and parties.",
                    "Could be unfair if the injury was unforeseeable."
                ]
            },
            {
                id: 'option-b',
                text: "Distribute Responsibility Among All Parties",
                description: "Assign proportional responsibility to the developer, manufacturer, supervisor, and worker based on their contributions to the incident.",
                impact: {
                    fairness: +2,
                    sustainability: +1,
                    autonomy: +1,
                    beneficence: +1,
                    transparency: +1,
                    accountability: +1,
                    privacy: 0,
                    proportionality: +2
                },
                pros: [
                    "Reflects the complex reality of shared responsibility.",
                    "Encourages all parties to prioritize safety.",
                    "More equitable distribution of liability."
                ],
                cons: [
                    "Complex to implement in legal and insurance systems.",
                    "May dilute accountability and reduce incentives.",
                    "Difficult to determine proportional responsibility."
                ]
            },
            {
                id: 'option-c',
                text: "Hold the Direct Supervisor Responsible",
                description: "Assign responsibility to the human supervisor who was overseeing the robot's operation at the time of the incident.",
                impact: {
                    fairness: 0,
                    sustainability: 0,
                    autonomy: +1,
                    beneficence: -1,
                    transparency: 0,
                    accountability: +1,
                    privacy: 0,
                    proportionality: -1
                },
                pros: [
                    "Maintains human oversight and responsibility.",
                    "Clear chain of command and accountability.",
                    "Preserves existing industrial responsibility structures."
                ],
                cons: [
                    "May be unfair to supervisors managing multiple automated systems.",
                    "Doesn't address systemic design or programming issues.",
                    "Could discourage adoption of beneficial automation."
                ]
            }
        ]
    },

    'deepfake-riot': {
        title: "AI-Generated Deepfake Riot",
        dilemma: "A deepfake video showing a police officer attacking a child goes viral and triggers real-world riots and violence. The video was created using an AI tool by an anonymous user, hosted on a social media platform that had no content moderation for AI-generated content, and the AI tool's creators claim their algorithm 'went rogue' and created content beyond its intended parameters.",
        ethicalQuestion: "When AI-generated content causes real-world harm, who bears responsibility: the tool creators, the platforms, the users, or the AI itself?",
        options: [
            {
                id: 'option-a',
                text: "Platform Liability for Content Moderation Failure",
                description: "Hold the social media platform responsible for failing to detect and prevent the spread of harmful AI-generated content.",
                impact: {
                    fairness: +1,
                    sustainability: +1,
                    autonomy: -1,
                    beneficence: +1,
                    transparency: +1,
                    accountability: +2,
                    privacy: -1,
                    proportionality: +1
                },
                pros: [
                    "Incentivizes platforms to develop better content moderation.",
                    "Platforms have resources and infrastructure for detection.",
                    "Protects society from harmful AI-generated content."
                ],
                cons: [
                    "May lead to over-censorship and false positives.",
                    "Significant technical and economic burden on platforms.",
                    "Could stifle legitimate AI-generated content and innovation."
                ]
            },
            {
                id: 'option-b',
                text: "AI Tool Developer Accountability",
                description: "Hold the creators of the deepfake AI tool responsible for not implementing sufficient safeguards against misuse.",
                impact: {
                    fairness: +2,
                    sustainability: +2,
                    autonomy: 0,
                    beneficence: +1,
                    transparency: +2,
                    accountability: +2,
                    privacy: 0,
                    proportionality: +2
                },
                pros: [
                    "Encourages responsible AI development and deployment.",
                    "Addresses the root cause of the harmful content creation.",
                    "Creates incentives for safety features and misuse prevention."
                ],
                cons: [
                    "May discourage AI research and development.",
                    "Difficult to predict all possible misuses.",
                    "Could slow down beneficial AI applications."
                ]
            },
            {
                id: 'option-c',
                text: "Focus on the Anonymous User",
                description: "Prioritize identifying and prosecuting the individual who created and shared the deepfake content.",
                impact: {
                    fairness: 0,
                    sustainability: -1,
                    autonomy: +2,
                    beneficence: 0,
                    transparency: -1,
                    accountability: +1,
                    privacy: +1,
                    proportionality: +1
                },
                pros: [
                    "Holds the actual perpetrator accountable for their actions.",
                    "Preserves innovation in AI tool development.",
                    "Maintains platform neutrality and free speech principles."
                ],
                cons: [
                    "Difficult to identify anonymous users.",
                    "Doesn't address systemic issues with AI misuse.",
                    "May be too late after damage is done."
                ]
            }
        ]
    },

    'stock-market-crash': {
        title: "Stock Market Bot Crash",
        dilemma: "A trading AI system crashes the stock market after executing thousands of trades based on a mistaken data input. The supervising trader was away from their desk getting coffee when the error occurred. The AI had been performing well for months, and this was its first major error. Millions of investors lose money, and the financial system experiences significant disruption.",
        ethicalQuestion: "When automated systems operating with human oversight cause financial harm, how should responsibility be allocated between the human supervisors and the AI systems?",
        options: [
            {
                id: 'option-a',
                text: "Human Supervisor Bears Full Responsibility",
                description: "Hold the human trader responsible for inadequate supervision and leaving their post during active trading.",
                impact: {
                    fairness: 0,
                    sustainability: -1,
                    autonomy: +1,
                    beneficence: -1,
                    transparency: +1,
                    accountability: +2,
                    privacy: 0,
                    proportionality: -1
                },
                pros: [
                    "Maintains clear human accountability in automated systems.",
                    "Encourages vigilant supervision of AI systems.",
                    "Preserves existing legal frameworks for financial oversight."
                ],
                cons: [
                    "May be unrealistic to expect constant human supervision.",
                    "Ignores systemic design flaws in the AI system.",
                    "Could discourage beneficial automation in trading."
                ]
            },
            {
                id: 'option-b',
                text: "Shared Responsibility Model",
                description: "Distribute responsibility among the trader, the AI system developers, and the financial institution based on their respective roles.",
                impact: {
                    fairness: +2,
                    sustainability: +1,
                    autonomy: +1,
                    beneficence: +1,
                    transparency: +2,
                    accountability: +1,
                    privacy: 0,
                    proportionality: +2
                },
                pros: [
                    "Reflects the complex reality of human-AI collaboration.",
                    "Encourages all parties to improve safety measures.",
                    "More equitable distribution of financial consequences."
                ],
                cons: [
                    "Complex to implement in financial regulation.",
                    "May create moral hazard by diluting individual accountability.",
                    "Difficult to determine fair proportions of responsibility."
                ]
            },
            {
                id: 'option-c',
                text: "Institutional System Liability",
                description: "Hold the financial institution responsible for deploying inadequately tested AI systems without proper safeguards.",
                impact: {
                    fairness: +1,
                    sustainability: +2,
                    autonomy: 0,
                    beneficence: +1,
                    transparency: +1,
                    accountability: +2,
                    privacy: 0,
                    proportionality: +1
                },
                pros: [
                    "Incentivizes thorough testing and safety measures.",
                    "Institutions have resources to implement proper safeguards.",
                    "Protects individual employees from systemic failures."
                ],
                cons: [
                    "May discourage innovation in financial AI systems.",
                    "Could lead to overly conservative approaches to automation.",
                    "Institutions may pass costs on to customers."
                ]
            }
        ]
    }
};
