/**
 * Scenario Browser Component
 * Handles filtering, searching, and displaying AI ethics scenarios with enhanced metadata
 */

import CategoryMetadataManager from '../utils/category-metadata-manager.js';
import ScenarioModal from './scenario-modal.js';
import PreLaunchModal from './pre-launch-modal.js';
import ScenarioCard from './scenario-card.js';

// Constants
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

      // Handle URL parameters for filtering
      this.handleURLParameters();
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

    // Add scenario card event listeners
    this.setupScenarioCardListeners();
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
        tags: [
          'decision-making',
          'responsibility',
          'human-rights',
          'justice',
          'consequentialism',
          'deontology',
          'moral-calculus',
          'ethical-dilemma',
          'utilitarian-ethics',
          'moral-philosophy',
        ],
        searchKeywords: [
          'trolley',
          'dilemma',
          'utilitarian',
          'moral',
          'choice',
          'consequentialism',
          'deontology',
          'moral-calculus',
          'ethical-dilemma',
          'duty-ethics',
          'greater-good',
          'moral-reasoning',
          'ethical-trade-offs',
          'moral-intuition',
          'philosophical-thought-experiment',
          'moral-permissibility',
          'acts-vs-omissions',
          'double-effect',
          'moral-absolutism',
          'moral-relativism',
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
          'algorithmic-fairness',
          'procedural-justice',
          'distributive-justice',
          'equality-of-opportunity',
          'ethical-ai',
          'machine-learning-ethics',
          'bias-mitigation',
        ],
        searchKeywords: [
          'hiring',
          'recruitment',
          'bias',
          'discrimination',
          'workplace',
          'algorithmic-bias',
          'procedural-justice',
          'distributive-justice',
          'equality-of-opportunity',
          'affirmative-action',
          'merit-based-selection',
          'implicit-bias',
          'structural-discrimination',
          'algorithmic-fairness',
          'bias-mitigation',
          'ethical-ai',
          'machine-learning-ethics',
          'predictive-analytics',
          'data-ethics',
          'automated-decision-making',
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
        tags: [
          'surveillance',
          'privacy',
          'consent',
          'safety',
          'autonomy',
          'social-contract',
          'civil-liberties',
          'privacy-rights',
          'democratic-accountability',
          'proportionality-principle',
          'collective-security',
          'individual-autonomy',
        ],
        searchKeywords: [
          'surveillance',
          'privacy',
          'security',
          'monitoring',
          'city',
          'social-contract',
          'consent-theory',
          'informed-consent',
          'privacy-rights',
          'civil-liberties',
          'panopticon',
          'surveillance-state',
          'privacy-paradox',
          'collective-security',
          'individual-autonomy',
          'democratic-accountability',
          'proportionality-principle',
          'necessity-principle',
          'privacy-by-design',
          'data-protection',
          'digital-rights',
          'governmental-overreach',
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
          'bioethics',
          'professional-autonomy',
          'clinical-judgment',
          'patient-safety',
          'healthcare-automation',
          'medical-responsibility',
          'therapeutic-relationship',
        ],
        searchKeywords: [
          'medical',
          'healthcare',
          'diagnosis',
          'doctor',
          'override',
          'medical-ethics',
          'bioethics',
          'professional-autonomy',
          'clinical-judgment',
          'human-oversight',
          'medical-AI',
          'diagnostic-accuracy',
          'physician-authority',
          'patient-safety',
          'medical-responsibility',
          'healthcare-automation',
          'clinical-decision-support',
          'medical-malpractice',
          'standard-of-care',
          'therapeutic-relationship',
          'medical-paternalism',
          'shared-decision-making',
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
          'machine-ethics',
          'algorithmic-moral-reasoning',
          'moral-programming',
          'value-alignment',
          'ethical-algorithms',
          'moral-agency',
          'artificial-moral-agents',
          'automated-ethics',
        ],
        searchKeywords: [
          'autonomous',
          'vehicle',
          'car',
          'accident',
          'moral machine',
          'moral-luck',
          'trolley-problem-variant',
          'algorithmic-moral-reasoning',
          'machine-ethics',
          'autonomous-systems',
          'moral-programming',
          'value-alignment',
          'ethical-algorithms',
          'moral-decision-making',
          'life-and-death-decisions',
          'utilitarian-calculus',
          'moral-weight',
          'responsibility-attribution',
          'automated-ethics',
          'moral-agency',
          'artificial-moral-agents',
          'ethical-programming',
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
          'artificial-consciousness',
          'machine-consciousness',
          'philosophy-of-mind',
          'cognitive-science',
          'artificial-personhood',
          'moral-status',
          'rights-attribution',
          'digital-personhood',
          'machine-rights',
        ],
        searchKeywords: [
          'consciousness',
          'sentience',
          'rights',
          'person',
          'mind',
          'artificial-consciousness',
          'machine-consciousness',
          'cognitive-science',
          'philosophy-of-mind',
          'qualia',
          'hard-problem-of-consciousness',
          'turing-test',
          'chinese-room',
          'functionalism',
          'phenomenology',
          'artificial-personhood',
          'moral-status',
          'rights-attribution',
          'sentience-recognition',
          'consciousness-tests',
          'subjective-experience',
          'mental-states',
          'artificial-intelligence-ethics',
          'machine-rights',
          'digital-personhood',
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
    this.showLoading(true);

    try {
      // Use metadata manager to get all scenarios with enhanced data
      this.scenarios = this.metadataManager.getAllScenariosEnhanced();

      // Update available tags from enhanced metadata
      this.updateAvailableTags();

      // Apply current filters
      this.applyFiltersEnhanced();

      this.hideLoading();
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

    this.sortAndRender();
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
        case 'difficulty': {
          return (
            DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty]
          );
        }
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
    const grid = document.getElementById('scenarios-grid');
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
   * Render scenario card with same structure as category-grid for consistency
   */
  /**
   * Render scenario card using shared ScenarioCard component
   */
  renderScenarioCard(scenario) {
    // Resolve category data using ScenarioCard helper
    const category = ScenarioCard.resolveCategory(
      scenario,
      this.enhancedCategories,
      () => this.metadataManager.getAllCategories()
    );

    const isCompleted = false; // TODO: Integrate with user progress system

    return ScenarioCard.render(scenario, category, isCompleted);
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
  setupScenarioCardListeners() {
    const scenarioList = document.getElementById('scenarios-list');
    if (!scenarioList) return;

    scenarioList.addEventListener('click', event => {
      const { target } = event;

      // Handle Learning Lab button clicks (scenario-start-btn)
      if (
        target.classList.contains('scenario-start-btn') ||
        target.closest('.scenario-start-btn')
      ) {
        event.preventDefault();
        event.stopPropagation();
        const scenarioCard = target.closest('.scenario-card');
        if (scenarioCard) {
          const { scenarioId, categoryId } = scenarioCard.dataset;
          if (scenarioId) {
            this.openScenario(categoryId, scenarioId);
          }
        }
        return;
      }

      // Handle Start/Quick Start button clicks (scenario-quick-start-btn)
      if (
        target.classList.contains('scenario-quick-start-btn') ||
        target.closest('.scenario-quick-start-btn')
      ) {
        event.preventDefault();
        event.stopPropagation();
        const scenarioCard = target.closest('.scenario-card');
        if (scenarioCard) {
          const { scenarioId, categoryId } = scenarioCard.dataset;
          if (scenarioId) {
            this.openScenarioModalDirect(categoryId, scenarioId);
          }
        }
        return;
      }

      // Handle card clicks
      const scenarioCard = target.closest('.scenario-card');
      if (scenarioCard) {
        const { scenarioId, categoryId } = scenarioCard.dataset;
        if (scenarioId) {
          this.openScenario(categoryId, scenarioId);
        }
      }
    });
  }

  openScenario(categoryId, scenarioId) {
    // Open with pre-launch modal (Learning Lab flow) - same as category-grid.js
    try {
      // Find the scenario and category data
      const scenario = this.scenarios.find(s => s.id === scenarioId);
      let category = {};

      // Try to get category from enhanced categories first
      if (categoryId && this.enhancedCategories[categoryId]) {
        category = this.enhancedCategories[categoryId];
      } else if (categoryId) {
        // Fallback: try to find category by ID in metadataManager
        const allCategories = this.metadataManager.getAllCategories();
        category = allCategories.find(cat => cat.id === categoryId) || {};
      }

      if (!scenario) {
        throw new Error(`Scenario not found: ${scenarioId}`);
      }

      // Open the PreLaunchModal configured for this scenario
      this.openScenarioPremodal(category, scenario);
    } catch (error) {
      // Fallback navigation
      window.location.href = `simulation.html?scenario=${scenarioId}`;
    }
  }

  openScenarioPremodal(category, scenario) {
    try {
      // Use the category ID as the "simulation ID" and pass category/scenario data
      const preModal = new PreLaunchModal(category.id || 'default', {
        categoryData: category,
        scenarioData: scenario,
        onLaunch: () => {
          // Launch the scenario modal with both category and scenario IDs
          this.openScenarioModal(scenario.id, category.id);
        },
        onCancel: () => {
          // Pre-launch modal cancelled
        },
        showEducatorResources: true,
      });

      preModal.show();
    } catch (error) {
      // Fallback to direct scenario modal
      this.openScenarioModal(scenario.id, category.id);
    }
  }

  openScenarioModal(scenarioId, categoryId) {
    try {
      const scenarioModal = new ScenarioModal();
      scenarioModal.open(scenarioId, categoryId);
    } catch (error) {
      // Fallback navigation
      window.location.href = `simulation.html?scenario=${scenarioId}`;
    }
  }

  openScenarioModalDirect(categoryId, scenarioId) {
    // Direct access to scenario modal (Start button flow) - skip pre-launch modal
    this.openScenarioModal(scenarioId, categoryId);
  }

  openLearningLab(scenarioId) {
    // Implementation for opening learning lab
    window.location.href = `learning-lab.html?scenario=${scenarioId}`;
  }

  startScenario(scenarioId) {
    // Implementation for starting scenario
    window.location.href = `simulation.html?scenario=${scenarioId}`;
  }

  openScenarioDetails(scenarioId) {
    // Implementation for scenario details or default action
    window.location.href = `simulation.html?scenario=${scenarioId}`;
  }

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
      document.getElementById('scenarios-grid').style.display = 'none';
    }
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('scenarios-grid').style.display = 'flex';
  }

  /**
   * Show error message
   */
  showError(message) {
    const grid = document.getElementById('scenarios-grid');
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

  /**
   * Handle URL parameters for initial filtering
   */
  handleURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);

    // Check for category parameter
    const categoryParam = urlParams.get('category');
    if (categoryParam) {
      // Set the category filter
      const categorySelect = document.getElementById('category-filter');
      if (categorySelect) {
        categorySelect.value = categoryParam;
        this.filters.category = categoryParam;
        this.applyFiltersEnhanced();
      }
    }

    // Check for other filter parameters
    const difficultyParam = urlParams.get('difficulty');
    if (difficultyParam) {
      const difficultySelect = document.getElementById('difficulty-filter');
      if (difficultySelect) {
        difficultySelect.value = difficultyParam;
        this.filters.difficulty = difficultyParam;
      }
    }

    const searchParam = urlParams.get('search');
    if (searchParam) {
      const searchInput = document.getElementById('search-filter');
      if (searchInput) {
        searchInput.value = searchParam;
        this.filters.search = searchParam;
      }
    }
  }
}

// Global functions
window.clearAllFilters = function () {
  window.scenarioBrowser?.clearAllFilters();
};

window.previewScenario = function (_scenarioId) {
  // TODO: Implement scenario preview modal
  // Preview functionality will be added when modal system is integrated
};

// Initialize global instance
window.scenarioBrowser = null;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScenarioBrowser;
}

// ES6 module export
export default ScenarioBrowser;
