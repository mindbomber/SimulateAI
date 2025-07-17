/**
 * Blog Comment System Component
 * Handles displaying and managing comments on blog posts
 */

export class BlogCommentSystem {
  constructor(postId, containerId) {
    this.postId = postId;
    this.container = document.getElementById(containerId);
    this.comments = [];
    this.currentUser = null;
    this.isAuthenticated = false;

    this.init();
  }

  async init() {
    try {
      // Check authentication status
      await this.checkAuthStatus();

      // Load existing comments
      await this.loadComments();

      // Render the comment system
      this.render();

      // Set up event listeners
      this.setupEventListeners();
    } catch (error) {
      console.error('Error initializing comment system:', error);
    }
  }

  async checkAuthStatus() {
    // This would integrate with your auth service
    // For now, we'll simulate auth check
    const user = localStorage.getItem('currentUser');
    this.isAuthenticated = !!user;
    this.currentUser = user ? JSON.parse(user) : null;
  }

  async loadComments() {
    try {
      // In a real implementation, this would load from Firestore
      // For now, we'll use localStorage for demo purposes
      const storedComments = localStorage.getItem(`comments_${this.postId}`);
      this.comments = storedComments ? JSON.parse(storedComments) : [];
    } catch (error) {
      console.error('Error loading comments:', error);
      this.comments = [];
    }
  }

  async saveComments() {
    try {
      localStorage.setItem(
        `comments_${this.postId}`,
        JSON.stringify(this.comments)
      );
    } catch (error) {
      console.error('Error saving comments:', error);
    }
  }

  render() {
    const html = `
      <div class="comment-system">
        <div class="comment-header">
          <h3 class="comment-title">
            <span class="comment-icon">💬</span>
            Comments (${this.comments.length})
          </h3>
          <div class="comment-actions">
            ${
              this.isAuthenticated
                ? '<button class="btn btn-outline btn-small" id="refresh-comments">🔄 Refresh</button>'
                : '<span class="auth-prompt">Sign in to comment</span>'
            }
          </div>
        </div>

        ${this.renderCommentForm()}
        
        <div class="comments-container">
          ${this.renderComments()}
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }

  renderCommentForm() {
    if (!this.isAuthenticated) {
      return `
        <div class="comment-form-disabled">
          <div class="auth-required">
            <div class="auth-icon">🔐</div>
            <h4>Sign in to join the conversation</h4>
            <p>Share your thoughts and engage with the community by commenting on this post.</p>
            <div class="auth-actions">
              <button class="btn btn-primary" id="signin-btn">Sign In</button>
              <button class="btn btn-outline" id="signup-btn">Create Account</button>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="comment-form">
        <div class="form-header">
          <div class="user-info">
            <div class="user-avatar">${this.currentUser?.displayName?.charAt(0)?.toUpperCase() || 'U'}</div>
            <span class="user-name">${this.currentUser?.displayName || 'Anonymous'}</span>
          </div>
        </div>
        
        <form id="comment-form" class="comment-input-form">
          <div class="form-group">
            <textarea 
              id="comment-content" 
              class="comment-textarea" 
              placeholder="Share your thoughts on this post..."
              rows="4"
              maxlength="1000"
            ></textarea>
            <div class="character-count">
              <span id="char-count">0</span>/1000
            </div>
          </div>
          
          <div class="form-actions">
            <div class="comment-options">
              <label class="checkbox-container">
                <input type="checkbox" id="notify-replies" checked>
                <span class="checkmark"></span>
                <span class="checkbox-label">Notify me of replies</span>
              </label>
            </div>
            
            <div class="submit-actions">
              <button type="button" class="btn btn-outline" id="cancel-comment">Cancel</button>
              <button type="submit" class="btn btn-primary" id="submit-comment">
                <span class="btn-icon">💬</span>
                Post Comment
              </button>
            </div>
          </div>
        </form>
      </div>
    `;
  }

  renderComments() {
    if (this.comments.length === 0) {
      return `
        <div class="no-comments">
          <div class="no-comments-icon">💭</div>
          <h4>Be the first to comment!</h4>
          <p>Start the conversation about this post. Your insights and questions help build our community.</p>
        </div>
      `;
    }

    return this.comments
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(comment => this.renderComment(comment))
      .join('');
  }

  renderComment(comment) {
    const timeAgo = this.getTimeAgo(new Date(comment.createdAt));
    const isAuthor =
      this.currentUser && this.currentUser.uid === comment.authorId;

    return `
      <div class="comment-item" data-comment-id="${comment.id}">
        <div class="comment-content">
          <div class="comment-header">
            <div class="comment-author">
              <div class="author-avatar">${comment.authorName?.charAt(0)?.toUpperCase() || 'A'}</div>
              <div class="author-info">
                <span class="author-name">${comment.authorName || 'Anonymous'}</span>
                <span class="comment-meta">
                  <time class="comment-time">${timeAgo}</time>
                  ${comment.isEdited ? '<span class="edited-indicator">(edited)</span>' : ''}
                </span>
              </div>
            </div>
            
            <div class="comment-actions">
              ${
                isAuthor
                  ? `
                <button class="comment-action-btn edit-comment" data-comment-id="${comment.id}">
                  <span class="action-icon">✏️</span>
                  Edit
                </button>
                <button class="comment-action-btn delete-comment" data-comment-id="${comment.id}">
                  <span class="action-icon">🗑️</span>
                  Delete
                </button>
              `
                  : ''
              }
              <button class="comment-action-btn reply-comment" data-comment-id="${comment.id}">
                <span class="action-icon">↩️</span>
                Reply
              </button>
            </div>
          </div>
          
          <div class="comment-body">
            <p class="comment-text">${this.escapeHtml(comment.content)}</p>
          </div>
          
          <div class="comment-footer">
            <div class="comment-reactions">
              <button class="reaction-btn like-btn ${comment.userLiked ? 'liked' : ''}" 
                      data-comment-id="${comment.id}">
                <span class="reaction-icon">👍</span>
                <span class="reaction-count">${comment.likes || 0}</span>
              </button>
            </div>
          </div>
        </div>
        
        ${
          comment.replies && comment.replies.length > 0
            ? `
          <div class="comment-replies">
            ${comment.replies.map(reply => this.renderReply(reply)).join('')}
          </div>
        `
            : ''
        }
      </div>
    `;
  }

  renderReply(reply) {
    const timeAgo = this.getTimeAgo(new Date(reply.createdAt));
    const isAuthor =
      this.currentUser && this.currentUser.uid === reply.authorId;

    return `
      <div class="comment-reply" data-reply-id="${reply.id}">
        <div class="reply-content">
          <div class="reply-header">
            <div class="reply-author">
              <div class="author-avatar small">${reply.authorName?.charAt(0)?.toUpperCase() || 'A'}</div>
              <span class="author-name">${reply.authorName || 'Anonymous'}</span>
              <span class="reply-time">${timeAgo}</span>
            </div>
            
            ${
              isAuthor
                ? `
              <div class="reply-actions">
                <button class="reply-action-btn delete-reply" data-reply-id="${reply.id}">
                  <span class="action-icon">🗑️</span>
                </button>
              </div>
            `
                : ''
            }
          </div>
          
          <div class="reply-body">
            <p class="reply-text">${this.escapeHtml(reply.content)}</p>
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    // Comment form submission
    const commentForm = document.getElementById('comment-form');
    if (commentForm) {
      commentForm.addEventListener('submit', e => this.handleCommentSubmit(e));
    }

    // Character counter
    const textarea = document.getElementById('comment-content');
    if (textarea) {
      textarea.addEventListener('input', e =>
        this.updateCharacterCount(e.target.value)
      );
    }

    // Comment actions
    this.container.addEventListener('click', e => {
      const target = e.target.closest('button');
      if (!target) return;

      const { commentId } = target.dataset;
      const { replyId } = target.dataset;

      if (target.classList.contains('like-btn')) {
        this.handleLike(commentId);
      } else if (target.classList.contains('reply-comment')) {
        this.handleReply(commentId);
      } else if (target.classList.contains('edit-comment')) {
        this.handleEdit(commentId);
      } else if (target.classList.contains('delete-comment')) {
        this.handleDelete(commentId);
      } else if (target.classList.contains('delete-reply')) {
        this.handleDeleteReply(replyId);
      } else if (target.id === 'refresh-comments') {
        this.refreshComments();
      }
    });
  }

  async handleCommentSubmit(e) {
    e.preventDefault();

    const content = document.getElementById('comment-content').value.trim();
    if (!content) return;

    try {
      const newComment = {
        id: `comment_${Date.now()}`,
        postId: this.postId,
        authorId: this.currentUser.uid,
        authorName: this.currentUser.displayName,
        content,
        createdAt: new Date().toISOString(),
        likes: 0,
        replies: [],
        isEdited: false,
      };

      this.comments.unshift(newComment);
      await this.saveComments();

      // Clear form
      document.getElementById('comment-content').value = '';
      this.updateCharacterCount('');

      // Re-render
      this.render();
      this.setupEventListeners();

      // Show success message
      this.showMessage('Comment posted successfully!', 'success');
    } catch (error) {
      console.error('Error posting comment:', error);
      this.showMessage('Failed to post comment. Please try again.', 'error');
    }
  }

  handleLike(commentId) {
    const comment = this.comments.find(c => c.id === commentId);
    if (!comment) return;

    // Toggle like status
    comment.userLiked = !comment.userLiked;
    comment.likes = (comment.likes || 0) + (comment.userLiked ? 1 : -1);

    this.saveComments();
    this.render();
    this.setupEventListeners();
  }

  async handleReply(commentId) {
    // For now, we'll use a simple prompt. In a real implementation,
    // you'd show an inline reply form
    const replyContent = prompt('Enter your reply:');
    if (!replyContent) return;

    const comment = this.comments.find(c => c.id === commentId);
    if (!comment) return;

    if (!comment.replies) comment.replies = [];

    const newReply = {
      id: `reply_${Date.now()}`,
      parentId: commentId,
      authorId: this.currentUser.uid,
      authorName: this.currentUser.displayName,
      content: replyContent,
      createdAt: new Date().toISOString(),
    };

    comment.replies.push(newReply);
    await this.saveComments();

    this.render();
    this.setupEventListeners();

    this.showMessage('Reply posted successfully!', 'success');
  }

  async handleEdit(commentId) {
    const comment = this.comments.find(c => c.id === commentId);
    if (!comment) return;

    const newContent = prompt('Edit your comment:', comment.content);
    if (!newContent || newContent === comment.content) return;

    comment.content = newContent;
    comment.isEdited = true;
    comment.editedAt = new Date().toISOString();

    await this.saveComments();

    this.render();
    this.setupEventListeners();

    this.showMessage('Comment updated successfully!', 'success');
  }

  async handleDelete(commentId) {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    this.comments = this.comments.filter(c => c.id !== commentId);
    await this.saveComments();

    this.render();
    this.setupEventListeners();

    this.showMessage('Comment deleted successfully!', 'success');
  }

  async handleDeleteReply(replyId) {
    if (!confirm('Are you sure you want to delete this reply?')) return;

    this.comments.forEach(comment => {
      if (comment.replies) {
        comment.replies = comment.replies.filter(r => r.id !== replyId);
      }
    });

    await this.saveComments();

    this.render();
    this.setupEventListeners();

    this.showMessage('Reply deleted successfully!', 'success');
  }

  async refreshComments() {
    await this.loadComments();
    this.render();
    this.setupEventListeners();
    this.showMessage('Comments refreshed!', 'info');
  }

  updateCharacterCount(value) {
    const charCount = document.getElementById('char-count');
    if (charCount) {
      charCount.textContent = value.length;

      // Add warning style if approaching limit
      const container = charCount.parentElement;
      if (value.length > 900) {
        container.classList.add('warning');
      } else {
        container.classList.remove('warning');
      }
    }
  }

  getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showMessage(message, type = 'info') {
    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.className = `comment-toast ${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 100);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  }
}

// Auto-initialize comment systems on blog posts
document.addEventListener('DOMContentLoaded', () => {
  const commentContainers = document.querySelectorAll('[data-comment-system]');
  commentContainers.forEach(container => {
    const { postId } = container.dataset;
    if (postId) {
      new BlogCommentSystem(postId, container.id);
    }
  });
});

export default BlogCommentSystem;
