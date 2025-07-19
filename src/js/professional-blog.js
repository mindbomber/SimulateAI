/*
Professional Blog JavaScript - SimulateAI Research Journal
Handles article loading, filtering, and professional blog functionality
*/

class ProfessionalBlog {
  constructor() {
    this.articles = [];
    this.filteredArticles = [];
    this.currentPage = 0;
    this.articlesPerPage = 9;
    this.filters = {
      search: '',
      format: '',
      topic: '',
      depth: '',
      audience: '',
    };
    this.sortBy = 'newest';

    this.init();
  }

  async init() {
    await this.loadSampleArticles();
    this.setupEventListeners();
    this.renderArticles();
  }

  async loadSampleArticles() {
    // Sample articles with your professional tag taxonomy
    this.articles = [
      {
        id: 1,
        title: 'The Ethics of AI Decision-Making in Healthcare',
        excerpt:
          'Examining the moral implications of algorithmic decision-making in medical contexts and the balance between efficiency and human oversight.',
        author: 'Dr. Sarah Chen',
        date: new Date('2024-12-15'),
        readingTime: 8,
        tags: [
          { name: 'Research Paper', category: 'format' },
          { name: 'AI Ethics', category: 'topic' },
          { name: 'Deep Dive', category: 'depth' },
          { name: 'For Researchers', category: 'audience' },
        ],
        featured: true,
        views: 2847,
        comments: 23,
        likes: 89,
      },
      {
        id: 2,
        title: 'Building User Agency in AI-Powered Platforms',
        excerpt:
          'How to design AI systems that empower rather than replace human decision-making, with practical frameworks for implementation.',
        author: 'Marcus Rodriguez',
        date: new Date('2024-12-10'),
        readingTime: 12,
        tags: [
          { name: 'Article', category: 'format' },
          { name: 'User Agency', category: 'topic' },
          { name: 'How-To', category: 'depth' },
          { name: 'For Contributors', category: 'audience' },
          { name: 'UX Decisions', category: 'platform' },
        ],
        featured: false,
        views: 1923,
        comments: 17,
        likes: 64,
      },
      {
        id: 3,
        title: 'Cognitive Bias in AI Training Data',
        excerpt:
          'A meta-analysis of how human cognitive biases become embedded in machine learning models and strategies for mitigation.',
        author: 'Prof. Elena Vasquez',
        date: new Date('2024-12-08'),
        readingTime: 15,
        tags: [
          { name: 'Meta Analysis', category: 'depth' },
          { name: 'Cognitive Bias', category: 'topic' },
          { name: 'Research Paper', category: 'format' },
          { name: 'Behavioral Research', category: 'topic' },
        ],
        featured: false,
        views: 3201,
        comments: 31,
        likes: 127,
      },
      {
        id: 4,
        title: 'Privacy by Design: A Philosophical Approach',
        excerpt:
          'Exploring the philosophical foundations of privacy-preserving AI systems and their implications for democratic society.',
        author: 'Dr. James Okafor',
        date: new Date('2024-12-05'),
        readingTime: 10,
        tags: [
          { name: 'Philosophy', category: 'topic' },
          { name: 'Privacy', category: 'topic' },
          { name: 'Reflection', category: 'depth' },
          { name: 'Cross-Cultural', category: 'audience' },
        ],
        featured: false,
        views: 1654,
        comments: 19,
        likes: 72,
      },
      {
        id: 5,
        title: 'Game Theory Applications in AI Ethics Education',
        excerpt:
          'Using game-theoretic models to understand ethical decision-making in multi-agent AI systems and educational simulations.',
        author: 'Dr. Aisha Patel',
        date: new Date('2024-12-03'),
        readingTime: 6,
        tags: [
          { name: 'Explainer', category: 'format' },
          { name: 'Game Theory', category: 'topic' },
          { name: 'Introductory', category: 'depth' },
          { name: 'Educator Resources', category: 'audience' },
          { name: 'Featured Scenario', category: 'platform' },
        ],
        featured: false,
        views: 2156,
        comments: 25,
        likes: 94,
      },
      {
        id: 6,
        title: 'Data Sovereignty in Indigenous Communities',
        excerpt:
          'Examining how AI systems can respect and protect indigenous data rights while advancing technological progress.',
        author: 'Dr. Maria Lightfoot',
        date: new Date('2024-11-28'),
        readingTime: 14,
        tags: [
          { name: 'Case Study', category: 'depth' },
          { name: 'Data Sovereignty', category: 'topic' },
          { name: 'Cross-Cultural', category: 'audience' },
          { name: 'Community Voices', category: 'depth' },
        ],
        featured: true,
        views: 4127,
        comments: 42,
        likes: 156,
      },
      {
        id: 7,
        title: 'Narrative Design for Ethical AI Scenarios',
        excerpt:
          'How storytelling techniques can create more engaging and effective AI ethics education experiences.',
        author: 'Sam Chen',
        date: new Date('2024-11-25'),
        readingTime: 7,
        tags: [
          { name: 'Narrative Design', category: 'topic' },
          { name: 'How-To', category: 'depth' },
          { name: 'Educator Resources', category: 'audience' },
          { name: 'Scenario Remix', category: 'platform' },
        ],
        featured: false,
        views: 1834,
        comments: 16,
        likes: 68,
      },
      {
        id: 8,
        title: 'The Future of AI Ethics: A Community Perspective',
        excerpt:
          'Insights from our community on the evolving landscape of AI ethics and the role of education in shaping responsible AI.',
        author: 'SimulateAI Community',
        date: new Date('2024-11-20'),
        readingTime: 11,
        tags: [
          { name: 'Community Voices', category: 'depth' },
          { name: 'Opinion', category: 'depth' },
          { name: 'For New Users', category: 'audience' },
          { name: 'User Data Insights', category: 'platform' },
        ],
        featured: false,
        views: 2741,
        comments: 38,
        likes: 103,
      },
    ];

    this.filteredArticles = [...this.articles];
  }

  setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('blog-search');
    if (searchInput) {
      searchInput.addEventListener('input', e => {
        this.filters.search = e.target.value.toLowerCase();
        this.applyFilters();
      });
    }

    // Filter dropdowns
    const filterElements = [
      'format-filter',
      'topic-filter',
      'depth-filter',
      'audience-filter',
    ];

    filterElements.forEach(filterId => {
      const element = document.getElementById(filterId);
      if (element) {
        element.addEventListener('change', e => {
          const filterType = filterId.replace('-filter', '');
          this.filters[filterType] = e.target.value;
          this.applyFilters();
        });
      }
    });

    // Sort dropdown
    const sortSelect = document.getElementById('sort-filter');
    if (sortSelect) {
      sortSelect.addEventListener('change', e => {
        this.sortBy = e.target.value;
        this.applyFilters();
      });
    }

    // Load more button
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        this.loadMoreArticles();
      });
    }

    // Write post button
    const writePostBtn = document.getElementById('write-post-btn');
    if (writePostBtn) {
      writePostBtn.addEventListener('click', () => {
        this.showWritePostModal();
      });
    }
  }

  applyFilters() {
    this.filteredArticles = this.articles.filter(article => {
      // Search filter
      if (this.filters.search) {
        const searchMatch =
          article.title.toLowerCase().includes(this.filters.search) ||
          article.excerpt.toLowerCase().includes(this.filters.search) ||
          article.author.toLowerCase().includes(this.filters.search) ||
          article.tags.some(tag =>
            tag.name.toLowerCase().includes(this.filters.search)
          );

        if (!searchMatch) return false;
      }

      // Tag-based filters
      if (this.filters.format) {
        const hasFormatTag = article.tags.some(
          tag =>
            tag.category === 'format' &&
            tag.name.toLowerCase().includes(this.filters.format)
        );
        if (!hasFormatTag) return false;
      }

      if (this.filters.topic) {
        const hasTopicTag = article.tags.some(
          tag =>
            tag.category === 'topic' &&
            tag.name.toLowerCase().includes(this.filters.topic)
        );
        if (!hasTopicTag) return false;
      }

      if (this.filters.depth) {
        const hasDepthTag = article.tags.some(
          tag =>
            tag.category === 'depth' &&
            tag.name.toLowerCase().includes(this.filters.depth)
        );
        if (!hasDepthTag) return false;
      }

      if (this.filters.audience) {
        const hasAudienceTag = article.tags.some(
          tag =>
            tag.category === 'audience' &&
            tag.name.toLowerCase().includes(this.filters.audience)
        );
        if (!hasAudienceTag) return false;
      }

      return true;
    });

    // Apply sorting
    this.sortArticles();
    this.currentPage = 0;
    this.renderArticles();
  }

  sortArticles() {
    switch (this.sortBy) {
      case 'newest':
        this.filteredArticles.sort((a, b) => b.date - a.date);
        break;
      case 'popular':
        this.filteredArticles.sort((a, b) => b.views - a.views);
        break;
      case 'trending':
        // Simple trending algorithm based on recent views and engagement
        this.filteredArticles.sort((a, b) => {
          const aScore = a.views + a.likes * 2 + a.comments * 3;
          const bScore = b.views + b.likes * 2 + b.comments * 3;
          return bScore - aScore;
        });
        break;
      case 'discussed':
        this.filteredArticles.sort((a, b) => b.comments - a.comments);
        break;
    }
  }

  renderArticles() {
    const container = document.getElementById('articles-grid');
    if (!container) return;

    // Clear existing articles
    if (this.currentPage === 0) {
      container.innerHTML = '';
    }

    // Calculate articles to show
    const startIndex = this.currentPage * this.articlesPerPage;
    const endIndex = startIndex + this.articlesPerPage;
    const articlesToShow = this.filteredArticles.slice(startIndex, endIndex);

    // Render articles
    articlesToShow.forEach((article, index) => {
      const articleElement = this.createArticleElement(
        article,
        startIndex + index === 0 && article.featured
      );
      container.appendChild(articleElement);
    });

    // Update load more button
    this.updateLoadMoreButton();
  }

  createArticleElement(article, showAsFeatured = false) {
    const articleDiv = document.createElement('div');
    articleDiv.className = `article-card ${showAsFeatured ? 'featured-article' : ''}`;
    articleDiv.setAttribute('data-article-id', article.id);

    const tagsHtml = article.tags
      .map(
        tag =>
          `<span class="article-tag" data-category="${tag.category}">${tag.name}</span>`
      )
      .join('');

    articleDiv.innerHTML = `
      ${showAsFeatured ? '<div class="featured-badge"><span>⭐</span> Featured</div>' : ''}
      <div class="article-header">
        <h3 class="article-title">${article.title}</h3>
        <div class="article-meta">
          <span class="article-author">${article.author}</span>
          <span class="article-date">${this.formatDate(article.date)}</span>
          <span class="article-reading-time">${article.readingTime} min read</span>
        </div>
      </div>
      
      <div class="article-excerpt">${article.excerpt}</div>
      
      <div class="article-tags">${tagsHtml}</div>
      
      <div class="article-footer">
        <div class="article-engagement">
          <div class="engagement-item">
            <span>👁️</span>
            <span>${this.formatNumber(article.views)}</span>
          </div>
          <div class="engagement-item">
            <span>💬</span>
            <span>${article.comments}</span>
          </div>
          <div class="engagement-item">
            <span>👍</span>
            <span>${article.likes}</span>
          </div>
        </div>
        
        <div class="article-actions">
          <button class="action-btn" aria-label="Share article">
            <span>🔗</span>
          </button>
          <button class="action-btn" aria-label="Bookmark article">
            <span>🔖</span>
          </button>
        </div>
      </div>
    `;

    // Add click handler to open article
    articleDiv.addEventListener('click', e => {
      if (
        !e.target.closest('.action-btn') &&
        !e.target.closest('.article-tag')
      ) {
        this.openArticle(article.id);
      }
    });

    // Add tag click handlers
    const tagElements = articleDiv.querySelectorAll('.article-tag');
    tagElements.forEach(tagElement => {
      tagElement.addEventListener('click', e => {
        e.stopPropagation();
        this.filterByTag(tagElement.textContent, tagElement.dataset.category);
      });
    });

    return articleDiv;
  }

  formatDate(date) {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatNumber(num) {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  }

  filterByTag(tagName, category) {
    // Clear existing filters
    this.clearFilters();

    // Set appropriate filter based on category
    const filterValue = tagName.toLowerCase();

    switch (category) {
      case 'format':
        this.filters.format = filterValue;
        document.getElementById('format-filter').value =
          this.getSelectValue(filterValue);
        break;
      case 'topic':
        this.filters.topic = filterValue;
        document.getElementById('topic-filter').value =
          this.getSelectValue(filterValue);
        break;
      case 'depth':
        this.filters.depth = filterValue;
        document.getElementById('depth-filter').value =
          this.getSelectValue(filterValue);
        break;
      case 'audience':
        this.filters.audience = filterValue;
        document.getElementById('audience-filter').value =
          this.getSelectValue(filterValue);
        break;
    }

    this.applyFilters();
  }

  getSelectValue(tagName) {
    // Convert tag name to select option value
    return tagName.toLowerCase().replace(/\s+/g, '-');
  }

  clearFilters() {
    this.filters = {
      search: '',
      format: '',
      topic: '',
      depth: '',
      audience: '',
    };

    // Clear UI elements
    document.getElementById('blog-search').value = '';
    document.getElementById('format-filter').value = '';
    document.getElementById('topic-filter').value = '';
    document.getElementById('depth-filter').value = '';
    document.getElementById('audience-filter').value = '';
  }

  updateLoadMoreButton() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (!loadMoreBtn) return;

    const totalShown = (this.currentPage + 1) * this.articlesPerPage;
    const hasMore = totalShown < this.filteredArticles.length;

    if (hasMore) {
      loadMoreBtn.style.display = 'block';
      const remaining = this.filteredArticles.length - totalShown;
      const nextBatch = Math.min(remaining, this.articlesPerPage);
      loadMoreBtn.textContent = `Load ${nextBatch} More Articles`;
    } else {
      loadMoreBtn.style.display = 'none';
    }
  }

  loadMoreArticles() {
    this.currentPage++;
    this.renderArticles();
  }

  openArticle(articleId) {
    const article = this.articles.find(a => a.id === articleId);
    if (!article) return;

    // For now, just log the article (in a real app, this would open a modal or navigate)
    console.log('Opening article:', article);

    // You could implement a modal here or navigate to a dedicated article page
    alert(
      `Opening article: "${article.title}"\n\nThis would open the full article in a modal or dedicated page.`
    );
  }

  showWritePostModal() {
    // For now, just show an alert (in a real app, this would open a contribution modal)
    alert(
      'Write Post Modal\n\nThis would open a modal for contributing new articles to the research journal.'
    );
  }
}

// Initialize the professional blog when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.professionalBlog = new ProfessionalBlog();
});

// Export for use in other modules
export default ProfessionalBlog;
