/**
 * Blog Admin Dashboard - JavaScript Controller
 * Handles admin authentication, post management, and UI interactions with DataHandler integration
 * Copyright 2025 Armando Sori
 */

import AuthService from "../services/auth-service.js";
import BlogService from "../services/blog-service.js";
import DataHandler from "../core/data-handler.js";
import { showNotification } from "../components/notification-toast.js";

class BlogAdminDashboard {
  constructor() {
    this.authService = new AuthService();
    this.blogService = new BlogService();

    // Initialize DataHandler for admin operations
    this.dataHandler = new DataHandler({
      appName: "SimulateAI-BlogAdmin",
      version: "1.60",
      enableCaching: true,
      enableOfflineQueue: true,
    });

    this.currentUser = null;
    this.posts = [];
    this.filteredPosts = [];
    this.currentEditingPost = null;
    this.isEditMode = false;

    // Admin email configuration
    this.ADMIN_EMAIL = "research@simulateai.io";

    this.init();
  }

  async init() {
    this.showLoading(true);

    try {
      // Initialize services
      await this.authService.initialize();
      await this.blogService.initialize();

      // Check authentication status
      await this.checkAdminAuth();

      // Setup event listeners
      this.setupEventListeners();
    } catch (error) {
      console.error("Dashboard initialization error:", error);
      this.showError("Failed to initialize dashboard");
    } finally {
      this.showLoading(false);
    }
  }

  async checkAdminAuth() {
    const user = this.authService.getCurrentUser();

    if (!user || user.email !== this.ADMIN_EMAIL) {
      this.showAuthScreen();
      return false;
    }

    this.currentUser = user;
    this.showDashboard();
    await this.loadDashboardData();
    return true;
  }

  showAuthScreen() {
    document.getElementById("auth-check").style.display = "flex";
    document.getElementById("main-content").style.display = "none";
  }

  showDashboard() {
    document.getElementById("auth-check").style.display = "none";
    document.getElementById("main-content").style.display = "block";
    document.getElementById("admin-email").textContent = this.currentUser.email;
  }

  async loadDashboardData() {
    try {
      this.showLoading(true);

      // Load all posts using the admin method
      this.posts = await this.blogService.getAllPosts({
        limit: 100,
        includeUnpublished: true,
      });

      this.filteredPosts = [...this.posts];

      // Update dashboard stats
      this.updateDashboardStats();

      // Render posts table
      this.renderPostsTable();
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      this.showError("Failed to load dashboard data");
    } finally {
      this.showLoading(false);
    }
  }

  updateDashboardStats() {
    const totalPosts = this.posts.length;
    const draftPosts = this.posts.filter(
      (post) => post.status === "draft",
    ).length;
    const totalViews = this.posts.reduce(
      (sum, post) => sum + (post.views || 0),
      0,
    );
    const totalComments = this.posts.reduce(
      (sum, post) => sum + (post.commentsCount || 0),
      0,
    );

    document.getElementById("total-posts-count").textContent = totalPosts;
    document.getElementById("draft-posts-count").textContent = draftPosts;
    document.getElementById("total-views-count").textContent =
      totalViews.toLocaleString();
    document.getElementById("total-comments-count").textContent = totalComments;
  }

  renderPostsTable() {
    const tbody = document.getElementById("posts-table-body");

    if (this.filteredPosts.length === 0) {
      tbody.innerHTML = `
        <tr class="no-posts">
          <td colspan="5">No posts found. Create your first post!</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.filteredPosts
      .map(
        (post) => `
      <tr data-post-id="${post.id}">
        <td>
          <div class="post-title-cell">
            <h4>${this.escapeHtml(post.title)}</h4>
            <small>${this.escapeHtml(post.excerpt || "No excerpt")}</small>
          </div>
        </td>
        <td>
          <span class="status-badge status-${post.status}">
            ${post.status}
          </span>
        </td>
        <td>
          <span title="${new Date(post.createdAt).toLocaleString()}">
            ${this.formatDateShort(post.createdAt)}
          </span>
        </td>
        <td>${(post.views || 0).toLocaleString()}</td>
        <td>
          <div class="post-actions">
            <button class="action-btn edit" onclick="adminDashboard.editPost('${post.id}')">
              ✏️ Edit
            </button>
            <button class="action-btn view" onclick="adminDashboard.viewPost('${post.id}')">
              👁️ View
            </button>
            <button class="action-btn delete" onclick="adminDashboard.deletePost('${post.id}')">
              🗑️ Delete
            </button>
          </div>
        </td>
      </tr>
    `,
      )
      .join("");
  }

  setupEventListeners() {
    // Admin sign in
    document
      .getElementById("admin-sign-in-btn")
      .addEventListener("click", async () => {
        try {
          this.showLoading(true);
          await this.authService.signInWithGoogle();

          // Wait for auth state change
          setTimeout(async () => {
            await this.checkAdminAuth();
          }, 1000);
        } catch (error) {
          console.error("Sign in error:", error);
          this.showError("Sign in failed. Please try again.");
        } finally {
          this.showLoading(false);
        }
      });

    // Admin logout
    document
      .getElementById("admin-logout-btn")
      .addEventListener("click", async () => {
        try {
          await this.authService.signOut();
          this.showAuthScreen();
          this.showNotification("Signed out successfully", "success");
        } catch (error) {
          console.error("Sign out error:", error);
          this.showError("Sign out failed");
        }
      });

    // New post button
    document.getElementById("new-post-btn").addEventListener("click", () => {
      this.openPostEditor();
    });

    // Search posts
    document.getElementById("posts-search").addEventListener("input", (e) => {
      this.filterPosts(e.target.value);
    });

    // Filter posts
    document.getElementById("posts-filter").addEventListener("change", (e) => {
      this.filterPostsByStatus(e.target.value);
    });

    // Post editor form
    document
      .getElementById("post-editor-form")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        this.handlePostSubmit();
      });

    // Save draft button
    document.getElementById("save-draft-btn").addEventListener("click", () => {
      this.savePostDraft();
    });

    // Preview button
    document
      .getElementById("preview-post-btn")
      .addEventListener("click", () => {
        this.previewPost();
      });

    // Modal close handlers
    document.querySelectorAll(".modal-close, .modal-cancel").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.closePostEditor();
      });
    });

    // Image upload
    this.setupImageUpload();

    // Character counters
    this.setupCharacterCounters();

    // Editor toolbar
    this.setupEditorToolbar();
  }

  setupImageUpload() {
    const fileInput = document.getElementById("post-image");
    const placeholder = document.getElementById("image-placeholder");
    const preview = document.getElementById("image-preview");
    const previewImg = document.getElementById("preview-img");
    const removeBtn = document.getElementById("remove-image");

    placeholder.addEventListener("click", () => {
      fileInput.click();
    });

    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          // 2MB limit
          this.showError("Image size must be less than 2MB");
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          previewImg.src = e.target.result;
          placeholder.style.display = "none";
          preview.style.display = "block";
        };
        reader.readAsDataURL(file);
      }
    });

    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      fileInput.value = "";
      placeholder.style.display = "block";
      preview.style.display = "none";
      previewImg.src = "";
    });
  }

  setupCharacterCounters() {
    const titleInput = document.getElementById("post-title");
    const titleCount = document.getElementById("title-count");

    titleInput.addEventListener("input", () => {
      titleCount.textContent = titleInput.value.length;
    });
  }

  setupEditorToolbar() {
    const toolbar = document.querySelector(".editor-toolbar");
    const textarea = document.getElementById("post-body");

    toolbar.addEventListener("click", (e) => {
      if (e.target.classList.contains("toolbar-btn")) {
        const format = e.target.dataset.format;
        this.insertMarkdown(textarea, format);
      }
    });
  }

  insertMarkdown(textarea, format) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    let replacement = "";
    let cursorOffset = 0;

    switch (format) {
      case "bold":
        replacement = `**${selectedText || "bold text"}**`;
        cursorOffset = selectedText ? 0 : -3;
        break;
      case "italic":
        replacement = `*${selectedText || "italic text"}*`;
        cursorOffset = selectedText ? 0 : -1;
        break;
      case "link":
        replacement = `[${selectedText || "link text"}](URL)`;
        cursorOffset = selectedText ? -4 : -4;
        break;
      case "image":
        replacement = `![alt text](image URL)`;
        cursorOffset = -11;
        break;
      case "youtube":
        replacement = `[youtube:VIDEO_ID]`;
        cursorOffset = -9;
        break;
    }

    const newText =
      text.substring(0, start) + replacement + text.substring(end);
    textarea.value = newText;

    const newCursorPos = start + replacement.length + cursorOffset;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    textarea.focus();
  }

  filterPosts(searchTerm) {
    const term = searchTerm.toLowerCase().trim();

    if (!term) {
      this.filteredPosts = [...this.posts];
    } else {
      this.filteredPosts = this.posts.filter(
        (post) =>
          post.title.toLowerCase().includes(term) ||
          post.body.toLowerCase().includes(term) ||
          (post.tags &&
            post.tags.some((tag) => tag.toLowerCase().includes(term))),
      );
    }

    this.renderPostsTable();
  }

  filterPostsByStatus(status) {
    if (status === "all") {
      this.filteredPosts = [...this.posts];
    } else {
      this.filteredPosts = this.posts.filter((post) => post.status === status);
    }

    this.renderPostsTable();
  }

  openPostEditor(postId = null) {
    this.isEditMode = !!postId;
    this.currentEditingPost = postId;

    const modal = document.getElementById("post-editor-modal");
    const title = document.getElementById("editor-title");
    const form = document.getElementById("post-editor-form");

    title.textContent = this.isEditMode ? "Edit Post" : "Create New Post";

    if (this.isEditMode) {
      this.loadPostForEditing(postId);
    } else {
      form.reset();
      this.resetImageUpload();
    }

    modal.style.display = "flex";
  }

  async loadPostForEditing(postId) {
    try {
      const post = this.posts.find((p) => p.id === postId);
      if (!post) {
        this.showError("Post not found");
        return;
      }

      document.getElementById("post-title").value = post.title;
      document.getElementById("post-body").value = post.body;
      document.getElementById("post-tags").value = post.tags
        ? post.tags.join(", ")
        : "";
      document.getElementById("post-category").value =
        post.category || "article";

      // Update character counter
      document.getElementById("title-count").textContent = post.title.length;

      // Load featured image if exists
      if (post.featuredImage) {
        const previewImg = document.getElementById("preview-img");
        const placeholder = document.getElementById("image-placeholder");
        const preview = document.getElementById("image-preview");

        previewImg.src = post.featuredImage;
        placeholder.style.display = "none";
        preview.style.display = "block";
      }
    } catch (error) {
      console.error("Error loading post for editing:", error);
      this.showError("Failed to load post data");
    }
  }

  closePostEditor() {
    document.getElementById("post-editor-modal").style.display = "none";
    this.currentEditingPost = null;
    this.isEditMode = false;
    this.resetImageUpload();
  }

  resetImageUpload() {
    document.getElementById("post-image").value = "";
    document.getElementById("image-placeholder").style.display = "block";
    document.getElementById("image-preview").style.display = "none";
    document.getElementById("preview-img").src = "";
  }

  async handlePostSubmit() {
    try {
      this.showLoading(true);

      const formData = this.collectFormData();

      if (!this.validatePostData(formData)) {
        return;
      }

      if (this.isEditMode) {
        await this.blogService.updatePost(this.currentEditingPost, formData);
      } else {
        await this.blogService.createPost(formData);
      }

      this.showNotification(
        this.isEditMode
          ? "Post updated successfully!"
          : "Post published successfully!",
        "success",
      );

      this.closePostEditor();
      await this.loadDashboardData();
    } catch (error) {
      console.error("Error saving post:", error);
      this.showError("Failed to save post. Please try again.");
    } finally {
      this.showLoading(false);
    }
  }

  async savePostDraft() {
    try {
      this.showLoading(true);

      const formData = this.collectFormData();
      formData.status = "draft";

      if (this.isEditMode) {
        await this.blogService.updatePost(this.currentEditingPost, formData);
      } else {
        await this.blogService.createPost(formData);
      }

      this.showNotification("Draft saved successfully!", "success");
      await this.loadDashboardData();
    } catch (error) {
      console.error("Error saving draft:", error);
      this.showError("Failed to save draft");
    } finally {
      this.showLoading(false);
    }
  }

  collectFormData() {
    const title = document.getElementById("post-title").value.trim();
    const body = document.getElementById("post-body").value.trim();
    const tags = document
      .getElementById("post-tags")
      .value.split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    const category = document.getElementById("post-category").value;
    const imageFile = document.getElementById("post-image").files[0];

    return {
      title,
      body,
      tags,
      category,
      status: "published",
      featuredImage: imageFile, // Will be handled by BlogService for upload
      author: {
        uid: this.currentUser.uid,
        displayName: this.currentUser.displayName || "Research Team",
        email: this.currentUser.email,
      },
    };
  }

  validatePostData(data) {
    if (!data.title) {
      this.showError("Title is required");
      return false;
    }

    if (!data.body) {
      this.showError("Content is required");
      return false;
    }

    if (data.title.length > 200) {
      this.showError("Title must be less than 200 characters");
      return false;
    }

    return true;
  }

  async editPost(postId) {
    this.openPostEditor(postId);
  }

  async viewPost(postId) {
    const post = this.posts.find((p) => p.id === postId);
    if (post) {
      // Open post in new tab/window
      window.open(`/blog.html#post=${postId}`, "_blank");
    }
  }

  async deletePost(postId) {
    const post = this.posts.find((p) => p.id === postId);
    if (!post) return;

    const confirmed = confirm(
      `Are you sure you want to delete "${post.title}"? This action cannot be undone.`,
    );

    if (confirmed) {
      try {
        this.showLoading(true);

        await this.blogService.deletePost(postId);

        this.showNotification("Post deleted successfully", "success");
        await this.loadDashboardData();
      } catch (error) {
        console.error("Error deleting post:", error);
        this.showError("Failed to delete post");
      } finally {
        this.showLoading(false);
      }
    }
  }

  previewPost() {
    const formData = this.collectFormData();

    if (!this.validatePostData(formData)) {
      return;
    }

    // Open preview in new window
    const previewWindow = window.open("", "_blank");

    const previewHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Preview: ${this.escapeHtml(formData.title)}</title>
          <link rel="stylesheet" href="/src/styles/main.css">
          <link rel="stylesheet" href="/src/styles/professional-blog.css">
        </head>
        <body>
          <div class="container">
            <article class="blog-post">
              <h1>${this.escapeHtml(formData.title)}</h1>
              <div class="post-meta">
                <span>Category: ${formData.category}</span>
                <span>Tags: ${formData.tags.join(", ")}</span>
              </div>
              <div class="post-content">
                ${this.renderMarkdown(formData.body)}
              </div>
            </article>
          </div>
        </body>
      </html>
    `;

    previewWindow.document.write(previewHtml);
    previewWindow.document.close();
  }

  renderMarkdown(text) {
    // Simple markdown renderer for preview
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(
        /\[youtube:(.*?)\]/g,
        '<div class="youtube-embed">YouTube Video: $1</div>',
      )
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
      .replace(/\n\n/g, "</p><p>")
      .replace(/^/, "<p>")
      .replace(/$/, "</p>");
  }

  // Utility methods
  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  formatDateShort(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString();
  }

  showLoading(show) {
    document.getElementById("loading").style.display = show ? "flex" : "none";
  }

  showError(message) {
    this.showNotification(message, "error");
  }

  showNotification(message, type = "info") {
    if (typeof showNotification === "function") {
      showNotification(message, type);
    } else {
      console.log(`${type.toUpperCase()}: ${message}`);
      alert(message);
    }
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.adminDashboard = new BlogAdminDashboard();
});

export default BlogAdminDashboard;
