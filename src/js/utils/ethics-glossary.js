/**
 * Ethics Glossary Utility
 * Provides definitions and explanations for ethical dimensions
 */

import { ETHICAL_AXES } from '../components/radar-chart.js';

/**
 * Get ethics glossary data
 */
export function getEthicsGlossary() {
    return Object.entries(ETHICAL_AXES).map(([key, data]) => ({
        key,
        label: data.label,
        description: data.description,
        color: data.color
    }));
}

/**
 * Get radar chart explanation text
 */
export function getRadarChartExplanation() {
    return {
        title: "Understanding the Ethical Impact Radar Chart",
        overview: "As you make choices in this scenario, you'll see a radar chart that visualizes how your decisions affect eight key ethical dimensions. This tool helps you understand the complex, multi-dimensional nature of ethical decision-making.",
        features: [
            {
                title: "Real-Time Feedback",
                description: "The chart updates instantly as you select different options, showing immediate ethical implications."
            },
            {
                title: "Multi-Dimensional View", 
                description: "See how a single decision can impact multiple ethical areas simultaneously—there are rarely simple trade-offs."
            },
            {
                title: "No Perfect Scores",
                description: "The goal isn't to maximize all dimensions, but to understand how different ethical frameworks prioritize different values."
            },
            {
                title: "Context Matters",
                description: "The same action might be ethical in one context but problematic in another—use the chart to explore these nuances."
            }
        ],
        interpretation: "The radar chart uses a scale from 0-5, where 3 represents a neutral impact. Higher scores indicate positive impacts on that dimension, while lower scores suggest potential concerns. Remember, this is a learning tool designed to prompt reflection, not provide definitive moral judgments."
    };
}

/**
 * Get ethics learning tips
 */
export function getEthicsLearningTips() {
    return [
        "Consider how different stakeholders might view your decisions differently",
        "Think about both immediate and long-term consequences of your choices",
        "Explore how cultural and contextual factors influence ethical reasoning",
        "Notice when ethical dimensions conflict with each other—this is normal!",
        "Use the chart to identify which ethical values you personally prioritize",
        "Discuss your reasoning with others to broaden your perspective"
    ];
}
