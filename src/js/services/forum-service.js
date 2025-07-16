/**
 * Forum Service for SimulateAI Community Platform
 * Implements advanced Firestore-based forum system with real-time features
 * Based on Firebase/Firestore best practices for forum architecture
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

class ForumService extends FirebaseService {
  constructor() {
    super();
    this.threadsCache = new Map();
    this.messagesCache = new Map();
    this.activeListeners = new Map();
    this.lastDocument = null;
    this.threadsPerPage = 20;
    this.messagesPerPage = 50;

    // Configuration constants
    this.MAX_TITLE_LENGTH = 200;
    this.MAX_MESSAGE_LENGTH = 10000;
    this.MAX_TAGS = 10;
    this.CACHE_DURATION_MINUTES = 5;
    this.SECONDS_PER_MINUTE = 60;
    this.MS_PER_SECOND = 1000;
    this.MINUTES_TO_MS = this.SECONDS_PER_MINUTE * this.MS_PER_SECOND;
    this.CACHE_DURATION = this.CACHE_DURATION_MINUTES * this.MINUTES_TO_MS;
    this.SEARCH_RESULTS_LIMIT = 50;
    this.EXCERPT_LENGTH = 200;

    // Search scoring weights
    this.SEARCH_WEIGHTS = {
      TITLE: 15,
      TAG: 10,
      CONTENT: 5,
      CATEGORY: 3,
      FEATURED_BONUS: 20,
      PINNED_BONUS: 15,
      SOLVED_BONUS: 10,
      POPULAR_BONUS: 5,
      POPULAR_THRESHOLD: 10,
      QUALITY_BONUS: 5,
    };

    // Moderation and gamification settings
    this.MODERATION_THRESHOLDS = {
      SPAM_REPORTS: 3,
      AUTO_HIDE: 5,
      EXPERT_VOTES_NEEDED: 2,
    };

    this.POINTS_SYSTEM = {
      CREATE_THREAD: 5,
      POST_MESSAGE: 2,
      RECEIVE_LIKE: 1,
      MARKED_HELPFUL: 10,
      EXPERT_ANSWER: 25,
    };
  }

  /**
   * Create a new discussion thread with comprehensive metadata
   * Implements nested structure with real-time capabilities
   */
  async createThread(threadData) {
    try {
      if (!this.currentUser) {
        throw new Error('Authentication required to create threads');
      }

      this.validateThreadData(threadData);

      // Create comprehensive thread document
      const thread = {
        // Core content
        title: threadData.title.trim(),
        content: threadData.content,
        excerpt: this.generateExcerpt(threadData.content),

        // Author information
        authorUID: this.currentUser.uid,
        authorName: this.currentUser.displayName || 'Anonymous',
        authorEmail: this.currentUser.email,
        authorPhoto: this.currentUser.photoURL,
        authorTier: await this.getUserTier(this.currentUser.uid),

        // Categorization and metadata
        category: threadData.category || 'general',
        tags: Array.isArray(threadData.tags)
          ? threadData.tags.slice(0, this.MAX_TAGS)
          : [],
        priority: threadData.priority || 'normal',
        type: threadData.type || 'discussion', // discussion, question, announcement

        // Timestamps
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastActivityAt: serverTimestamp(),

        // Status and visibility
        status: 'active', // active, locked, archived, deleted
        visibility: threadData.visibility || 'public', // public, private, members-only
        isPinned: threadData.isPinned || false,
        isFeatured: false,

        // Engagement metrics
        viewCount: 0,
        messageCount: 0,
        likeCount: 0,
        participantCount: 1,
        participantUIDs: [this.currentUser.uid],

        // Moderation and quality
        moderated: false,
        moderatedBy: null,
        moderatedAt: null,
        flagCount: 0,
        reportCount: 0,
        qualityScore: 0,

        // Thread-specific features
        isSolved: false,
        solvedAt: null,
        solvedBy: null,
        bestAnswerId: null,
        expertAnswerIds: [],

        // Real-time and interaction
        lastMessage: null,
        lastMessageAt: null,
        lastMessageBy: null,

        // Gamification
        helpfulVotes: 0,
        expertVotes: 0,
        communityScore: 0,

        // Notifications and subscriptions
        subscriberUIDs: [this.currentUser.uid],
        notificationsSent: 0,

        // Analytics
        analytics: {
          avgResponseTime: 0,
          expertParticipation: false,
          resolutionRate: 0,
          engagementScore: 0,
        },
      };

      // Add to threads collection
      const docRef = await addDoc(collection(this.db, 'threads'), thread);

      // Award points for creating thread
      await this.awardPoints(
        this.currentUser.uid,
        this.POINTS_SYSTEM.CREATE_THREAD,
        'thread_created'
      );

      // Update user's thread count
      await this.updateUserForumStats(
        this.currentUser.uid,
        'threadsCreated',
        1
      );

      // Clear cache
      this.threadsCache.clear();

      // Dispatch event for real-time updates
      this.dispatchEvent('threadCreated', { threadId: docRef.id, thread });

      return { id: docRef.id, ...thread };
    } catch (error) {
      this.handleError('Error creating thread', error);
      throw new Error(`Failed to create thread: ${error.message}`);
    }
  }

  /**
   * Add message to thread using subcollection
   * Implements real-time messaging with reply chains
   */
  async addMessage(threadId, messageData) {
    try {
      if (!this.currentUser) {
        throw new Error('Authentication required to post messages');
      }

      this.validateMessageData(messageData);

      const message = {
        // Core content
        content: messageData.content.trim(),

        // Author information
        authorUID: this.currentUser.uid,
        authorName: this.currentUser.displayName || 'Anonymous',
        authorEmail: this.currentUser.email,
        authorPhoto: this.currentUser.photoURL,
        authorTier: await this.getUserTier(this.currentUser.uid),

        // Threading and replies
        parentId: messageData.parentId || null, // For nested replies
        replyDepth: messageData.replyDepth || 0,
        replyChain: messageData.replyChain || [],

        // Timestamps
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),

        // Engagement
        likeCount: 0,
        replyCount: 0,
        helpfulVotes: 0,

        // Quality and moderation
        flagged: false,
        flagCount: 0,
        reportCount: 0,
        moderated: false,
        isExpertAnswer: false,
        isBestAnswer: false,

        // Message metadata
        edited: false,
        editedAt: null,
        editHistory: [],

        // Gamification
        pointsAwarded: this.POINTS_SYSTEM.POST_MESSAGE,
        qualityScore: 0,

        // Analytics
        readBy: [],
        readCount: 0,
      };

      // Add to messages subcollection
      const messagesRef = collection(this.db, 'threads', threadId, 'messages');
      const docRef = await addDoc(messagesRef, message);

      // Update thread metadata
      const threadRef = doc(this.db, 'threads', threadId);
      const threadDoc = await getDoc(threadRef);

      if (threadDoc.exists()) {
        const threadData = threadDoc.data();
        const updateData = {
          messageCount: increment(1),
          lastActivityAt: serverTimestamp(),
          lastMessage: message.content.substring(0, 100),
          lastMessageAt: serverTimestamp(),
          lastMessageBy: this.currentUser.uid,
          updatedAt: serverTimestamp(),
        };

        // Add participant if not already included
        if (!threadData.participantUIDs.includes(this.currentUser.uid)) {
          updateData.participantUIDs = arrayUnion(this.currentUser.uid);
          updateData.participantCount = increment(1);
        }

        await updateDoc(threadRef, updateData);
      }

      // Update parent message reply count if this is a reply
      if (message.parentId) {
        const parentMessageRef = doc(
          this.db,
          'threads',
          threadId,
          'messages',
          message.parentId
        );
        await updateDoc(parentMessageRef, {
          replyCount: increment(1),
        });
      }

      // Award points for posting message
      await this.awardPoints(
        this.currentUser.uid,
        this.POINTS_SYSTEM.POST_MESSAGE,
        'message_posted'
      );

      // Update user forum stats
      await this.updateUserForumStats(
        this.currentUser.uid,
        'messagesPosted',
        1
      );

      // Clear caches
      this.threadsCache.delete(threadId);
      this.messagesCache.delete(threadId);

      // Dispatch events
      this.dispatchEvent('messageAdded', {
        threadId,
        messageId: docRef.id,
        message,
      });

      // Send notifications to thread subscribers
      await this.notifyThreadSubscribers(threadId, message);

      return { id: docRef.id, ...message };
    } catch (error) {
      this.handleError('Error adding message', error);
      throw error;
    }
  }

  /**
   * Get threads with advanced filtering and real-time updates
   * Implements cursor-based pagination as recommended
   */
  async getThreads(options = {}) {
    try {
      const {
        category = null,
        tags = [],
        status = 'active',
        priority = null,
        type = null,
        authorUID = null,
        pinned = null,
        featured = null,
        solved = null,
        limit: limitCount = this.threadsPerPage,
        orderByField = 'lastActivityAt',
        orderDirection = 'desc',
        startAfter: startAfterDoc = null,
        realtime = false,
      } = options;

      // Build query with multiple constraints
      let q = collection(this.db, 'threads');
      const constraints = [];

      // Apply filters
      if (status) {
        constraints.push(where('status', '==', status));
      }

      if (category) {
        constraints.push(where('category', '==', category));
      }

      if (authorUID) {
        constraints.push(where('authorUID', '==', authorUID));
      }

      if (priority) {
        constraints.push(where('priority', '==', priority));
      }

      if (type) {
        constraints.push(where('type', '==', type));
      }

      if (pinned !== null) {
        constraints.push(where('isPinned', '==', pinned));
      }

      if (featured !== null) {
        constraints.push(where('isFeatured', '==', featured));
      }

      if (solved !== null) {
        constraints.push(where('isSolved', '==', solved));
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
        return this.setupRealtimeThreadListener(q, options);
      }

      const querySnapshot = await getDocs(q);
      const threads = [];

      querySnapshot.forEach(doc => {
        const thread = { id: doc.id, ...doc.data() };
        threads.push(this.processThreadData(thread));
        this.threadsCache.set(doc.id, { thread, timestamp: Date.now() });
      });

      // Store last document for pagination
      if (querySnapshot.docs.length > 0) {
        this.lastDocument = querySnapshot.docs[querySnapshot.docs.length - 1];
      }

      return threads;
    } catch (error) {
      this.handleError('Error getting threads', error);
      throw error;
    }
  }

  /**
   * Get messages for a thread with real-time updates
   * Implements nested message structure and reply chains
   */
  async getMessages(threadId, options = {}) {
    try {
      const {
        limit: limitCount = this.messagesPerPage,
        orderByField = 'createdAt',
        orderDirection = 'asc',
        startAfter: startAfterDoc = null,
        realtime = false,
        includeReplies = true,
      } = options;

      // Check cache first
      const cacheKey = `${threadId}_${JSON.stringify(options)}`;
      const cached = this.messagesCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return cached.messages;
      }

      // Build query
      const messagesRef = collection(this.db, 'threads', threadId, 'messages');
      const constraints = [orderBy(orderByField, orderDirection)];

      // For threaded view, only get top-level messages initially
      if (!includeReplies) {
        constraints.push(where('parentId', '==', null));
      }

      if (startAfterDoc) {
        constraints.push(startAfter(startAfterDoc));
      }

      constraints.push(limit(limitCount));

      const q = query(messagesRef, ...constraints);

      if (realtime) {
        return this.setupRealtimeMessageListener(threadId, q, options);
      }

      const querySnapshot = await getDocs(q);
      const messages = [];

      querySnapshot.forEach(doc => {
        const message = { id: doc.id, ...doc.data() };
        messages.push(this.processMessageData(message));
      });

      // Cache the results
      this.messagesCache.set(cacheKey, {
        messages,
        timestamp: Date.now(),
      });

      // Track thread view
      await this.trackThreadView(threadId);

      return messages;
    } catch (error) {
      this.handleError('Error getting messages', error);
      throw error;
    }
  }

  /**
   * Search threads with advanced filtering
   */
  async searchThreads(searchQuery, filters = {}) {
    try {
      if (!searchQuery || searchQuery.trim().length < 2) {
        return [];
      }

      const searchTerms = searchQuery
        .toLowerCase()
        .split(' ')
        .filter(term => term.length > 1);

      // Build base query
      let q = collection(this.db, 'threads');
      const constraints = [
        where('status', '==', 'active'),
        where('visibility', '==', 'public'),
        orderBy('lastActivityAt', 'desc'),
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
      const threads = [];

      querySnapshot.forEach(doc => {
        const thread = { id: doc.id, ...doc.data() };

        // Client-side search scoring
        const score = this.calculateThreadSearchScore(thread, searchTerms);
        if (score > 0) {
          thread.searchScore = score;
          threads.push(this.processThreadData(thread));
        }
      });

      // Sort by search relevance
      threads.sort((a, b) => b.searchScore - a.searchScore);

      return threads.slice(0, this.SEARCH_RESULTS_LIMIT);
    } catch (error) {
      this.handleError('Error searching threads', error);
      throw error;
    }
  }

  /**
   * Like/unlike a thread or message
   */
  async toggleLike(itemType, itemId, threadId = null) {
    try {
      if (!this.currentUser) {
        throw new Error('Authentication required');
      }

      const userLikesRef = doc(
        this.db,
        'users',
        this.currentUser.uid,
        'likes',
        itemId
      );
      const userLikeDoc = await getDoc(userLikesRef);
      const hasLiked = userLikeDoc.exists();

      let itemRef;
      if (itemType === 'thread') {
        itemRef = doc(this.db, 'threads', itemId);
      } else if (itemType === 'message') {
        itemRef = doc(this.db, 'threads', threadId, 'messages', itemId);
      } else {
        throw new Error('Invalid item type');
      }

      if (hasLiked) {
        // Unlike
        await deleteDoc(userLikesRef);
        await updateDoc(itemRef, {
          likeCount: increment(-1),
        });
      } else {
        // Like
        await setDoc(userLikesRef, {
          likedAt: serverTimestamp(),
          itemType,
          itemId,
          threadId,
        });
        await updateDoc(itemRef, {
          likeCount: increment(1),
        });

        // Award points to content author
        const itemDoc = await getDoc(itemRef);
        if (itemDoc.exists()) {
          const { authorUID } = itemDoc.data();
          await this.awardPoints(
            authorUID,
            this.POINTS_SYSTEM.RECEIVE_LIKE,
            'received_like'
          );
        }
      }

      // Clear relevant caches
      if (itemType === 'thread') {
        this.threadsCache.delete(itemId);
      } else {
        this.messagesCache.delete(threadId);
      }

      this.dispatchEvent('likeToggled', {
        itemType,
        itemId,
        threadId,
        liked: !hasLiked,
      });

      return !hasLiked;
    } catch (error) {
      this.handleError('Error toggling like', error);
      throw error;
    }
  }

  /**
   * Mark message as helpful/best answer
   */
  async markAsHelpful(threadId, messageId, isExpertAnswer = false) {
    try {
      if (!this.currentUser) {
        throw new Error('Authentication required');
      }

      const messageRef = doc(
        this.db,
        'threads',
        threadId,
        'messages',
        messageId
      );
      const threadRef = doc(this.db, 'threads', threadId);

      const updateData = {
        helpfulVotes: increment(1),
        qualityScore: increment(this.SEARCH_WEIGHTS.QUALITY_BONUS),
      };

      if (isExpertAnswer) {
        updateData.isExpertAnswer = true;
        updateData.expertVotes = increment(1);
      }

      await updateDoc(messageRef, updateData);

      // Update thread if this becomes the best answer
      const messageDoc = await getDoc(messageRef);
      if (messageDoc.exists()) {
        const messageData = messageDoc.data();
        const { authorUID } = messageData;

        // Award points for helpful answer
        const points = isExpertAnswer
          ? this.POINTS_SYSTEM.EXPERT_ANSWER
          : this.POINTS_SYSTEM.MARKED_HELPFUL;
        await this.awardPoints(
          authorUID,
          points,
          isExpertAnswer ? 'expert_answer' : 'helpful_answer'
        );

        // Check if this should be marked as best answer
        if (
          messageData.helpfulVotes >=
          this.MODERATION_THRESHOLDS.EXPERT_VOTES_NEEDED
        ) {
          await updateDoc(threadRef, {
            bestAnswerId: messageId,
            isSolved: true,
            solvedAt: serverTimestamp(),
            solvedBy: this.currentUser.uid,
          });
        }
      }

      // Clear caches
      this.threadsCache.delete(threadId);
      this.messagesCache.delete(threadId);

      this.dispatchEvent('messageMarkedHelpful', {
        threadId,
        messageId,
        isExpertAnswer,
      });

      return true;
    } catch (error) {
      this.handleError('Error marking message as helpful', error);
      throw error;
    }
  }

  /**
   * Subscribe/unsubscribe to thread notifications
   */
  async toggleThreadSubscription(threadId) {
    try {
      if (!this.currentUser) {
        throw new Error('Authentication required');
      }

      const threadRef = doc(this.db, 'threads', threadId);
      const threadDoc = await getDoc(threadRef);

      if (!threadDoc.exists()) {
        throw new Error('Thread not found');
      }

      const threadData = threadDoc.data();
      const isSubscribed = threadData.subscriberUIDs.includes(
        this.currentUser.uid
      );

      if (isSubscribed) {
        // Unsubscribe
        await updateDoc(threadRef, {
          subscriberUIDs: arrayRemove(this.currentUser.uid),
        });
      } else {
        // Subscribe
        await updateDoc(threadRef, {
          subscriberUIDs: arrayUnion(this.currentUser.uid),
        });
      }

      this.dispatchEvent('threadSubscriptionToggled', {
        threadId,
        subscribed: !isSubscribed,
      });

      return !isSubscribed;
    } catch (error) {
      this.handleError('Error toggling thread subscription', error);
      throw error;
    }
  }

  /**
   * Report content for moderation
   */
  async reportContent(itemType, itemId, threadId, reason) {
    try {
      if (!this.currentUser) {
        throw new Error('Authentication required');
      }

      // Create moderation report
      const reportData = {
        reportedBy: this.currentUser.uid,
        reportedAt: serverTimestamp(),
        itemType,
        itemId,
        threadId,
        reason,
        status: 'pending',
        reviewedBy: null,
        reviewedAt: null,
        action: null,
      };

      await addDoc(collection(this.db, 'moderation-reports'), reportData);

      // Update item report count
      let itemRef;
      if (itemType === 'thread') {
        itemRef = doc(this.db, 'threads', itemId);
      } else {
        itemRef = doc(this.db, 'threads', threadId, 'messages', itemId);
      }

      await updateDoc(itemRef, {
        reportCount: increment(1),
        flagged: increment(1) >= this.MODERATION_THRESHOLDS.SPAM_REPORTS,
      });

      this.dispatchEvent('contentReported', {
        itemType,
        itemId,
        threadId,
        reason,
      });

      return true;
    } catch (error) {
      this.handleError('Error reporting content', error);
      throw error;
    }
  }

  /**
   * Utility Methods
   */

  validateThreadData(threadData) {
    if (!threadData.title || threadData.title.trim().length === 0) {
      throw new Error('Thread title is required');
    }

    if (!threadData.content || threadData.content.trim().length === 0) {
      throw new Error('Thread content is required');
    }

    if (threadData.title.length > this.MAX_TITLE_LENGTH) {
      throw new Error(
        `Thread title too long (max ${this.MAX_TITLE_LENGTH} characters)`
      );
    }

    if (threadData.content.length > this.MAX_MESSAGE_LENGTH) {
      throw new Error(
        `Thread content too long (max ${this.MAX_MESSAGE_LENGTH} characters)`
      );
    }
  }

  validateMessageData(messageData) {
    if (!messageData.content || messageData.content.trim().length === 0) {
      throw new Error('Message content is required');
    }

    if (messageData.content.length > this.MAX_MESSAGE_LENGTH) {
      throw new Error(
        `Message too long (max ${this.MAX_MESSAGE_LENGTH} characters)`
      );
    }
  }

  generateExcerpt(content, maxLength = this.EXCERPT_LENGTH) {
    const plainText = content.replace(/<[^>]*>/g, '').replace(/\n+/g, ' ');
    return plainText.length > maxLength
      ? `${plainText.substring(0, maxLength).trim()}...`
      : plainText;
  }

  calculateThreadSearchScore(thread, searchTerms) {
    let score = 0;
    const title = thread.title.toLowerCase();
    const content = thread.content.toLowerCase();
    const tags = thread.tags.map(tag => tag.toLowerCase());

    searchTerms.forEach(term => {
      // Title matches get highest score
      if (title.includes(term)) score += this.SEARCH_WEIGHTS.TITLE;

      // Tag matches get high score
      if (tags.some(tag => tag.includes(term)))
        score += this.SEARCH_WEIGHTS.TAG;

      // Content matches get medium score
      if (content.includes(term)) score += this.SEARCH_WEIGHTS.CONTENT;

      // Category match gets some score
      if (thread.category.toLowerCase().includes(term))
        score += this.SEARCH_WEIGHTS.CATEGORY;
    });

    // Boost score for quality indicators
    if (thread.isFeatured) score += this.SEARCH_WEIGHTS.FEATURED_BONUS;
    if (thread.isPinned) score += this.SEARCH_WEIGHTS.PINNED_BONUS;
    if (thread.isSolved) score += this.SEARCH_WEIGHTS.SOLVED_BONUS;
    if (thread.likeCount > this.SEARCH_WEIGHTS.POPULAR_THRESHOLD)
      score += this.SEARCH_WEIGHTS.POPULAR_BONUS;

    return score;
  }

  async getUserTier(uid) {
    try {
      const userDoc = await getDoc(doc(this.db, 'users', uid));
      return userDoc.exists() ? userDoc.data().tier || 'member' : 'member';
    } catch (error) {
      return 'member';
    }
  }

  async awardPoints(uid, points, reason) {
    try {
      const userRef = doc(this.db, 'users', uid);
      await updateDoc(userRef, {
        forumPoints: increment(points),
        totalPoints: increment(points),
      });

      // Record point transaction
      await addDoc(collection(this.db, 'point-transactions'), {
        uid,
        points,
        reason,
        timestamp: serverTimestamp(),
        source: 'forum',
      });
    } catch (error) {
      this.handleError('Error awarding points', error);
    }
  }

  async updateUserForumStats(uid, stat, increment_value) {
    try {
      const userRef = doc(this.db, 'users', uid);
      const updateData = {};
      updateData[`forumStats.${stat}`] = increment(increment_value);
      await updateDoc(userRef, updateData);
    } catch (error) {
      this.handleError('Error updating user forum stats', error);
    }
  }

  async trackThreadView(threadId) {
    try {
      const threadRef = doc(this.db, 'threads', threadId);
      await updateDoc(threadRef, {
        viewCount: increment(1),
      });
    } catch (error) {
      this.handleError('Error tracking thread view', error);
    }
  }

  async notifyThreadSubscribers(threadId, message) {
    // This would integrate with a notification service
    this.logInfo('Notifying thread subscribers', {
      threadId,
      messageAuthor: message.authorUID,
    });
  }

  processThreadData(thread) {
    // Convert Firestore timestamps to JavaScript Date objects
    if (thread.createdAt && typeof thread.createdAt.toDate === 'function') {
      thread.createdAt = thread.createdAt.toDate();
    }

    if (thread.updatedAt && typeof thread.updatedAt.toDate === 'function') {
      thread.updatedAt = thread.updatedAt.toDate();
    }

    if (
      thread.lastActivityAt &&
      typeof thread.lastActivityAt.toDate === 'function'
    ) {
      thread.lastActivityAt = thread.lastActivityAt.toDate();
    }

    return thread;
  }

  processMessageData(message) {
    // Convert Firestore timestamps to JavaScript Date objects
    if (message.createdAt && typeof message.createdAt.toDate === 'function') {
      message.createdAt = message.createdAt.toDate();
    }

    if (message.updatedAt && typeof message.updatedAt.toDate === 'function') {
      message.updatedAt = message.updatedAt.toDate();
    }

    return message;
  }

  setupRealtimeThreadListener(query, options) {
    const listenerId = `threads_${Date.now()}`;

    const unsubscribe = onSnapshot(query, querySnapshot => {
      const threads = [];
      querySnapshot.forEach(doc => {
        const thread = { id: doc.id, ...doc.data() };
        threads.push(this.processThreadData(thread));
      });

      this.dispatchEvent('threadsUpdated', { threads, options });
    });

    this.activeListeners.set(listenerId, unsubscribe);
    return unsubscribe;
  }

  setupRealtimeMessageListener(threadId, query, options) {
    const listenerId = `messages_${threadId}_${Date.now()}`;

    const unsubscribe = onSnapshot(query, querySnapshot => {
      const messages = [];
      querySnapshot.forEach(doc => {
        const message = { id: doc.id, ...doc.data() };
        messages.push(this.processMessageData(message));
      });

      this.dispatchEvent('messagesUpdated', { threadId, messages, options });
    });

    this.activeListeners.set(listenerId, unsubscribe);
    return unsubscribe;
  }

  // Error handling and logging methods
  handleError(context, error) {
    if (window.location.hostname === 'localhost') {
      // eslint-disable-next-line no-console
      console.error(`${context}:`, error);
    }
  }

  logInfo(context, data) {
    if (window.location.hostname === 'localhost') {
      // eslint-disable-next-line no-console
      console.log(`${context}:`, data);
    }
  }

  dispatchEvent(eventName, detail) {
    window.dispatchEvent(new CustomEvent(`forum:${eventName}`, { detail }));
  }

  // Cleanup method
  cleanup() {
    this.activeListeners.forEach(unsubscribe => unsubscribe());
    this.activeListeners.clear();
    this.threadsCache.clear();
    this.messagesCache.clear();
  }
}

export default ForumService;
