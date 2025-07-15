// Enhanced Forum JavaScript - Professional Community Discussion Platform
class EnhancedForum {
  constructor() {
    this.currentUser = null;
    this.currentView = 'card';
    this.currentSort = 'latest';
    this.currentCategory = 'all';
    this.currentFilters = {
      status: 'all',
      timeRange: 'all',
      author: 'all',
    };
    this.searchQuery = '';
    this.discussions = [];
    this.categories = [];
    this.isLoading = false;
    this.page = 1;
    this.hasMore = true;

    this.initializeEventListeners();
    this.loadInitialData();
    this.initializeModals();
    this.initializeSearch();
    this.initializeFilters();
    this.checkAuthStatus();
  }

  // ===== INITIALIZATION METHODS =====
  initializeEventListeners() {
    // Mobile menu toggle
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    if (mobileToggle) {
      mobileToggle.addEventListener('click', this.toggleMobileMenu.bind(this));
    }

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.querySelector('.search-btn');
    const searchToggle = document.querySelector('.search-toggle');

    if (searchInput) {
      searchInput.addEventListener(
        'input',
        this.debounce(this.handleSearch.bind(this), 300)
      );
      searchInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.handleSearch();
        }
      });
    }

    if (searchBtn) {
      searchBtn.addEventListener('click', this.handleSearch.bind(this));
    }

    if (searchToggle) {
      searchToggle.addEventListener('click', this.toggleSearchMode.bind(this));
    }

    // Filter controls
    const filterSelects = document.querySelectorAll('.filter-select');
    filterSelects.forEach(select => {
      select.addEventListener('change', this.handleFilterChange.bind(this));
    });

    const clearFiltersBtn = document.querySelector('.clear-filters');
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener(
        'click',
        this.clearAllFilters.bind(this)
      );
    }

    // View options
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const { view } = btn.dataset;
        this.setDiscussionView(view);
      });
    });

    // Category cards
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
      card.addEventListener('click', e => {
        e.preventDefault();
        const { category } = card.dataset;
        this.filterByCategory(category);
      });
    });

    // Load more functionality
    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener(
        'click',
        this.loadMoreDiscussions.bind(this)
      );
    }

    // Modal triggers
    const modalTriggers = document.querySelectorAll('[data-modal]');
    modalTriggers.forEach(trigger => {
      trigger.addEventListener('click', e => {
        e.preventDefault();
        const modalId = trigger.dataset.modal;
        this.openModal(modalId);
      });
    });

    // Auth buttons
    const authButtons = document.querySelectorAll('.auth-btn');
    authButtons.forEach(btn => {
      btn.addEventListener('click', this.handleAuthAction.bind(this));
    });

    // Scroll to top functionality
    this.initializeScrollToTop();

    // Keyboard navigation
    document.addEventListener(
      'keydown',
      this.handleKeyboardNavigation.bind(this)
    );

    // Intersection Observer for infinite scroll
    this.initializeInfiniteScroll();
  }

  loadInitialData() {
    this.showLoading('Loading forum content...');

    // Simulate API calls
    Promise.all([
      this.loadDiscussions(),
      this.loadCategories(),
      this.loadCommunityStats(),
    ])
      .then(() => {
        this.hideLoading();
        this.renderDiscussions();
        this.renderCategories();
        this.updateCommunityStats();
      })
      .catch(error => {
        console.error('Error loading initial data:', error);
        this.hideLoading();
        this.showNotification('Error loading forum content', 'error');
      });
  }

  // ===== DATA LOADING METHODS =====
  async loadDiscussions(reset = false) {
    if (reset) {
      this.page = 1;
      this.discussions = [];
      this.hasMore = true;
    }

    // Simulate API call
    return new Promise(resolve => {
      setTimeout(() => {
        const newDiscussions = this.generateMockDiscussions(20);
        this.discussions = reset
          ? newDiscussions
          : [...this.discussions, ...newDiscussions];
        this.hasMore = this.discussions.length < 100; // Simulate pagination limit
        resolve(newDiscussions);
      }, 500);
    });
  }

  async loadCategories() {
    return new Promise(resolve => {
      setTimeout(() => {
        this.categories = [
          {
            id: 'ai-ethics',
            name: 'AI Ethics',
            description:
              'Discussions about AI safety, bias, and ethical considerations',
            icon: '🤖',
            topics: 156,
            posts: 2847,
            color: '#3b82f6',
          },
          {
            id: 'simulations',
            name: 'Simulations',
            description: 'Share and discuss simulation scenarios and outcomes',
            icon: '🔬',
            topics: 234,
            posts: 4521,
            color: '#10b981',
          },
          {
            id: 'tutorials',
            name: 'Tutorials',
            description: 'Step-by-step guides and learning resources',
            icon: '📚',
            topics: 89,
            posts: 1632,
            color: '#f59e0b',
          },
          {
            id: 'feedback',
            name: 'Feedback',
            description: 'Platform feedback, bug reports, and feature requests',
            icon: '💬',
            topics: 145,
            posts: 892,
            color: '#8b5cf6',
          },
          {
            id: 'research',
            name: 'Research',
            description: 'Latest research papers and academic discussions',
            icon: '🧬',
            topics: 67,
            posts: 1234,
            color: '#ef4444',
          },
          {
            id: 'community',
            name: 'Community',
            description: 'General community discussions and introductions',
            icon: '👥',
            topics: 312,
            posts: 5678,
            color: '#06b6d4',
          },
        ];
        resolve(this.categories);
      }, 300);
    });
  }

  async loadCommunityStats() {
    return new Promise(resolve => {
      setTimeout(() => {
        this.communityStats = {
          totalMembers: 12547,
          activeDiscussions: 1203,
          totalPosts: 23456,
          onlineNow: 847,
        };
        resolve(this.communityStats);
      }, 200);
    });
  }

  generateMockDiscussions(count) {
    const titles = [
      'The Future of AI Bias Detection in Healthcare',
      'Implementing Ethical Guidelines in ML Models',
      'Best Practices for Simulation Scenario Design',
      'Understanding Algorithmic Transparency',
      'Community Guidelines for Research Sharing',
      'New Tutorial: Building Your First AI Ethics Assessment',
      'Feedback Needed: Platform Accessibility Features',
      'Research Discussion: Fairness in Automated Decision Making',
      'Simulation Results: Climate Change Impact Modeling',
      'Introducing Myself to the Community',
      'Advanced Techniques in Bias Mitigation',
      'Platform Feature Request: Dark Mode Support',
      'Latest Research on Explainable AI',
      'Tutorial Request: Ethics in Data Collection',
      'Discussion: The Role of Human Oversight in AI',
    ];

    const authors = [
      'Dr. Sarah Chen',
      'Alex Rodriguez',
      'Prof. Michael Johnson',
      'Emma Thompson',
      'David Kim',
      'Dr. Lisa Wang',
      'James Miller',
      'Maria Garcia',
      'Dr. Robert Brown',
      'Jennifer Lee',
    ];

    const categories = [
      'ai-ethics',
      'simulations',
      'tutorials',
      'feedback',
      'research',
      'community',
    ];

    const discussions = [];

    for (let i = 0; i < count; i++) {
      const randomTitle = titles[Math.floor(Math.random() * titles.length)];
      const randomAuthor = authors[Math.floor(Math.random() * authors.length)];
      const randomCategory =
        categories[Math.floor(Math.random() * categories.length)];
      const randomDate = new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      );

      discussions.push({
        id: `discussion-${Date.now()}-${i}`,
        title: randomTitle,
        author: randomAuthor,
        category: randomCategory,
        excerpt: this.generateExcerpt(randomTitle),
        tags: this.generateTags(),
        replies: Math.floor(Math.random() * 50),
        views: Math.floor(Math.random() * 500) + 10,
        likes: Math.floor(Math.random() * 25),
        createdAt: randomDate,
        lastActivity: new Date(
          randomDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000
        ),
        isPinned: Math.random() < 0.1,
        isFeatured: Math.random() < 0.05,
        status: Math.random() < 0.9 ? 'active' : 'closed',
      });
    }

    return discussions;
  }

  generateExcerpt(title) {
    const excerpts = [
      'This discussion explores the latest developments and challenges in the field...',
      'I would like to share some insights and get community feedback on...',
      'Looking for guidance and best practices regarding...',
      'Has anyone encountered similar issues when working with...',
      'Excited to announce new findings that could impact how we approach...',
      'Seeking collaboration on a research project focused on...',
      'Tutorial covering step-by-step implementation of...',
      'Community input needed for improving our understanding of...',
    ];
    return excerpts[Math.floor(Math.random() * excerpts.length)];
  }

  generateTags() {
    const allTags = [
      'machine-learning',
      'ethics',
      'bias-detection',
      'fairness',
      'transparency',
      'explainability',
      'research',
      'tutorial',
      'community',
      'feedback',
      'simulation',
      'healthcare',
      'education',
      'policy',
      'guidelines',
    ];
    const numTags = Math.floor(Math.random() * 4) + 1;
    const shuffled = allTags.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numTags);
  }

  // ===== SEARCH AND FILTER METHODS =====
  handleSearch() {
    const searchInput = document.getElementById('searchInput');
    this.searchQuery = searchInput ? searchInput.value.trim() : '';
    this.applyFiltersAndSearch();
  }

  handleFilterChange(event) {
    const filterType = event.target.dataset.filter;
    const filterValue = event.target.value;

    if (filterType) {
      this.currentFilters[filterType] = filterValue;
    }

    this.updateActiveFilters();
    this.applyFiltersAndSearch();
  }

  clearAllFilters() {
    this.currentFilters = {
      status: 'all',
      timeRange: 'all',
      author: 'all',
    };
    this.currentCategory = 'all';
    this.searchQuery = '';

    // Reset UI
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';

    const filterSelects = document.querySelectorAll('.filter-select');
    filterSelects.forEach(select => {
      select.value = 'all';
    });

    this.updateActiveFilters();
    this.applyFiltersAndSearch();
  }

  updateActiveFilters() {
    const activeFiltersContainer = document.querySelector('.filter-tags');
    if (!activeFiltersContainer) return;

    activeFiltersContainer.innerHTML = '';

    // Add active filter tags
    Object.entries(this.currentFilters).forEach(([key, value]) => {
      if (value !== 'all') {
        this.addFilterTag(activeFiltersContainer, key, value);
      }
    });

    if (this.currentCategory !== 'all') {
      this.addFilterTag(
        activeFiltersContainer,
        'category',
        this.currentCategory
      );
    }

    if (this.searchQuery) {
      this.addFilterTag(activeFiltersContainer, 'search', this.searchQuery);
    }

    // Show/hide active filters section
    const activeFiltersSection = document.querySelector('.active-filters');
    if (activeFiltersSection) {
      const hasActiveFilters = activeFiltersContainer.children.length > 0;
      activeFiltersSection.style.display = hasActiveFilters ? 'block' : 'none';
    }
  }

  addFilterTag(container, type, value) {
    const tag = document.createElement('span');
    tag.className = 'filter-tag';
    tag.innerHTML = `
            <span>${this.formatFilterLabel(type, value)}</span>
            <button class="filter-tag-remove" data-filter-type="${type}" data-filter-value="${value}">
                ×
            </button>
        `;

    const removeBtn = tag.querySelector('.filter-tag-remove');
    removeBtn.addEventListener('click', () => {
      this.removeFilter(type, value);
    });

    container.appendChild(tag);
  }

  formatFilterLabel(type, value) {
    const labels = {
      status: { active: 'Active', closed: 'Closed', pinned: 'Pinned' },
      timeRange: {
        today: 'Today',
        week: 'This Week',
        month: 'This Month',
        year: 'This Year',
      },
      author: { verified: 'Verified Authors', moderators: 'Moderators' },
      category: this.categories.reduce((acc, cat) => {
        acc[cat.id] = cat.name;
        return acc;
      }, {}),
      search: { [value]: `"${value}"` },
    };

    return labels[type]?.[value] || value;
  }

  removeFilter(type, value) {
    if (type === 'category') {
      this.currentCategory = 'all';
    } else if (type === 'search') {
      this.searchQuery = '';
      const searchInput = document.getElementById('searchInput');
      if (searchInput) searchInput.value = '';
    } else {
      this.currentFilters[type] = 'all';
      const filterSelect = document.querySelector(`[data-filter="${type}"]`);
      if (filterSelect) filterSelect.value = 'all';
    }

    this.updateActiveFilters();
    this.applyFiltersAndSearch();
  }

  applyFiltersAndSearch() {
    this.showLoading('Searching discussions...');

    // Simulate search delay
    setTimeout(() => {
      this.loadDiscussions(true).then(() => {
        this.renderDiscussions();
        this.hideLoading();
        this.updateResultsSummary();
      });
    }, 300);
  }

  filterByCategory(categoryId) {
    this.currentCategory = categoryId;
    this.updateActiveFilters();
    this.applyFiltersAndSearch();

    // Smooth scroll to discussions section
    const discussionsSection = document.querySelector(
      '.recent-discussions-section'
    );
    if (discussionsSection) {
      discussionsSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // ===== VIEW AND DISPLAY METHODS =====
  setDiscussionView(view) {
    this.currentView = view;

    // Update view buttons
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });

    // Update discussions container
    const discussionsContainer = document.querySelector(
      '.discussions-container'
    );
    if (discussionsContainer) {
      discussionsContainer.className = `discussions-container ${view}-view`;
    }

    this.renderDiscussions();
  }

  renderDiscussions() {
    const discussionsContainer = document.querySelector(
      '.discussions-container'
    );
    if (!discussionsContainer) return;

    if (this.discussions.length === 0) {
      discussionsContainer.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">🔍</div>
                    <h3>No discussions found</h3>
                    <p>Try adjusting your search criteria or filters.</p>
                    <button class="btn btn-primary" onclick="forum.clearAllFilters()">
                        Clear Filters
                    </button>
                </div>
            `;
      return;
    }

    discussionsContainer.innerHTML = this.discussions
      .map(discussion => this.renderDiscussionCard(discussion))
      .join('');

    // Add event listeners to discussion cards
    this.attachDiscussionListeners();
  }

  renderDiscussionCard(discussion) {
    const formattedDate = this.formatDate(discussion.createdAt);
    const lastActivity = this.formatRelativeTime(discussion.lastActivity);
    const categoryInfo = this.categories.find(
      cat => cat.id === discussion.category
    );

    return `
            <article class="discussion-card ${discussion.isPinned ? 'pinned' : ''}" data-discussion-id="${discussion.id}">
                ${discussion.isPinned ? '<div class="pinned-badge">📌 Pinned</div>' : ''}
                
                <div class="discussion-content">
                    <div class="discussion-header">
                        <span class="discussion-category" style="background: ${categoryInfo?.color || '#6b7280'}">
                            ${categoryInfo?.icon || '💬'} ${categoryInfo?.name || 'General'}
                        </span>
                        <span class="discussion-date">${formattedDate}</span>
                    </div>
                    
                    <h2>
                        <a href="#" data-discussion-id="${discussion.id}">
                            ${this.highlightSearchTerms(discussion.title)}
                        </a>
                    </h2>
                    
                    <p class="discussion-preview">
                        ${this.highlightSearchTerms(discussion.excerpt)}
                    </p>
                    
                    <div class="discussion-tags">
                        ${discussion.tags
                          .map(
                            tag =>
                              `<a href="#" class="tag" data-tag="${tag}">#${tag}</a>`
                          )
                          .join('')}
                    </div>
                    
                    <div class="discussion-footer">
                        <div class="discussion-author">
                            ${this.renderUserAvatar(discussion)}
                            <span>${discussion.author}</span>
                        </div>
                        
                        <div class="discussion-stats">
                            <span title="Replies">💬 ${discussion.replies}</span>
                            <span title="Views">👁️ ${discussion.views}</span>
                            <span title="Likes">❤️ ${discussion.likes}</span>
                            <span class="last-activity" title="Last Activity">🕒 ${lastActivity}</span>
                        </div>
                    </div>
                </div>
            </article>
        `;
  }

  renderCategories() {
    const categoriesGrid = document.querySelector('.categories-grid');
    if (!categoriesGrid) return;

    categoriesGrid.innerHTML = this.categories
      .map(
        category => `
            <div class="category-card" data-category="${category.id}">
                <div class="category-icon" style="color: ${category.color}">${category.icon}</div>
                <h3 class="category-title">${category.name}</h3>
                <p class="category-description">${category.description}</p>
                <div class="category-stats">
                    <div class="stat-item">
                        <span class="stat-number">${category.topics}</span>
                        <span class="stat-label">Topics</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${category.posts}</span>
                        <span class="stat-label">Posts</span>
                    </div>
                </div>
            </div>
        `
      )
      .join('');
  }

  updateCommunityStats() {
    if (!this.communityStats) return;

    const statNumbers = document.querySelectorAll('.stat-number');
    const stats = [
      this.communityStats.totalMembers,
      this.communityStats.activeDiscussions,
      this.communityStats.totalPosts,
      this.communityStats.onlineNow,
    ];

    statNumbers.forEach((element, index) => {
      if (stats[index] !== undefined) {
        this.animateNumber(element, stats[index]);
      }
    });
  }

  updateResultsSummary() {
    const resultsCount = document.querySelector('.results-count');
    const resultsMeta = document.querySelector('.results-meta');

    if (resultsCount) {
      resultsCount.textContent = `Showing ${this.discussions.length} discussions`;
    }

    if (resultsMeta) {
      const filterCount = Object.values(this.currentFilters).filter(
        v => v !== 'all'
      ).length;
      const totalFilters = this.searchQuery ? filterCount + 1 : filterCount;
      if (this.currentCategory !== 'all') totalFilters++;

      resultsMeta.textContent =
        totalFilters > 0
          ? `${totalFilters} filter${totalFilters > 1 ? 's' : ''} applied`
          : 'No filters applied';
    }
  }

  // ===== MODAL METHODS =====
  initializeModals() {
    // Close modal when clicking overlay
    document.addEventListener('click', e => {
      if (e.target.classList.contains('modal-overlay')) {
        this.closeModal();
      }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    });

    // Modal close buttons
    document.addEventListener('click', e => {
      if (e.target.classList.contains('modal-close')) {
        this.closeModal();
      }
    });

    // Thread modal specific handlers
    const closeThreadModal = document.getElementById('close-thread-modal');
    if (closeThreadModal) {
      closeThreadModal.addEventListener('click', () => {
        this.hideThreadModal();
      });
    }

    // Reply form submission
    const replyForm = document.getElementById('reply-form');
    if (replyForm) {
      replyForm.addEventListener('submit', e => {
        e.preventDefault();
        this.handleReplySubmission();
      });
    }

    // Cancel reply button
    const cancelReplyBtn = document.getElementById('cancel-reply-btn');
    if (cancelReplyBtn) {
      cancelReplyBtn.addEventListener('click', () => {
        this.cancelReply();
      });
    }

    // Login buttons in thread modal
    const loginToReplyBtn = document.getElementById('login-to-reply-btn');
    const signupToReplyBtn = document.getElementById('signup-to-reply-btn');

    if (loginToReplyBtn) {
      loginToReplyBtn.addEventListener('click', () => {
        this.showAuthModal('login');
      });
    }

    if (signupToReplyBtn) {
      signupToReplyBtn.addEventListener('click', () => {
        this.showAuthModal('signup');
      });
    }

    // Thread modal overlay click to close
    const threadModal = document.getElementById('discussion-thread-modal');
    if (threadModal) {
      threadModal.addEventListener('click', e => {
        if (e.target === threadModal) {
          this.hideThreadModal();
        }
      });
    }
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Focus management
    const firstFocusable = modal.querySelector(
      'input, textarea, button, select, [tabindex="0"]'
    );
    if (firstFocusable) {
      firstFocusable.focus();
    }

    // Initialize modal-specific functionality
    if (modalId === 'newDiscussionModal') {
      this.initializeDiscussionForm();
    }
  }

  closeModal() {
    const activeModal = document.querySelector('.modal-overlay[style*="flex"]');
    if (activeModal) {
      activeModal.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  initializeDiscussionForm() {
    const form = document.getElementById('newDiscussionForm');
    if (!form) return;

    form.addEventListener('submit', this.handleDiscussionSubmit.bind(this));

    // Initialize rich text editor simulation
    this.initializeContentEditor();

    // Character counter
    const textarea = form.querySelector('#discussionContent');
    const counter = form.querySelector('.char-counter');
    if (textarea && counter) {
      textarea.addEventListener('input', () => {
        const count = textarea.value.length;
        counter.textContent = `${count}/5000 characters`;
        counter.style.color = count > 4500 ? '#ef4444' : '#6b7280';
      });
    }
  }

  initializeContentEditor() {
    const toolbar = document.querySelector('.editor-toolbar');
    if (!toolbar) return;

    const buttons = toolbar.querySelectorAll('.toolbar-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const { action } = btn.dataset;
        this.handleEditorAction(action);
      });
    });
  }

  handleEditorAction(action) {
    const textarea = document.getElementById('discussionContent');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    let replacement = '';

    switch (action) {
      case 'bold':
        replacement = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        replacement = `*${selectedText || 'italic text'}*`;
        break;
      case 'link':
        const url = prompt('Enter URL:');
        if (url) {
          replacement = `[${selectedText || 'link text'}](${url})`;
        }
        break;
      case 'code':
        replacement = `\`${selectedText || 'code'}\``;
        break;
      case 'quote':
        replacement = `> ${selectedText || 'quoted text'}`;
        break;
      case 'list':
        replacement = `- ${selectedText || 'list item'}`;
        break;
    }

    if (replacement) {
      textarea.value =
        text.substring(0, start) + replacement + text.substring(end);
      textarea.focus();
      textarea.setSelectionRange(
        start + replacement.length,
        start + replacement.length
      );
    }
  }

  handleDiscussionSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const discussionData = {
      title: formData.get('title'),
      category: formData.get('category'),
      content: formData.get('content'),
      tags:
        formData
          .get('tags')
          ?.split(',')
          .map(tag => tag.trim()) || [],
      allowComments: formData.get('allowComments') === 'on',
      notifyReplies: formData.get('notifyReplies') === 'on',
      isPinned: formData.get('isPinned') === 'on',
    };

    this.showLoading('Creating discussion...');

    // Simulate API call
    setTimeout(() => {
      this.hideLoading();
      this.closeModal();
      this.showNotification('Discussion created successfully!', 'success');

      // Add new discussion to the list
      const newDiscussion = {
        id: `discussion-${Date.now()}`,
        title: discussionData.title,
        author: this.currentUser?.name || 'You',
        category: discussionData.category,
        excerpt: `${discussionData.content.substring(0, 150)}...`,
        tags: discussionData.tags,
        replies: 0,
        views: 1,
        likes: 0,
        createdAt: new Date(),
        lastActivity: new Date(),
        isPinned: discussionData.isPinned,
        isFeatured: false,
        status: 'active',
      };

      this.discussions.unshift(newDiscussion);
      this.renderDiscussions();

      // Reset form
      event.target.reset();
    }, 1000);
  }

  // ===== UTILITY METHODS =====
  formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  }

  formatRelativeTime(date) {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return this.formatDate(date);
  }

  highlightSearchTerms(text) {
    if (!this.searchQuery) return text;

    const regex = new RegExp(`(${this.searchQuery})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  animateNumber(element, targetNumber) {
    const duration = 2000;
    const startTime = Date.now();
    const startNumber = 0;

    const updateNumber = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const currentNumber = Math.floor(
        startNumber + (targetNumber - startNumber) * progress
      );
      element.textContent = this.formatNumber(currentNumber);

      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      }
    };

    updateNumber();
  }

  formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // ===== LOADING AND NOTIFICATIONS =====
  showLoading(message = 'Loading...') {
    this.isLoading = true;

    let loadingElement = document.querySelector('.loading-enhanced');
    if (!loadingElement) {
      loadingElement = document.createElement('div');
      loadingElement.className = 'loading-enhanced';
      document.body.appendChild(loadingElement);
    }

    loadingElement.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <div class="loading-content">
                    <div class="loading-text">${message}</div>
                    <div class="loading-subtext">Please wait a moment</div>
                </div>
                <div class="loading-progress">
                    <div class="progress-bar"></div>
                </div>
            </div>
        `;

    loadingElement.style.display = 'flex';
  }

  hideLoading() {
    this.isLoading = false;
    const loadingElement = document.querySelector('.loading-enhanced');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    ${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
                </div>
                <div class="notification-message">${message}</div>
                <button class="notification-close">×</button>
            </div>
        `;

    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      notification.remove();
    });

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }

  // ===== ADDITIONAL FUNCTIONALITY =====
  toggleMobileMenu() {
    const nav = document.querySelector('.header-nav');
    const toggle = document.querySelector('.mobile-menu-toggle');

    if (nav && toggle) {
      nav.classList.toggle('mobile-open');
      toggle.classList.toggle('active');
    }
  }

  toggleSearchMode() {
    const searchBox = document.querySelector('.search-box');
    if (searchBox) {
      searchBox.classList.toggle('expanded');
      const input = searchBox.querySelector('input');
      if (input) input.focus();
    }
  }

  initializeSearch() {
    // Enhanced search functionality would go here
    // Including autocomplete, search suggestions, etc.
  }

  initializeFilters() {
    // Enhanced filter functionality would go here
    // Including saved filters, custom filter creation, etc.
  }

  checkAuthStatus() {
    // Simulate checking authentication status
    this.currentUser = {
      id: 'user-123',
      name: 'Guest User',
      email: 'guest@example.com',
      avatar: null,
      isAuthenticated: false,
    };

    this.updateAuthUI();
  }

  updateAuthUI() {
    const authSection = document.querySelector('.auth-section');
    if (!authSection) return;

    if (this.currentUser.isAuthenticated) {
      authSection.innerHTML = `
                <div class="user-menu">
                    <div class="user-avatar">${this.currentUser.name.charAt(0)}</div>
                    <span class="user-name">${this.currentUser.name}</span>
                    <i class="fas fa-chevron-down"></i>
                </div>
            `;
    } else {
      authSection.innerHTML = `
                <div class="auth-buttons">
                    <button class="btn btn-outline auth-btn" data-action="login">Sign In</button>
                    <button class="btn btn-primary auth-btn" data-action="register">Join Community</button>
                </div>
            `;
    }
  }

  handleAuthAction(event) {
    const { action } = event.target.dataset;

    if (action === 'login') {
      this.showNotification(
        'Login functionality would be implemented here',
        'info'
      );
    } else if (action === 'register') {
      this.showNotification(
        'Registration functionality would be implemented here',
        'info'
      );
    }
  }

  attachDiscussionListeners() {
    // Discussion card clicks
    const discussionLinks = document.querySelectorAll('[data-discussion-id]');
    discussionLinks.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const { discussionId } = link.dataset;
        this.viewDiscussion(discussionId);
      });
    });

    // Tag clicks
    const tagLinks = document.querySelectorAll('.tag[data-tag]');
    tagLinks.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const { tag } = link.dataset;
        this.searchByTag(tag);
      });
    });
  }

  viewDiscussion(discussionId) {
    const discussion = this.discussions.find(d => d.id === discussionId);
    if (!discussion) {
      this.showNotification('Discussion not found', 'error');
      return;
    }

    this.showThreadModal(discussion);
  }

  showThreadModal(discussion) {
    const modal = document.getElementById('discussion-thread-modal');
    if (!modal) return;

    // Set current thread ID for reply tracking
    this.currentThreadId = discussion.id;

    // Update thread content
    this.populateThreadModal(discussion);

    // Load replies
    this.loadThreadReplies(discussion.id);

    // Show modal
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Update UI based on auth status
    this.updateReplyFormForAuth();
  }

  populateThreadModal(discussion) {
    // Update modal title
    document.getElementById('thread-title').textContent = discussion.title;

    // Update original post
    document.getElementById('op-name').textContent = discussion.author;
    document.getElementById('op-tier').textContent = this.getAuthorTier(
      discussion.authorTier || 1
    );
    document.getElementById('op-date').textContent = this.formatRelativeTime(
      discussion.createdAt
    );
    document.getElementById('op-content').innerHTML = this.formatPostContent(
      discussion.content || discussion.excerpt
    );

    // Update thread stats
    document.getElementById('thread-views').textContent = discussion.views || 0;
    document.getElementById('thread-replies').textContent =
      discussion.replies || 0;
    document.getElementById('thread-likes').textContent = discussion.likes || 0;
    document.getElementById('replies-count').textContent =
      discussion.replies || 0;

    // Update tags
    const tagsContainer = document.getElementById('op-tags');
    tagsContainer.innerHTML = discussion.tags
      .map(tag => `<span class="post-tag">${tag}</span>`)
      .join('');
  }

  async loadThreadReplies(discussionId) {
    const repliesContainer = document.getElementById('replies-container');
    repliesContainer.innerHTML =
      '<div class="loading-replies">Loading replies...</div>';

    try {
      // Simulate loading replies - in real implementation, this would fetch from API
      const replies = await this.fetchThreadReplies(discussionId);
      this.renderThreadReplies(replies);
    } catch (error) {
      console.error('Error loading replies:', error);
      repliesContainer.innerHTML =
        '<div class="error-loading">Failed to load replies</div>';
    }
  }

  async fetchThreadReplies(discussionId) {
    // Simulate API call - replace with actual API integration
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          {
            id: 'reply1',
            author: 'Dr. Sarah Chen',
            avatar: 'emoji:🧠',
            authorTier: 2,
            content:
              "This is a very thoughtful discussion. I've been researching similar patterns in algorithmic bias detection...",
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            likes: 5,
            helpful: true,
          },
          {
            id: 'reply2',
            author: 'Alex Rodriguez',
            avatar: 'emoji:🚀',
            authorTier: 1,
            content:
              "Great points! I'd like to add that we've seen similar issues in our educational simulations.",
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
            likes: 2,
            helpful: false,
          },
        ]);
      }, 500);
    });
  }

  renderThreadReplies(replies) {
    const repliesContainer = document.getElementById('replies-container');

    if (!replies || replies.length === 0) {
      repliesContainer.innerHTML = `
        <div class="no-replies">
          <i class="fas fa-comments"></i>
          <h3>No replies yet</h3>
          <p>Be the first to reply to this discussion!</p>
        </div>
      `;
      return;
    }

    repliesContainer.innerHTML = replies
      .map(reply => this.renderReplyItem(reply))
      .join('');

    // Add event listeners to reply actions
    this.attachReplyListeners();
  }

  renderReplyItem(reply) {
    const formattedDate = this.formatRelativeTime(reply.createdAt);
    const authorTier = this.getAuthorTier(reply.authorTier);

    return `
      <div class="reply-item" data-reply-id="${reply.id}">
        <div class="reply-header">
          <div class="reply-author">
            ${this.renderUserAvatar(reply)}
            <div class="reply-author-details">
              <div class="reply-author-name">${reply.author}</div>
              <div class="reply-meta">
                <span class="author-tier">${authorTier}</span>
                <span class="reply-date">${formattedDate}</span>
                ${reply.helpful ? '<span class="helpful-badge">✅ Helpful</span>' : ''}
              </div>
            </div>
          </div>
          <div class="reply-actions">
            <button class="btn btn-outline btn-small like-reply" data-reply-id="${reply.id}">
              <i class="fas fa-thumbs-up"></i>
              ${reply.likes || 0}
            </button>
            <button class="btn btn-outline btn-small reply-to-reply" data-reply-id="${reply.id}">
              <i class="fas fa-reply"></i>
              Reply
            </button>
          </div>
        </div>
        <div class="reply-content">
          ${this.formatPostContent(reply.content)}
        </div>
        <div class="reply-footer">
          <div class="reply-reactions">
            <div class="reply-reaction ${reply.likes > 0 ? 'active' : ''}" data-reaction="like">
              <i class="fas fa-thumbs-up"></i>
              <span>${reply.likes || 0}</span>
            </div>
          </div>
          <div class="reply-time">${formattedDate}</div>
        </div>
      </div>
    `;
  }

  attachReplyListeners() {
    // Like buttons
    document.querySelectorAll('.like-reply').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const { replyId } = btn.dataset;
        this.likeReply(replyId);
      });
    });

    // Reply to reply buttons
    document.querySelectorAll('.reply-to-reply').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const { replyId } = btn.dataset;
        this.replyToReply(replyId);
      });
    });

    // Reaction buttons
    document.querySelectorAll('.reply-reaction').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const { replyId } = btn.closest('.reply-item').dataset;
        const { reaction } = btn.dataset;
        this.toggleReaction(replyId, reaction);
      });
    });
  }

  updateReplyFormForAuth() {
    const replyFormSection = document.getElementById('reply-form-section');
    const loginRequiredSection = document.getElementById(
      'login-required-reply'
    );

    if (this.currentUser) {
      replyFormSection.style.display = 'block';
      loginRequiredSection.style.display = 'none';

      // Update user info in reply form
      document.getElementById('reply-user-name').textContent =
        this.currentUser.displayName || 'You';

      const userAvatar = document.getElementById('reply-user-avatar');
      if (
        this.currentUser.avatar &&
        this.isEmojiAvatar(this.currentUser.avatar)
      ) {
        const emoji = this.getEmojiFromAvatar(this.currentUser.avatar);
        userAvatar.textContent = emoji;
        userAvatar.className = 'user-avatar emoji-avatar';
      } else {
        userAvatar.textContent = (this.currentUser.displayName || 'U').charAt(
          0
        );
        userAvatar.className = 'user-avatar';
      }

      // Update status banner based on user tier
      this.updateReplyStatusBanner();
    } else {
      replyFormSection.style.display = 'none';
      loginRequiredSection.style.display = 'block';
    }
  }

  updateReplyStatusBanner() {
    const banner = document.getElementById('reply-status-banner');
    const icon = document.getElementById('reply-status-icon');
    const message = document.getElementById('reply-status-message');

    // This would check user's contribution status
    const userTier = this.currentUser?.tier || 0;

    if (userTier >= 2) {
      banner.className = 'status-banner success';
      banner.style.display = 'flex';
      icon.textContent = '👑';
      message.textContent =
        'Your reply will be posted immediately as a valued contributor.';
    } else if (userTier >= 1) {
      banner.className = 'status-banner';
      banner.style.display = 'flex';
      icon.textContent = 'ℹ️';
      message.textContent = 'Your reply will be posted immediately.';
    } else {
      banner.className = 'status-banner warning';
      banner.style.display = 'flex';
      icon.textContent = '⏳';
      message.textContent =
        'Your reply may require moderation before appearing.';
    }
  }

  likeReply(_replyId) {
    if (!this.currentUser) {
      this.showNotification('Please sign in to like replies', 'warning');
      return;
    }

    // Implement like functionality
    this.showNotification('Reply liked!', 'success');
  }

  replyToReply(replyId) {
    if (!this.currentUser) {
      this.showNotification('Please sign in to reply', 'warning');
      return;
    }

    // Focus reply form and add mention
    const replyForm = document.getElementById('reply-content');
    const reply = document.querySelector(`[data-reply-id="${replyId}"]`);
    const authorName = reply.querySelector('.reply-author-name').textContent;

    replyForm.focus();
    replyForm.value = `@${authorName} `;

    // Scroll to reply form
    document
      .getElementById('reply-form-section')
      .scrollIntoView({ behavior: 'smooth' });
  }

  toggleReaction(replyId, reaction) {
    if (!this.currentUser) {
      this.showNotification('Please sign in to react', 'warning');
      return;
    }

    // Implement reaction toggle
    this.showNotification(`Reaction ${reaction} toggled!`, 'success');
  }

  formatPostContent(content) {
    if (!content) return '';

    // Basic markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  getAuthorTier(tier) {
    const tiers = {
      0: 'Community Member',
      1: '🔬 Research Contributor',
      2: '⭐ Community Supporter',
      3: '👑 Education Patron',
    };
    return tiers[tier] || 'Community Member';
  }

  async handleReplySubmission() {
    if (!this.currentUser) {
      this.showNotification('Please sign in to reply', 'error');
      return;
    }

    const form = document.getElementById('reply-form');
    const submitBtn = document.getElementById('submit-reply-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const originalText = btnText.textContent;

    try {
      // Show loading state
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      // Get form data
      const formData = new FormData(form);
      const replyData = {
        content: formData.get('content').trim(),
        notifications: formData.get('notifications') === 'on',
        anonymous: formData.get('anonymous') === 'on',
        threadId: this.currentThreadId,
      };

      // Validate content
      if (!replyData.content) {
        throw new Error('Please enter your reply content');
      }

      if (replyData.content.length < 10) {
        throw new Error('Reply must be at least 10 characters long');
      }

      // Show status message
      this.showReplyStatus('Submitting your reply...', 'info');

      // Submit through ContributionService if available
      let result;
      if (window.contributionService) {
        result = await window.contributionService.submitReply({
          type: 'forum-reply',
          threadId: replyData.threadId,
          content: replyData.content,
          anonymous: replyData.anonymous,
          metadata: {
            wordCount: replyData.content.split(/\s+/).length,
            submissionSource: 'forum-thread',
          },
        });
      } else {
        // Fallback to local submission
        result = await this.submitReplyLocal(replyData);
      }

      // Show success message
      if (result.autoApproved) {
        this.showReplyStatus('Your reply has been posted!', 'success');
        // Add reply to the thread immediately
        this.addReplyToThread(result.reply);
      } else {
        this.showReplyStatus(
          'Your reply has been submitted for review',
          'info'
        );
      }

      // Clear form
      form.reset();

      // Hide status after delay
      setTimeout(() => {
        this.hideReplyStatus();
      }, 3000);
    } catch (error) {
      console.error('Reply submission error:', error);
      this.showReplyStatus(`Failed to submit reply: ${error.message}`, 'error');
    } finally {
      // Reset button state
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      btnText.textContent = originalText;
    }
  }

  async submitReplyLocal(replyData) {
    // Simulate API submission for demonstration
    return new Promise(resolve => {
      setTimeout(() => {
        const newReply = {
          id: `reply_${Date.now()}`,
          author: this.currentUser.displayName || 'User',
          authorTier: this.currentUser.donorTier || 0,
          content: replyData.content,
          createdAt: new Date(),
          likes: 0,
          helpful: false,
          threadId: replyData.threadId,
        };

        resolve({
          autoApproved: true,
          reply: newReply,
        });
      }, 1000);
    });
  }

  addReplyToThread(reply) {
    const repliesContainer = document.getElementById('replies-container');

    // Check if no replies message exists and remove it
    const noRepliesMsg = repliesContainer.querySelector('.no-replies');
    if (noRepliesMsg) {
      noRepliesMsg.remove();
    }

    // Add new reply to the top
    const replyHtml = this.renderReplyItem(reply);
    repliesContainer.insertAdjacentHTML('afterbegin', replyHtml);

    // Update reply count
    const currentCount =
      parseInt(document.getElementById('replies-count').textContent) || 0;
    document.getElementById('replies-count').textContent = currentCount + 1;
    document.getElementById('thread-replies').textContent = currentCount + 1;

    // Reattach listeners
    this.attachReplyListeners();

    // Scroll to new reply
    const newReplyElement = repliesContainer.firstElementChild;
    newReplyElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  showReplyStatus(message, type) {
    const statusBanner = document.getElementById('reply-status-banner');
    const statusIcon = document.getElementById('reply-status-icon');
    const statusMessage = document.getElementById('reply-status-message');

    if (!statusBanner) return;

    statusBanner.style.display = 'flex';
    statusBanner.className = `status-banner ${type}`;

    const icons = {
      success: '✅',
      error: '❌',
      info: 'ℹ️',
      warning: '⚠️',
    };

    statusIcon.textContent = icons[type] || 'ℹ️';
    statusMessage.textContent = message;
  }

  hideReplyStatus() {
    const statusBanner = document.getElementById('reply-status-banner');
    if (statusBanner) {
      statusBanner.style.display = 'none';
    }
  }

  cancelReply() {
    const form = document.getElementById('reply-form');
    form.reset();
    this.hideReplyStatus();
  }

  hideThreadModal() {
    const modal = document.getElementById('discussion-thread-modal');
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';

    // Clear reply form
    document.getElementById('reply-form').reset();
  }

  searchByTag(tag) {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.value = `#${tag}`;
      this.handleSearch();
    }
  }

  loadMoreDiscussions() {
    if (this.isLoading || !this.hasMore) return;

    this.page++;
    this.showLoading('Loading more discussions...');

    this.loadDiscussions().then(() => {
      this.renderDiscussions();
      this.hideLoading();
      this.updateResultsSummary();
    });
  }

  initializeInfiniteScroll() {
    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (!loadMoreBtn) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && this.hasMore && !this.isLoading) {
            this.loadMoreDiscussions();
          }
        });
      },
      {
        rootMargin: '100px',
      }
    );

    observer.observe(loadMoreBtn);
  }

  initializeScrollToTop() {
    // Create scroll to top button
    const scrollBtn = document.createElement('button');
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.innerHTML = '↑';
    scrollBtn.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: var(--primary-color);
            color: white;
            border: none;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            cursor: pointer;
            display: none;
            z-index: 1000;
            box-shadow: var(--shadow-lg);
            transition: var(--transition-fast);
        `;

    scrollBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.body.appendChild(scrollBtn);

    // Show/hide scroll button
    window.addEventListener('scroll', () => {
      scrollBtn.style.display = window.pageYOffset > 500 ? 'block' : 'none';
    });
  }

  handleKeyboardNavigation(event) {
    // Implement keyboard shortcuts
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'k':
          event.preventDefault();
          const searchInput = document.getElementById('searchInput');
          if (searchInput) searchInput.focus();
          break;
        case 'n':
          event.preventDefault();
          this.openModal('newDiscussionModal');
          break;
      }
    }

    if (event.key === 'Escape') {
      this.closeModal();
    }
  }

  // ===== AVATAR HELPER METHODS =====

  /**
   * Check if avatar is an emoji type
   */
  isEmojiAvatar(avatarURL) {
    return avatarURL && avatarURL.startsWith('emoji:');
  }

  /**
   * Get emoji from emoji avatar URL
   */
  getEmojiFromAvatar(avatarURL) {
    if (this.isEmojiAvatar(avatarURL)) {
      return avatarURL.replace('emoji:', '');
    }
    return null;
  }

  /**
   * Render user avatar (emoji or traditional)
   */
  renderUserAvatar(user) {
    if (user.avatar && this.isEmojiAvatar(user.avatar)) {
      const emoji = this.getEmojiFromAvatar(user.avatar);
      return `<div class="author-avatar emoji-avatar">${emoji}</div>`;
    } else if (user.avatar && !this.isEmojiAvatar(user.avatar)) {
      return `<img src="${user.avatar}" alt="${user.name}" class="author-avatar-img" />`;
    } else {
      // Fallback to first letter
      return `<div class="author-avatar">${user.name?.charAt(0) || '?'}</div>`;
    }
  }
}

// Initialize the enhanced forum when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.forum = new EnhancedForum();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnhancedForum;
}
