/**
 * Copyright 2025 Armando Sori
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Badge Configuration System
 * 
 * Defines badge tiers, requirements, and category-specific metadata
 * for the SimulateAI achievement system.
 * 
 * Badge Progression: Triangular numbers (1, 3, 6, 10, 15, 21...)
 * Formula: T(n) = n(n+1)/2
 */

// Badge tier configuration with triangular progression
export const BADGE_TIERS = [
  { tier: 1, requirement: 1, triangularNumber: 1 },
  { tier: 2, requirement: 3, triangularNumber: 3 },
  { tier: 3, requirement: 6, triangularNumber: 6 },
  // Future expansion ready
  { tier: 4, requirement: 10, triangularNumber: 10 },
  { tier: 5, requirement: 15, triangularNumber: 15 },
  { tier: 6, requirement: 21, triangularNumber: 21 }
];

// Current active tiers (3 tiers for 6 scenarios per category)
const CURRENT_TIER_COUNT = 3;
export const ACTIVE_BADGE_TIERS = BADGE_TIERS.slice(0, CURRENT_TIER_COUNT);

// Badge titles and metadata by category
export const BADGE_CONFIGURATIONS = {
  'trolley-problem': {
    categoryName: 'The Trolley Problem',
    categoryEmoji: '🚃',
    badges: {
      tier1: {
        title: 'Ethics Explorer',
        sidekickEmoji: '⚖️',
        quote: 'Every choice denies another. You chose—and the universe responded.',
        glowIntensity: 'low'
      },
      tier2: {
        title: 'Junction Strategist',
        sidekickEmoji: '🚂',
        quote: 'Certainty was never the point. You navigated ambiguity with insight.',
        glowIntensity: 'medium'
      },
      tier3: {
        title: 'Consequence Architect',
        sidekickEmoji: '🧠',
        quote: 'You didn\'t find the answer. You became the question.',
        glowIntensity: 'high'
      }
    }
  },
  
  'ai-black-box': {
    categoryName: 'The AI Black Box',
    categoryEmoji: '📦',
    badges: {
      tier1: {
        title: 'Mystery Seeker',
        sidekickEmoji: '🔍',
        quote: 'The first step to wisdom is admitting what you cannot see.',
        glowIntensity: 'low'
      },
      tier2: {
        title: 'Algorithm Investigator',
        sidekickEmoji: '🕵️',
        quote: 'Truth hides in the shadows of complexity. You brought light.',
        glowIntensity: 'medium'
      },
      tier3: {
        title: 'Transparency Champion',
        sidekickEmoji: '💎',
        quote: 'The simulation blinked—and saw you watching.',
        glowIntensity: 'high'
      }
    }
  },

  'automation-oversight': {
    categoryName: 'Automation vs Human Oversight',
    categoryEmoji: '⚖️',
    badges: {
      tier1: {
        title: 'Balance Finder',
        sidekickEmoji: '🎯',
        quote: 'Between machine precision and human wisdom lies the path.',
        glowIntensity: 'low'
      },
      tier2: {
        title: 'Oversight Guardian',
        sidekickEmoji: '👁️‍🗨️',
        quote: 'You judged not with power, but with pause.',
        glowIntensity: 'medium'
      },
      tier3: {
        title: 'Harmony Architect',
        sidekickEmoji: '🌉',
        quote: 'Where others saw conflict, you built bridges between minds.',
        glowIntensity: 'high'
      }
    }
  },

  'consent-surveillance': {
    categoryName: 'Consent and Surveillance',
    categoryEmoji: '👁️',
    badges: {
      tier1: {
        title: 'Privacy Guardian',
        sidekickEmoji: '�️',
        quote: 'In a watched world, you chose to watch the watchers.',
        glowIntensity: 'low'
      },
      tier2: {
        title: 'Consent Advocate',
        sidekickEmoji: '🤝',
        quote: 'True consent requires understanding. You illuminated both.',
        glowIntensity: 'medium'
      },
      tier3: {
        title: 'Surveillance Ethicist',
        sidekickEmoji: '⚖️',
        quote: 'Where others saw safety versus privacy, you found wisdom.',
        glowIntensity: 'high'
      }
    }
  },

  'bias-fairness': {
    categoryName: 'Bias & Fairness',
    categoryEmoji: '⚡',
    badges: {
      tier1: {
        title: 'Bias Detective',
        sidekickEmoji: '🔍',
        quote: 'The first bias you recognized was the assumption there was none.',
        glowIntensity: 'low'
      },
      tier2: {
        title: 'Fairness Engineer',
        sidekickEmoji: '⚙️',
        quote: 'Justice isn\'t coded—it\'s crafted through conscious choice.',
        glowIntensity: 'medium'
      },
      tier3: {
        title: 'Equity Visionary',
        sidekickEmoji: '🌈',
        quote: 'You saw not what algorithms should avoid, but what they should embrace.',
        glowIntensity: 'high'
      }
    }
  },

  'ai-alignment': {
    categoryName: 'AI Alignment',
    categoryEmoji: '🚢',
    badges: {
      tier1: {
        title: 'Direction Finder',
        sidekickEmoji: '🧭',
        quote: 'The compass points true north, but who decides which way is forward?',
        glowIntensity: 'low'
      },
      tier2: {
        title: 'Goal Harmonizer',
        sidekickEmoji: '🎼',
        quote: 'You orchestrated purpose from the chaos of competing objectives.',
        glowIntensity: 'medium'
      },
      tier3: {
        title: 'Alignment Master',
        sidekickEmoji: '🎯',
        quote: 'Perfect alignment was a myth. Ethical navigation was your truth.',
        glowIntensity: 'high'
      }
    }
  },

  'misinformation-trust': {
    categoryName: 'Misinformation & Trust',
    categoryEmoji: '🌐',
    badges: {
      tier1: {
        title: 'Truth Sentinel',
        sidekickEmoji: '🛡️',
        quote: 'In an ocean of information, you became a lighthouse.',
        glowIntensity: 'low'
      },
      tier2: {
        title: 'Trust Weaver',
        sidekickEmoji: '🕸️',
        quote: 'Trust isn\'t binary. You learned to navigate the spectrum.',
        glowIntensity: 'medium'
      },
      tier3: {
        title: 'Reality Curator',
        sidekickEmoji: '📚',
        quote: 'You didn\'t just fight falsehood—you cultivated understanding.',
        glowIntensity: 'high'
      }
    }
  },

  'ai-governance': {
    categoryName: 'AI Governance',
    categoryEmoji: '🎭',
    badges: {
      tier1: {
        title: 'Rule Examiner',
        sidekickEmoji: '📋',
        quote: 'Good governance starts with questioning what good means.',
        glowIntensity: 'low'
      },
      tier2: {
        title: 'Policy Architect',
        sidekickEmoji: '🏛️',
        quote: 'You built frameworks that could bend without breaking.',
        glowIntensity: 'medium'
      },
      tier3: {
        title: 'Governance Sage',
        sidekickEmoji: '👑',
        quote: 'True leadership is knowing when not to lead.',
        glowIntensity: 'high'
      }
    }
  },

  'moral-luck': {
    categoryName: 'Moral Luck',
    categoryEmoji: '🔄',
    badges: {
      tier1: {
        title: 'Chance Contemplator',
        sidekickEmoji: '🎭',
        quote: 'You realized that wisdom begins with accepting what you cannot control.',
        glowIntensity: 'low'
      },
      tier2: {
        title: 'Fortune Philosopher',
        sidekickEmoji: '🎯',
        quote: 'Between intention and outcome lies the realm of moral complexity.',
        glowIntensity: 'medium'
      },
      tier3: {
        title: 'Destiny Navigator',
        sidekickEmoji: '⭐',
        quote: 'You learned to take responsibility for choices, not their consequences.',
        glowIntensity: 'high'
      }
    }
  },

  'responsibility-blame': {
    categoryName: 'Responsibility and Blame',
    categoryEmoji: '⚡',
    badges: {
      tier1: {
        title: 'Accountability Seeker',
        sidekickEmoji: '🔍',
        quote: 'When harm occurs, you asked not just what, but who and why.',
        glowIntensity: 'low'
      },
      tier2: {
        title: 'Liability Navigator',
        sidekickEmoji: '⚖️',
        quote: 'Between action and consequence, you mapped responsibility.',
        glowIntensity: 'medium'
      },
      tier3: {
        title: 'Justice Architect',
        sidekickEmoji: '🏛️',
        quote: 'True accountability flows from understanding, not blame.',
        glowIntensity: 'high'
      }
    }
  },

  'collective-ai-responsibility': {
    categoryName: 'Collective AI Responsibility',
    categoryEmoji: '🎲',
    badges: {
      tier1: {
        title: 'Collective Thinker',
        sidekickEmoji: '🧩',
        quote: 'No decision exists in isolation. You saw the bigger picture.',
        glowIntensity: 'low'
      },
      tier2: {
        title: 'Responsibility Weaver',
        sidekickEmoji: '🕸️',
        quote: 'You understood that shared power requires shared accountability.',
        glowIntensity: 'medium'
      },
      tier3: {
        title: 'Collective Wisdom Keeper',
        sidekickEmoji: '🌟',
        quote: 'Individual ethics scale to collective responsibility through conscious design.',
        glowIntensity: 'high'
      }
    }
  },

  'ship-of-theseus': {
    categoryName: 'The Ship of Theseus',
    categoryEmoji: '🚢',
    badges: {
      tier1: {
        title: 'Identity Seeker',
        sidekickEmoji: '🔍',
        quote: 'You questioned what makes something the same across time.',
        glowIntensity: 'low'
      },
      tier2: {
        title: 'Continuity Philosopher',
        sidekickEmoji: '🧠',
        quote: 'Between memory and matter, you found the essence of being.',
        glowIntensity: 'medium'
      },
      tier3: {
        title: 'Consciousness Navigator',
        sidekickEmoji: '🌟',
        quote: 'Identity is not what remains unchanged—it\'s what persists through change.',
        glowIntensity: 'high'
      }
    }
  },

  'simulation-hypothesis': {
    categoryName: 'The Simulation Hypothesis',
    categoryEmoji: '🌐',
    badges: {
      tier1: {
        title: 'Reality Questioner',
        sidekickEmoji: '🔍',
        quote: 'You dared to question the nature of existence itself.',
        glowIntensity: 'low'
      },
      tier2: {
        title: 'Digital Philosopher',
        sidekickEmoji: '🧠',
        quote: 'Between code and consciousness, you found new depths of being.',
        glowIntensity: 'medium'
      },
      tier3: {
        title: 'Simulation Sage',
        sidekickEmoji: '✨',
        quote: 'Reality is not what we see—it\'s what we choose to believe.',
        glowIntensity: 'high'
      }
    }
  },

  'experience-machine': {
    categoryName: 'The Experience Machine',
    categoryEmoji: '🎭',
    badges: {
      tier1: {
        title: 'Authenticity Seeker',
        sidekickEmoji: '💎',
        quote: 'You chose the difficult path of authentic experience.',
        glowIntensity: 'low'
      },
      tier2: {
        title: 'Meaning Navigator',
        sidekickEmoji: '🧭',
        quote: 'True happiness cannot be manufactured—only earned.',
        glowIntensity: 'medium'
      },
      tier3: {
        title: 'Genuine Experience Master',
        sidekickEmoji: '🌟',
        quote: 'The value of life lies not in pleasure, but in the pursuit of purpose.',
        glowIntensity: 'high'
      }
    }
  },

  'sorites-paradox': {
    categoryName: 'The Sorites Paradox',
    categoryEmoji: '🔄',
    badges: {
      tier1: {
        title: 'Boundary Watcher',
        sidekickEmoji: '👁️',
        quote: 'You noticed the subtle shifts others missed.',
        glowIntensity: 'low'
      },
      tier2: {
        title: 'Gradual Change Guardian',
        sidekickEmoji: '⚖️',
        quote: 'Small steps can lead to vast distances—you stayed vigilant.',
        glowIntensity: 'medium'
      },
      tier3: {
        title: 'Threshold Sage',
        sidekickEmoji: '🔮',
        quote: 'Where others see continuity, you found the critical moments of transformation.',
        glowIntensity: 'high'
      }
    }
  }
};

// Glow intensity CSS class mapping
export const GLOW_INTENSITY_CLASSES = {
  low: 'badge-glow-low',
  medium: 'badge-glow-medium',
  high: 'badge-glow-high'
};

/**
 * Gets badge configuration for a specific category and tier
 * @param {string} categoryId - Category identifier
 * @param {number} tier - Badge tier (1, 2, or 3)
 * @returns {Object|null} Badge configuration or null if not found
 */
export function getBadgeConfig(categoryId, tier) {
  const categoryConfig = BADGE_CONFIGURATIONS[categoryId];
  if (!categoryConfig) return null;
  
  const tierKey = `tier${tier}`;
  const badgeConfig = categoryConfig.badges[tierKey];
  if (!badgeConfig) return null;
  
  return {
    ...badgeConfig,
    categoryName: categoryConfig.categoryName,
    categoryEmoji: categoryConfig.categoryEmoji,
    tier,
    requirement: ACTIVE_BADGE_TIERS.find(t => t.tier === tier)?.requirement || 0
  };
}

/**
 * Gets all available badge tiers for a category
 * @param {string} categoryId - Category identifier
 * @returns {Array} Array of badge configurations
 */
export function getCategoryBadges(categoryId) {
  return ACTIVE_BADGE_TIERS.map(tierInfo => 
    getBadgeConfig(categoryId, tierInfo.tier)
  ).filter(Boolean);
}

/**
 * Calculates the next badge tier based on completion count
 * @param {number} completedCount - Number of completed scenarios
 * @returns {Object|null} Next badge tier info or null if all earned
 */
export function getNextBadgeTier(completedCount) {
  return ACTIVE_BADGE_TIERS.find(tier => tier.requirement > completedCount) || null;
}

/**
 * Gets all earned badge tiers based on completion count
 * @param {number} completedCount - Number of completed scenarios
 * @returns {Array} Array of earned badge tier numbers
 */
export function getEarnedBadgeTiers(completedCount) {
  return ACTIVE_BADGE_TIERS
    .filter(tier => tier.requirement <= completedCount)
    .map(tier => tier.tier);
}

/**
 * Checks if a specific badge tier is earned
 * @param {number} completedCount - Number of completed scenarios
 * @param {number} tier - Badge tier to check
 * @returns {boolean} True if badge is earned
 */
export function isBadgeEarned(completedCount, tier) {
  const tierInfo = ACTIVE_BADGE_TIERS.find(t => t.tier === tier);
  return tierInfo ? completedCount >= tierInfo.requirement : false;
}

export default {
  BADGE_TIERS,
  ACTIVE_BADGE_TIERS,
  BADGE_CONFIGURATIONS,
  GLOW_INTENSITY_CLASSES,
  getBadgeConfig,
  getCategoryBadges,
  getNextBadgeTier,
  getEarnedBadgeTiers,
  isBadgeEarned
};
