/**
 * Firebase Hybrid Data Service for SimulateAI
 * Intelligently uses both Firestore and Data Connect for optimal performance
 *
 * Data Connect Schema Integration:
 * - User: Structured user data with research participation tracking
 * - Scenario: AI ethics scenarios with JSON content storage
 * - SimulationDecision: User decision tracking with relational links
 * - Donation: Donation tracking with currency support
 * - ForumPost: Community discussion posts
 * - ForumComment: Threaded comments on forum posts
 */

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Data Connect will be imported when available
// import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';

/**
 * Hybrid Data Strategy Configuration
 */
const HYBRID_CONFIG = {
  // Use Firestore for real-time, flexible documents
  FIRESTORE_COLLECTIONS: [
    'analytics_scenario_performance',
    'analytics_framework_engagement',
    'analytics_session_tracking',
    'analytics_platform_metrics',
    'user_sessions',
    'notifications',
    'user_preferences',
    'badges',
  ],

  // Use Data Connect for structured, relational queries
  DATA_CONNECT_TABLES: [
    'User',
    'Scenario',
    'SimulationDecision',
    'Donation',
    'ForumPost',
    'ForumComment',
  ],

  // Performance thresholds for choosing data source
  THRESHOLDS: {
    LARGE_QUERY_SIZE: 100,
    COMPLEX_JOIN_THRESHOLD: 3,
    REAL_TIME_PRIORITY: ['user_sessions', 'notifications'],
    ANALYTICS_PRIORITY: ['analytics_*'],
  },
};

/**
 * Hybrid Data Service Class
 */
export class HybridDataService {
  constructor(firebaseApp) {
    this.app = firebaseApp;
    this.db = getFirestore(firebaseApp);
    this.dataConnect = null; // Will be initialized when Data Connect is available
    this.queryCache = new Map();
    this.realtimeListeners = new Map();
    this.performanceMetrics = {
      firestoreQueries: 0,
      dataConnectQueries: 0,
      cacheHits: 0,
      averageQueryTime: 0,
    };
  }

  /**
   * Initialize Data Connect (when available)
   */
  async initializeDataConnect() {
    try {
      // Data Connect initialization will be available soon
      // const { getDataConnect } = await import('firebase/data-connect');
      // this.dataConnect = getDataConnect(this.app);
      console.log('🔗 Data Connect initialization pending Firebase SDK update');
      return false;
    } catch (error) {
      console.warn('⚠️ Data Connect not available yet:', error.message);
      return false;
    }
  }

  /**
   * Intelligent data source selection
   */
  shouldUseDataConnect(operation, collection, options = {}) {
    // If Data Connect not available, use Firestore
    if (!this.dataConnect) return false;

    // Use Data Connect for structured tables
    if (HYBRID_CONFIG.DATA_CONNECT_TABLES.includes(collection)) return true;

    // Use Data Connect for complex queries with joins
    if (
      options.joins &&
      options.joins.length >= HYBRID_CONFIG.THRESHOLDS.COMPLEX_JOIN_THRESHOLD
    ) {
      return true;
    }

    // Use Data Connect for large analytical queries
    if (
      options.limit &&
      options.limit >= HYBRID_CONFIG.THRESHOLDS.LARGE_QUERY_SIZE
    ) {
      return true;
    }

    // Use Firestore for real-time operations
    if (
      HYBRID_CONFIG.THRESHOLDS.REAL_TIME_PRIORITY.some(pattern =>
        new RegExp(pattern.replace('*', '.*')).test(collection)
      )
    ) {
      return false;
    }

    return false;
  }

  /**
   * Hybrid User Operations
   */
  async createUser(userData) {
    const startTime = Date.now();

    try {
      // Use Data Connect schema for structured user data
      const dcUser = {
        displayName: userData.displayName || 'Anonymous User',
        email: userData.email,
        researchParticipationStatus: userData.researchParticipant || false,
        flairBadge: userData.flair?.badge || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Use Firestore for flexible user profile data
      const fsUser = {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Create in both systems for redundancy and flexibility
      const results = await Promise.allSettled([
        this.createDataConnectUser(dcUser),
        this.createFirestoreDocument('users', userData.uid, fsUser),
      ]);

      this.updatePerformanceMetrics('createUser', startTime);

      return {
        success: true,
        dataConnect: results[0].status === 'fulfilled',
        firestore: results[1].status === 'fulfilled',
        user: userData,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create Data Connect User (placeholder for when SDK is available)
   */
  async createDataConnectUser(userData) {
    // This will use Data Connect mutations when available
    // For now, fallback to Firestore
    return await this.createFirestoreDocument(
      'dc_users',
      userData.email,
      userData
    );
  }

  /**
   * Hybrid Scenario Operations
   */
  async createScenario(scenarioData) {
    const startTime = Date.now();

    try {
      // Use Data Connect for structured scenario metadata
      const dcScenario = {
        title: scenarioData.title,
        description: scenarioData.description,
        contentJson: JSON.stringify(scenarioData.content),
        difficultyLevel: scenarioData.difficultyLevel || 'intermediate',
        createdAt: new Date(),
      };

      // Use Firestore for flexible scenario content and analytics
      const fsScenario = {
        ...scenarioData,
        createdAt: serverTimestamp(),
        analytics: {
          completions: 0,
          averageScore: 0,
          feedbackSentiment: 'neutral',
        },
      };

      const results = await Promise.allSettled([
        this.createDataConnectScenario(dcScenario),
        this.createFirestoreDocument('scenarios', scenarioData.id, fsScenario),
      ]);

      this.updatePerformanceMetrics('createScenario', startTime);

      return {
        success: true,
        dataConnect: results[0].status === 'fulfilled',
        firestore: results[1].status === 'fulfilled',
        scenario: scenarioData,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create Data Connect Scenario (placeholder)
   */
  async createDataConnectScenario(scenarioData) {
    return await this.createFirestoreDocument(
      'dc_scenarios',
      `scenario_${Date.now()}`,
      scenarioData
    );
  }

  /**
   * Hybrid Decision Tracking
   */
  async recordSimulationDecision(decisionData) {
    const startTime = Date.now();

    try {
      // Use Data Connect for structured decision tracking with relationships
      const dcDecision = {
        scenario: { id: decisionData.scenarioId },
        user: decisionData.userId ? { id: decisionData.userId } : null,
        sessionId: decisionData.sessionId,
        decisionNodeId: decisionData.decisionNodeId,
        decisionText: decisionData.decisionText,
        timestamp: new Date(),
      };

      // Use Firestore for detailed decision analytics
      const fsDecision = {
        ...decisionData,
        timestamp: serverTimestamp(),
        analytics: {
          responseTime: decisionData.responseTime,
          ethicsScore: decisionData.ethicsScore,
          confidenceLevel: decisionData.confidenceLevel,
        },
      };

      const results = await Promise.allSettled([
        this.createDataConnectDecision(dcDecision),
        this.createFirestoreDocument(
          'simulation_decisions',
          `decision_${Date.now()}`,
          fsDecision
        ),
      ]);

      this.updatePerformanceMetrics('recordDecision', startTime);

      return {
        success: true,
        dataConnect: results[0].status === 'fulfilled',
        firestore: results[1].status === 'fulfilled',
        decision: decisionData,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create Data Connect Decision (placeholder)
   */
  async createDataConnectDecision(decisionData) {
    return await this.createFirestoreDocument(
      'dc_decisions',
      `decision_${Date.now()}`,
      decisionData
    );
  }

  /**
   * Hybrid Forum Operations
   */
  async createForumPost(postData) {
    const startTime = Date.now();

    try {
      // Use Data Connect for structured forum relationships
      const dcPost = {
        author: { id: postData.authorId },
        title: postData.title,
        content: postData.content,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Use Firestore for real-time forum features
      const fsPost = {
        ...postData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        realtime: {
          views: 0,
          likes: 0,
          commentsCount: 0,
          lastActivity: serverTimestamp(),
        },
      };

      const results = await Promise.allSettled([
        this.createDataConnectPost(dcPost),
        this.createFirestoreDocument('forum_posts', postData.id, fsPost),
      ]);

      this.updatePerformanceMetrics('createForumPost', startTime);

      return {
        success: true,
        dataConnect: results[0].status === 'fulfilled',
        firestore: results[1].status === 'fulfilled',
        post: postData,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create Data Connect Forum Post (placeholder)
   */
  async createDataConnectPost(postData) {
    return await this.createFirestoreDocument(
      'dc_forum_posts',
      `post_${Date.now()}`,
      postData
    );
  }

  /**
   * Hybrid Analytics Queries
   */
  async getAdvancedAnalytics(queryOptions = {}) {
    const startTime = Date.now();

    try {
      const useDataConnect = this.shouldUseDataConnect(
        'query',
        'analytics',
        queryOptions
      );

      if (useDataConnect) {
        return await this.getDataConnectAnalytics(queryOptions);
      } else {
        return await this.getFirestoreAnalytics(queryOptions);
      }
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      this.updatePerformanceMetrics('getAnalytics', startTime);
    }
  }

  /**
   * Data Connect Analytics (when available)
   */
  async getDataConnectAnalytics(queryOptions) {
    // Complex SQL-like queries will be available with Data Connect
    // For now, simulate with Firestore aggregation
    return await this.getFirestoreAnalytics(queryOptions);
  }

  /**
   * Firestore Analytics
   */
  async getFirestoreAnalytics(queryOptions) {
    const analytics = {
      userEngagement: await this.getUserEngagementStats(),
      scenarioPerformance: await this.getScenarioPerformanceStats(),
      donationMetrics: await this.getDonationStats(),
      forumActivity: await this.getForumActivityStats(),
    };

    return { success: true, data: analytics };
  }

  /**
   * Generic Firestore Operations
   */
  async createFirestoreDocument(collection, docId, data) {
    if (docId) {
      await setDoc(doc(this.db, collection, docId), data);
    } else {
      const docRef = await addDoc(collection(this.db, collection), data);
      return docRef.id;
    }
    return true;
  }

  async getFirestoreDocument(collection, docId) {
    const docRef = doc(this.db, collection, docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  }

  async queryFirestoreCollection(collection, queryOptions = {}) {
    let q = collection(this.db, collection);

    if (queryOptions.where) {
      queryOptions.where.forEach(([field, operator, value]) => {
        q = query(q, where(field, operator, value));
      });
    }

    if (queryOptions.orderBy) {
      queryOptions.orderBy.forEach(([field, direction = 'asc']) => {
        q = query(q, orderBy(field, direction));
      });
    }

    if (queryOptions.limit) {
      q = query(q, limit(queryOptions.limit));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Real-time Data Operations
   */
  subscribeToRealtimeUpdates(collection, docId, callback, queryOptions = {}) {
    const listenerId = `${collection}_${docId}_${Date.now()}`;

    let unsubscribe;

    if (docId) {
      // Document listener
      const docRef = doc(this.db, collection, docId);
      unsubscribe = onSnapshot(docRef, doc => {
        callback(doc.exists() ? { id: doc.id, ...doc.data() } : null);
      });
    } else {
      // Collection listener
      let q = collection(this.db, collection);

      if (queryOptions.where) {
        queryOptions.where.forEach(([field, operator, value]) => {
          q = query(q, where(field, operator, value));
        });
      }

      unsubscribe = onSnapshot(q, querySnapshot => {
        const docs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(docs);
      });
    }

    this.realtimeListeners.set(listenerId, unsubscribe);
    return listenerId;
  }

  unsubscribeFromRealtimeUpdates(listenerId) {
    const unsubscribe = this.realtimeListeners.get(listenerId);
    if (unsubscribe) {
      unsubscribe();
      this.realtimeListeners.delete(listenerId);
      return true;
    }
    return false;
  }

  /**
   * Analytics Helper Methods
   */
  async getUserEngagementStats() {
    try {
      const sessions = await this.queryFirestoreCollection(
        'analytics_session_tracking',
        {
          orderBy: [['timestamp', 'desc']],
          limit: 1000,
        }
      );

      return {
        totalSessions: sessions.length,
        averageSessionTime:
          sessions.reduce((acc, s) => acc + (s.duration || 0), 0) /
          sessions.length,
        activeUsers: new Set(sessions.map(s => s.userId)).size,
        bounceRate:
          sessions.filter(s => s.pageViews === 1).length / sessions.length,
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  async getScenarioPerformanceStats() {
    try {
      const performance = await this.queryFirestoreCollection(
        'analytics_scenario_performance',
        {
          orderBy: [['timestamp', 'desc']],
          limit: 500,
        }
      );

      const byScenario = performance.reduce((acc, p) => {
        if (!acc[p.scenarioId]) {
          acc[p.scenarioId] = { completions: 0, totalScore: 0, responses: [] };
        }
        acc[p.scenarioId].completions++;
        acc[p.scenarioId].totalScore += p.ethicsScore || 0;
        acc[p.scenarioId].responses.push(p);
        return acc;
      }, {});

      return Object.entries(byScenario).map(([scenarioId, stats]) => ({
        scenarioId,
        completions: stats.completions,
        averageScore: stats.totalScore / stats.completions,
        difficulty: this.calculateDifficulty(stats.responses),
      }));
    } catch (error) {
      return { error: error.message };
    }
  }

  async getDonationStats() {
    try {
      // This would be much more efficient with Data Connect SQL queries
      const donations = await this.queryFirestoreCollection('dc_donations', {
        orderBy: [['donationDate', 'desc']],
        limit: 1000,
      });

      return {
        totalAmount: donations.reduce((sum, d) => sum + d.amount, 0),
        totalDonations: donations.length,
        averageDonation:
          donations.reduce((sum, d) => sum + d.amount, 0) / donations.length,
        uniqueDonors: new Set(donations.map(d => d.userId)).size,
        byMonth: this.groupDonationsByMonth(donations),
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  async getForumActivityStats() {
    try {
      const [posts, comments] = await Promise.all([
        this.queryFirestoreCollection('dc_forum_posts', {
          orderBy: [['createdAt', 'desc']],
          limit: 500,
        }),
        this.queryFirestoreCollection('dc_forum_comments', {
          orderBy: [['createdAt', 'desc']],
          limit: 1000,
        }),
      ]);

      return {
        totalPosts: posts.length,
        totalComments: comments.length,
        activePosters: new Set(posts.map(p => p.authorId)).size,
        activeCommenters: new Set(comments.map(c => c.authorId)).size,
        engagementRate: comments.length / posts.length,
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Performance and Caching
   */
  updatePerformanceMetrics(operation, startTime) {
    const duration = Date.now() - startTime;

    if (operation.includes('DataConnect')) {
      this.performanceMetrics.dataConnectQueries++;
    } else {
      this.performanceMetrics.firestoreQueries++;
    }

    // Update rolling average
    const totalQueries =
      this.performanceMetrics.firestoreQueries +
      this.performanceMetrics.dataConnectQueries;
    this.performanceMetrics.averageQueryTime =
      (this.performanceMetrics.averageQueryTime * (totalQueries - 1) +
        duration) /
      totalQueries;
  }

  getPerformanceReport() {
    return {
      ...this.performanceMetrics,
      totalQueries:
        this.performanceMetrics.firestoreQueries +
        this.performanceMetrics.dataConnectQueries,
      cacheHitRate:
        this.performanceMetrics.cacheHits /
        (this.performanceMetrics.firestoreQueries +
          this.performanceMetrics.dataConnectQueries),
      recommendedOptimizations: this.generateOptimizationRecommendations(),
    };
  }

  generateOptimizationRecommendations() {
    const recommendations = [];

    if (this.performanceMetrics.averageQueryTime > 500) {
      recommendations.push('Consider implementing query result caching');
    }

    if (
      this.performanceMetrics.firestoreQueries >
      this.performanceMetrics.dataConnectQueries * 3
    ) {
      recommendations.push(
        'Consider migrating complex queries to Data Connect'
      );
    }

    return recommendations;
  }

  /**
   * Helper Methods
   */
  calculateDifficulty(responses) {
    // Calculate difficulty based on completion time and score variance
    const times = responses.map(r => r.completionTime).filter(t => t);
    const scores = responses.map(r => r.ethicsScore).filter(s => s);

    if (times.length === 0) return 'unknown';

    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const scoreVariance = this.calculateVariance(scores);

    if (avgTime > 180000 || scoreVariance > 0.3) return 'hard';
    if (avgTime > 120000 || scoreVariance > 0.2) return 'medium';
    return 'easy';
  }

  calculateVariance(numbers) {
    if (numbers.length === 0) return 0;
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const variance =
      numbers.reduce((acc, num) => acc + Math.pow(num - mean, 2), 0) /
      numbers.length;
    return Math.sqrt(variance) / mean; // Coefficient of variation
  }

  groupDonationsByMonth(donations) {
    return donations.reduce((acc, donation) => {
      const month = new Date(donation.donationDate.seconds * 1000)
        .toISOString()
        .substring(0, 7);
      if (!acc[month]) acc[month] = { count: 0, total: 0 };
      acc[month].count++;
      acc[month].total += donation.amount;
      return acc;
    }, {});
  }

  /**
   * Cleanup
   */
  cleanup() {
    // Unsubscribe from all real-time listeners
    this.realtimeListeners.forEach(unsubscribe => unsubscribe());
    this.realtimeListeners.clear();

    // Clear caches
    this.queryCache.clear();
  }

  /**
   * Set Firebase Storage Service reference
   */
  setStorageService(storageService) {
    this.storageService = storageService;
  }

  /**
   * Enhanced User Operations with File Support
   */
  async createUserWithProfile(userData, profileImageFile = null) {
    const startTime = Date.now();

    try {
      // First create user without profile image
      const userResult = await this.createUser(userData);

      // If profile image provided, upload it
      if (profileImageFile && this.storageService) {
        try {
          const imageResult = await this.storageService.uploadUserProfileImage(
            userData.uid,
            profileImageFile
          );

          // Update user with profile image URL
          if (imageResult.success) {
            await this.updateFirestoreDocument('users', userData.uid, {
              profileImageURL: imageResult.downloadURL,
              profileImagePath: imageResult.filePath,
              updatedAt: serverTimestamp(),
            });

            userResult.profileImage = imageResult;
          }
        } catch (imageError) {
          userResult.profileImageError = imageError.message;
        }
      }

      this.updatePerformanceMetrics('createUserWithProfile', startTime);
      return userResult;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Enhanced Blog Operations with Image Support
   */
  async createBlogPostWithImages(blogData, imageFiles = []) {
    const startTime = Date.now();

    try {
      const blogId = blogData.id || `blog_${Date.now()}`;
      const uploadedImages = [];

      // Upload images if provided
      if (imageFiles.length > 0 && this.storageService) {
        for (const imageFile of imageFiles) {
          try {
            const imageResult = await this.storageService.uploadBlogImage(
              blogId,
              imageFile
            );
            if (imageResult.success) {
              uploadedImages.push({
                url: imageResult.downloadURL,
                path: imageResult.filePath,
                fileName: imageFile.name,
                size: imageFile.size,
              });
            }
          } catch (imageError) {
            // Failed to upload blog image - continue without it
          }
        }
      }

      // Create blog post with image references
      const enhancedBlogData = {
        ...blogData,
        id: blogId,
        images: uploadedImages,
        hasImages: uploadedImages.length > 0,
      };

      // Use Data Connect for structured blog metadata
      const dcBlog = {
        title: enhancedBlogData.title,
        content: enhancedBlogData.content,
        authorId: enhancedBlogData.authorId,
        categoryId: enhancedBlogData.categoryId || null,
        tags: JSON.stringify(enhancedBlogData.tags || []),
        imageCount: uploadedImages.length,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Use Firestore for flexible blog content and real-time features
      const fsBlog = {
        ...enhancedBlogData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        analytics: {
          views: 0,
          likes: 0,
          shares: 0,
          comments: 0,
          readTime: this.calculateReadTime(enhancedBlogData.content),
        },
      };

      const results = await Promise.allSettled([
        this.createDataConnectBlog(dcBlog),
        this.createFirestoreDocument('blog_posts', blogId, fsBlog),
      ]);

      this.updatePerformanceMetrics('createBlogPost', startTime);

      return {
        success: true,
        dataConnect: results[0].status === 'fulfilled',
        firestore: results[1].status === 'fulfilled',
        blog: enhancedBlogData,
        uploadedImages,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Enhanced Forum Operations with Attachment Support
   */
  async createForumPostWithAttachments(postData, attachmentFiles = []) {
    const startTime = Date.now();

    try {
      const postId = postData.id || `post_${Date.now()}`;
      const uploadedAttachments = [];

      // Upload attachments if provided
      if (attachmentFiles.length > 0 && this.storageService) {
        for (const attachmentFile of attachmentFiles) {
          try {
            const attachmentResult =
              await this.storageService.uploadForumAttachment(
                postId,
                attachmentFile
              );

            if (attachmentResult.success) {
              uploadedAttachments.push({
                url: attachmentResult.downloadURL,
                path: attachmentResult.filePath,
                fileName: attachmentFile.name,
                size: attachmentFile.size,
                type: attachmentFile.type,
              });
            }
          } catch (attachmentError) {
            // Failed to upload forum attachment - continue without it
          }
        }
      }

      // Create forum post with attachment references
      const enhancedPostData = {
        ...postData,
        id: postId,
        attachments: uploadedAttachments,
        hasAttachments: uploadedAttachments.length > 0,
      };

      // Use Data Connect for structured forum relationships
      const dcPost = {
        author: { id: enhancedPostData.authorId },
        title: enhancedPostData.title,
        content: enhancedPostData.content,
        categoryId: enhancedPostData.categoryId || null,
        attachmentCount: uploadedAttachments.length,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Use Firestore for real-time forum features
      const fsPost = {
        ...enhancedPostData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        realtime: {
          views: 0,
          likes: 0,
          commentsCount: 0,
          lastActivity: serverTimestamp(),
        },
      };

      const results = await Promise.allSettled([
        this.createDataConnectPost(dcPost),
        this.createFirestoreDocument('forum_posts', postId, fsPost),
      ]);

      this.updatePerformanceMetrics('createForumPost', startTime);

      return {
        success: true,
        dataConnect: results[0].status === 'fulfilled',
        firestore: results[1].status === 'fulfilled',
        post: enhancedPostData,
        uploadedAttachments,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * File Management Operations
   */
  async getUserFiles(userId) {
    try {
      if (!this.storageService) {
        return { success: false, error: 'Storage service not available' };
      }

      const [profileImages, documents] = await Promise.allSettled([
        this.storageService.getUserProfileImages(userId),
        this.getFirestoreDocument('user_documents', userId),
      ]);

      return {
        success: true,
        profileImages:
          profileImages.status === 'fulfilled'
            ? profileImages.value
            : { images: [] },
        documents: documents.status === 'fulfilled' ? documents.value : null,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getBlogAssets(blogId) {
    try {
      if (!this.storageService) {
        return { success: false, error: 'Storage service not available' };
      }

      const result = await this.storageService.getBlogImages(blogId);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getForumAttachments(postId) {
    try {
      if (!this.storageService) {
        return { success: false, error: 'Storage service not available' };
      }

      const result = await this.storageService.getForumAttachments(postId);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Content Management Helpers
   */
  calculateReadTime(content) {
    // Average reading speed: 200 words per minute
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  }

  async updateFirestoreDocument(collection, docId, data) {
    const docRef = doc(this.db, collection, docId);
    await updateDoc(docRef, data);
    return true;
  }

  /**
   * Create Data Connect Blog (placeholder)
   */
  async createDataConnectBlog(blogData) {
    return await this.createFirestoreDocument(
      'dc_blog_posts',
      `blog_${Date.now()}`,
      blogData
    );
  }

  // ...existing code...
}

// Export the service
export default HybridDataService;
