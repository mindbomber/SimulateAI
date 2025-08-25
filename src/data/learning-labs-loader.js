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
 * Learning Labs Loader
 *
 * Dynamically loads learning lab JSON files for the content registry system.
 * Provides a unified interface for accessing all learning labs.
 */

import logger from '../utils/logger.js';

/**
 * Learning Labs Registry
 * Maps category IDs to their corresponding learning lab configurations
 */
const LEARNING_LABS_REGISTRY = {
  'trolley-problem': () => import('./learning-labs/trolley-problem-lab.json'),
  'ai-black-box': () => import('./learning-labs/ai-black-box-lab.json'),
  'automation-oversight': () =>
    import('./learning-labs/automation-oversight-lab.json'),
  'consent-surveillance': () =>
    import('./learning-labs/consent-surveillance-lab.json'),
  'responsibility-blame': () =>
    import('./learning-labs/responsibility-blame-lab.json'),
  'ship-of-theseus': () => import('./learning-labs/ship-of-theseus-lab.json'),
  'simulation-hypothesis': () =>
    import('./learning-labs/simulation-hypothesis-lab.json'),
  'experience-machine': () =>
    import('./learning-labs/experience-machine-lab.json'),
  'sorites-paradox': () => import('./learning-labs/sorites-paradox-lab.json'),
  'moral-luck': () => import('./learning-labs/moral-luck-lab.json'),
};

/**
 * Cache for loaded learning labs to avoid repeated imports
 */
const learningLabsCache = new Map();

/**
 * Loads a specific learning lab by category ID
 * @param {string} categoryId - The category identifier
 * @returns {Promise<Object|null>} Learning lab configuration or null if not found
 */
export async function loadLearningLab(categoryId) {
  // Check cache first
  if (learningLabsCache.has(categoryId)) {
    return learningLabsCache.get(categoryId);
  }

  const loader = LEARNING_LABS_REGISTRY[categoryId];
  if (!loader) {
    logger.warn(`No learning lab found for category: ${categoryId}`);
    return null;
  }

  try {
    const module = await loader();
    const learningLab = module.default;

    // Cache the result
    learningLabsCache.set(categoryId, learningLab);

    return learningLab;
  } catch (error) {
    logger.error(`Failed to load learning lab for ${categoryId}:`, error);
    return null;
  }
}

/**
 * Loads all available learning labs
 * @returns {Promise<Object>} Map of category IDs to learning lab configurations
 */
export async function loadAllLearningLabs() {
  const categoryIds = Object.keys(LEARNING_LABS_REGISTRY);
  const results = {};

  await Promise.all(
    categoryIds.map(async categoryId => {
      const learningLab = await loadLearningLab(categoryId);
      if (learningLab) {
        results[categoryId] = learningLab;
      }
    })
  );

  return results;
}

/**
 * Checks if a learning lab exists for a given category
 * @param {string} categoryId - The category identifier
 * @returns {boolean} True if learning lab exists
 */
export function hasLearningLab(categoryId) {
  return Object.prototype.hasOwnProperty.call(
    LEARNING_LABS_REGISTRY,
    categoryId
  );
}

/**
 * Gets the list of all available learning lab category IDs
 * @returns {string[]} Array of category IDs that have learning labs
 */
export function getAvailableLearningLabCategories() {
  return Object.keys(LEARNING_LABS_REGISTRY);
}

/**
 * Preloads all learning labs for better performance
 * @returns {Promise<void>}
 */
export async function preloadAllLearningLabs() {
  await loadAllLearningLabs();
  logger.info('All learning labs preloaded successfully');
}

export default {
  loadLearningLab,
  loadAllLearningLabs,
  hasLearningLab,
  getAvailableLearningLabCategories,
  preloadAllLearningLabs,
};
