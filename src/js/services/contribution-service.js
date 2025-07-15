/**
 * Contribution Management Service
 * Handles blog and forum contributions with donation-based approval system
 */

import FirebaseService from './firebase-service.js';
import AuthService from './auth-service.js';

class ContributionService {
  constructor() {
    this.firebaseService = null;
    this.authService = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    this.firebaseService = new FirebaseService();
    this.authService = new AuthService();

    await this.firebaseService.initialize();
    await this.authService.initialize();

    this.initialized = true;
  }

  /**
   * Check if user has donation-based privileges
   */
  async checkDonorStatus(userId) {
    try {
      const userProfile = await this.firebaseService.getUserProfile(userId);

      // Check various donor indicators
      const hasDonated = userProfile?.donation_history?.length > 0;
      const hasActiveDonation = userProfile?.active_donor === true;
      const hasTier = userProfile?.tier && userProfile.tier >= 1;
      const hasSpecialBadge = userProfile?.badges?.some(badge =>
        ['gold', 'silver', 'bronze', 'premium'].includes(badge.type)
      );

      return {
        isDonor: hasDonated || hasActiveDonation || hasTier || hasSpecialBadge,
        donorLevel: this.getDonorLevel(userProfile),
        profile: userProfile,
      };
    } catch (error) {
      // Log error through proper error handling service
      if (this.firebaseService?.logError) {
        this.firebaseService.logError('Error checking donor status', error);
      }
      return { isDonor: false, donorLevel: 'none', profile: null };
    }
  }

  /**
   * Determine donor level based on profile data
   */
  getDonorLevel(userProfile) {
    if (!userProfile) return 'none';

    const PREMIUM_THRESHOLD = 100;
    const GOLD_THRESHOLD = 50;
    const SILVER_THRESHOLD = 25;
    const BRONZE_THRESHOLD = 5;
    const MINIMUM_TIER = 1;

    const totalDonated =
      userProfile.donation_history?.reduce(
        (total, donation) => total + (donation.amount || 0),
        0
      ) || 0;

    if (totalDonated >= PREMIUM_THRESHOLD) return 'premium';
    if (totalDonated >= GOLD_THRESHOLD) return 'gold';
    if (totalDonated >= SILVER_THRESHOLD) return 'silver';
    if (totalDonated >= BRONZE_THRESHOLD) return 'bronze';
    if (userProfile.tier >= MINIMUM_TIER) return 'supporter';

    return 'none';
  }

  /**
   * Submit a blog post contribution
   */
  async submitBlogPost(postData) {
    if (!this.authService.currentUser) {
      throw new Error('Must be signed in to contribute');
    }

    const userId = this.authService.currentUser.uid;
    const donorStatus = await this.checkDonorStatus(userId);

    const submission = {
      ...postData,
      id: this.generateId(),
      authorId: userId,
      authorName: this.authService.currentUser.displayName || 'Anonymous',
      authorEmail: this.authService.currentUser.email,
      submittedAt: new Date().toISOString(),
      status: donorStatus.isDonor ? 'approved' : 'pending_review',
      donorLevel: donorStatus.donorLevel,
      type: 'blog_post',
      approvedAt: donorStatus.isDonor ? new Date().toISOString() : null,
      moderationNotes: donorStatus.isDonor
        ? 'Auto-approved: Donor status'
        : 'Pending moderator review',
    };

    // Save to Firebase
    await this.firebaseService.saveDocument(
      'contributions',
      submission.id,
      submission
    );

    // If auto-approved, also save to published posts
    if (submission.status === 'approved') {
      await this.publishContent(submission);
    }

    return {
      success: true,
      submission,
      autoApproved: donorStatus.isDonor,
      message: donorStatus.isDonor
        ? 'Your post has been published immediately!'
        : 'Your post has been submitted for moderator review.',
    };
  }

  /**
   * Submit a forum discussion contribution
   */
  async submitForumPost(postData) {
    if (!this.authService.currentUser) {
      throw new Error('Must be signed in to contribute');
    }

    const userId = this.authService.currentUser.uid;
    const donorStatus = await this.checkDonorStatus(userId);

    const submission = {
      ...postData,
      id: this.generateId(),
      authorId: userId,
      authorName: this.authService.currentUser.displayName || 'Anonymous',
      authorEmail: this.authService.currentUser.email,
      submittedAt: new Date().toISOString(),
      status: donorStatus.isDonor ? 'approved' : 'pending_review',
      donorLevel: donorStatus.donorLevel,
      type: 'forum_post',
      approvedAt: donorStatus.isDonor ? new Date().toISOString() : null,
      moderationNotes: donorStatus.isDonor
        ? 'Auto-approved: Donor status'
        : 'Pending moderator review',
      replies: [],
      upvotes: 0,
      views: 0,
    };

    // Save to Firebase
    await this.firebaseService.saveDocument(
      'contributions',
      submission.id,
      submission
    );

    // If auto-approved, also save to published discussions
    if (submission.status === 'approved') {
      await this.publishContent(submission);
    }

    return {
      success: true,
      submission,
      autoApproved: donorStatus.isDonor,
      message: donorStatus.isDonor
        ? 'Your discussion has been posted immediately!'
        : 'Your discussion has been submitted for moderator review.',
    };
  }

  /**
   * Submit a reply to existing forum post
   */
  async submitReply(parentPostId, replyData) {
    if (!this.authService.currentUser) {
      throw new Error('Must be signed in to reply');
    }

    const userId = this.authService.currentUser.uid;
    const donorStatus = await this.checkDonorStatus(userId);

    const reply = {
      ...replyData,
      id: this.generateId(),
      parentId: parentPostId,
      authorId: userId,
      authorName: this.authService.currentUser.displayName || 'Anonymous',
      submittedAt: new Date().toISOString(),
      status: donorStatus.isDonor ? 'approved' : 'pending_review',
      donorLevel: donorStatus.donorLevel,
      type: 'forum_reply',
      approvedAt: donorStatus.isDonor ? new Date().toISOString() : null,
      moderationNotes: donorStatus.isDonor
        ? 'Auto-approved: Donor status'
        : 'Pending moderator review',
    };

    // Save reply
    await this.firebaseService.saveDocument('contributions', reply.id, reply);

    // If auto-approved, add to parent post's replies
    if (reply.status === 'approved') {
      await this.addReplyToPost(parentPostId, reply);
    }

    return {
      success: true,
      reply,
      autoApproved: donorStatus.isDonor,
      message: donorStatus.isDonor
        ? 'Your reply has been posted!'
        : 'Your reply has been submitted for review.',
    };
  }

  /**
   * Publish approved content to public collections
   */
  async publishContent(submission) {
    const publishedContent = {
      ...submission,
      publishedAt: new Date().toISOString(),
    };

    if (submission.type === 'blog_post') {
      await this.firebaseService.saveDocument(
        'blog_posts',
        submission.id,
        publishedContent
      );
    } else if (submission.type === 'forum_post') {
      await this.firebaseService.saveDocument(
        'forum_posts',
        submission.id,
        publishedContent
      );
    }
  }

  /**
   * Add approved reply to parent post
   */
  async addReplyToPost(parentPostId, reply) {
    try {
      const parentPost = await this.firebaseService.getDocument(
        'forum_posts',
        parentPostId
      );
      if (parentPost) {
        const updatedReplies = [...(parentPost.replies || []), reply];
        await this.firebaseService.updateDocument('forum_posts', parentPostId, {
          replies: updatedReplies,
          lastActivity: new Date().toISOString(),
          replyCount: updatedReplies.length,
        });
      }
    } catch (error) {
      if (this.firebaseService?.logError) {
        this.firebaseService.logError('Error adding reply to post', error);
      }
    }
  }

  /**
   * Get pending contributions for moderation
   */
  async getPendingContributions() {
    try {
      const contributions = await this.firebaseService.queryDocuments(
        'contributions',
        {
          field: 'status',
          operator: '==',
          value: 'pending_review',
        }
      );

      return contributions.sort(
        (a, b) => new Date(a.submittedAt) - new Date(b.submittedAt)
      );
    } catch (error) {
      if (this.firebaseService?.logError) {
        this.firebaseService.logError(
          'Error fetching pending contributions',
          error
        );
      }
      return [];
    }
  }

  /**
   * Approve a pending contribution
   */
  async approveContribution(contributionId, moderatorNotes = '') {
    try {
      const contribution = await this.firebaseService.getDocument(
        'contributions',
        contributionId
      );
      if (!contribution) {
        throw new Error('Contribution not found');
      }

      const updatedContribution = {
        ...contribution,
        status: 'approved',
        approvedAt: new Date().toISOString(),
        moderationNotes: moderatorNotes || 'Approved by moderator',
        moderatedBy: this.authService.currentUser?.uid,
      };

      await this.firebaseService.updateDocument(
        'contributions',
        contributionId,
        updatedContribution
      );
      await this.publishContent(updatedContribution);

      return { success: true, message: 'Contribution approved and published' };
    } catch (error) {
      if (this.firebaseService?.logError) {
        this.firebaseService.logError('Error approving contribution', error);
      }
      throw error;
    }
  }

  /**
   * Reject a pending contribution
   */
  async rejectContribution(contributionId, reason = '') {
    try {
      const updates = {
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        rejectionReason: reason,
        moderatedBy: this.authService.currentUser?.uid,
      };

      await this.firebaseService.updateDocument(
        'contributions',
        contributionId,
        updates
      );
      return { success: true, message: 'Contribution rejected' };
    } catch (error) {
      if (this.firebaseService?.logError) {
        this.firebaseService.logError('Error rejecting contribution', error);
      }
      throw error;
    }
  }

  /**
   * Get user's contribution history
   */
  async getUserContributions(userId) {
    try {
      const contributions = await this.firebaseService.queryDocuments(
        'contributions',
        {
          field: 'authorId',
          operator: '==',
          value: userId,
        }
      );

      return contributions.sort(
        (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)
      );
    } catch (error) {
      if (this.firebaseService?.logError) {
        this.firebaseService.logError(
          'Error fetching user contributions',
          error
        );
      }
      return [];
    }
  }

  /**
   * Generate unique ID for contributions
   */
  generateId() {
    const BASE_36 = 36;
    const RANDOM_LENGTH = 9;
    const RANDOM_START = 2;

    return `contrib_${Date.now()}_${Math.random().toString(BASE_36).substr(RANDOM_START, RANDOM_LENGTH)}`;
  }

  /**
   * Check if user can contribute (basic validation)
   */
  canContribute() {
    return this.authService.currentUser && this.authService.userProfile;
  }

  /**
   * Get contribution guidelines based on user status
   */
  async getContributionGuidelines(userId) {
    const donorStatus = await this.checkDonorStatus(userId);

    return {
      canContribute: this.canContribute(),
      isDonor: donorStatus.isDonor,
      donorLevel: donorStatus.donorLevel,
      autoApproval: donorStatus.isDonor,
      guidelines: {
        general: [
          'Content must be relevant to AI ethics and education',
          'Be respectful and constructive in discussions',
          'Provide sources for factual claims',
          'Follow academic integrity standards',
        ],
        formatting: [
          'Use clear headings and structure',
          'Include relevant tags and categories',
          'Proofread before submitting',
          'Use markdown formatting for better readability',
        ],
        approval: donorStatus.isDonor
          ? [
              '✅ Your contributions are automatically approved',
              '✅ Posts go live immediately',
              '✅ Priority support for any issues',
            ]
          : [
              '⏳ Your contributions require moderator review',
              "📧 You'll be notified when reviewed",
              '💖 Consider donating for immediate publication',
            ],
      },
    };
  }
}

export default ContributionService;
