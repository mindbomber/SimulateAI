/**
 * Forum Integration with Contribution Service
 * Handles forum posts and replies with donation-based approval
 */

// Services loaded dynamically to prevent circular dependencies

class ForumIntegration {
  constructor() {
    this.authService = null;
    this.firebaseService = null;
    this.contributionService = null;
    this.currentUser = null;
    this.discussions = [];
    this.initialized = false;
    this.PREVIEW_LENGTH = 150;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Use service manager to get existing service instances
      const { default: serviceManager } = await import(
        '../services/service-manager.js'
      );

      // Wait for services to be initialized
      await serviceManager.initialize();

      // Get service references
      this.firebaseService = serviceManager.getFirebaseService();
      this.authService = serviceManager.getAuthService();

      // Get contribution service from ServiceManager
      this.contributionService =
        serviceManager.getService('contribution') || null;

      // If not available, create but don't initialize to prevent duplication
      if (!this.contributionService) {
        const { default: ContributionService } = await import(
          '../services/contribution-service.js'
        );
        this.contributionService = new ContributionService();
        // Skip initialization - let ServiceManager handle it
      }

      if (!this.firebaseService || !this.authService) {
        return; // Services not available
      }

      // Set up auth state listener
      this.authService.firebaseService.addAuthStateListener(user => {
        this.currentUser = user;
        this.updateUIForAuth();
      });
    } catch (error) {
      // Silent failure - forum integration not available
      return;
    }

    this.setupEventHandlers();
    await this.loadDiscussions();

    this.initialized = true;
  }

  async updateUIForAuth() {
    const startDiscussionBtn = document.getElementById('start-discussion-btn');

    if (this.currentUser && this.canStartDiscussion()) {
      startDiscussionBtn.style.display = 'inline-block';

      // Update button text based on donor status
      const guidelines =
        await this.contributionService.getContributionGuidelines(
          this.currentUser.uid
        );
      const btnText = guidelines.autoApproval
        ? '💬 Start Discussion'
        : '📝 Submit Discussion';
      startDiscussionBtn.querySelector('.btn-text').textContent = btnText;
    } else {
      startDiscussionBtn.style.display = 'none';
    }

    // Update reply buttons for existing discussions
    this.updateReplyButtons();
  }

  canStartDiscussion() {
    return this.currentUser && this.contributionService.canContribute();
  }

  async loadDiscussions() {
    try {
      this.showLoading(true);

      // Load approved forum posts from Firebase
      const approvedPosts = await this.firebaseService.queryDocuments(
        'forum_posts',
        {
          field: 'status',
          operator: '==',
          value: 'approved',
        }
      );

      // If no posts in Firebase, use sample data
      this.discussions =
        approvedPosts.length > 0 ? approvedPosts : this.getSampleDiscussions();

      this.renderDiscussions();
    } catch (error) {
      this.showError('Failed to load discussions');
    } finally {
      this.showLoading(false);
    }
  }

  getSampleDiscussions() {
    return [
      {
        id: 'sample1',
        title: 'How do you handle bias in AI training data?',
        content:
          "I've been working on a project and struggling with identifying and mitigating bias...",
        category: 'ethics',
        authorName: 'Dr. Maya Patel',
        donorLevel: 'gold',
        submittedAt: new Date('2025-01-14').toISOString(),
        replies: [],
        upvotes: 12,
        views: 234,
      },
      {
        id: 'sample2',
        title: 'Best practices for teaching AI ethics to K-12 students',
        content:
          'Looking for curriculum recommendations and age-appropriate activities...',
        category: 'education',
        authorName: 'Sarah Johnson',
        donorLevel: 'silver',
        submittedAt: new Date('2025-01-13').toISOString(),
        replies: [],
        upvotes: 8,
        views: 156,
      },
    ];
  }

  renderDiscussions() {
    const container = document.getElementById('discussions-container');
    if (!container) return;

    container.innerHTML = this.discussions
      .map(
        discussion => `
      <article class="discussion-card" data-id="${discussion.id}">
        <div class="discussion-header">
          <div class="discussion-meta">
            <span class="category-tag">${this.getCategoryName(discussion.category)}</span>
            ${this.getDonorBadge(discussion.donorLevel)}
            <span class="author-name">${discussion.authorName}</span>
            <span class="post-date">${this.formatDate(new Date(discussion.submittedAt))}</span>
          </div>
          <div class="discussion-stats">
            <span class="stat">👍 ${discussion.upvotes || 0}</span>
            <span class="stat">💬 ${discussion.replies?.length || 0}</span>
            <span class="stat">👁️ ${discussion.views || 0}</span>
          </div>
        </div>
        
        <h3 class="discussion-title">
          <a href="#" onclick="forumIntegration.openDiscussion('${discussion.id}')">${discussion.title}</a>
        </h3>
        
        <p class="discussion-preview">${this.truncateText(discussion.content, this.PREVIEW_LENGTH)}</p>
        
        <div class="discussion-actions">
          <button class="btn btn-outline btn-sm" onclick="forumIntegration.openDiscussion('${discussion.id}')">
            Read Discussion
          </button>
          ${
            this.currentUser
              ? `
            <button class="btn btn-outline btn-sm reply-btn" onclick="forumIntegration.showReplyForm('${discussion.id}')">
              Reply
            </button>
          `
              : ''
          }
        </div>
      </article>
    `
      )
      .join('');
  }

  setupEventHandlers() {
    // Start discussion button
    const startBtn = document.getElementById('start-discussion-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => this.showStartDiscussionModal());
    }

    // Start discussion form submission
    const form = document.getElementById('start-discussion-form');
    if (form) {
      form.addEventListener('submit', e => {
        e.preventDefault();
        this.handleDiscussionSubmission();
      });
    }

    // Modal close buttons
    const closeButtons = document.querySelectorAll('.modal-close');
    closeButtons.forEach(btn => {
      btn.addEventListener('click', () => this.hideAllModals());
    });
  }

  async handleDiscussionSubmission() {
    try {
      const title = document.getElementById('discussion-title').value.trim();
      const content = document
        .getElementById('discussion-content')
        .value.trim();
      const category = document.getElementById('discussion-category').value;
      const tags = document
        .getElementById('discussion-tags')
        .value.split(',')
        .map(tag => tag.trim())
        .filter(Boolean);
      const type = document.getElementById('discussion-type').value;

      if (!title || !content) {
        this.showError('Please fill in all required fields');
        return;
      }

      this.showLoading(true);

      const result = await this.contributionService.submitForumPost({
        title,
        content,
        category,
        tags,
        discussionType: type,
        submissionMethod: 'forum_form',
      });

      this.showLoading(false);
      this.hideAllModals();

      if (result.autoApproved) {
        this.showSuccess(`🎉 ${result.message} Your discussion is now live!`);
        await this.loadDiscussions();
      } else {
        this.showSuccess(
          `📋 ${result.message} We'll notify you when it's reviewed.`
        );
      }

      // Clear form
      document.getElementById('start-discussion-form').reset();
    } catch (error) {
      this.showLoading(false);
      this.showError(`Failed to submit discussion: ${error.message}`);
    }
  }

  async submitReply(discussionId, replyContent) {
    try {
      if (!replyContent.trim()) {
        this.showError('Please enter a reply');
        return;
      }

      this.showLoading(true);

      const result = await this.contributionService.submitReply(discussionId, {
        content: replyContent,
        submissionMethod: 'forum_reply',
      });

      this.showLoading(false);

      if (result.autoApproved) {
        this.showSuccess(`✅ ${result.message}`);
        await this.loadDiscussions();
      } else {
        this.showSuccess(`📋 ${result.message}`);
      }
    } catch (error) {
      this.showLoading(false);
      this.showError(`Failed to submit reply: ${error.message}`);
    }
  }

  showStartDiscussionModal() {
    if (!this.canStartDiscussion()) {
      this.showError('Please sign in to start a discussion');
      return;
    }

    document.getElementById('start-discussion-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
  }

  hideAllModals() {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
      modal.style.display = 'none';
    });
    document.body.style.overflow = 'auto';
  }

  updateReplyButtons() {
    const replyButtons = document.querySelectorAll('.reply-btn');
    replyButtons.forEach(btn => {
      btn.style.display = this.currentUser ? 'inline-block' : 'none';
    });
  }

  getCategoryName(category) {
    const names = {
      general: 'General Discussion',
      ethics: 'AI Ethics',
      education: 'Education',
      research: 'Research',
      feedback: 'Feedback',
      scenarios: 'Scenarios',
    };
    return names[category] || 'General';
  }

  getDonorBadge(donorLevel) {
    const badges = {
      premium: '<span class="donor-badge premium">💎 Premium</span>',
      gold: '<span class="donor-badge gold">🏆 Gold</span>',
      silver: '<span class="donor-badge silver">🥈 Silver</span>',
      bronze: '<span class="donor-badge bronze">🏅 Bronze</span>',
      supporter: '<span class="donor-badge supporter">❤️ Supporter</span>',
    };
    return badges[donorLevel] || '';
  }

  formatDate(date) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  }

  openDiscussion(id) {
    // TODO: Navigate to individual discussion page
    alert(`Opening discussion: ${id}`);
  }

  showReplyForm(discussionId) {
    if (!this.currentUser) {
      this.showError('Please sign in to reply');
      return;
    }

    const reply = prompt('Enter your reply:');
    if (reply) {
      this.submitReply(discussionId, reply);
    }
  }

  showLoading(show) {
    const loading = document.getElementById('loading');
    if (loading) {
      loading.style.display = show ? 'flex' : 'none';
    }
  }

  showError(message) {
    if (window.NotificationToast) {
      window.NotificationToast.show(message, 'error');
    } else {
      alert(`Error: ${message}`);
    }
  }

  showSuccess(message) {
    if (window.NotificationToast) {
      window.NotificationToast.show(message, 'success');
    } else {
      alert(message);
    }
  }
}

// Initialize forum integration and make it globally available
const forumIntegration = new ForumIntegration();
window.forumIntegration = forumIntegration;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  forumIntegration.initialize();
});

export default ForumIntegration;
