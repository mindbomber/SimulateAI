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
 * Content Registry - Centralized management for categories, scenarios, and learning labs
 * Provides a scalable system for organizing and accessing educational content
 */

// Import existing category and scenario data
import { ETHICAL_CATEGORIES } from '../categories.js';
import trolleyProblemScenarios from '../data/scenarios/trolley-problem-scenarios.js';
import aiBlackBoxScenarios from '../data/scenarios/ai-black-box-scenarios.js';
import automationOversightScenarios from '../data/scenarios/automation-oversight-scenarios.js';
import consentSurveillanceScenarios from '../data/scenarios/consent-surveillance-scenarios.js';
import experienceMachineScenarios from '../data/scenarios/experience-machine-scenarios.js';
import moralLuckScenarios from '../data/scenarios/moral-luck-scenarios.js';
import responsibilityBlameScenarios from '../data/scenarios/responsibility-blame-scenarios.js';
import shipOfTheseusScenarios from '../data/scenarios/ship-of-theseus-scenarios.js';
import simulationHypothesisScenarios from '../data/scenarios/simulation-hypothesis-scenarios.js';
import soritesParadoxScenarios from '../data/scenarios/sorites-paradox-scenarios.js';

// Import learning labs loader
import { loadLearningLab, hasLearningLab } from './learning-labs-loader.js';
import { logger } from '../utils/logger.js';

/**
 * Content Registry Class
 * Manages all educational content in a unified, scalable way
 */
class ContentRegistry {
  constructor() {
    this.categories = new Map();
    this.scenarios = new Map();
    this.learningLabs = new Map();
    this.metadata = new Map();

    // Track content relationships
    this.categoryScenarios = new Map(); // category -> scenario IDs
    this.scenarioCategories = new Map(); // scenario -> category ID
    this.categoryLearningLabs = new Map(); // category -> learning lab ID

    this.initialize();
  }

  /**
   * Initialize the registry with existing content
   */
  initialize() {
    // Map scenario imports to category IDs
    const scenarioMapping = {
      'trolley-problem': trolleyProblemScenarios,
      'ai-black-box': aiBlackBoxScenarios,
      'automation-oversight': automationOversightScenarios,
      'consent-surveillance': consentSurveillanceScenarios,
      'experience-machine': experienceMachineScenarios,
      'moral-luck': moralLuckScenarios,
      'responsibility-blame': responsibilityBlameScenarios,
      'ship-of-theseus': shipOfTheseusScenarios,
      'simulation-hypothesis': simulationHypothesisScenarios,
      'sorites-paradox': soritesParadoxScenarios,
    };

    // Register categories and their scenarios
    Object.entries(ETHICAL_CATEGORIES).forEach(([categoryId, categoryData]) => {
      this.registerCategory(categoryId, categoryData);

      // Register scenarios for this category
      const scenarioData = scenarioMapping[categoryId];
      if (scenarioData) {
        Object.entries(scenarioData).forEach(([scenarioId, scenario]) => {
          this.registerScenario(scenarioId, scenario, categoryId);
        });
      }
    });
  }

  /**
   * Register a new category
   */
  registerCategory(categoryId, categoryData) {
    const processedCategory = {
      id: categoryId,
      ...categoryData,
      registeredAt: new Date().toISOString(),
      version: '1.0.0',
    };

    this.categories.set(categoryId, processedCategory);
    this.categoryScenarios.set(categoryId, new Set());

    // Learning labs will be loaded dynamically when requested
    // No need to generate defaults since we have JSON files

    return processedCategory;
  }

  /**
   * Register a new scenario
   */
  registerScenario(scenarioId, scenarioData, categoryId) {
    const processedScenario = {
      id: scenarioId,
      categoryId,
      ...scenarioData,
      registeredAt: new Date().toISOString(),
      version: '1.0.0',
    };

    this.scenarios.set(scenarioId, processedScenario);
    this.scenarioCategories.set(scenarioId, categoryId);

    // Add to category's scenario list
    if (this.categoryScenarios.has(categoryId)) {
      this.categoryScenarios.get(categoryId).add(scenarioId);
    }

    return processedScenario;
  }

  /**
   * Register a learning lab
   */
  registerLearningLab(labId, labData) {
    const processedLab = {
      id: labId,
      ...labData,
      registeredAt: new Date().toISOString(),
      version: '1.0.0',
    };

    this.learningLabs.set(labId, processedLab);
    this.categoryLearningLabs.set(labData.categoryId || labId, labId);

    return processedLab;
  }

  /**
   * Get all categories with their scenarios and learning labs
   */
  async getAllCategoriesWithContent() {
    const result = [];

    for (const [categoryId, category] of this.categories) {
      const scenarios = this.getScenariosForCategory(categoryId);
      const learningLab = await this.getLearningLabForCategory(categoryId);

      result.push({
        ...category,
        scenarios,
        learningLab,
        scenarioCount: scenarios.length,
      });
    }

    return result;
  }

  /**
   * Get scenarios for a specific category
   */
  getScenariosForCategory(categoryId) {
    const scenarioIds = this.categoryScenarios.get(categoryId);
    if (!scenarioIds) return [];

    return Array.from(scenarioIds)
      .map(id => this.scenarios.get(id))
      .filter(Boolean);
  }

  /**
   * Get learning lab for a category
   */
  async getLearningLabForCategory(categoryId) {
    // First check if already loaded in memory
    const labId = this.categoryLearningLabs.get(categoryId);
    if (labId && this.learningLabs.has(labId)) {
      return this.learningLabs.get(labId);
    }

    // Try to load from JSON file if it exists
    if (hasLearningLab(categoryId)) {
      try {
        const learningLabData = await loadLearningLab(categoryId);
        this.registerLearningLab(learningLabData.id, learningLabData);
        return learningLabData;
      } catch (error) {
        logger.error(
          `Failed to load learning lab for category ${categoryId}:`,
          error
        );
      }
    }

    return null;
  }

  /**
   * Search content by filters
   */
  searchContent(filters = {}) {
    const {
      contentType = 'all', // 'categories', 'scenarios', 'learningLabs', 'all'
    } = filters;

    const results = {
      categories: [],
      scenarios: [],
      learningLabs: [],
    };

    // Search categories
    if (contentType === 'all' || contentType === 'categories') {
      for (const category of this.categories.values()) {
        if (this.matchesFilters(category, filters)) {
          results.categories.push(category);
        }
      }
    }

    // Search scenarios
    if (contentType === 'all' || contentType === 'scenarios') {
      for (const scenario of this.scenarios.values()) {
        if (this.matchesFilters(scenario, filters)) {
          results.scenarios.push(scenario);
        }
      }
    }

    // Search learning labs
    if (contentType === 'all' || contentType === 'learningLabs') {
      for (const lab of this.learningLabs.values()) {
        if (this.matchesFilters(lab, filters)) {
          results.learningLabs.push(lab);
        }
      }
    }

    return results;
  }

  /**
   * Check if content matches filters
   */
  matchesFilters(content, filters) {
    const {
      difficulty,
      philosophy,
      tags,
      search,
      targetAudience,
      estimatedTimeMax,
    } = filters;

    // Difficulty filter
    if (difficulty && content.difficulty !== difficulty) {
      return false;
    }

    // Philosophy filter
    if (
      philosophy &&
      content.philosophicalApproaches &&
      !content.philosophicalApproaches.includes(philosophy)
    ) {
      return false;
    }

    // Tags filter
    if (tags && tags.length > 0 && content.tags) {
      const hasMatchingTag = tags.some(tag =>
        content.tags.some(contentTag =>
          contentTag.toLowerCase().includes(tag.toLowerCase())
        )
      );
      if (!hasMatchingTag) return false;
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      const searchableText = [
        content.title,
        content.description,
        content.dilemma,
        content.ethicalQuestion,
      ]
        .join(' ')
        .toLowerCase();

      if (!searchableText.includes(searchLower)) {
        return false;
      }
    }

    // Target audience filter
    if (
      targetAudience &&
      content.targetAudience &&
      !content.targetAudience.includes(targetAudience)
    ) {
      return false;
    }

    // Estimated time filter
    if (estimatedTimeMax && content.estimatedTime > estimatedTimeMax) {
      return false;
    }

    return true;
  }

  /**
   * Generate a default learning lab for a category
   */
  generateDefaultLearningLab(categoryData) {
    return {
      id: `${categoryData.id}-learning-lab`,
      categoryId: categoryData.id,
      title: `Learning Lab: ${categoryData.title}`,
      overview: `Comprehensive learning experience for ${categoryData.title.toLowerCase()} scenarios, designed to deepen understanding through structured exploration and reflection.`,
      learningObjectives: [
        `Analyze ethical implications of ${categoryData.title.toLowerCase()}`,
        'Apply multiple ethical frameworks to complex scenarios',
        'Develop reasoned arguments for ethical positions',
        'Understand stakeholder perspectives and impacts',
      ],
      phases: [
        {
          name: 'Introduction & Context',
          duration: '10-15 minutes',
          activities: [
            'Review key concepts and terminology',
            'Explore real-world relevance',
            'Set learning intentions',
          ],
          resources: [
            'Background reading',
            'Video introduction',
            'Concept glossary',
          ],
        },
        {
          name: 'Scenario Exploration',
          duration: '20-30 minutes',
          activities: [
            'Engage with interactive scenarios',
            'Document initial responses',
            'Consider multiple perspectives',
          ],
          resources: [
            'Interactive scenarios',
            'Decision journal',
            'Stakeholder profiles',
          ],
        },
        {
          name: 'Deep Analysis',
          duration: '15-20 minutes',
          activities: [
            'Apply ethical frameworks',
            'Analyze consequences and tradeoffs',
            'Research related cases',
          ],
          resources: [
            'Framework guides',
            'Case study database',
            'Analysis templates',
          ],
        },
        {
          name: 'Synthesis & Reflection',
          duration: '10-15 minutes',
          activities: [
            'Synthesize learning insights',
            'Reflect on personal growth',
            'Plan future applications',
          ],
          resources: [
            'Reflection prompts',
            'Learning portfolio',
            'Action planning guide',
          ],
        },
      ],
      assessmentRubric: this.generateDefaultRubric(),
      educatorResources: {
        discussionQuestions: [
          'How do different ethical frameworks lead to different conclusions?',
          'What role should stakeholder perspectives play in ethical decisions?',
          'How can we balance competing values and interests?',
        ],
        extensionActivities: [
          'Research current events related to this ethical domain',
          'Interview professionals who face these ethical decisions',
          'Design solutions that address identified ethical concerns',
        ],
        crossCurricularConnections: [
          'Social Studies: Policy and governance implications',
          'Science: Technical understanding of AI systems',
          'Language Arts: Persuasive writing and argumentation',
        ],
      },
    };
  }

  /**
   * Generate a default assessment rubric
   */
  generateDefaultRubric() {
    return {
      criteria: [
        {
          name: 'Ethical Reasoning',
          description: 'Quality of ethical analysis and argumentation',
          levels: {
            exemplary:
              'Demonstrates sophisticated understanding of multiple ethical frameworks with nuanced analysis',
            proficient:
              'Shows solid grasp of ethical principles with clear reasoning',
            developing: 'Basic understanding of ethics with some logical gaps',
            beginning:
              'Limited ethical reasoning with unclear or missing connections',
          },
        },
        {
          name: 'Stakeholder Awareness',
          description:
            'Recognition and consideration of different perspectives',
          levels: {
            exemplary:
              'Comprehensive identification and empathetic consideration of all relevant stakeholders',
            proficient:
              'Good awareness of multiple stakeholder perspectives with thoughtful consideration',
            developing:
              'Some recognition of different viewpoints with basic consideration',
            beginning:
              'Limited awareness of stakeholder perspectives beyond obvious ones',
          },
        },
        {
          name: 'Critical Thinking',
          description: 'Depth of analysis and quality of decision-making',
          levels: {
            exemplary:
              'Exceptional analysis with creative solutions and deep insight into consequences',
            proficient:
              'Strong analytical thinking with well-reasoned conclusions',
            developing:
              'Basic analysis with some consideration of implications',
            beginning:
              'Superficial thinking with limited consideration of complexity',
          },
        },
      ],
    };
  }

  /**
   * Export content for external use (JSON format)
   */
  exportToJSON() {
    return {
      categories: Array.from(this.categories.values()),
      scenarios: Array.from(this.scenarios.values()),
      learningLabs: Array.from(this.learningLabs.values()),
      metadata: {
        exportedAt: new Date().toISOString(),
        totalCategories: this.categories.size,
        totalScenarios: this.scenarios.size,
        totalLearningLabs: this.learningLabs.size,
      },
    };
  }

  /**
   * Import content from JSON
   */
  importFromJSON(jsonData) {
    const { categories, scenarios, learningLabs } = jsonData;

    // Clear existing data
    this.categories.clear();
    this.scenarios.clear();
    this.learningLabs.clear();
    this.categoryScenarios.clear();
    this.scenarioCategories.clear();
    this.categoryLearningLabs.clear();

    // Import categories
    categories?.forEach(category => {
      this.registerCategory(category.id, category);
    });

    // Import scenarios
    scenarios?.forEach(scenario => {
      this.registerScenario(scenario.id, scenario, scenario.categoryId);
    });

    // Import learning labs
    learningLabs?.forEach(lab => {
      this.registerLearningLab(lab.id, lab);
    });
  }

  /**
   * Get content statistics
   */
  getStatistics() {
    const stats = {
      totalCategories: this.categories.size,
      totalScenarios: this.scenarios.size,
      totalLearningLabs: this.learningLabs.size,
      difficultyCounts: { beginner: 0, intermediate: 0, advanced: 0 },
      philosophyCounts: {},
      averageTimeEstimate: 0,
    };

    // Calculate difficulty distribution
    for (const category of this.categories.values()) {
      if (category.difficulty) {
        stats.difficultyCounts[category.difficulty]++;
      }
    }

    // Calculate philosophy distribution
    for (const category of this.categories.values()) {
      if (category.philosophicalApproaches) {
        category.philosophicalApproaches.forEach(philosophy => {
          stats.philosophyCounts[philosophy] =
            (stats.philosophyCounts[philosophy] || 0) + 1;
        });
      }
    }

    // Calculate average time estimate
    const times = Array.from(this.categories.values())
      .map(c => c.estimatedTime)
      .filter(t => typeof t === 'number');

    if (times.length > 0) {
      stats.averageTimeEstimate = Math.round(
        times.reduce((a, b) => a + b, 0) / times.length
      );
    }

    return stats;
  }
}

// Create and export singleton instance
const contentRegistry = new ContentRegistry();

export default contentRegistry;
export { ContentRegistry };
