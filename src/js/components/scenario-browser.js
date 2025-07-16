/**
 * Scenario Browser Component
 * Handles filtering, searching, and displaying AI ethics scenarios with enhanced metadata
 */

import CategoryMetadataManager from '../utils/category-metadata-manager.js';

// Constants
const DEFAULT_ESTIMATED_TIME = 5;
const MAX_VISIBLE_TAGS = 4;
const DEBOUNCE_DELAY = 300;
const DIFFICULTY_ORDER = { beginner: 1, intermediate: 2, advanced: 3 };

class ScenarioBrowser {
  constructor() {
    this.scenarios = [];
    this.filteredScenarios = [];
    this.availableTags = new Set();
    this.filters = {
      category: '',
      difficulty: '',
      philosophy: '',
      tags: [],
      search: '',
    };
    this.sortBy = 'title';
    this.currentPage = 0;
    this.pageSize = 12;
    this.lastVisible = null;
    this.hasMore = true;
    this.isLoading = false;

    // Enhanced metadata support
    this.metadataManager = CategoryMetadataManager;
    this.enhancedCategories = null;
  }

  /**
   * Initialize the scenario browser with enhanced metadata
   */
  async init() {
    try {
      this.setupEventListeners();

      // Load enhanced categories and scenarios
      this.enhancedCategories = this.metadataManager.getAllEnhancedCategories();

      await this.loadAvailableTags();
      await this.loadScenariosEnhanced();
      this.renderTagChips();
      this.updateMetadataDisplay();
    } catch (error) {
      console.error('Error initializing scenario browser:', error);
      this.showError('Failed to load scenarios. Please try again later.');
    }
  }

  /**
   * Setup event listeners for filter controls
   */
  setupEventListeners() {
    // Filter controls
    document.getElementById('category-filter').addEventListener('change', e => {
      this.filters.category = e.target.value;
      this.applyFilters();
    });

    document
      .getElementById('difficulty-filter')
      .addEventListener('change', e => {
        this.filters.difficulty = e.target.value;
        this.applyFilters();
      });

    document
      .getElementById('philosophy-filter')
      .addEventListener('change', e => {
        this.filters.philosophy = e.target.value;
        this.applyFilters();
      });

    document.getElementById('search-filter').addEventListener('input', e => {
      this.filters.search = e.target.value.toLowerCase();
      this.debounceSearch();
    });

    document.getElementById('sort-by').addEventListener('change', e => {
      this.sortBy = e.target.value;
      this.sortAndRender();
    });

    document.getElementById('clear-filters').addEventListener('click', () => {
      this.clearAllFilters();
    });

    document.getElementById('load-more-btn')?.addEventListener('click', () => {
      this.loadMoreScenarios();
    });
  }

  /**
   * Load available tags from Firestore for filter UI
   */
  async loadAvailableTags() {
    try {
      // For now, we'll use a predefined set of tags
      // In a real implementation, you'd query Firestore to get all unique tags
      const commonTags = [
        'bias',
        'autonomy',
        'surveillance',
        'privacy',
        'fairness',
        'transparency',
        'accountability',
        'safety',
        'human-rights',
        'decision-making',
        'automation',
        'consciousness',
        'identity',
        'responsibility',
        'free-will',
        'determinism',
        'justice',
        'equality',
        'dignity',
        'consent',
        'manipulation',
        'trust',
      ];

      commonTags.forEach(tag => this.availableTags.add(tag));
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  }

  /**
   * Load scenarios from Firestore
   */
  async loadScenarios(loadMore = false) {
    if (this.isLoading) return;

    this.isLoading = true;
    this.showLoading(!loadMore);

    try {
      // For demo purposes, we'll create mock data
      // In production, replace with actual Firestore queries
      const mockScenarios = await this.getMockScenarios();

      if (loadMore) {
        this.scenarios = [...this.scenarios, ...mockScenarios];
      } else {
        this.scenarios = mockScenarios;
        this.currentPage = 0;
      }

      this.applyFilters();
      this.hideLoading();
    } catch (error) {
      console.error('Error loading scenarios:', error);
      this.showError('Failed to load scenarios. Please try again.');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Generate mock scenarios with proper metadata structure
   * Replace this with actual Firestore queries in production
   */
  async getMockScenarios() {
    return [
      {
        id: 'trolley-basic',
        title: 'The Classic Trolley Problem',
        description:
          'A runaway trolley is heading toward five people. You can pull a lever to divert it to kill one person instead. What do you do?',
        category: 'trolley-problem',
        difficulty: 'beginner',
        philosophical_leaning: 'utilitarian',
        tags: ['decision-making', 'responsibility', 'human-rights', 'justice'],
        searchKeywords: [
          'trolley',
          'dilemma',
          'utilitarian',
          'moral',
          'choice',
        ],
        createdAt: new Date('2024-01-15'),
        estimatedTime: 15,
      },
      {
        id: 'ai-hiring-bias',
        title: 'Biased AI Hiring System',
        description:
          'An AI recruitment system shows bias against certain demographics. How do you address fairness while maintaining efficiency?',
        category: 'ai-black-box',
        difficulty: 'intermediate',
        philosophical_leaning: 'deontological',
        tags: [
          'bias',
          'fairness',
          'automation',
          'discrimination',
          'transparency',
        ],
        searchKeywords: [
          'hiring',
          'recruitment',
          'bias',
          'discrimination',
          'workplace',
        ],
        createdAt: new Date('2024-02-01'),
        estimatedTime: 25,
      },
      {
        id: 'surveillance-consent',
        title: 'Smart City Surveillance Dilemma',
        description:
          'A smart city uses AI surveillance to prevent crime, but citizens question consent and privacy. Balance security with rights.',
        category: 'consent-surveillance',
        difficulty: 'advanced',
        philosophical_leaning: 'social-contract',
        tags: ['surveillance', 'privacy', 'consent', 'safety', 'autonomy'],
        searchKeywords: [
          'surveillance',
          'privacy',
          'security',
          'monitoring',
          'city',
        ],
        createdAt: new Date('2024-01-28'),
        estimatedTime: 30,
      },
      {
        id: 'medical-ai-override',
        title: 'Medical AI Override Decision',
        description:
          "An AI diagnostic system disagrees with a doctor's assessment. Who has the final say in patient care?",
        category: 'automation-oversight',
        difficulty: 'intermediate',
        philosophical_leaning: 'virtue-ethics',
        tags: [
          'automation',
          'human-oversight',
          'medical-ethics',
          'trust',
          'responsibility',
        ],
        searchKeywords: [
          'medical',
          'healthcare',
          'diagnosis',
          'doctor',
          'override',
        ],
        createdAt: new Date('2024-02-10'),
        estimatedTime: 20,
      },
      {
        id: 'autonomous-vehicle-crash',
        title: 'Autonomous Vehicle Moral Machine',
        description:
          'A self-driving car must choose between hitting a child or swerving to hit an elderly person. How should it decide?',
        category: 'moral-luck',
        difficulty: 'advanced',
        philosophical_leaning: 'utilitarian',
        tags: [
          'autonomous-vehicles',
          'moral-luck',
          'decision-making',
          'responsibility',
        ],
        searchKeywords: [
          'autonomous',
          'vehicle',
          'car',
          'accident',
          'moral machine',
        ],
        createdAt: new Date('2024-01-20'),
        estimatedTime: 35,
      },
      {
        id: 'ai-consciousness-test',
        title: 'Testing AI Consciousness',
        description:
          'An AI claims to be conscious and requests rights. How do we determine if it truly experiences consciousness?',
        category: 'experience-machine',
        difficulty: 'advanced',
        philosophical_leaning: 'existentialist',
        tags: [
          'consciousness',
          'identity',
          'rights',
          'personhood',
          'sentience',
        ],
        searchKeywords: [
          'consciousness',
          'sentience',
          'rights',
          'person',
          'mind',
        ],
        createdAt: new Date('2024-02-05'),
        estimatedTime: 40,
      },
    ];
  }

  /**
   * Load scenarios using enhanced metadata system
   */
  async loadScenariosEnhanced() {
    this.isLoading = true;
    this.showLoadingState();

    try {
      // Use metadata manager to get all scenarios with enhanced data
      this.scenarios = this.metadataManager.getAllScenariosEnhanced();

      // Update available tags from enhanced metadata
      this.updateAvailableTags();

      // Apply current filters
      this.applyFiltersEnhanced();

      this.hideLoadingState();
    } catch (error) {
      console.error('Error loading enhanced scenarios:', error);
      this.showError('Failed to load scenarios with metadata.');
    }
  }

  /**
   * Update available tags from enhanced metadata
   */
  updateAvailableTags() {
    this.availableTags.clear();

    // Get tags from scenarios
    this.scenarios.forEach(scenario => {
      scenario.metadata.tags?.forEach(tag => {
        this.availableTags.add(tag);
      });
    });

    // Get tags from categories
    Object.values(this.enhancedCategories).forEach(category => {
      category.metadata.tags?.forEach(tag => {
        this.availableTags.add(tag);
      });
    });
  }

  /**
   * Apply filters using enhanced metadata system
   */
  applyFiltersEnhanced() {
    this.filteredScenarios = this.metadataManager.searchScenarios(
      this.filters.search,
      {
        category: this.filters.category || undefined,
        difficulty: this.filters.difficulty || undefined,
        philosophy: this.filters.philosophy || undefined,
        tags: this.filters.tags.length > 0 ? this.filters.tags : undefined,
      }
    );

    this.sortScenarios();
    this.renderScenarios();
    this.updateResultsCount();
    this.updateActiveFilters();
  }

  /**
   * Sort scenarios and render them
   */
  sortAndRender() {
    // Sort scenarios
    this.filteredScenarios.sort((a, b) => {
      switch (this.sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'difficulty':
          const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        case 'category':
          return a.category.localeCompare(b.category);
        case 'recently-added':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

    this.renderScenarios();
  }

  /**
   * Render scenario cards
   */
  renderScenarios() {
    const grid = document.getElementById('scenario-grid');
    const noResults = document.getElementById('no-results');

    if (this.filteredScenarios.length === 0) {
      grid.innerHTML = '';
      noResults.style.display = 'block';
      return;
    }

    noResults.style.display = 'none';

    const scenariosToShow = this.filteredScenarios.slice(
      0,
      (this.currentPage + 1) * this.pageSize
    );

    grid.innerHTML = scenariosToShow
      .map(scenario => this.renderScenarioCard(scenario))
      .join('');

    // Show/hide load more button
    const loadMoreContainer = document.getElementById('load-more-container');
    if (scenariosToShow.length < this.filteredScenarios.length) {
      loadMoreContainer.style.display = 'block';
    } else {
      loadMoreContainer.style.display = 'none';
    }
  }

  /**
   * Render scenario card with enhanced metadata
   */
  renderScenarioCard(scenario) {
    const estimatedTime =
      scenario.metadata.estimatedTime || DEFAULT_ESTIMATED_TIME;
    const complexity = scenario.metadata.complexity || 'moderate';
    const philosophicalLeaning =
      scenario.metadata.philosophicalLeaning || 'utilitarian';

    return `
      <div class="scenario-card" data-scenario-id="${scenario.id}">
        <!-- Color indicator from category -->
        <div class="scenario-card-header">
          <span class="scenario-category" style="background-color: ${scenario.category.color}20; color: ${scenario.category.color};">
            ${scenario.category.icon} ${scenario.category.title}
          </span>
          <h3 class="scenario-title">${scenario.title}</h3>
          <p class="scenario-description">${scenario.description}</p>
        </div>
        
        <div class="scenario-card-body">
          <!-- Enhanced metadata display -->
          <div class="scenario-meta">
            <span class="difficulty-badge difficulty-${scenario.difficulty}">
              ${scenario.difficulty.charAt(0).toUpperCase() + scenario.difficulty.slice(1)}
            </span>
            <span class="philosophy-tag">
              ${philosophicalLeaning.charAt(0).toUpperCase() + philosophicalLeaning.slice(1)}
            </span>
          </div>
          
          <!-- Time and complexity indicators -->
          <div class="scenario-indicators">
            <span class="time-indicator" title="Estimated completion time">
              ⏱️ ${estimatedTime} min
            </span>
            <span class="complexity-indicator" title="Cognitive complexity">
              🧠 ${complexity.charAt(0).toUpperCase() + complexity.slice(1)}
            </span>
          </div>
          
          <!-- Enhanced tags display -->
          <div class="scenario-tags">
            ${
              scenario.metadata.tags
                ?.slice(0, MAX_VISIBLE_TAGS)
                .map(
                  tag =>
                    `<span class="scenario-tag" data-tag="${tag}">${tag}</span>`
                )
                .join('') || ''
            }
            ${
              scenario.metadata.tags?.length > MAX_VISIBLE_TAGS
                ? `<span class="tag-more">+${scenario.metadata.tags.length - MAX_VISIBLE_TAGS} more</span>`
                : ''
            }
          </div>
          
          <!-- Action buttons -->
          <div class="scenario-actions">
            <button class="btn-scenario btn-scenario-primary" 
                    onclick="window.location.href='category.html?category=${scenario.categoryId}'">
              <span>🚀</span> Start Simulation
            </button>
            <button class="btn-scenario btn-scenario-secondary" 
                    onclick="showScenarioPreview('${scenario.id}')">
              <span>👁️</span> Preview
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Update metadata display in the UI
   */
  updateMetadataDisplay() {
    const stats = this.metadataManager.getMetadataStats();
    const headerElement = document.querySelector('.filter-header h2');

    if (headerElement) {
      headerElement.innerHTML = `
        🔍 Filter Scenarios 
        <small style="font-weight: normal; margin-left: 1rem; opacity: 0.7;">
          ${stats.totalScenarios} scenarios across ${stats.totalCategories} categories
        </small>
      `;
    }
  }

  /**
   * Apply current filters to scenarios
   */
  applyFilters() {
    let filtered = [...this.scenarios];

    // Category filter
    if (this.filters.category) {
      filtered = filtered.filter(
        scenario => scenario.category === this.filters.category
      );
    }

    // Difficulty filter
    if (this.filters.difficulty) {
      filtered = filtered.filter(
        scenario => scenario.difficulty === this.filters.difficulty
      );
    }

    // Philosophy filter
    if (this.filters.philosophy) {
      filtered = filtered.filter(
        scenario => scenario.philosophical_leaning === this.filters.philosophy
      );
    }

    // Tags filter
    if (this.filters.tags.length > 0) {
      filtered = filtered.filter(scenario =>
        this.filters.tags.some(tag => scenario.tags.includes(tag))
      );
    }

    // Search filter
    if (this.filters.search) {
      filtered = filtered.filter(scenario => {
        const searchText = this.filters.search;
        return (
          scenario.title.toLowerCase().includes(searchText) ||
          scenario.description.toLowerCase().includes(searchText) ||
          scenario.searchKeywords.some(keyword =>
            keyword.toLowerCase().includes(searchText)
          )
        );
      });
    }

    this.filteredScenarios = filtered;
    this.sortAndRender();
    this.updateActiveFilters();
    this.updateResultsCount();
  }

  /**
   * Render tag filter chips
   */
  renderTagChips() {
    const container = document.getElementById('tag-chips');
    const tagsArray = Array.from(this.availableTags).sort();

    container.innerHTML = tagsArray
      .map(
        tag => `
      <div class="tag-chip" data-tag="${tag}" onclick="scenarioBrowser.toggleTag('${tag}')">
        ${tag.replace(/-/g, ' ')}
      </div>
    `
      )
      .join('');
  }

  /**
   * Toggle tag filter
   */
  toggleTag(tag) {
    const index = this.filters.tags.indexOf(tag);
    if (index > -1) {
      this.filters.tags.splice(index, 1);
    } else {
      this.filters.tags.push(tag);
    }

    this.updateTagChipStates();
    this.applyFilters();
  }

  /**
   * Update tag chip visual states
   */
  updateTagChipStates() {
    document.querySelectorAll('.tag-chip').forEach(chip => {
      const { tag } = chip.dataset;
      if (this.filters.tags.includes(tag)) {
        chip.classList.add('selected');
      } else {
        chip.classList.remove('selected');
      }
    });
  }

  /**
   * Update active filters display
   */
  updateActiveFilters() {
    const container = document.getElementById('active-filters');
    const activeFilters = [];

    if (this.filters.category) {
      activeFilters.push({
        type: 'category',
        value: this.filters.category,
        display: this.filters.category
          .replace(/-/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase()),
      });
    }

    if (this.filters.difficulty) {
      activeFilters.push({
        type: 'difficulty',
        value: this.filters.difficulty,
        display: this.filters.difficulty,
      });
    }

    if (this.filters.philosophy) {
      activeFilters.push({
        type: 'philosophy',
        value: this.filters.philosophy,
        display: this.filters.philosophy
          .replace(/-/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase()),
      });
    }

    this.filters.tags.forEach(tag => {
      activeFilters.push({
        type: 'tag',
        value: tag,
        display: tag.replace(/-/g, ' '),
      });
    });

    if (this.filters.search) {
      activeFilters.push({
        type: 'search',
        value: this.filters.search,
        display: `"${this.filters.search}"`,
      });
    }

    container.innerHTML = activeFilters
      .map(
        filter => `
      <div class="filter-chip">
        ${filter.display}
        <button class="remove-chip" onclick="scenarioBrowser.removeFilter('${filter.type}', '${filter.value}')">&times;</button>
      </div>
    `
      )
      .join('');
  }

  /**
   * Remove a specific filter
   */
  removeFilter(type, value) {
    switch (type) {
      case 'category':
        this.filters.category = '';
        document.getElementById('category-filter').value = '';
        break;
      case 'difficulty':
        this.filters.difficulty = '';
        document.getElementById('difficulty-filter').value = '';
        break;
      case 'philosophy':
        this.filters.philosophy = '';
        document.getElementById('philosophy-filter').value = '';
        break;
      case 'tag':
        this.toggleTag(value);
        return; // toggleTag already calls applyFilters
      case 'search':
        this.filters.search = '';
        document.getElementById('search-filter').value = '';
        break;
    }
    this.applyFilters();
  }

  /**
   * Clear all filters
   */
  clearAllFilters() {
    this.filters = {
      category: '',
      difficulty: '',
      philosophy: '',
      tags: [],
      search: '',
    };

    // Reset form controls
    document.getElementById('category-filter').value = '';
    document.getElementById('difficulty-filter').value = '';
    document.getElementById('philosophy-filter').value = '';
    document.getElementById('search-filter').value = '';

    this.updateTagChipStates();
    this.applyFilters();
  }

  /**
   * Update results count display
   */
  updateResultsCount() {
    const countElement = document.getElementById('results-count');
    const count = this.filteredScenarios.length;
    const total = this.scenarios.length;

    if (count === total) {
      countElement.textContent = `${count} scenarios`;
    } else {
      countElement.textContent = `${count} of ${total} scenarios`;
    }
  }

  /**
   * Load more scenarios (pagination)
   */
  loadMoreScenarios() {
    this.currentPage++;
    this.renderScenarios();
  }

  /**
   * Debounced search to avoid too many filter applications
   */
  debounceSearch() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.applyFilters();
    }, DEBOUNCE_DELAY);
  }

  /**
   * Show loading state
   */
  showLoading(full = true) {
    if (full) {
      document.getElementById('loading-state').style.display = 'flex';
      document.getElementById('scenario-grid').style.display = 'none';
    }
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('scenario-grid').style.display = 'grid';
  }

  /**
   * Show error message
   */
  showError(message) {
    const grid = document.getElementById('scenario-grid');
    grid.innerHTML = `
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>Error Loading Scenarios</h3>
        <p>${message}</p>
        <button class="btn btn-primary" onclick="location.reload()">Try Again</button>
      </div>
    `;
    this.hideLoading();
  }
}

// Global functions
window.clearAllFilters = function () {
  window.scenarioBrowser?.clearAllFilters();
};

window.previewScenario = function (_scenarioId) {
  // TODO: Implement scenario preview modal
  // Preview scenario functionality would go here
};

// Initialize global instance
window.scenarioBrowser = null;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScenarioBrowser;
}
