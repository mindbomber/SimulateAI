/**
 * Blog Service for SimulateAI Research Community
 * Implements Firestore-based blog system with advanced features
 * Based on Firebase/Firestore best practices for blog content
 */

import FirebaseService from './firebase-service.js';
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

class BlogService extends FirebaseService {
  constructor() {
    super();
    this.postsCache = new Map();
    this.activeListeners = new Map();
    this.lastDocument = null;
    this.postsPerPage = 10;

    // Configuration constants
    this.MAX_TITLE_LENGTH = 200;
    this.MAX_EXCERPT_LENGTH = 300;
    this.SEARCH_RESULTS_LIMIT = 50;
    this.WORDS_PER_MINUTE = 200;

    // Search scoring weights
    this.SEARCH_WEIGHTS = {
      TITLE: 10,
      TAG: 8,
      EXCERPT: 5,
      BODY: 2,
    };
  }

  /**
   * Create a new blog post with comprehensive metadata
   * Implements versioning, draft states, and rich content structure
   */
  async createPost(postData) {
    try {
      if (!this.currentUser) {
        throw new Error('Authentication required to create posts');
      }

      // Validate required fields
      this.validatePostData(postData);

      // Create comprehensive post document
      const post = {
        // Core content
        title: postData.title.trim(),
        body: postData.body,
        excerpt: postData.excerpt || this.generateExcerpt(postData.body),

        // Author information
        authorUID: this.currentUser.uid,
        authorName: this.currentUser.displayName || 'Anonymous',
        authorEmail: this.currentUser.email,
        authorPhoto: this.currentUser.photoURL,
        authorBio: postData.authorBio || '',
        authorAffiliation: postData.authorAffiliation || '',

        // Metadata and categorization
        tags: Array.isArray(postData.tags) ? postData.tags : [],
        category: postData.category || 'general',
        primaryTopic: postData.primaryTopic || postData.category,
        contentType: postData.contentType || 'article',

        // Timestamps and versioning
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastEdited: serverTimestamp(),
        publishedAt: postData.isPublished ? serverTimestamp() : null,

        // Publication and visibility
        isPublished: postData.isPublished || false,
        isDraft: !postData.isPublished,
        visibility: postData.visibility || 'public', // public, private, unlisted
        status: postData.isPublished ? 'published' : 'draft',

        // Engagement metrics
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        shareCount: 0,
        readTime: this.calculateReadTime(postData.body),

        // Content quality and moderation
        featured: postData.featured || false,
        sticky: postData.sticky || false,
        moderated: false,
        flagged: false,

        // SEO and discovery
        slug: this.generateSlug(postData.title),
        keywords: postData.keywords || [],
        metaDescription: postData.metaDescription || postData.excerpt,

        // Research-specific fields
        researchType: postData.researchType || 'general',
        methodology: postData.methodology || '',
        citations: postData.citations || [],
        peerReviewed: postData.peerReviewed || false,
        academicLevel: postData.academicLevel || 'general',

        // Version control
        version: 1,
        versionHistory: [],

        // Analytics
        analytics: {
          avgReadTime: 0,
          bounceRate: 0,
          engagementScore: 0,
          lastAnalyzed: serverTimestamp(),
        },
      };

      // Add to posts collection
      const docRef = await addDoc(collection(this.db, 'posts'), post);

      // Create author's post reference
      await this.updateAuthorPostsList(this.currentUser.uid, docRef.id, 'add');

      // Index for search if published
      if (post.isPublished) {
        await this.indexPostForSearch(docRef.id, post);
      }

      // Clear cache to force refresh
      this.postsCache.clear();

      // Dispatch event for UI updates
      this.dispatchEvent('postCreated', { postId: docRef.id, post });

      return { id: docRef.id, ...post };
    } catch (error) {
      this.handleError('Error creating post', error);
      throw new Error(`Failed to create post: ${error.message}`);
    }
  }

  /**
   * Update existing post with version history
   */
  async updatePost(postId, updates) {
    try {
      if (!this.currentUser) {
        throw new Error('Authentication required');
      }

      const postRef = doc(this.db, 'posts', postId);
      const postDoc = await getDoc(postRef);

      if (!postDoc.exists()) {
        throw new Error('Post not found');
      }

      const currentPost = postDoc.data();

      // Verify ownership
      if (currentPost.authorUID !== this.currentUser.uid) {
        throw new Error('Unauthorized: Can only edit your own posts');
      }

      // Create version history entry
      const versionEntry = {
        version: currentPost.version,
        updatedAt: currentPost.updatedAt,
        changes: this.detectChanges(currentPost, updates),
        updatedBy: this.currentUser.uid,
      };

      // Prepare update data
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
        lastEdited: serverTimestamp(),
        version: increment(1),
        versionHistory: arrayUnion(versionEntry),
      };

      // Update published timestamp if publishing for first time
      if (updates.isPublished && !currentPost.isPublished) {
        updateData.publishedAt = serverTimestamp();
        updateData.isDraft = false;
        updateData.status = 'published';
      }

      await updateDoc(postRef, updateData);

      // Update search index if published
      if (updateData.isPublished) {
        await this.indexPostForSearch(postId, {
          ...currentPost,
          ...updateData,
        });
      }

      // Clear cache
      this.postsCache.delete(postId);

      this.dispatchEvent('postUpdated', { postId, updates: updateData });

      return true;
    } catch (error) {
      this.handleError('Error updating post', error);
      throw error;
    }
  }

  /**
   * Get posts with advanced querying capabilities
   * Supports filtering by tag, author, date, category, etc.
   */
  async getPosts(options = {}) {
    try {
      const {
        category = null,
        tags = [],
        authorUID = null,
        status = 'published',
        featured = null,
        limit: limitCount = this.postsPerPage,
        orderByField = 'publishedAt',
        orderDirection = 'desc',
        startAfter: startAfterDoc = null,
        realtime = false,
      } = options;

      // Build query
      let q = collection(this.db, 'posts');

      // Apply filters
      const constraints = [];

      if (status) {
        constraints.push(where('status', '==', status));
      }

      if (category) {
        constraints.push(where('category', '==', category));
      }

      if (authorUID) {
        constraints.push(where('authorUID', '==', authorUID));
      }

      if (featured !== null) {
        constraints.push(where('featured', '==', featured));
      }

      if (tags.length > 0) {
        constraints.push(where('tags', 'array-contains-any', tags));
      }

      // Add ordering
      constraints.push(orderBy(orderByField, orderDirection));

      // Add pagination
      if (startAfterDoc) {
        constraints.push(startAfter(startAfterDoc));
      }

      constraints.push(limit(limitCount));

      q = query(q, ...constraints);

      if (realtime) {
        return this.setupRealtimePostListener(q, options);
      }

      const querySnapshot = await getDocs(q);
      const posts = [];

      querySnapshot.forEach(doc => {
        const post = { id: doc.id, ...doc.data() };
        posts.push(this.processPostData(post));
        this.postsCache.set(doc.id, post);
      });

      // Store last document for pagination
      if (querySnapshot.docs.length > 0) {
        this.lastDocument = querySnapshot.docs[querySnapshot.docs.length - 1];
      }

      return posts;
    } catch (error) {
      this.handleError('Error getting posts', error);
      throw error;
    }
  }

  /**
   * Get single post by ID with view tracking
   */
  async getPost(postId, trackView = true) {
    try {
      // Check cache first
      if (this.postsCache.has(postId)) {
        const cachedPost = this.postsCache.get(postId);
        if (trackView) {
          this.trackPostView(postId);
        }
        return cachedPost;
      }

      const postRef = doc(this.db, 'posts', postId);
      const postDoc = await getDoc(postRef);

      if (!postDoc.exists()) {
        throw new Error('Post not found');
      }

      const post = { id: postDoc.id, ...postDoc.data() };
      const processedPost = this.processPostData(post);

      // Cache the post
      this.postsCache.set(postId, processedPost);

      // Track view
      if (trackView) {
        await this.trackPostView(postId);
      }

      return processedPost;
    } catch (error) {
      this.handleError('Error getting post', error);
      throw error;
    }
  }

  /**
   * Search posts with full-text search capabilities
   */
  async searchPosts(searchQuery, filters = {}) {
    try {
      if (!searchQuery || searchQuery.trim().length < 2) {
        return [];
      }

      const searchTerms = searchQuery
        .toLowerCase()
        .split(' ')
        .filter(term => term.length > 1);

      // Build base query
      let q = collection(this.db, 'posts');
      const constraints = [
        where('status', '==', 'published'),
        orderBy('publishedAt', 'desc'),
      ];

      // Apply additional filters
      if (filters.category) {
        constraints.push(where('category', '==', filters.category));
      }

      if (filters.tags && filters.tags.length > 0) {
        constraints.push(where('tags', 'array-contains-any', filters.tags));
      }

      q = query(q, ...constraints);

      const querySnapshot = await getDocs(q);
      const posts = [];

      querySnapshot.forEach(doc => {
        const post = { id: doc.id, ...doc.data() };

        // Client-side search scoring
        const score = this.calculateSearchScore(post, searchTerms);
        if (score > 0) {
          post.searchScore = score;
          posts.push(this.processPostData(post));
        }
      });

      // Sort by search relevance
      posts.sort((a, b) => b.searchScore - a.searchScore);

      return posts.slice(0, this.SEARCH_RESULTS_LIMIT);
    } catch (error) {
      this.handleError('Error searching posts', error);
      throw error;
    }
  }

  /**
   * Add comment to post using subcollection
   */
  async addComment(postId, commentData) {
    try {
      if (!this.currentUser) {
        throw new Error('Authentication required to comment');
      }

      const comment = {
        content: commentData.content.trim(),
        authorUID: this.currentUser.uid,
        authorName: this.currentUser.displayName || 'Anonymous',
        authorPhoto: this.currentUser.photoURL,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likeCount: 0,
        replies: [],
        flagged: false,
        parentId: commentData.parentId || null, // For threaded comments
      };

      // Add to comments subcollection
      const commentsRef = collection(this.db, 'posts', postId, 'comments');
      const docRef = await addDoc(commentsRef, comment);

      // Update post comment count
      const postRef = doc(this.db, 'posts', postId);
      await updateDoc(postRef, {
        commentCount: increment(1),
        updatedAt: serverTimestamp(),
      });

      // Clear post cache
      this.postsCache.delete(postId);

      this.dispatchEvent('commentAdded', {
        postId,
        commentId: docRef.id,
        comment,
      });

      return { id: docRef.id, ...comment };
    } catch (error) {
      this.handleError('Error adding comment', error);
      throw error;
    }
  }

  /**
   * Get comments for a post
   */
  async getComments(postId, options = {}) {
    try {
      const {
        limit: limitCount = 20,
        orderBy: orderByField = 'createdAt',
        orderDirection = 'desc',
      } = options;

      const commentsRef = collection(this.db, 'posts', postId, 'comments');
      const q = query(
        commentsRef,
        orderBy(orderByField, orderDirection),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const comments = [];

      querySnapshot.forEach(doc => {
        comments.push({ id: doc.id, ...doc.data() });
      });

      return comments;
    } catch (error) {
      this.handleError('Error getting comments', error);
      throw error;
    }
  }

  /**
   * Like/unlike a post
   */
  async togglePostLike(postId) {
    try {
      if (!this.currentUser) {
        throw new Error('Authentication required');
      }

      const userLikesRef = doc(
        this.db,
        'users',
        this.currentUser.uid,
        'likes',
        postId
      );
      const userLikeDoc = await getDoc(userLikesRef);
      const hasLiked = userLikeDoc.exists();

      const postRef = doc(this.db, 'posts', postId);

      if (hasLiked) {
        // Unlike
        await deleteDoc(userLikesRef);
        await updateDoc(postRef, {
          likeCount: increment(-1),
        });
      } else {
        // Like
        await setDoc(userLikesRef, {
          likedAt: serverTimestamp(),
          postId,
        });
        await updateDoc(postRef, {
          likeCount: increment(1),
        });
      }

      // Clear cache
      this.postsCache.delete(postId);

      this.dispatchEvent('postLikeToggled', { postId, liked: !hasLiked });

      return !hasLiked;
    } catch (error) {
      this.handleError('Error toggling post like', error);
      throw error;
    }
  }

  /**
   * Get user's liked posts
   */
  async getUserLikedPosts() {
    try {
      if (!this.currentUser) return [];

      const likesRef = collection(
        this.db,
        'users',
        this.currentUser.uid,
        'likes'
      );
      const q = query(likesRef, orderBy('likedAt', 'desc'));
      const querySnapshot = await getDocs(q);

      const likedPostIds = [];
      querySnapshot.forEach(doc => {
        likedPostIds.push(doc.id);
      });

      return likedPostIds;
    } catch (error) {
      this.handleError('Error getting user liked posts', error);
      return [];
    }
  }

  /**
   * Get posts by category with analytics
   */
  async getPostsByCategory(category, limit = 10) {
    try {
      return await this.getPosts({
        category,
        limit,
        status: 'published',
        orderByField: 'publishedAt',
        orderDirection: 'desc',
      });
    } catch (error) {
      this.handleError('Error getting posts by category', error);
      throw error;
    }
  }

  /**
   * Get featured posts
   */
  async getFeaturedPosts(limit = 5) {
    try {
      return await this.getPosts({
        featured: true,
        limit,
        status: 'published',
        orderByField: 'publishedAt',
        orderDirection: 'desc',
      });
    } catch (error) {
      this.handleError('Error getting featured posts', error);
      throw error;
    }
  }

  /**
   * Get user's draft posts
   */
  async getUserDrafts() {
    try {
      if (!this.currentUser) return [];

      return await this.getPosts({
        authorUID: this.currentUser.uid,
        status: 'draft',
        orderByField: 'updatedAt',
        orderDirection: 'desc',
      });
    } catch (error) {
      this.handleError('Error getting user drafts', error);
      return [];
    }
  }

  /**
   * Utility Methods
   */

  validatePostData(postData) {
    if (!postData.title || postData.title.trim().length === 0) {
      throw new Error('Post title is required');
    }

    if (!postData.body || postData.body.trim().length === 0) {
      throw new Error('Post content is required');
    }

    if (postData.title.length > this.MAX_TITLE_LENGTH) {
      throw new Error(
        `Post title too long (max ${this.MAX_TITLE_LENGTH} characters)`
      );
    }
  }

  generateExcerpt(body, maxLength = this.MAX_EXCERPT_LENGTH) {
    const plainText = body.replace(/<[^>]*>/g, '').replace(/\n+/g, ' ');
    return plainText.length > maxLength
      ? `${plainText.substring(0, maxLength).trim()}...`
      : plainText;
  }

  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  calculateReadTime(content) {
    const wordCount = content.trim().split(/\s+/).length;
    return Math.ceil(wordCount / this.WORDS_PER_MINUTE);
  }

  calculateSearchScore(post, searchTerms) {
    let score = 0;
    const title = post.title.toLowerCase();
    const body = post.body.toLowerCase();
    const excerpt = (post.excerpt || '').toLowerCase();
    const tags = post.tags.map(tag => tag.toLowerCase());

    searchTerms.forEach(term => {
      // Title matches get highest score
      if (title.includes(term)) score += this.SEARCH_WEIGHTS.TITLE;

      // Tag matches get high score
      if (tags.some(tag => tag.includes(term)))
        score += this.SEARCH_WEIGHTS.TAG;

      // Excerpt matches get medium score
      if (excerpt.includes(term)) score += this.SEARCH_WEIGHTS.EXCERPT;

      // Body matches get lower score
      if (body.includes(term)) score += this.SEARCH_WEIGHTS.BODY;
    });

    return score;
  }

  processPostData(post) {
    // Convert Firestore timestamps to JavaScript Date objects
    if (post.createdAt && typeof post.createdAt.toDate === 'function') {
      post.createdAt = post.createdAt.toDate();
    }

    if (post.publishedAt && typeof post.publishedAt.toDate === 'function') {
      post.publishedAt = post.publishedAt.toDate();
    }

    if (post.updatedAt && typeof post.updatedAt.toDate === 'function') {
      post.updatedAt = post.updatedAt.toDate();
    }

    return post;
  }

  async trackPostView(postId) {
    try {
      const postRef = doc(this.db, 'posts', postId);
      await updateDoc(postRef, {
        viewCount: increment(1),
      });
    } catch (error) {
      this.handleError('Error tracking post view', error);
    }
  }

  async updateAuthorPostsList(authorUID, postId, action) {
    try {
      const userRef = doc(this.db, 'users', authorUID);
      const updateData = {};

      if (action === 'add') {
        updateData.postIds = arrayUnion(postId);
        updateData.postCount = increment(1);
      } else if (action === 'remove') {
        updateData.postIds = arrayRemove(postId);
        updateData.postCount = increment(-1);
      }

      await updateDoc(userRef, updateData);
    } catch (error) {
      this.handleError('Error updating author posts list', error);
    }
  }

  async indexPostForSearch(postId, post) {
    // This would integrate with a search service like Algolia or implement custom indexing
    this.logInfo('Indexing post for search', { postId, title: post.title });
  }

  setupRealtimePostListener(query, options) {
    const listenerId = `posts_${Date.now()}`;

    const unsubscribe = onSnapshot(query, querySnapshot => {
      const posts = [];
      querySnapshot.forEach(doc => {
        const post = { id: doc.id, ...doc.data() };
        posts.push(this.processPostData(post));
      });

      this.dispatchEvent('postsUpdated', { posts, options });
    });

    this.activeListeners.set(listenerId, unsubscribe);
    return unsubscribe;
  }

  detectChanges(oldPost, updates) {
    const changes = [];

    Object.keys(updates).forEach(key => {
      if (oldPost[key] !== updates[key]) {
        changes.push({
          field: key,
          oldValue: oldPost[key],
          newValue: updates[key],
        });
      }
    });

    return changes;
  }

  dispatchEvent(eventName, detail) {
    window.dispatchEvent(new CustomEvent(`blog:${eventName}`, { detail }));
  }

  // Error handling and logging methods
  handleError(context, error) {
    if (this.currentUser) {
      // Log error for debugging in development
      if (window.location.hostname === 'localhost') {
        // eslint-disable-next-line no-console
        console.error(`${context}:`, error);
      }
    }
    // In production, you might want to send to error tracking service
  }

  logInfo(context, data) {
    if (window.location.hostname === 'localhost') {
      // eslint-disable-next-line no-console
      console.log(`${context}:`, data);
    }
  }

  // Cleanup method
  cleanup() {
    this.activeListeners.forEach(unsubscribe => unsubscribe());
    this.activeListeners.clear();
    this.postsCache.clear();
  }
}

export default BlogService;
