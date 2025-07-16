/**
 * Forum Page Integration
 * Comprehensive integration of ForumService with forum.html UI
 * Implements real-time threading, messaging, and community features
 */

import { ForumService } from './services/forum-service.js';
import { AuthService } from './services/auth-service.js';
import { showNotification } from './components/notification-toast.js';

// Import Firebase service for messaging
let firebaseService = null;
try {
  if (window.firebaseService) {
    ({ firebaseService } = window);
  }
} catch (error) {
  // Firebase service not available, notifications will be disabled
}

// Configuration constants
const CONFIG = {
  PREVIEW_LENGTH: 150,
  REPLY_INDENT: 20,
  PAGINATION_LIMIT: 20,
  SCROLL_THRESHOLD: 1000,
  THREAD_OPEN_DELAY: 500,
  TIME_UNITS: {
    MINUTE: 60,
    HOUR: 3600,
    DAY: 86400,
    WEEK: 604800,
  },
};

class ForumPageIntegration {
  constructor() {
    this.forumService = new ForumService();
    this.authService = new AuthService();
    this.currentUser = null;
    this.currentThreadId = null;
    this.listeners = new Map();
    this.pagination = {
      lastDoc: null,
      hasMore: true,
      loading: false,
    };

    // UI Elements
    this.elements = {};

    // Real-time subscriptions
    this.subscriptions = new Map();

    this.init();
  }

  async init() {
    try {
      this.initializeElements();
      await this.setupAuthentication();
      this.setupEventListeners();
      this.loadInitialData();
    } catch (error) {
      this.handleError('Forum initialization failed', error);
      showNotification('Forum initialization failed', 'error');
    }
  }

  initializeElements() {
    // Thread list and filters
    this.elements.threadsList = document.getElementById('threads-list');
    this.elements.categoryFilter = document.getElementById('category-filter');
    this.elements.sortingSelect = document.getElementById('sorting-select');
    this.elements.searchInput = document.getElementById('search-input');
    this.elements.searchBtn = document.getElementById('search-btn');

    // Create thread modal
    this.elements.createThreadBtn =
      document.getElementById('create-thread-btn');
    this.elements.createThreadModal = document.getElementById(
      'create-thread-modal'
    );
    this.elements.threadForm = document.getElementById('thread-form');
    this.elements.threadTitle = document.getElementById('thread-title');
    this.elements.threadContent = document.getElementById('thread-content');
    this.elements.threadCategory = document.getElementById('thread-category');
    this.elements.threadTags = document.getElementById('thread-tags');
    this.elements.threadVisibility =
      document.getElementById('thread-visibility');

    // Thread view modal
    this.elements.threadModal = document.getElementById('thread-modal');
    this.elements.threadModalTitle =
      this.elements.threadModal?.querySelector('.thread-title');
    this.elements.threadModalContent =
      this.elements.threadModal?.querySelector('.thread-content');
    this.elements.threadModalAuthor =
      this.elements.threadModal?.querySelector('.thread-author');
    this.elements.threadModalTimestamp =
      this.elements.threadModal?.querySelector('.thread-timestamp');
    this.elements.messagesList =
      this.elements.threadModal?.querySelector('.messages-list');
    this.elements.messageForm =
      this.elements.threadModal?.querySelector('.message-form');
    this.elements.messageInput =
      this.elements.threadModal?.querySelector('.message-input');

    // Loading states
    this.elements.loading = document.getElementById('loading');
    this.elements.loadingText =
      this.elements.loading?.querySelector('.loading-text');

    // User interface elements
    this.elements.userProfile = document.getElementById('user-profile');
    this.elements.loginPrompt = document.getElementById('login-prompt');
  }

  async setupAuthentication() {
    // Listen for authentication state changes
    this.authService.onAuthStateChanged(user => {
      this.currentUser = user;
      this.updateUIForAuthState(user);

      if (user) {
        this.loadUserForumData(user.uid);
      }
    });
  }

  updateUIForAuthState(user) {
    if (user) {
      // Show authenticated UI
      this.elements.createThreadBtn?.classList.remove('hidden');
      this.elements.loginPrompt?.classList.add('hidden');
      this.elements.userProfile?.classList.remove('hidden');

      // Update user profile display
      this.updateUserProfileDisplay(user);
    } else {
      // Show guest UI
      this.elements.createThreadBtn?.classList.add('hidden');
      this.elements.loginPrompt?.classList.remove('hidden');
      this.elements.userProfile?.classList.add('hidden');
    }
  }

  async loadUserForumData(uid) {
    try {
      const userStats = await this.forumService.getUserStats(uid);
      this.updateUserStatsDisplay(userStats);

      // Initialize push notifications if available
      await this.initializePushNotifications();
    } catch (error) {
      this.handleError('Error loading user forum data', error);
    }
  }

  async initializePushNotifications() {
    if (!firebaseService || !firebaseService.isPushNotificationSupported()) {
      return;
    }

    try {
      const result = await firebaseService.initializePushNotifications();
      if (result.success) {
        // Add notification settings to UI
        this.addNotificationSettings();
        showNotification('Push notifications enabled!', 'success');
      }
    } catch (error) {
      this.handleError('Error initializing push notifications', error);
    }
  }
  addNotificationSettings() {
    // Add notification toggle to user profile area
    const { userProfile } = this.elements;
    if (userProfile) {
      const notificationToggle = document.createElement('div');
      notificationToggle.className = 'notification-settings';
      notificationToggle.innerHTML = `
        <label class="notification-toggle">
          <input type="checkbox" id="enable-notifications" checked>
          <span>🔔 Push notifications</span>
        </label>
      `;
      userProfile.appendChild(notificationToggle);

      // Add event listener for notification toggle
      const toggle = notificationToggle.querySelector('#enable-notifications');
      toggle.addEventListener('change', e => {
        this.handleNotificationToggle(e.target.checked);
      });
    }
  }

  async handleNotificationToggle(enabled) {
    if (!firebaseService) return;

    try {
      if (enabled) {
        await firebaseService.initializePushNotifications();
        showNotification('Notifications enabled', 'success');
      } else {
        // Could implement disable logic here
        showNotification('Notifications disabled', 'info');
      }
    } catch (error) {
      this.handleError('Error toggling notifications', error);
    }
  }

  setupEventListeners() {
    // Search functionality
    this.elements.searchBtn?.addEventListener('click', () =>
      this.handleSearch()
    );
    this.elements.searchInput?.addEventListener('keypress', e => {
      if (e.key === 'Enter') this.handleSearch();
    });

    // Filtering and sorting
    this.elements.categoryFilter?.addEventListener('change', () =>
      this.handleFiltering()
    );
    this.elements.sortingSelect?.addEventListener('change', () =>
      this.handleSorting()
    );

    // Create thread
    this.elements.createThreadBtn?.addEventListener('click', () =>
      this.openCreateThreadModal()
    );
    this.elements.threadForm?.addEventListener('submit', e =>
      this.handleCreateThread(e)
    );

    // Infinite scroll for threads
    window.addEventListener('scroll', () => this.handleScroll());

    // Modal close handlers
    document.addEventListener('click', e => {
      if (e.target.classList.contains('modal-backdrop')) {
        this.closeModals();
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', e => this.handleKeyboardShortcuts(e));
  }

  async loadInitialData() {
    try {
      this.showLoading('Loading forum discussions...');

      // Load threads with pagination
      await this.loadThreads();

      // Load categories for filter
      await this.loadCategories();

      this.hideLoading();
    } catch (error) {
      this.handleError('Error loading initial forum data', error);
      this.hideLoading();
      showNotification('Failed to load forum data', 'error');
    }
  }

  async loadThreads(append = false) {
    if (this.pagination.loading || (!this.pagination.hasMore && append)) {
      return;
    }

    this.pagination.loading = true;

    try {
      const options = {
        category: this.elements.categoryFilter?.value || null,
        sortBy: this.elements.sortingSelect?.value || 'recent',
        limit: CONFIG.PAGINATION_LIMIT,
        lastDoc: append ? this.pagination.lastDoc : null,
      };

      const result = await this.forumService.getThreads(options);

      if (!append) {
        this.elements.threadsList.innerHTML = '';
        this.pagination.lastDoc = null;
      }

      this.renderThreads(result.threads, append);

      this.pagination.lastDoc = result.lastDoc;
      this.pagination.hasMore = result.hasMore;

      // Setup real-time listeners for new threads
      this.setupThreadsRealTimeListener(options);
    } catch (error) {
      this.handleError('Error loading threads', error);
      showNotification('Failed to load threads', 'error');
    } finally {
      this.pagination.loading = false;
    }
  }

  async loadCategories() {
    try {
      const categories = await this.forumService.getCategories();
      this.renderCategoryFilter(categories);
    } catch (error) {
      this.handleError('Error loading categories', error);
    }
  }

  renderThreads(threads, append = false) {
    if (!this.elements.threadsList) return;

    const threadsHTML = threads
      .map(thread => this.createThreadHTML(thread))
      .join('');

    if (append) {
      this.elements.threadsList.insertAdjacentHTML('beforeend', threadsHTML);
    } else {
      this.elements.threadsList.innerHTML = threadsHTML;
    }

    // Add click listeners to thread items
    this.elements.threadsList.querySelectorAll('.thread-item').forEach(item => {
      item.addEventListener('click', e => {
        if (!e.target.closest('.thread-actions')) {
          const { threadId } = item.dataset;
          this.openThread(threadId);
        }
      });
    });

    // Add event listeners to thread actions
    this.setupThreadEventListeners();
  }

  setupThreadEventListeners() {
    // Subscribe buttons
    this.elements.threadsList
      ?.querySelectorAll('.subscribe-btn')
      .forEach(btn => {
        btn.addEventListener('click', async e => {
          e.preventDefault();
          e.stopPropagation();
          const { threadId } = btn.dataset;
          await this.handleThreadSubscription(threadId, btn);
        });
      });
  }

  async handleThreadSubscription(threadId, button) {
    if (!this.currentUser) {
      showNotification(
        'Please sign in to subscribe to notifications',
        'warning'
      );
      return;
    }

    try {
      // Subscribe to forum notifications
      await this.forumService.subscribeToThread(threadId, this.currentUser.uid);

      // Subscribe to push notifications if available
      if (firebaseService) {
        await firebaseService.subscribeToThreadNotifications(threadId);
      }

      // Update button state
      button.classList.add('subscribed');
      button.innerHTML = '🔕 Unsubscribe';
      button.title = 'Unsubscribe from notifications';

      showNotification('Subscribed to thread notifications!', 'success');
    } catch (error) {
      this.handleError('Error subscribing to thread', error);
      showNotification('Failed to subscribe to notifications', 'error');
    }
  }

  createThreadHTML(thread) {
    const {
      id,
      title,
      content,
      author,
      createdAt,
      category,
      tags = [],
      messageCount = 0,
      lastActivity,
      isPinned = false,
      isLocked = false,
      status,
    } = thread;

    const preview =
      content.substring(0, CONFIG.PREVIEW_LENGTH) +
      (content.length > CONFIG.PREVIEW_LENGTH ? '...' : '');
    const timeAgo = this.formatTimeAgo(createdAt);
    const lastActivityAgo = lastActivity
      ? this.formatTimeAgo(lastActivity)
      : timeAgo;

    return `
            <article class="thread-item ${isPinned ? 'pinned' : ''} ${isLocked ? 'locked' : ''}" 
                     data-thread-id="${id}"
                     role="button"
                     tabindex="0"
                     aria-label="Thread: ${title}">
                <div class="thread-indicators">
                    ${isPinned ? '<span class="indicator pinned" title="Pinned">📌</span>' : ''}
                    ${isLocked ? '<span class="indicator locked" title="Locked">🔒</span>' : ''}
                    ${status === 'solved' ? '<span class="indicator solved" title="Solved">✅</span>' : ''}
                </div>
                
                <div class="thread-content">
                    <header class="thread-header">
                        <h3 class="thread-title">${this.escapeHtml(title)}</h3>
                        <div class="thread-meta">
                            <span class="thread-author">${this.escapeHtml(author.displayName || author.email || 'Anonymous')}</span>
                            <span class="thread-timestamp" title="${new Date(createdAt).toLocaleString()}">
                                ${timeAgo}
                            </span>
                            <span class="thread-category">${this.escapeHtml(category)}</span>
                        </div>
                    </header>
                    
                    <div class="thread-preview">
                        ${this.escapeHtml(preview)}
                    </div>
                    
                    ${
                      tags.length > 0
                        ? `
                        <div class="thread-tags">
                            ${tags.map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('')}
                        </div>
                    `
                        : ''
                    }
                </div>
                
                <div class="thread-stats">
                    <div class="stat-item">
                        <span class="stat-icon">💬</span>
                        <span class="stat-value">${messageCount}</span>
                        <span class="stat-label">replies</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-icon">⏰</span>
                        <span class="stat-value">${lastActivityAgo}</span>
                        <span class="stat-label">last activity</span>
                    </div>
                </div>
                
                <div class="thread-actions">
                    <button class="action-btn subscribe-btn" 
                            data-thread-id="${id}"
                            title="Subscribe to notifications"
                            aria-label="Subscribe to thread notifications">
                        🔔
                    </button>
                    ${
                      this.currentUser &&
                      (this.currentUser.uid === author.uid ||
                        this.canModerate())
                        ? `
                        <button class="action-btn edit-btn" 
                                data-thread-id="${id}"
                                title="Edit thread"
                                aria-label="Edit thread">
                            ✏️
                        </button>
                    `
                        : ''
                    }
                </div>
            </article>
        `;
  }

  async openThread(threadId) {
    try {
      this.currentThreadId = threadId;
      this.showLoading('Loading thread...');

      // Get thread details
      const thread = await this.forumService.getThread(threadId);
      if (!thread) {
        showNotification('Thread not found', 'error');
        return;
      }

      // Render thread in modal
      this.renderThreadModal(thread);

      // Load messages
      await this.loadThreadMessages(threadId);

      // Setup real-time message listener
      this.setupMessageRealTimeListener(threadId);

      // Show modal
      this.elements.threadModal?.classList.add('active');

      // Mark as read and update view count
      if (this.currentUser) {
        await this.forumService.markThreadAsRead(
          threadId,
          this.currentUser.uid
        );
      }

      this.hideLoading();
    } catch (error) {
      this.handleError('Error opening thread', error);
      this.hideLoading();
      showNotification('Failed to load thread', 'error');
    }
  }

  renderThreadModal(thread) {
    if (!this.elements.threadModal) return;

    this.elements.threadModalTitle.textContent = thread.title;
    this.elements.threadModalContent.innerHTML = this.formatContent(
      thread.content
    );
    this.elements.threadModalAuthor.textContent =
      thread.author.displayName || thread.author.email || 'Anonymous';
    this.elements.threadModalTimestamp.textContent = new Date(
      thread.createdAt
    ).toLocaleString();

    // Add thread actions
    const actionsContainer = this.elements.threadModal.querySelector(
      '.thread-actions-container'
    );
    if (actionsContainer) {
      actionsContainer.innerHTML = this.createThreadActionsHTML(thread);
    }
  }

  async loadThreadMessages(threadId) {
    try {
      const messages = await this.forumService.getThreadMessages(threadId);
      this.renderMessages(messages);
    } catch (error) {
      this.handleError('Error loading messages', error);
      showNotification('Failed to load messages', 'error');
    }
  }

  renderMessages(messages) {
    if (!this.elements.messagesList) return;

    const messagesHTML = messages
      .map(message => this.createMessageHTML(message))
      .join('');
    this.elements.messagesList.innerHTML = messagesHTML;

    // Add event listeners to message actions
    this.setupMessageEventListeners();

    // Scroll to bottom
    this.elements.messagesList.scrollTop =
      this.elements.messagesList.scrollHeight;
  }

  createMessageHTML(message) {
    const {
      id,
      content,
      author,
      createdAt,
      editedAt,
      replyTo,
      replyDepth = 0,
      likeCount = 0,
      isHelpful = false,
      isExpertAnswer = false,
    } = message;

    const timeAgo = this.formatTimeAgo(createdAt);
    const isOwn = this.currentUser && this.currentUser.uid === author.uid;
    const canModerate = this.canModerate();

    return `
            <div class="message-item ${isExpertAnswer ? 'expert-answer' : ''}" 
                 data-message-id="${id}"
                 style="margin-left: ${replyDepth * CONFIG.REPLY_INDENT}px">
                
                <div class="message-header">
                    <div class="message-author">
                        <img src="${author.photoURL || '/src/assets/icons/default-avatar.svg'}" 
                             alt="${author.displayName || 'User'}" 
                             class="author-avatar">
                        <span class="author-name">${this.escapeHtml(author.displayName || author.email || 'Anonymous')}</span>
                        ${isExpertAnswer ? '<span class="expert-badge">Expert</span>' : ''}
                    </div>
                    <div class="message-meta">
                        <span class="message-timestamp" title="${new Date(createdAt).toLocaleString()}">
                            ${timeAgo}
                        </span>
                        ${editedAt ? '<span class="edited-indicator">(edited)</span>' : ''}
                    </div>
                </div>
                
                ${
                  replyTo
                    ? `
                    <div class="reply-context">
                        <span class="reply-indicator">↳ Replying to ${replyTo.authorName}</span>
                    </div>
                `
                    : ''
                }
                
                <div class="message-content">
                    ${this.formatContent(content)}
                </div>
                
                <div class="message-actions">
                    <button class="action-btn like-btn ${likeCount > 0 ? 'liked' : ''}" 
                            data-message-id="${id}"
                            title="Like this message">
                        👍 <span class="like-count">${likeCount}</span>
                    </button>
                    
                    <button class="action-btn reply-btn" 
                            data-message-id="${id}"
                            title="Reply to this message">
                        💬 Reply
                    </button>
                    
                    ${
                      this.currentUser
                        ? `
                        <button class="action-btn helpful-btn ${isHelpful ? 'marked-helpful' : ''}" 
                                data-message-id="${id}"
                                title="Mark as helpful">
                            ⭐ Helpful
                        </button>
                    `
                        : ''
                    }
                    
                    ${
                      isOwn || canModerate
                        ? `
                        <button class="action-btn edit-message-btn" 
                                data-message-id="${id}"
                                title="Edit message">
                            ✏️ Edit
                        </button>
                    `
                        : ''
                    }
                    
                    ${
                      canModerate
                        ? `
                        <button class="action-btn moderate-btn" 
                                data-message-id="${id}"
                                title="Moderate message">
                            🛡️ Moderate
                        </button>
                    `
                        : ''
                    }
                </div>
            </div>
        `;
  }

  setupMessageEventListeners() {
    // Like buttons
    this.elements.messagesList?.querySelectorAll('.like-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const { messageId } = btn.dataset;
        this.handleMessageLike(messageId);
      });
    });

    // Reply buttons
    this.elements.messagesList?.querySelectorAll('.reply-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        const { messageId } = btn.dataset;
        this.handleMessageReply(messageId);
      });
    });

    // Helpful buttons
    this.elements.messagesList
      ?.querySelectorAll('.helpful-btn')
      .forEach(btn => {
        btn.addEventListener('click', e => {
          e.preventDefault();
          const { messageId } = btn.dataset;
          this.handleMarkHelpful(messageId);
        });
      });
  }

  async handleCreateThread(e) {
    e.preventDefault();

    if (!this.currentUser) {
      showNotification('Please sign in to create a thread', 'warning');
      return;
    }

    try {
      const formData = new FormData(e.target);
      const threadData = {
        title: formData.get('title').trim(),
        content: formData.get('content').trim(),
        category: formData.get('category'),
        tags: formData.get('tags')
          ? formData
              .get('tags')
              .split(',')
              .map(tag => tag.trim())
          : [],
        visibility: formData.get('visibility') || 'public',
      };

      if (!threadData.title || !threadData.content) {
        showNotification('Please fill in all required fields', 'warning');
        return;
      }

      this.showLoading('Creating thread...');

      const threadId = await this.forumService.createThread(
        threadData.title,
        threadData.content,
        this.currentUser.uid,
        {
          category: threadData.category,
          tags: threadData.tags,
          visibility: threadData.visibility,
        }
      );

      this.hideLoading();
      this.closeModals();

      showNotification('Thread created successfully!', 'success');

      // Refresh threads list
      await this.loadThreads();

      // Open the new thread
      setTimeout(() => this.openThread(threadId), CONFIG.THREAD_OPEN_DELAY);
    } catch (error) {
      this.handleError('Error creating thread', error);
      this.hideLoading();
      showNotification('Failed to create thread', 'error');
    }
  }

  async handleMessageSubmit() {
    if (!this.currentUser || !this.currentThreadId) {
      showNotification('Please sign in to post messages', 'warning');
      return;
    }

    const { messageInput } = this.elements;
    const content = messageInput?.value.trim();

    if (!content) {
      showNotification('Please enter a message', 'warning');
      return;
    }

    try {
      await this.forumService.addMessage(
        this.currentThreadId,
        content,
        this.currentUser.uid
      );

      messageInput.value = '';
      showNotification('Message posted!', 'success');
    } catch (error) {
      this.handleError('Error posting message', error);
      showNotification('Failed to post message', 'error');
    }
  }

  setupThreadsRealTimeListener(options) {
    // Clean up existing listener
    if (this.subscriptions.has('threads')) {
      this.subscriptions.get('threads')();
    }

    // Setup new listener
    const unsubscribe = this.forumService.subscribeToThreads(threads => {
      this.handleThreadsUpdate(threads);
    }, options);

    this.subscriptions.set('threads', unsubscribe);
  }

  setupMessageRealTimeListener(threadId) {
    // Clean up existing listener
    if (this.subscriptions.has('messages')) {
      this.subscriptions.get('messages')();
    }

    // Setup new listener
    const unsubscribe = this.forumService.subscribeToMessages(
      threadId,
      messages => {
        this.handleMessagesUpdate(messages);
      }
    );

    this.subscriptions.set('messages', unsubscribe);
  }

  handleThreadsUpdate(threads) {
    // Update threads list with new data
    this.renderThreads(threads);
  }

  handleMessagesUpdate(messages) {
    // Update messages list with new data
    this.renderMessages(messages);
  }

  // Utility methods
  formatTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);

    if (diffInSeconds < CONFIG.TIME_UNITS.MINUTE) return 'just now';
    if (diffInSeconds < CONFIG.TIME_UNITS.HOUR) {
      return `${Math.floor(diffInSeconds / CONFIG.TIME_UNITS.MINUTE)}m ago`;
    }
    if (diffInSeconds < CONFIG.TIME_UNITS.DAY) {
      return `${Math.floor(diffInSeconds / CONFIG.TIME_UNITS.HOUR)}h ago`;
    }
    if (diffInSeconds < CONFIG.TIME_UNITS.WEEK) {
      return `${Math.floor(diffInSeconds / CONFIG.TIME_UNITS.DAY)}d ago`;
    }

    return time.toLocaleDateString();
  }

  formatContent(content) {
    // Basic content formatting (you can enhance this)
    return content
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  canModerate() {
    return (
      this.currentUser &&
      (this.currentUser.role === 'admin' ||
        this.currentUser.role === 'moderator' ||
        this.currentUser.tier === 'donor')
    );
  }

  showLoading(message = 'Loading...') {
    if (this.elements.loading) {
      this.elements.loadingText.textContent = message;
      this.elements.loading.classList.add('active');
    }
  }

  hideLoading() {
    this.elements.loading?.classList.remove('active');
  }

  openCreateThreadModal() {
    if (!this.currentUser) {
      showNotification('Please sign in to create a thread', 'warning');
      return;
    }
    this.elements.createThreadModal?.classList.add('active');
  }

  closeModals() {
    this.elements.createThreadModal?.classList.remove('active');
    this.elements.threadModal?.classList.remove('active');

    // Clean up message listeners when closing thread
    if (this.subscriptions.has('messages')) {
      this.subscriptions.get('messages')();
      this.subscriptions.delete('messages');
    }

    this.currentThreadId = null;
  }

  async handleSearch() {
    const query = this.elements.searchInput?.value.trim();
    if (!query) {
      await this.loadThreads();
      return;
    }

    try {
      this.showLoading('Searching...');
      const results = await this.forumService.searchThreads(query);
      this.renderThreads(results);
      this.hideLoading();
    } catch (error) {
      this.handleError('Search failed', error);
      this.hideLoading();
      showNotification('Search failed', 'error');
    }
  }

  handleFiltering() {
    this.pagination.lastDoc = null;
    this.pagination.hasMore = true;
    this.loadThreads();
  }

  handleSorting() {
    this.pagination.lastDoc = null;
    this.pagination.hasMore = true;
    this.loadThreads();
  }

  handleScroll() {
    if (
      window.innerHeight + window.scrollY >=
      document.body.offsetHeight - CONFIG.SCROLL_THRESHOLD
    ) {
      this.loadThreads(true);
    }
  }

  handleKeyboardShortcuts(e) {
    // Add keyboard shortcuts for power users
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'n':
          e.preventDefault();
          this.openCreateThreadModal();
          break;
        case 'f':
          e.preventDefault();
          this.elements.searchInput?.focus();
          break;
        default:
          break;
      }
    }

    if (e.key === 'Escape') {
      this.closeModals();
    }
  }

  // Error handling method
  handleError(message, error) {
    // In production, you might want to send this to a logging service
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error(`${message}:`, error);
    }
  }

  // Placeholder methods for missing functionality
  async handleMessageLike(messageId) {
    if (!this.currentUser) {
      showNotification('Please sign in to like messages', 'warning');
      return;
    }

    try {
      await this.forumService.toggleMessageLike(
        messageId,
        this.currentUser.uid
      );
    } catch (error) {
      this.handleError('Error liking message', error);
      showNotification('Failed to like message', 'error');
    }
  }

  async handleMessageReply(messageId) {
    // Implementation for replying to messages
    if (!this.currentUser) {
      showNotification('Please sign in to reply', 'warning');
      return;
    }

    // Focus the message input and set reply context
    const { messageInput } = this.elements;
    if (messageInput) {
      messageInput.focus();
      messageInput.dataset.replyTo = messageId;
      messageInput.placeholder = 'Reply to message...';
    }
  }

  async handleMarkHelpful(messageId) {
    if (!this.currentUser) {
      showNotification('Please sign in to mark messages as helpful', 'warning');
      return;
    }

    try {
      await this.forumService.markMessageHelpful(
        messageId,
        this.currentUser.uid
      );
    } catch (error) {
      this.handleError('Error marking message helpful', error);
      showNotification('Failed to mark message as helpful', 'error');
    }
  }

  renderCategoryFilter(categories) {
    if (!this.elements.categoryFilter) return;

    const options = ['<option value="">All Categories</option>'];
    categories.forEach(category => {
      options.push(
        `<option value="${category.id}">${this.escapeHtml(category.name)}</option>`
      );
    });

    this.elements.categoryFilter.innerHTML = options.join('');
  }

  createThreadActionsHTML(thread) {
    const canEdit =
      this.currentUser &&
      (this.currentUser.uid === thread.authorUID || this.canModerate());

    return `
            <div class="thread-actions">
                <button class="action-btn subscribe-btn" title="Subscribe to notifications">
                    🔔 Subscribe
                </button>
                ${
                  canEdit
                    ? `
                    <button class="action-btn edit-thread-btn" title="Edit thread">
                        ✏️ Edit
                    </button>
                `
                    : ''
                }
                <button class="action-btn share-btn" title="Share thread">
                    🔗 Share
                </button>
            </div>
        `;
  }

  updateUserProfileDisplay(user) {
    // Update user profile display in the UI
    const profileElement = this.elements.userProfile;
    if (profileElement) {
      profileElement.innerHTML = `
                <div class="user-info">
                    <img src="${user.photoURL || '/src/assets/icons/default-avatar.svg'}" 
                         alt="${user.displayName || 'User'}" 
                         class="user-avatar">
                    <span class="user-name">${this.escapeHtml(user.displayName || user.email || 'User')}</span>
                </div>
            `;
    }
  }

  updateUserStatsDisplay(stats) {
    // Update user forum statistics display
    const statsElement = document.querySelector('.user-forum-stats');
    if (statsElement && stats) {
      statsElement.innerHTML = `
                <div class="stat-item">
                    <span class="stat-label">Threads:</span>
                    <span class="stat-value">${stats.threadsCreated || 0}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Messages:</span>
                    <span class="stat-value">${stats.messagesPosted || 0}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Points:</span>
                    <span class="stat-value">${stats.totalPoints || 0}</span>
                </div>
            `;
    }
  }

  // Cleanup method
  destroy() {
    // Unsubscribe from all real-time listeners
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions.clear();
  }
}

// Initialize forum integration when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.forumIntegration = new ForumPageIntegration();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.forumIntegration) {
    window.forumIntegration.destroy();
  }
});

export { ForumPageIntegration };
