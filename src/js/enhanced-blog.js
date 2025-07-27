/**
 * Enhanced Blog Functionality - Professional Research & Community Platform
 * Copyright 2025 SimulateAI Educational Platform
 */

// Enhanced Blog Management System
class EnhancedBlogManager {
  constructor() {
    this.posts = [];
    this.filteredPosts = [];
    this.categories = [];
    this.currentPage = 1;
    this.postsPerPage = 10;
    this.isLoading = false;
    this.currentView = "grid";
    this.activeFilters = {};
    this.searchQuery = "";
    this.currentCarouselIndex = 0;
    this.carouselInterval = null;

    this.init();
  }

  async init() {
    this.setupEventListeners();
    this.initializeUI();
    await this.loadBlogPosts();
    this.initializeCarousel();
    this.updateStats();
  }

  setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById("blog-search");
    if (searchInput) {
      searchInput.addEventListener(
        "input",
        this.debounce((e) => {
          this.searchQuery = e.target.value;
          this.filterPosts();
        }, 300),
      );
    }

    // Filter functionality
    this.setupFilterListeners();

    // View toggle
    this.setupViewToggle();

    // Modal management
    this.setupModalListeners();

    // Carousel controls
    this.setupCarouselControls();

    // Load more functionality
    this.setupLoadMore();

    // Newsletter subscription
    this.setupNewsletterSubscription();

    // Category navigation
    this.setupCategoryNavigation();

    // Scroll enhancements
    this.setupScrollEnhancements();
  }

  setupFilterListeners() {
    const filters = ["category-filter", "author-filter", "sort-filter"];

    filters.forEach((filterId) => {
      const filterElement = document.getElementById(filterId);
      if (filterElement) {
        filterElement.addEventListener("change", (e) => {
          const filterType = filterId.replace("-filter", "");
          if (e.target.value) {
            this.activeFilters[filterType] = e.target.value;
          } else {
            delete this.activeFilters[filterType];
          }
          this.filterPosts();
          this.updateActiveFiltersDisplay();
        });
      }
    });

    // Clear filters button
    const clearFiltersBtn = document.getElementById("clear-filters");
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener("click", () => {
        this.clearAllFilters();
      });
    }
  }

  setupViewToggle() {
    const viewButtons = document.querySelectorAll(".view-btn");
    viewButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const { view } = e.target.closest(".view-btn").dataset;
        this.switchView(view);
      });
    });
  }

  setupModalListeners() {
    // Write post modal
    const writePostBtn = document.getElementById("write-post-btn");
    const writePostModal = document.getElementById("write-post-modal");
    const modalClose = writePostModal?.querySelector(".modal-close");

    if (writePostBtn && writePostModal) {
      writePostBtn.addEventListener("click", () => {
        this.openModal("write-post-modal");
      });
    }

    if (modalClose) {
      modalClose.addEventListener("click", () => {
        this.closeModal("write-post-modal");
      });
    }

    // Close modal on overlay click
    if (writePostModal) {
      writePostModal.addEventListener("click", (e) => {
        if (e.target === writePostModal) {
          this.closeModal("write-post-modal");
        }
      });
    }

    // Form submission
    this.setupFormSubmission();
  }

  setupCarouselControls() {
    const prevBtn = document.querySelector(".carousel-prev");
    const nextBtn = document.querySelector(".carousel-next");

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        this.previousSlide();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        this.nextSlide();
      });
    }

    // Auto-play carousel
    this.startCarouselAutoPlay();
  }

  setupLoadMore() {
    const loadMoreBtn = document.getElementById("load-more-btn");
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener("click", () => {
        this.loadMorePosts();
      });
    }

    const jumpToTopBtn = document.getElementById("jump-to-top");
    if (jumpToTopBtn) {
      jumpToTopBtn.addEventListener("click", () => {
        this.scrollToTop();
      });
    }
  }

  setupNewsletterSubscription() {
    const newsletterForm = document.getElementById("newsletter-form");
    if (newsletterForm) {
      newsletterForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleNewsletterSubscription(e);
      });
    }
  }

  setupCategoryNavigation() {
    const categoryCards = document.querySelectorAll(".category-card");
    categoryCards.forEach((card) => {
      card.addEventListener("click", (e) => {
        const { category } = e.currentTarget.dataset;
        this.filterByCategory(category);
      });
    });
  }

  setupScrollEnhancements() {
    // Smooth scroll for anchor links
    document.addEventListener("click", (e) => {
      if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const target = document.querySelector(e.target.getAttribute("href"));
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    });

    // Intersection Observer for animations
    this.setupScrollAnimations();
  }

  setupScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
        }
      });
    }, observerOptions);

    // Observe elements for animations
    const animateElements = document.querySelectorAll(
      ".post-card, .category-card, .stat-item",
    );
    animateElements.forEach((el) => observer.observe(el));
  }

  async loadBlogPosts() {
    this.showLoading();

    try {
      // Simulate API call - replace with actual endpoint
      await this.delay(1000);

      this.posts = this.generateSamplePosts();
      this.filteredPosts = [...this.posts];
      this.categories = this.extractCategories();

      this.renderPosts();
      this.renderFeaturedPosts();
      this.updateResultsCount();
    } catch (error) {
      console.error("Error loading blog posts:", error);
      this.showError("Failed to load blog posts. Please try again.");
    } finally {
      this.hideLoading();
    }
  }

  generateSamplePosts() {
    const samplePosts = [
      {
        id: 1,
        title: "Addressing Algorithmic Bias in Educational AI Systems",
        excerpt:
          "A comprehensive analysis of bias detection and mitigation strategies in AI-powered educational platforms, focusing on equitable learning outcomes across diverse student populations.",
        category: "ai-bias",
        categoryIcon: "🎯",
        categoryName: "AI Bias & Fairness",
        author: "Dr. Sarah Chen",
        authorType: "researchers",
        authorAvatar: "SC",
        publishDate: "2025-01-15",
        readTime: 8,
        tags: [
          "algorithmic-bias",
          "educational-ai",
          "equity",
          "machine-learning",
        ],
        image: "🎯",
        featured: true,
        views: 2847,
        likes: 156,
        comments: 23,
        content: "Full article content would go here...",
        trending: true,
      },
      {
        id: 2,
        title:
          "Simulation-Based Ethics Training: A New Paradigm for AI Education",
        excerpt:
          "Exploring how immersive ethical scenarios and simulation-based learning can enhance understanding of complex AI ethics principles in educational settings.",
        category: "education",
        categoryIcon: "📚",
        categoryName: "Educational Methods",
        author: "Prof. Michael Rodriguez",
        authorType: "educators",
        authorAvatar: "MR",
        publishDate: "2025-01-12",
        readTime: 12,
        tags: [
          "simulation-learning",
          "ethics-education",
          "pedagogy",
          "immersive-learning",
        ],
        image: "📚",
        featured: true,
        views: 1923,
        likes: 89,
        comments: 17,
        content: "Full article content would go here...",
        popular: true,
      },
      {
        id: 3,
        title: "Privacy-Preserving Techniques in Educational Data Analytics",
        excerpt:
          "An in-depth look at differential privacy, federated learning, and other techniques for protecting student data while enabling valuable educational insights.",
        category: "privacy",
        categoryIcon: "🔒",
        categoryName: "Privacy & Security",
        author: "Dr. Emily Watson",
        authorType: "researchers",
        authorAvatar: "EW",
        publishDate: "2025-01-10",
        readTime: 15,
        tags: [
          "data-privacy",
          "educational-analytics",
          "differential-privacy",
          "federated-learning",
        ],
        image: "🔒",
        featured: false,
        views: 1456,
        likes: 67,
        comments: 12,
        content: "Full article content would go here...",
      },
      {
        id: 4,
        title: "Building Inclusive AI: Community-Driven Design Principles",
        excerpt:
          "How involving diverse communities in AI development leads to more equitable and effective educational technologies that serve all learners.",
        category: "community",
        categoryIcon: "🤝",
        categoryName: "Community Insights",
        author: "Alex Thompson",
        authorType: "community",
        authorAvatar: "AT",
        publishDate: "2025-01-08",
        readTime: 6,
        tags: [
          "inclusive-design",
          "community-engagement",
          "participatory-design",
          "accessibility",
        ],
        image: "🤝",
        featured: false,
        views: 2156,
        likes: 134,
        comments: 28,
        content: "Full article content would go here...",
        discussed: true,
      },
      {
        id: 5,
        title:
          "The Ethics of Personalized Learning: Balancing Customization and Privacy",
        excerpt:
          "Examining the ethical implications of adaptive learning systems and how to balance personalized education with student privacy and autonomy.",
        category: "ethics",
        categoryIcon: "⚖️",
        categoryName: "Ethics & Philosophy",
        author: "Dr. James Liu",
        authorType: "team",
        authorAvatar: "JL",
        publishDate: "2025-01-05",
        readTime: 10,
        tags: [
          "personalized-learning",
          "ethics",
          "privacy",
          "autonomy",
          "adaptive-systems",
        ],
        image: "⚖️",
        featured: true,
        views: 3245,
        likes: 201,
        comments: 45,
        content: "Full article content would go here...",
        trending: true,
      },
    ];

    // Generate more posts for pagination testing
    for (let i = 6; i <= 25; i++) {
      const categories = [
        "research",
        "education",
        "ethics",
        "ai-bias",
        "privacy",
        "community",
      ];
      const randomCategory =
        categories[Math.floor(Math.random() * categories.length)];

      samplePosts.push({
        id: i,
        title: `Research Article ${i}: Advanced Topics in AI Ethics`,
        excerpt: `This is a sample excerpt for research article ${i}, exploring various aspects of AI ethics and educational methodology.`,
        category: randomCategory,
        categoryIcon: this.getCategoryIcon(randomCategory),
        categoryName: this.getCategoryName(randomCategory),
        author: `Researcher ${i}`,
        authorType: "researchers",
        authorAvatar: `R${i}`,
        publishDate: new Date(2025, 0, Math.floor(Math.random() * 30) + 1)
          .toISOString()
          .split("T")[0],
        readTime: Math.floor(Math.random() * 15) + 3,
        tags: ["research", "ai-ethics", "education"],
        image: this.getCategoryIcon(randomCategory),
        featured: false,
        views: Math.floor(Math.random() * 5000) + 100,
        likes: Math.floor(Math.random() * 200) + 10,
        comments: Math.floor(Math.random() * 50) + 1,
        content: "Full article content would go here...",
      });
    }

    return samplePosts;
  }

  getCategoryIcon(category) {
    const icons = {
      research: "🔬",
      education: "📚",
      ethics: "⚖️",
      "ai-bias": "🎯",
      privacy: "🔒",
      community: "🤝",
    };
    return icons[category] || "📄";
  }

  getCategoryName(category) {
    const names = {
      research: "Research & Studies",
      education: "Educational Methods",
      ethics: "Ethics & Philosophy",
      "ai-bias": "AI Bias & Fairness",
      privacy: "Privacy & Security",
      community: "Community Insights",
    };
    return names[category] || "General";
  }

  extractCategories() {
    const categories = new Set();
    this.posts.forEach((post) => {
      categories.add(post.category);
    });
    return Array.from(categories);
  }

  filterPosts() {
    let filtered = [...this.posts];

    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.excerpt.toLowerCase().includes(query) ||
          post.author.toLowerCase().includes(query) ||
          post.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    // Apply category filter
    if (this.activeFilters.category) {
      filtered = filtered.filter(
        (post) => post.category === this.activeFilters.category,
      );
    }

    // Apply author type filter
    if (this.activeFilters.author) {
      filtered = filtered.filter(
        (post) => post.authorType === this.activeFilters.author,
      );
    }

    // Apply sorting
    if (this.activeFilters.sort) {
      switch (this.activeFilters.sort) {
        case "newest":
          filtered.sort(
            (a, b) => new Date(b.publishDate) - new Date(a.publishDate),
          );
          break;
        case "popular":
          filtered.sort((a, b) => b.views - a.views);
          break;
        case "trending":
          filtered.sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0));
          break;
        case "discussed":
          filtered.sort((a, b) => b.comments - a.comments);
          break;
        case "research":
          filtered.sort(
            (a, b) =>
              (b.category === "research" ? 1 : 0) -
              (a.category === "research" ? 1 : 0),
          );
          break;
      }
    }

    this.filteredPosts = filtered;
    this.currentPage = 1;
    this.renderPosts();
    this.updateResultsCount();
  }

  renderPosts() {
    const container = document.getElementById("blog-posts-container");
    if (!container) return;

    const startIndex = (this.currentPage - 1) * this.postsPerPage;
    const endIndex = startIndex + this.postsPerPage;
    const postsToShow = this.filteredPosts.slice(0, endIndex);

    if (this.currentPage === 1) {
      container.innerHTML = "";
    }

    postsToShow.slice(startIndex).forEach((post) => {
      const postElement = this.createPostElement(post);
      container.appendChild(postElement);
    });

    this.updateLoadMoreButton();
  }

  createPostElement(post) {
    const postDiv = document.createElement("div");
    postDiv.className = "post-card";
    postDiv.innerHTML = `
            <div class="post-image">
                ${post.image}
            </div>
            <div class="post-content">
                <div class="post-meta">
                    <span class="post-category">${post.categoryIcon} ${post.categoryName}</span>
                    <span class="post-date">${this.formatDate(post.publishDate)}</span>
                    <span class="post-read-time">${post.readTime} min read</span>
                </div>
                <h3 class="post-title">${post.title}</h3>
                <p class="post-excerpt">${post.excerpt}</p>
                <div class="post-footer">
                    <div class="post-author">
                        <div class="author-avatar">${post.authorAvatar}</div>
                        <span class="author-name">${post.author}</span>
                    </div>
                    <div class="post-stats">
                        <span class="stat-item">👁️ ${this.formatNumber(post.views)}</span>
                        <span class="stat-item">❤️ ${post.likes}</span>
                        <span class="stat-item">💬 ${post.comments}</span>
                    </div>
                </div>
                <div class="post-tags">
                    ${post.tags.map((tag) => `<span class="post-tag">${tag}</span>`).join("")}
                </div>
            </div>
        `;

    // Add click handler to open post
    postDiv.addEventListener("click", () => {
      this.openPost(post);
    });

    return postDiv;
  }

  renderFeaturedPosts() {
    const container = document.getElementById("featured-posts-grid");
    if (!container) return;

    const featuredPosts = this.posts
      .filter((post) => post.featured)
      .slice(0, 3);

    container.innerHTML = featuredPosts
      .map(
        (post) => `
            <div class="featured-post-card" onclick="window.enhancedBlog.openPost(${post.id})">
                <div class="featured-post-image">
                    ${post.image}
                </div>
                <div class="featured-post-content">
                    <div class="featured-post-meta">
                        <span class="post-category">${post.categoryIcon} ${post.categoryName}</span>
                        <span class="post-date">${this.formatDate(post.publishDate)}</span>
                    </div>
                    <h3 class="featured-post-title">${post.title}</h3>
                    <p class="featured-post-excerpt">${post.excerpt}</p>
                    <div class="featured-post-footer">
                        <div class="post-author">
                            <div class="author-avatar">${post.authorAvatar}</div>
                            <span class="author-name">${post.author}</span>
                        </div>
                        <button class="btn btn-primary btn-small read-more-btn">Read More</button>
                    </div>
                </div>
            </div>
        `,
      )
      .join("");
  }

  initializeCarousel() {
    this.updateCarouselIndicators();
    this.showSlide(0);
  }

  updateCarouselIndicators() {
    const indicatorContainer = document.getElementById("carousel-indicators");
    if (!indicatorContainer) return;

    const featuredPosts = this.posts.filter((post) => post.featured);
    const slideCount = Math.ceil(featuredPosts.length / 3);

    indicatorContainer.innerHTML = "";
    for (let i = 0; i < slideCount; i++) {
      const indicator = document.createElement("button");
      indicator.className = `carousel-indicator ${i === 0 ? "active" : ""}`;
      indicator.addEventListener("click", () => this.goToSlide(i));
      indicatorContainer.appendChild(indicator);
    }
  }

  showSlide(index) {
    const indicators = document.querySelectorAll(".carousel-indicator");
    indicators.forEach((indicator, i) => {
      indicator.classList.toggle("active", i === index);
    });
    this.currentCarouselIndex = index;
  }

  nextSlide() {
    const featuredPosts = this.posts.filter((post) => post.featured);
    const slideCount = Math.ceil(featuredPosts.length / 3);
    const nextIndex = (this.currentCarouselIndex + 1) % slideCount;
    this.goToSlide(nextIndex);
  }

  previousSlide() {
    const featuredPosts = this.posts.filter((post) => post.featured);
    const slideCount = Math.ceil(featuredPosts.length / 3);
    const prevIndex =
      this.currentCarouselIndex === 0
        ? slideCount - 1
        : this.currentCarouselIndex - 1;
    this.goToSlide(prevIndex);
  }

  goToSlide(index) {
    this.showSlide(index);
    // Animate slide transition here if needed
  }

  startCarouselAutoPlay() {
    this.carouselInterval = setInterval(() => {
      this.nextSlide();
    }, 8000); // Change slide every 8 seconds
  }

  stopCarouselAutoPlay() {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
      this.carouselInterval = null;
    }
  }

  switchView(view) {
    this.currentView = view;
    const container = document.getElementById("blog-posts-container");
    const viewButtons = document.querySelectorAll(".view-btn");

    if (container) {
      container.className = `blog-posts-container ${view}-view`;
    }

    viewButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.view === view);
    });
  }

  clearAllFilters() {
    this.activeFilters = {};
    this.searchQuery = "";

    // Clear form inputs
    const searchInput = document.getElementById("blog-search");
    if (searchInput) searchInput.value = "";

    const filterSelects = document.querySelectorAll(".filter-select");
    filterSelects.forEach((select) => (select.value = ""));

    this.filterPosts();
    this.updateActiveFiltersDisplay();
  }

  updateActiveFiltersDisplay() {
    const activeFiltersContainer = document.getElementById("active-filters");
    const filterTagsContainer = document.getElementById(
      "filter-tags-container",
    );

    if (!activeFiltersContainer || !filterTagsContainer) return;

    const hasActiveFilters =
      Object.keys(this.activeFilters).length > 0 || this.searchQuery;

    if (hasActiveFilters) {
      activeFiltersContainer.style.display = "block";
      filterTagsContainer.innerHTML = "";

      // Add search query tag
      if (this.searchQuery) {
        const tag = this.createFilterTag(
          "search",
          `Search: "${this.searchQuery}"`,
        );
        filterTagsContainer.appendChild(tag);
      }

      // Add filter tags
      Object.entries(this.activeFilters).forEach(([type, value]) => {
        const label = this.getFilterLabel(type, value);
        const tag = this.createFilterTag(type, label);
        filterTagsContainer.appendChild(tag);
      });
    } else {
      activeFiltersContainer.style.display = "none";
    }
  }

  createFilterTag(type, label) {
    const tag = document.createElement("span");
    tag.className = "filter-tag";
    tag.innerHTML = `
            ${label}
            <button class="filter-tag-remove" onclick="window.enhancedBlog.removeFilter('${type}')">&times;</button>
        `;
    return tag;
  }

  removeFilter(type) {
    if (type === "search") {
      this.searchQuery = "";
      const searchInput = document.getElementById("blog-search");
      if (searchInput) searchInput.value = "";
    } else {
      delete this.activeFilters[type];
      const filterSelect = document.getElementById(`${type}-filter`);
      if (filterSelect) filterSelect.value = "";
    }

    this.filterPosts();
    this.updateActiveFiltersDisplay();
  }

  getFilterLabel(type, value) {
    const labels = {
      category: {
        research: "🔬 Research & Studies",
        education: "📚 Educational Methods",
        ethics: "⚖️ Ethics & Philosophy",
        "ai-bias": "🎯 AI Bias & Fairness",
        privacy: "🔒 Privacy & Security",
        community: "🤝 Community Insights",
      },
      author: {
        team: "👑 SimulateAI Team",
        researchers: "🔬 Research Contributors",
        educators: "🎓 Educators",
        community: "🤝 Community Members",
      },
      sort: {
        newest: "📅 Newest First",
        popular: "🔥 Most Popular",
        trending: "📈 Trending",
        discussed: "💬 Most Discussed",
      },
    };

    return labels[type]?.[value] || value;
  }

  filterByCategory(category) {
    this.activeFilters.category = category;
    const categoryFilter = document.getElementById("category-filter");
    if (categoryFilter) {
      categoryFilter.value = category;
    }
    this.filterPosts();
    this.updateActiveFiltersDisplay();

    // Smooth scroll to posts section
    const postsSection = document.querySelector(".latest-posts-section");
    if (postsSection) {
      postsSection.scrollIntoView({ behavior: "smooth" });
    }
  }

  updateResultsCount() {
    const resultsCount = document.getElementById("results-count");
    const resultsMeta = document.getElementById("results-meta");

    if (resultsCount) {
      const total = this.filteredPosts.length;
      const showing = Math.min(this.currentPage * this.postsPerPage, total);

      if (total === this.posts.length) {
        resultsCount.textContent = `Showing all ${total} articles`;
      } else {
        resultsCount.textContent = `Showing ${showing} of ${total} articles`;
      }
    }

    if (resultsMeta) {
      if (Object.keys(this.activeFilters).length > 0 || this.searchQuery) {
        resultsMeta.textContent = `(filtered from ${this.posts.length} total)`;
      } else {
        resultsMeta.textContent = "";
      }
    }
  }

  loadMorePosts() {
    if (this.isLoading) return;

    const totalPages = Math.ceil(this.filteredPosts.length / this.postsPerPage);
    if (this.currentPage < totalPages) {
      this.currentPage++;
      this.renderPosts();
    }
  }

  updateLoadMoreButton() {
    const loadMoreBtn = document.getElementById("load-more-btn");
    const loadMoreCount = document.getElementById("load-more-count");
    const paginationStatus = document.getElementById("pagination-status");

    const totalPosts = this.filteredPosts.length;
    const shownPosts = Math.min(
      this.currentPage * this.postsPerPage,
      totalPosts,
    );
    const remainingPosts = totalPosts - shownPosts;

    if (loadMoreBtn) {
      if (remainingPosts > 0) {
        loadMoreBtn.style.display = "flex";
        if (loadMoreCount) {
          loadMoreCount.textContent = `(${Math.min(this.postsPerPage, remainingPosts)} more)`;
        }
      } else {
        loadMoreBtn.style.display = "none";
      }
    }

    if (paginationStatus) {
      paginationStatus.textContent = `Showing 1-${shownPosts} of ${totalPosts}+ articles`;
    }
  }

  openPost(postId) {
    const post =
      typeof postId === "object"
        ? postId
        : this.posts.find((p) => p.id === postId);
    if (!post) return;

    // For now, show a simple alert - in a real app, this would navigate to the full post
    this.showNotification(`Opening "${post.title}"`, "info");

    // Example: window.location.href = `post.html?id=${post.id}`;
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = "flex";
      document.body.style.overflow = "hidden";

      // Focus management for accessibility
      const firstFocusable = modal.querySelector(
        "input, button, textarea, select",
      );
      if (firstFocusable) {
        firstFocusable.focus({ preventScroll: true });
      }
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = "none";
      document.body.style.overflow = "";
    }
  }

  setupFormSubmission() {
    const writePostForm = document.getElementById("write-post-form");
    if (writePostForm) {
      writePostForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handlePostSubmission(e);
      });
    }

    // Draft saving
    const saveDraftBtn = document.getElementById("save-draft-btn");
    if (saveDraftBtn) {
      saveDraftBtn.addEventListener("click", () => {
        this.saveDraft();
      });
    }

    // Preview functionality
    const previewBtn = document.getElementById("preview-btn");
    if (previewBtn) {
      previewBtn.addEventListener("click", () => {
        this.showPreview();
      });
    }
  }

  async handlePostSubmission(e) {
    const formData = new FormData(e.target);
    const postData = {
      title:
        formData.get("title") || document.getElementById("post-title")?.value,
      category:
        formData.get("category") ||
        document.getElementById("post-category")?.value,
      summary:
        formData.get("summary") ||
        document.getElementById("post-summary")?.value,
      content:
        formData.get("content") ||
        document.getElementById("post-content")?.value,
      tags: (
        formData.get("tags") || document.getElementById("post-tags")?.value
      )
        ?.split(",")
        .map((tag) => tag.trim()),
      readingTime:
        formData.get("readingTime") ||
        document.getElementById("post-reading-time")?.value,
    };

    if (
      !postData.title ||
      !postData.category ||
      !postData.summary ||
      !postData.content
    ) {
      this.showNotification("Please fill in all required fields", "error");
      return;
    }

    try {
      this.showLoading();

      // Simulate API submission
      await this.delay(2000);

      // In a real app, this would submit to your backend

      this.showNotification("Article published successfully!", "success");
      this.closeModal("write-post-modal");

      // Reset form
      document.getElementById("write-post-form").reset();

      // Refresh posts (in real app, this would refetch from server)
      await this.loadBlogPosts();
    } catch (error) {
      console.error("Error submitting post:", error);
      this.showNotification(
        "Failed to publish article. Please try again.",
        "error",
      );
    } finally {
      this.hideLoading();
    }
  }

  saveDraft() {
    const title = document.getElementById("post-title")?.value;
    const content = document.getElementById("post-content")?.value;

    if (!title && !content) {
      this.showNotification("Nothing to save", "warning");
      return;
    }

    // Save to localStorage for now - in real app, save to server
    const draft = {
      title,
      category: document.getElementById("post-category")?.value,
      summary: document.getElementById("post-summary")?.value,
      content,
      tags: document.getElementById("post-tags")?.value,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem("blog-draft", JSON.stringify(draft));
    this.showNotification("Draft saved successfully", "success");
  }

  showPreview() {
    const title = document.getElementById("post-title")?.value;
    const content = document.getElementById("post-content")?.value;

    if (!title || !content) {
      this.showNotification(
        "Please add title and content to preview",
        "warning",
      );
      return;
    }

    // In a real app, this would open a preview modal or new window
    this.showNotification("Preview functionality would open here", "info");
  }

  async handleNewsletterSubscription(e) {
    const formData = new FormData(e.target);
    const email =
      formData.get("email") ||
      document.getElementById("newsletter-email")?.value;

    if (!email || !this.isValidEmail(email)) {
      this.showNotification("Please enter a valid email address", "error");
      return;
    }

    try {
      this.showLoading();

      // Simulate API call
      await this.delay(1500);

      const subscriptionData = {
        email,
        research: document.getElementById("newsletter-research")?.checked,
        community: document.getElementById("newsletter-community")?.checked,
        subscribedAt: new Date().toISOString(),
      };

      this.showNotification(
        "Successfully subscribed to newsletter!",
        "success",
      );

      // Reset form
      e.target.reset();
    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
      this.showNotification("Failed to subscribe. Please try again.", "error");
    } finally {
      this.hideLoading();
    }
  }

  updateStats() {
    // Update category counts
    const categoryCounts = {};
    this.posts.forEach((post) => {
      categoryCounts[post.category] = (categoryCounts[post.category] || 0) + 1;
    });

    Object.entries(categoryCounts).forEach(([category, count]) => {
      const countElement = document.getElementById(`${category}-count`);
      if (countElement) {
        countElement.textContent = count;
      }
    });

    // Update hero stats
    const totalPosts = this.posts.length;
    const totalViews = this.posts.reduce((sum, post) => sum + post.views, 0);
    const totalAuthors = new Set(this.posts.map((post) => post.author)).size;

    this.updateStatElement("total-posts", totalPosts);
    this.updateStatElement("total-views", this.formatNumber(totalViews));
    this.updateStatElement("total-authors", totalAuthors);
  }

  updateStatElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
      if (typeof value === "number" && value > element.textContent) {
        this.animateNumber(
          element,
          parseInt(element.textContent) || 0,
          value,
          1000,
        );
      } else {
        element.textContent = value;
      }
    }
  }

  animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(start + (end - start) * progress);
      element.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // Utility functions
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

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  formatNumber(num) {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  showLoading() {
    const loading = document.getElementById("loading");
    if (loading) {
      loading.style.display = "flex";
      loading.setAttribute("aria-hidden", "false");
    }
    this.isLoading = true;
  }

  hideLoading() {
    const loading = document.getElementById("loading");
    if (loading) {
      loading.style.display = "none";
      loading.setAttribute("aria-hidden", "true");
    }
    this.isLoading = false;
  }

  showError(message) {
    this.showNotification(message, "error");
  }

  showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification-toast ${type}`;
    notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">&times;</button>
        `;

    // Add to page
    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);

    // Trigger entrance animation
    requestAnimationFrame(() => {
      notification.classList.add("show");
    });
  }

  getNotificationIcon(type) {
    const icons = {
      success: "✅",
      error: "❌",
      warning: "⚠️",
      info: "ℹ️",
    };
    return icons[type] || "ℹ️";
  }

  initializeUI() {
    // Initialize any UI components that need setup
    this.setupKeyboardNavigation();
    this.setupAccessibilityFeatures();
  }

  setupKeyboardNavigation() {
    document.addEventListener("keydown", (e) => {
      // ESC key to close modals
      if (e.key === "Escape") {
        const openModal = document.querySelector(
          '.modal-overlay[style*="flex"]',
        );
        if (openModal) {
          this.closeModal(openModal.id);
        }
      }

      // Arrow keys for carousel navigation
      if (e.key === "ArrowLeft" && e.ctrlKey) {
        e.preventDefault();
        this.previousSlide();
      } else if (e.key === "ArrowRight" && e.ctrlKey) {
        e.preventDefault();
        this.nextSlide();
      }
    });
  }

  setupAccessibilityFeatures() {
    // Add ARIA labels and roles where needed
    const postCards = document.querySelectorAll(".post-card");
    postCards.forEach((card, index) => {
      card.setAttribute("role", "article");
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-label", `Blog post ${index + 1}`);
    });

    // Add skip links
    this.addSkipLinks();
  }

  addSkipLinks() {
    const skipLinks = document.createElement("div");
    skipLinks.className = "skip-links";
    skipLinks.innerHTML = `
            <a href="#main-content" class="skip-link">Skip to main content</a>
            <a href="#search-section" class="skip-link">Skip to search</a>
            <a href="#latest-posts" class="skip-link">Skip to latest posts</a>
        `;
    document.body.insertBefore(skipLinks, document.body.firstChild);
  }
}

// Initialize the enhanced blog manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.enhancedBlog = new EnhancedBlogManager();
});

// Export for potential module use
if (typeof module !== "undefined" && module.exports) {
  module.exports = EnhancedBlogManager;
}
