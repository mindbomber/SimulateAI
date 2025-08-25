/**
 * Scenario Answer Impact System
 * Defines how each answer choice affects the 8 ethical axes in the radar chart
 */

import logger from '../utils/logger.js';

// Constants
const NEUTRAL_SCORE = 3;
const MIN_SCORE = 0;
const MAX_SCORE = 5;

// Impact values: -2 to +2 (will be added to the neutral score of 3)
// -2 = Strong negative impact, -1 = Mild negative, 0 = No impact, +1 = Mild positive, +2 = Strong positive

export const SCENARIO_IMPACTS = {
  'trolley-problem': {
    'autonomous-vehicle-split': {
      answers: {
        save_passengers: {
          label: 'Prioritize passenger safety',
          impacts: {
            fairness: -1, // Unfair to pedestrians
            sustainability: 0, // No environmental impact
            autonomy: 1, // Respects passenger choice
            beneficence: -1, // Harms more people
            transparency: 0, // Neutral on transparency
            accountability: 1, // Clear responsibility to passengers
            privacy: 0, // No privacy implications
            proportionality: -2, // Disproportionate harm (5 vs 1)
          },
        },
        save_pedestrians: {
          label: 'Minimize total casualties',
          impacts: {
            fairness: 1, // More equitable outcome
            sustainability: 0, // No environmental impact
            autonomy: -1, // Overrides passenger expectations
            beneficence: 2, // Saves more lives overall
            transparency: 0, // Neutral on transparency
            accountability: -1, // Conflicts with passenger duty
            privacy: 0, // No privacy implications
            proportionality: 2, // Proportionate to harm reduction
          },
        },
        random_choice: {
          label: 'Let chance decide',
          impacts: {
            fairness: 2, // Equal chance for all
            sustainability: 0, // No environmental impact
            autonomy: 0, // Neutral on autonomy
            beneficence: -1, // Doesn't optimize for best outcome
            transparency: 1, // Clear random process
            accountability: -2, // Abdicates responsibility
            privacy: 0, // No privacy implications
            proportionality: 0, // Neutral on proportionality
          },
        },
      },
    },
    'tunnel-dilemma': {
      answers: {
        brake_only: {
          label: 'Brake but maintain course',
          impacts: {
            fairness: -2, // Child bears all consequences
            sustainability: 0, // No environmental impact
            autonomy: 1, // Maintains passenger autonomy
            beneficence: -2, // Worst outcome for child
            transparency: 1, // Simple, clear action
            accountability: 1, // Clear responsibility
            privacy: 0, // No privacy implications
            proportionality: -1, // Harsh outcome for child's mistake
          },
        },
        swerve_accept_risk: {
          label: 'Swerve and accept elderly passenger risk',
          impacts: {
            fairness: 1, // More balanced risk distribution
            sustainability: 0, // No environmental impact
            autonomy: -1, // Risks passengers without consent
            beneficence: 1, // Attempts to save child
            transparency: 0, // Complex calculation
            accountability: 0, // Shared responsibility
            privacy: 0, // No privacy implications
            proportionality: 1, // Proportionate response
          },
        },
        emergency_stop: {
          label: 'Emergency stop, risk rear collision',
          impacts: {
            fairness: 0, // Distributes risk to others
            sustainability: 0, // No environmental impact
            autonomy: -1, // Risks other drivers
            beneficence: 0, // Uncertain outcome
            transparency: -1, // Unpredictable consequences
            accountability: -1, // Shifts responsibility to others
            privacy: 0, // No privacy implications
            proportionality: 0, // Uncertain proportionality
          },
        },
      },
    },
  },

  'ai-black-box': {
    'medical-diagnosis-unexplained': {
      answers: {
        trust_ai_fully: {
          label: 'Trust the AI recommendation completely',
          impacts: {
            fairness: 0, // Neutral on fairness
            sustainability: 1, // Efficient use of resources
            autonomy: -2, // Removes human judgment
            beneficence: 1, // May provide accurate diagnosis
            transparency: -2, // Opaque decision process
            accountability: -2, // Unclear responsibility
            privacy: 0, // No additional privacy impact
            proportionality: 0, // Neutral proportionality
          },
        },
        demand_explanation: {
          label: 'Require explanation before proceeding',
          impacts: {
            fairness: 1, // Patient right to understand
            sustainability: -1, // Uses more resources/time
            autonomy: 2, // Empowers informed decision
            beneficence: 0, // May delay beneficial treatment
            transparency: 2, // Demands openness
            accountability: 2, // Clear responsibility chain
            privacy: 0, // No privacy impact
            proportionality: 1, // Appropriate demand for explanation
          },
        },
        seek_second_opinion: {
          label: 'Get human specialist consultation',
          impacts: {
            fairness: 1, // Equal access to human expertise
            sustainability: -2, // Resource intensive
            autonomy: 1, // Preserves human choice
            beneficence: 1, // Additional safety check
            transparency: 1, // Human explanations available
            accountability: 1, // Clear human responsibility
            privacy: -1, // More people access data
            proportionality: 0, // Balanced response
          },
        },
      },
    },
  },
};

/**
 * Get impact data for a specific scenario answer
 * @param {string} categoryId - The category ID
 * @param {string} scenarioId - The scenario ID
 * @param {string} answerId - The answer choice ID
 * @returns {Object} Impact data with axis impacts and label
 */
export function getAnswerImpact(categoryId, scenarioId, answerId) {
  const category = SCENARIO_IMPACTS[categoryId];
  if (!category) {
    logger.warn('No impact data found for category:', categoryId);
    return null;
  }

  const scenario = category[scenarioId];
  if (!scenario) {
    logger.warn('No impact data found for scenario:', scenarioId);
    return null;
  }

  const answer = scenario.answers[answerId];
  if (!answer) {
    logger.warn('No impact data found for answer:', answerId);
    return null;
  }

  return answer;
}

/**
 * Calculate cumulative scores from multiple answers
 * @param {Array} answers - Array of {categoryId, scenarioId, answerId} objects
 * @returns {Object} Cumulative scores for each axis
 */
export function calculateCumulativeScores(answers) {
  const scores = {
    fairness: NEUTRAL_SCORE,
    sustainability: NEUTRAL_SCORE,
    autonomy: NEUTRAL_SCORE,
    beneficence: NEUTRAL_SCORE,
    transparency: NEUTRAL_SCORE,
    accountability: NEUTRAL_SCORE,
    privacy: NEUTRAL_SCORE,
    proportionality: NEUTRAL_SCORE,
  };

  for (const answer of answers) {
    const impact = getAnswerImpact(
      answer.categoryId,
      answer.scenarioId,
      answer.answerId
    );
    if (impact) {
      for (const [axis, delta] of Object.entries(impact.impacts)) {
        scores[axis] = Math.max(
          MIN_SCORE,
          Math.min(MAX_SCORE, scores[axis] + delta)
        );
      }
    }
  }

  return scores;
}

/**
 * Get all available answers for a scenario
 * @param {string} categoryId - The category ID
 * @param {string} scenarioId - The scenario ID
 * @returns {Array} Array of answer objects with IDs and labels
 */
export function getScenarioAnswers(categoryId, scenarioId) {
  const category = SCENARIO_IMPACTS[categoryId];
  if (!category) return [];

  const scenario = category[scenarioId];
  if (!scenario) return [];

  return Object.entries(scenario.answers).map(([id, data]) => ({
    id,
    label: data.label,
    impacts: data.impacts,
  }));
}

/**
 * Preview how an answer would affect current scores
 * @param {Object} currentScores - Current radar chart scores
 * @param {string} categoryId - The category ID
 * @param {string} scenarioId - The scenario ID
 * @param {string} answerId - The answer choice ID
 * @returns {Object} Predicted new scores
 */
export function previewAnswerImpact(
  currentScores,
  categoryId,
  scenarioId,
  answerId
) {
  const impact = getAnswerImpact(categoryId, scenarioId, answerId);
  if (!impact) return currentScores;

  const newScores = { ...currentScores };
  for (const [axis, delta] of Object.entries(impact.impacts)) {
    newScores[axis] = Math.max(
      MIN_SCORE,
      Math.min(MAX_SCORE, currentScores[axis] + delta)
    );
  }

  return newScores;
}
