/**
 * Category Metadata Enhancement Utility
 * Integrates enhanced metadata with existing category system
 */

import { ETHICAL_CATEGORIES } from '../../data/categories.js';

// Constants
const DEFAULT_ESTIMATED_TIME = 5;

/**
 * Enhanced category data with comprehensive metadata
 */
export class CategoryMetadataManager {
  /**
   * Get enhanced category data with full metadata
   */
  static getEnhancedCategory(categoryId) {
    const baseCategory = ETHICAL_CATEGORIES[categoryId];
    if (!baseCategory) return null;

    return {
      ...baseCategory,
      metadata: {
        // Philosophical metadata
        philosophicalApproaches: baseCategory.philosophicalApproaches || [],
        primaryPhilosophy: baseCategory.primaryPhilosophy || 'utilitarian',
        ethicalFrameworks: baseCategory.ethicalFrameworks || [],

        // Learning metadata
        targetAudience: baseCategory.targetAudience || ['students'],
        prerequisites: baseCategory.prerequisites || [],
        complexity: baseCategory.complexity || 'moderate',
        timeCommitment: baseCategory.timeCommitment || 'medium',
        interactionLevel: baseCategory.interactionLevel || 'medium',

        // Search and discovery
        searchKeywords: baseCategory.searchKeywords || [],
        tags: baseCategory.tags || [],

        // Analytics
        completionRate: 0,
        averageRating: 0,
        popularityScore: 0,
        lastUpdated: new Date().toISOString(),
      },

      // Enhanced scenarios with metadata
      scenarios:
        baseCategory.scenarios?.map(scenario =>
          this.enhanceScenario(scenario, categoryId)
        ) || [],
    };
  }

  /**
   * Enhance individual scenario with metadata
   */
  static enhanceScenario(scenario, categoryId) {
    return {
      ...scenario,
      categoryId,
      metadata: {
        // Philosophical metadata
        philosophicalLeaning: scenario.philosophicalLeaning || 'utilitarian',
        ethicalDimensions: scenario.ethicalDimensions || [
          'autonomy',
          'beneficence',
        ],

        // Content metadata
        tags: scenario.tags || [],
        searchKeywords: scenario.searchKeywords || [],
        estimatedTime: scenario.estimatedTime || DEFAULT_ESTIMATED_TIME,
        complexity: scenario.complexity || 'moderate',

        // Learning objectives specific to scenario
        learningOutcomes: scenario.learningOutcomes || [],

        // Analytics
        completionCount: 0,
        averageRating: 0,
        difficultyCommunityRating: 0,
        lastCompleted: null,
      },
    };
  }

  /**
   * Get all categories with enhanced metadata
   */
  static getAllEnhancedCategories() {
    const enhanced = {};
    Object.keys(ETHICAL_CATEGORIES).forEach(categoryId => {
      enhanced[categoryId] = this.getEnhancedCategory(categoryId);
    });
    return enhanced;
  }

  /**
   * Search categories by tags, keywords, or philosophical approach
   */
  static searchCategories(query, filters = {}) {
    const allCategories = this.getAllEnhancedCategories();
    const results = [];

    Object.values(allCategories).forEach(category => {
      let matches = false;
      const searchQuery = query.toLowerCase();

      // Text search
      if (searchQuery) {
        const searchableText = [
          category.title,
          category.description,
          ...(category.metadata.searchKeywords || []),
          ...(category.metadata.tags || []),
        ]
          .join(' ')
          .toLowerCase();

        matches = searchableText.includes(searchQuery);
      } else {
        matches = true; // No query means show all
      }

      // Apply filters
      if (matches && filters.difficulty) {
        matches = category.difficulty === filters.difficulty;
      }

      if (matches && filters.philosophy) {
        matches = category.metadata.philosophicalApproaches?.includes(
          filters.philosophy
        );
      }

      if (matches && filters.tags?.length) {
        matches = filters.tags.some(tag =>
          category.metadata.tags?.includes(tag)
        );
      }

      if (matches && filters.timeCommitment) {
        matches = category.metadata.timeCommitment === filters.timeCommitment;
      }

      if (matches) {
        results.push(category);
      }
    });

    return results;
  }

  /**
   * Get scenarios across all categories with enhanced metadata
   */
  static getAllScenariosEnhanced() {
    const allCategories = this.getAllEnhancedCategories();
    const scenarios = [];

    Object.values(allCategories).forEach(category => {
      category.scenarios.forEach(scenario => {
        scenarios.push({
          ...scenario,
          category: {
            id: category.id,
            title: category.title,
            icon: category.icon,
            color: category.color,
          },
        });
      });
    });

    return scenarios;
  }

  /**
   * Search scenarios with enhanced filtering
   */
  static searchScenarios(query, filters = {}) {
    const allScenarios = this.getAllScenariosEnhanced();
    const results = [];

    allScenarios.forEach(scenario => {
      let matches = false;
      const searchQuery = query.toLowerCase();

      // Text search
      if (searchQuery) {
        const searchableText = [
          scenario.title,
          scenario.description,
          ...(scenario.metadata.searchKeywords || []),
          ...(scenario.metadata.tags || []),
        ]
          .join(' ')
          .toLowerCase();

        matches = searchableText.includes(searchQuery);
      } else {
        matches = true;
      }

      // Apply filters
      if (matches && filters.category) {
        matches = scenario.categoryId === filters.category;
      }

      if (matches && filters.difficulty) {
        matches = scenario.difficulty === filters.difficulty;
      }

      if (matches && filters.philosophy) {
        matches = scenario.metadata.philosophicalLeaning === filters.philosophy;
      }

      if (matches && filters.tags?.length) {
        matches = filters.tags.some(tag =>
          scenario.metadata.tags?.includes(tag)
        );
      }

      if (matches && filters.complexity) {
        matches = scenario.metadata.complexity === filters.complexity;
      }

      if (matches) {
        results.push(scenario);
      }
    });

    return results;
  }

  /**
   * Get popular tags across all categories and scenarios
   */
  static getPopularTags() {
    const tagCounts = {};
    const allCategories = this.getAllEnhancedCategories();

    Object.values(allCategories).forEach(category => {
      // Count category tags
      category.metadata.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });

      // Count scenario tags
      category.scenarios.forEach(scenario => {
        scenario.metadata.tags?.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });
    });

    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([tag, count]) => ({ tag, count }));
  }

  /**
   * Get metadata statistics
   */
  static getMetadataStats() {
    const allCategories = this.getAllEnhancedCategories();
    const allScenarios = this.getAllScenariosEnhanced();

    return {
      totalCategories: Object.keys(allCategories).length,
      totalScenarios: allScenarios.length,
      difficultyBreakdown: this.getDifficultyBreakdown(allScenarios),
      philosophyBreakdown: this.getPhilosophyBreakdown(allScenarios),
      averageEstimatedTime: this.getAverageEstimatedTime(allScenarios),
      topTags: this.getPopularTags().slice(0, 10),
    };
  }

  static getDifficultyBreakdown(scenarios) {
    const breakdown = { beginner: 0, intermediate: 0, advanced: 0 };
    scenarios.forEach(scenario => {
      breakdown[scenario.difficulty] =
        (breakdown[scenario.difficulty] || 0) + 1;
    });
    return breakdown;
  }

  static getPhilosophyBreakdown(scenarios) {
    const breakdown = {};
    scenarios.forEach(scenario => {
      const philosophy = scenario.metadata.philosophicalLeaning;
      breakdown[philosophy] = (breakdown[philosophy] || 0) + 1;
    });
    return breakdown;
  }

  static getAverageEstimatedTime(scenarios) {
    const times = scenarios
      .map(s => s.metadata.estimatedTime)
      .filter(t => t && t > 0);

    return times.length > 0
      ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
      : 0;
  }
}

export default CategoryMetadataManager;
