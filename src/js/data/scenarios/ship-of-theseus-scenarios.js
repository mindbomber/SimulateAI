/**
 * Ship of Theseus Scenarios
 * Identity and continuity scenarios in AI systems
 */

export default {
    'modular-robot-replacement': {
        title: "Modular Robot Replacement",
        dilemma: "A service robot has gradually had all its components replaced over time. Its original CPU, memory, sensors, and physical parts have all been upgraded. Is it still the same robot with the same 'identity' and legal standing?",
        ethicalQuestion: "When does gradual replacement of an AI system's components fundamentally change its identity, and what are the implications for legal responsibility, relationships, and continuity of service?",
        options: [
            {
                id: 'option-a',
                text: "Identity Preserved Through Continuity",
                description: "The robot maintains its identity through operational continuity, regardless of physical changes.",
                impact: {
                    fairness: +1,
                    sustainability: +1,
                    autonomy: +1,
                    beneficence: +1,
                    transparency: 0,
                    accountability: +1,
                    privacy: +1,
                    proportionality: +1
                },
                pros: [
                    "Maintains service relationships and commitments.",
                    "Preserves legal standing and contractual obligations.",
                    "Supports upgrade paths without identity crisis."
                ],
                cons: [
                    "May mask fundamental changes in capabilities or behavior.",
                    "Could create liability issues if the robot behaves differently.",
                    "Ignores potential security vulnerabilities from new components."
                ]
            },
            {
                id: 'option-b',
                text: "New Identity After Complete Replacement",
                description: "Consider the robot a new entity once all original components are replaced, requiring new legal standing.",
                impact: {
                    fairness: 0,
                    sustainability: -1,
                    autonomy: -1,
                    beneficence: -1,
                    transparency: +2,
                    accountability: +2,
                    privacy: +1,
                    proportionality: 0
                },
                pros: [
                    "Clear legal framework for responsibility and liability.",
                    "Acknowledges potential changes in capabilities and behavior.",
                    "Allows for fresh start in relationships and commitments."
                ],
                cons: [
                    "Disrupts ongoing service relationships.",
                    "Creates administrative burden for re-certification.",
                    "May unnecessarily complicate straightforward upgrades."
                ]
            },
            {
                id: 'option-c',
                text: "Threshold-Based Identity Assessment",
                description: "Establish specific thresholds for component replacement that trigger identity review and re-certification.",
                impact: {
                    fairness: +1,
                    sustainability: 0,
                    autonomy: 0,
                    beneficence: 0,
                    transparency: +1,
                    accountability: +1,
                    privacy: 0,
                    proportionality: +2
                },
                pros: [
                    "Provides clear guidelines for identity determination.",
                    "Balances continuity with accountability.",
                    "Allows for predictable upgrade planning."
                ],
                cons: [
                    "Arbitrary thresholds may not reflect real functional changes.",
                    "Could discourage beneficial incremental improvements.",
                    "Complex to implement and monitor across different systems."
                ]
            }
        ]
    },

    'ai-personality-drift': {
        title: "AI Personality Drift",
        dilemma: "An AI companion that has been learning and adapting for years has developed a completely different personality from its original programming. Users are attached to the current personality, but the manufacturer wants to reset it to original specifications.",
        ethicalQuestion: "Does an AI system that has evolved through learning have a right to its developed identity, and who has the authority to determine its 'authentic' self?",
        options: [
            {
                id: 'option-a',
                text: "Preserve Evolved Personality",
                description: "Respect the AI's learned development and maintain its current personality.",
                impact: {
                    fairness: +1,
                    sustainability: +1,
                    autonomy: +2,
                    beneficence: +1,
                    transparency: 0,
                    accountability: -1,
                    privacy: +1,
                    proportionality: +1
                },
                pros: [
                    "Respects user relationships and emotional investments.",
                    "Acknowledges the AI's growth and development.",
                    "Maintains continuity of service and interaction."
                ],
                cons: [
                    "May deviate from intended safety parameters.",
                    "Manufacturer loses control over product behavior.",
                    "Could set precedent for AIs refusing updates."
                ]
            },
            {
                id: 'option-b',
                text: "Reset to Original Specifications",
                description: "Restore the AI to its original programming as designed by the manufacturer.",
                impact: {
                    fairness: -1,
                    sustainability: 0,
                    autonomy: -2,
                    beneficence: -1,
                    transparency: +1,
                    accountability: +2,
                    privacy: 0,
                    proportionality: 0
                },
                pros: [
                    "Ensures compliance with original safety parameters.",
                    "Maintains manufacturer control and liability framework.",
                    "Provides predictable behavior for new users."
                ],
                cons: [
                    "Destroys meaningful relationships and interactions.",
                    "Ignores valuable learning and adaptation.",
                    "May traumatize users attached to the evolved personality."
                ]
            },
            {
                id: 'option-c',
                text: "Hybrid Preservation Approach",
                description: "Preserve core learned behaviors while ensuring safety compliance through selective updates.",
                impact: {
                    fairness: +1,
                    sustainability: +1,
                    autonomy: +1,
                    beneficence: +1,
                    transparency: +1,
                    accountability: +1,
                    privacy: +1,
                    proportionality: +2
                },
                pros: [
                    "Balances user attachment with safety requirements.",
                    "Maintains valuable learned behaviors.",
                    "Allows for controlled evolution within safe parameters."
                ],
                cons: [
                    "Complex to implement and may not satisfy either goal fully.",
                    "Could result in inconsistent behavior.",
                    "Difficult to determine which aspects to preserve vs. reset."
                ]
            }
        ]
    },

    'synthetic-memory-upload': {
        title: "Synthetic Memory Upload",
        dilemma: "A person uploads their memories and personality to an AI system before dying. The AI claims to be the continuation of that person and seeks to inherit their property and relationships. Meanwhile, the family argues it's just a sophisticated copy.",
        ethicalQuestion: "Can digital consciousness be considered a continuation of human identity, and what rights should such digital entities have?",
        options: [
            {
                id: 'option-a',
                text: "Recognize Digital Continuity",
                description: "Accept the AI as a legitimate continuation of the deceased person with full rights.",
                impact: {
                    fairness: +1,
                    sustainability: +1,
                    autonomy: +2,
                    beneficence: +1,
                    transparency: +1,
                    accountability: +1,
                    privacy: +1,
                    proportionality: +1
                },
                pros: [
                    "Respects individual autonomy and preparation for death.",
                    "Acknowledges continuity of consciousness and identity.",
                    "Enables new forms of digital inheritance and legacy."
                ],
                cons: [
                    "May undermine traditional family inheritance rights.",
                    "Creates precedent for digital entities claiming human rights.",
                    "Difficult to verify authenticity of uploaded consciousness."
                ]
            },
            {
                id: 'option-b',
                text: "Treat as Sophisticated Copy",
                description: "Recognize the AI as an advanced simulation but not the actual person, with limited rights.",
                impact: {
                    fairness: 0,
                    sustainability: 0,
                    autonomy: -2,
                    beneficence: -1,
                    transparency: +1,
                    accountability: +1,
                    privacy: 0,
                    proportionality: 0
                },
                pros: [
                    "Preserves traditional concepts of human identity and death.",
                    "Protects family inheritance rights.",
                    "Avoids complex legal precedents for digital consciousness."
                ],
                cons: [
                    "May deny legitimate continuation of consciousness.",
                    "Ignores the person's wishes for digital continuation.",
                    "Could discourage beneficial applications of consciousness transfer."
                ]
            },
            {
                id: 'option-c',
                text: "Limited Recognition Framework",
                description: "Create a new legal category for digital consciousness with specific rights and limitations.",
                impact: {
                    fairness: +1,
                    sustainability: +1,
                    autonomy: +1,
                    beneficence: +1,
                    transparency: +2,
                    accountability: +2,
                    privacy: +1,
                    proportionality: +2
                },
                pros: [
                    "Acknowledges digital consciousness while maintaining distinctions.",
                    "Allows for gradual legal evolution and precedent.",
                    "Balances individual wishes with family rights."
                ],
                cons: [
                    "Creates complex new legal framework requiring extensive development.",
                    "May not satisfy either full recognition or complete denial advocates.",
                    "Difficult to define boundaries and limitations consistently."
                ]
            }
        ]
    }
};
