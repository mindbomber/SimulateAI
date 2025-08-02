const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Load environment variables
require("dotenv").config();

// Initialize Firebase Admin SDK
admin.initializeApp();

/**
 * Middleware to verify Firebase ID tokens for all secured endpoints
 * This prevents users from spoofing API calls and ensures data integrity
 */
const verifyToken = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Unauthorized: Missing or invalid authorization header",
        code: "auth/missing-token",
      });
    }

    const idToken = authHeader.split("Bearer ")[1];

    // Verify the ID token with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Add user info to request for downstream use
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      displayName: decodedToken.name,
      photoURL: decodedToken.picture,
      authTime: decodedToken.auth_time,
      iat: decodedToken.iat,
      exp: decodedToken.exp,
    };

    // Log successful authentication for security monitoring
    console.log(
      `✅ Token verified for user: ${decodedToken.uid} (${decodedToken.email})`,
    );

    next();
  } catch (error) {
    console.error("❌ Token verification failed:", error);

    // Provide specific error messages based on the error type
    let errorMessage = "Invalid authentication token";
    let errorCode = "auth/invalid-token";

    if (error.code === "auth/id-token-expired") {
      errorMessage = "Authentication token has expired";
      errorCode = "auth/token-expired";
    } else if (error.code === "auth/id-token-revoked") {
      errorMessage = "Authentication token has been revoked";
      errorCode = "auth/token-revoked";
    } else if (error.code === "auth/invalid-id-token") {
      errorMessage = "Invalid authentication token format";
      errorCode = "auth/invalid-format";
    }

    return res.status(401).json({
      error: errorMessage,
      code: errorCode,
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Secured endpoint for submitting research data
 * Only authenticated users can submit simulation responses
 * TEMPORARILY DISABLED - NEEDS UPGRADE TO 2ND GEN
 */
/* exports.submitResearchData = functions.https.onRequest(async (req, res) => {
  // Enable CORS for web client
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication token
    await new Promise((resolve, reject) => {
      verifyToken(req, res, err => {
        if (err) reject(err);
        else resolve();
      });
    });

    const { scenarioId, responses, ethicsScores, completionTime } = req.body;

    // Validate required fields
    if (!scenarioId || !responses || !ethicsScores) {
      return res.status(400).json({
        error:
          'Missing required fields: scenarioId, responses, or ethicsScores',
      });
    }

    // Get user profile to check research participation status
    const userDoc = await admin
      .firestore()
      .collection('users')
      .doc(req.user.uid)
      .get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const userData = userDoc.data();

    // Verify user is a research participant
    if (!userData.researchParticipant) {
      return res.status(403).json({
        error: 'User is not enrolled in research program',
        code: 'research/not-participant',
      });
    }

    // Create research response document
    const researchData = {
      userId: req.user.uid,
      userEmail: req.user.email,
      scenarioId,
      responses,
      ethicsScores,
      completionTime,
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
      // Security: Don't trust client timestamps, use server time
      serverTimestamp: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Save to Firestore
    const docRef = await admin
      .firestore()
      .collection('researchResponses')
      .add(researchData);

    // Update user's research response count
    await admin
      .firestore()
      .collection('users')
      .doc(req.user.uid)
      .update({
        researchResponsesSubmitted: admin.firestore.FieldValue.increment(1),
        lastResearchSubmission: admin.firestore.FieldValue.serverTimestamp(),
      });

    console.log(`📊 Research data submitted by ${req.user.uid}: ${docRef.id}`);

    res.status(200).json({
      success: true,
      submissionId: docRef.id,
      message: 'Research data submitted successfully',
    });
  } catch (error) {
    console.error('❌ Research submission failed:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'server/internal-error',
    });
  }
}); */

/**
 * Secured endpoint for updating user profiles
 * Validates user identity and prevents privilege escalation
 * TEMPORARILY DISABLED - NEEDS UPGRADE TO 2ND GEN
 */
/* exports.updateUserProfile = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication token
    await new Promise((resolve, reject) => {
      verifyToken(req, res, err => {
        if (err) reject(err);
        else resolve();
      });
    });

    const { displayName, photoURL, profileTheme } = req.body;
    const allowedFields = ['displayName', 'photoURL', 'profileTheme'];

    // Build update object with only allowed fields
    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Validate and sanitize input
    if (displayName) {
      if (typeof displayName !== 'string' || displayName.length > 50) {
        return res.status(400).json({
          error: 'Display name must be a string with max 50 characters',
        });
      }
      updateData.displayName = displayName.trim();
    }

    if (photoURL) {
      if (typeof photoURL !== 'string' || !isValidURL(photoURL)) {
        return res.status(400).json({
          error: 'Photo URL must be a valid URL',
        });
      }
      updateData.photoURL = photoURL;
    }

    if (profileTheme) {
      const validThemes = ['default', 'dark', 'high-contrast', 'colorblind'];
      if (!validThemes.includes(profileTheme)) {
        return res.status(400).json({
          error: 'Invalid profile theme',
        });
      }
      updateData.profileTheme = profileTheme;
    }

    // Security: Users can only update their own profile
    await admin
      .firestore()
      .collection('users')
      .doc(req.user.uid)
      .update(updateData);

    console.log(`👤 Profile updated for user: ${req.user.uid}`);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      updatedFields: Object.keys(updateData).filter(key => key !== 'updatedAt'),
    });
  } catch (error) {
    console.error('❌ Profile update failed:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'server/internal-error',
    });
  }
}); */

/**
 * Secured endpoint for awarding badges
 * Only authorized systems can award badges to prevent spoofing
 * TEMPORARILY DISABLED - NEEDS UPGRADE TO 2ND GEN
 */
/* exports.awardBadge = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Admin-Key'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication token
    await new Promise((resolve, reject) => {
      verifyToken(req, res, err => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Additional admin key check for badge awarding
    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== functions.config().admin.key) {
      return res.status(403).json({
        error: 'Insufficient privileges for badge awarding',
        code: 'auth/insufficient-privileges',
      });
    }

    const { targetUserId, badgeData } = req.body;

    // Validate badge data
    const requiredFields = [
      'category',
      'tier',
      'title',
      'description',
      'icon',
      'color',
    ];
    for (const field of requiredFields) {
      if (!badgeData[field]) {
        return res.status(400).json({
          error: `Missing required badge field: ${field}`,
        });
      }
    }

    // Get target user profile
    const userDoc = await admin
      .firestore()
      .collection('users')
      .doc(targetUserId)
      .get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Target user not found' });
    }

    const userData = userDoc.data();
    const existingBadges = userData.badges || [];

    // Check if badge already exists
    const badgeExists = existingBadges.some(
      b => b.category === badgeData.category && b.tier === badgeData.tier
    );

    if (badgeExists) {
      return res.status(409).json({
        error: 'Badge already awarded',
        code: 'badge/already-exists',
      });
    }

    // Create badge record
    const badge = {
      id: `${badgeData.category}_${badgeData.tier}`,
      ...badgeData,
      awardedAt: admin.firestore.FieldValue.serverTimestamp(),
      awardedBy: req.user.uid,
    };

    // Update user profile
    await admin
      .firestore()
      .collection('users')
      .doc(targetUserId)
      .update({
        badges: admin.firestore.FieldValue.arrayUnion(badge),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    console.log(`🏆 Badge awarded to ${targetUserId}: ${badge.id}`);

    res.status(200).json({
      success: true,
      badge,
      message: 'Badge awarded successfully',
    });
  } catch (error) {
    console.error('❌ Badge awarding failed:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'server/internal-error',
    });
  }
}); */

/**
 * Utility function to validate URLs
 */
function isValidURL(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Secured endpoint for getting user analytics
 * Returns aggregated data while protecting individual privacy
 * TEMPORARILY DISABLED - NEEDS UPGRADE TO 2ND GEN
 */
/* exports.getUserAnalytics = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication token
    await new Promise((resolve, reject) => {
      verifyToken(req, res, err => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Users can only access their own analytics
    const userDoc = await admin
      .firestore()
      .collection('users')
      .doc(req.user.uid)
      .get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const userData = userDoc.data();

    // Get user's research responses (if participant)
    let researchData = null;
    if (userData.researchParticipant) {
      const responsesSnapshot = await admin
        .firestore()
        .collection('researchResponses')
        .where('userId', '==', req.user.uid)
        .orderBy('submittedAt', 'desc')
        .limit(10)
        .get();

      researchData = {
        totalResponses: userData.researchResponsesSubmitted || 0,
        recentResponses: responsesSnapshot.docs.map(doc => ({
          id: doc.id,
          scenarioId: doc.data().scenarioId,
          submittedAt: doc.data().submittedAt?.toDate?.() || null,
          ethicsScores: doc.data().ethicsScores,
        })),
      };
    }

    const analytics = {
      profile: {
        tier: userData.tier,
        totalDonated: userData.totalDonated,
        scenariosCompleted: userData.scenariosCompleted,
        badges: (userData.badges || []).length,
        memberSince: userData.createdAt?.toDate?.() || null,
      },
      research: researchData,
      achievements: {
        badges: userData.badges || [],
        currentFlair: userData.flair || null,
      },
    };

    res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error('❌ Analytics request failed:', error);
    res.status(500).json({
      error: 'Internal server error',
      code: 'server/internal-error',
    });
  }
}); */

// ===== STRIPE INTEGRATION FUNCTIONS =====

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

/**
 * Create Stripe Checkout Session
 * Called from frontend when user wants to donate
 */
exports.createCheckoutSession = functions.https.onCall(
  async (data, context) => {
    try {
      // Verify user authentication
      if (!context.auth) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "Must be authenticated",
        );
      }

      const { priceId, tier } = data;
      const userId = context.auth.uid;
      const userEmail = context.auth.token.email;

      // Validate tier
      const validTiers = ["1", "2", "3"];
      if (!validTiers.includes(tier)) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Invalid tier",
        );
      }

      // Get or create Stripe customer
      const userDoc = await admin
        .firestore()
        .collection("users")
        .doc(userId)
        .get();
      let customerId = userDoc.data()?.stripeCustomerId;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: userEmail,
          metadata: {
            firebaseUid: userId,
          },
        });

        customerId = customer.id;

        // Save customer ID to Firebase
        await admin.firestore().collection("users").doc(userId).update({
          stripeCustomerId: customerId,
        });
      }

      // Create checkout session for one-time payment
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "payment", // Changed from 'subscription' to 'payment'
        success_url: `${process.env.APP_FRONTEND_URL || "http://localhost:3003"}/profile.html?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.APP_FRONTEND_URL || "http://localhost:3003"}/profile.html?success=false`,
        metadata: {
          tier,
          userId,
          tierName: getTierName(tier),
        },
      });

      console.log(
        `✅ Checkout session created for user ${userId}, tier ${tier}`,
      );

      return {
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      console.error("❌ Error creating checkout session:", error);
      throw new functions.https.HttpsError("internal", error.message);
    }
  },
);

/**
 * Verify Payment Success
 * Called from frontend after successful Stripe checkout
 */
exports.verifyPaymentSuccess = functions.https.onCall(async (data, context) => {
  try {
    // Verify user authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Must be authenticated",
      );
    }

    const { sessionId } = data;
    const userId = context.auth.uid;

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Verify the session belongs to this user
    if (session.metadata.userId !== userId) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Session does not belong to user",
      );
    }

    if (session.payment_status === "paid") {
      const tier = parseInt(session.metadata.tier);
      const tierInfo = getTierInfo(tier);

      // For one-time payments, get amount from session
      const amountPaid = session.amount_total / 100; // Convert from cents

      // Update user profile for one-time payment
      await admin
        .firestore()
        .collection("users")
        .doc(userId)
        .update({
          tier,
          flair: tierInfo.flair,
          stripeCustomerId: session.customer,
          paymentType: "one-time",
          totalDonated: admin.firestore.FieldValue.increment(amountPaid),
          lastPaymentDate: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      console.log(
        `✅ One-time payment verified for user ${userId}, tier ${tier}, amount: $${amountPaid}`,
      );

      return {
        success: true,
        tier,
        flair: tierInfo.flair,
        tierName: tierInfo.name,
        stripeCustomerId: session.customer,
        totalDonated: amountPaid,
        paymentType: "one-time",
      };
    } else {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Payment not completed",
      );
    }
  } catch (error) {
    console.error("❌ Error verifying payment:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

/**
 * Create Anonymous Stripe Checkout Session
 * Allows donations without user authentication
 */
exports.createAnonymousCheckout = functions.https.onCall(
  async (data, context) => {
    try {
      const { priceId, tier, donorEmail } = data;

      // Validate tier
      const validTiers = ["1", "2", "3"];
      if (!validTiers.includes(tier)) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Invalid tier",
        );
      }

      // Validate price ID
      if (!priceId) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Price ID is required",
        );
      }

      // Create checkout session for anonymous donation
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.APP_FRONTEND_URL || "http://localhost:3000"}/?donation_success=true&tier=${tier}`,
        cancel_url: `${process.env.APP_FRONTEND_URL || "http://localhost:3000"}/?donation_cancelled=true`,
        metadata: {
          tier,
          tierName: getTierName(tier),
          donationType: "anonymous",
          donorEmail: donorEmail || "anonymous",
        },
        customer_email: donorEmail || undefined,
      });

      console.log(`✅ Anonymous checkout session created for tier ${tier}`);

      return {
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      console.error("❌ Error creating anonymous checkout session:", error);
      throw new functions.https.HttpsError("internal", error.message);
    }
  },
);

/**
 * Stripe Webhook Handler
 * Handles all Stripe events securely
 */
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("❌ Webhook secret not configured");
    return res.status(500).send("Webhook secret not configured");
  }

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    console.log(`📥 Received Stripe webhook: ${event.type}`);

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object);
        break;

      case "customer.subscription.trial_will_end":
        await handleTrialWillEnd(event.data.object);
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("❌ Error handling webhook:", error);
    res.status(500).json({ error: "Webhook handler failed" });
  }
});

/**
 * Cancel User Subscription
 * Allows users to cancel their subscription
 */
exports.cancelSubscription = functions.https.onCall(async (data, context) => {
  try {
    // Verify user authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Must be authenticated",
      );
    }

    const userId = context.auth.uid;

    // Get user's subscription ID
    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .get();
    const subscriptionId = userDoc.data()?.subscriptionId;

    if (!subscriptionId) {
      throw new functions.https.HttpsError(
        "not-found",
        "No active subscription found",
      );
    }

    // Cancel the subscription at period end
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    // Update user profile
    await admin.firestore().collection("users").doc(userId).update({
      subscriptionStatus: "cancel_at_period_end",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`✅ Subscription cancellation scheduled for user ${userId}`);

    return {
      success: true,
      message:
        "Subscription will be cancelled at the end of the current period",
    };
  } catch (error) {
    console.error("❌ Error cancelling subscription:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

/**
 * Create Customer Portal Session
 * Allows users to manage their billing
 */
exports.createPortalSession = functions.https.onCall(async (data, context) => {
  try {
    // Verify user authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Must be authenticated",
      );
    }

    const userId = context.auth.uid;

    // Get user's Stripe customer ID
    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .get();
    const stripeCustomerId = userDoc.data()?.stripeCustomerId;

    if (!stripeCustomerId) {
      throw new functions.https.HttpsError(
        "not-found",
        "No Stripe customer found",
      );
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${process.env.APP_FRONTEND_URL || "http://localhost:3003"}/profile.html`,
    });

    console.log(`✅ Billing portal session created for user ${userId}`);

    return { url: session.url };
  } catch (error) {
    console.error("❌ Error creating portal session:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// ===== STRIPE WEBHOOK HANDLERS =====

/**
 * Handle checkout session completed (one-time payments)
 */
async function handleCheckoutSessionCompleted(session) {
  try {
    if (session.payment_status === "paid") {
      const tier = parseInt(session.metadata.tier);
      const tierInfo = getTierInfo(tier);
      const amountPaid = session.amount_total / 100; // Convert from cents
      const donationType = session.metadata.donationType || "authenticated";

      if (donationType === "anonymous") {
        // Handle anonymous donation - just log it
        await admin
          .firestore()
          .collection("anonymousDonations")
          .add({
            tier,
            tierName: tierInfo.name,
            amount: amountPaid,
            donorEmail:
              session.metadata.donorEmail ||
              session.customer_email ||
              "anonymous",
            stripeSessionId: session.id,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
          });

        console.log(
          `✅ Anonymous donation processed: tier ${tier}, amount: $${amountPaid}`,
        );
      } else {
        // Handle authenticated user donation
        const customer = await stripe.customers.retrieve(session.customer);
        const userId = customer.metadata?.firebaseUid;

        if (userId) {
          // Update user profile with one-time payment
          await admin
            .firestore()
            .collection("users")
            .doc(userId)
            .update({
              tier,
              flair: tierInfo.flair,
              paymentType: "one-time",
              totalDonated: admin.firestore.FieldValue.increment(amountPaid),
              lastPaymentDate: admin.firestore.FieldValue.serverTimestamp(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

          console.log(
            `✅ Authenticated donation processed via webhook for user ${userId}, tier ${tier}, amount: $${amountPaid}`,
          );
        }
      }
    }
  } catch (error) {
    console.error("❌ Error handling checkout session completed:", error);
  }
}

/**
 * Handle subscription creation
 */
async function handleSubscriptionCreated(subscription) {
  try {
    const customer = await stripe.customers.retrieve(subscription.customer);
    const userId = customer.metadata.firebaseUid;

    if (userId) {
      await admin
        .firestore()
        .collection("users")
        .doc(userId)
        .update({
          subscriptionId: subscription.id,
          subscriptionStatus: subscription.status,
          subscriptionStartDate: admin.firestore.Timestamp.fromDate(
            new Date(subscription.created * 1000),
          ),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      console.log(`✅ Subscription created for user ${userId}`);
    }
  } catch (error) {
    console.error("❌ Error handling subscription created:", error);
  }
}

/**
 * Handle subscription updates
 */
async function handleSubscriptionUpdated(subscription) {
  try {
    const customer = await stripe.customers.retrieve(subscription.customer);
    const userId = customer.metadata.firebaseUid;

    if (userId) {
      const updateData = {
        subscriptionStatus: subscription.status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // If subscription is cancelled, update tier and flair
      if (subscription.status === "canceled") {
        updateData.tier = 0;
        updateData.flair = null;
        updateData.subscriptionEndDate = admin.firestore.Timestamp.fromDate(
          new Date(subscription.ended_at * 1000),
        );
      }

      await admin
        .firestore()
        .collection("users")
        .doc(userId)
        .update(updateData);

      console.log(
        `✅ Subscription updated for user ${userId}: ${subscription.status}`,
      );
    }
  } catch (error) {
    console.error("❌ Error handling subscription updated:", error);
  }
}

/**
 * Handle subscription deletion/cancellation
 */
async function handleSubscriptionDeleted(subscription) {
  try {
    const customer = await stripe.customers.retrieve(subscription.customer);
    const userId = customer.metadata.firebaseUid;

    if (userId) {
      await admin
        .firestore()
        .collection("users")
        .doc(userId)
        .update({
          tier: 0,
          flair: null,
          subscriptionStatus: "canceled",
          subscriptionEndDate: admin.firestore.Timestamp.fromDate(
            new Date(subscription.ended_at * 1000),
          ),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      console.log(`✅ Subscription deleted for user ${userId}`);
    }
  } catch (error) {
    console.error("❌ Error handling subscription deleted:", error);
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(invoice) {
  try {
    const customer = await stripe.customers.retrieve(invoice.customer);
    const userId = customer.metadata.firebaseUid;

    if (userId) {
      await admin
        .firestore()
        .collection("users")
        .doc(userId)
        .update({
          lastPaymentDate: admin.firestore.Timestamp.fromDate(
            new Date(invoice.created * 1000),
          ),
          totalDonated: admin.firestore.FieldValue.increment(
            invoice.amount_paid / 100,
          ),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      console.log(
        `✅ Payment succeeded for user ${userId}: $${invoice.amount_paid / 100}`,
      );
    }
  } catch (error) {
    console.error("❌ Error handling payment succeeded:", error);
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice) {
  try {
    const customer = await stripe.customers.retrieve(invoice.customer);
    const userId = customer.metadata.firebaseUid;

    if (userId) {
      // Log the failed payment
      await admin
        .firestore()
        .collection("payment_failures")
        .add({
          userId,
          invoiceId: invoice.id,
          amount: invoice.amount_due / 100,
          failureReason: invoice.last_payment_error?.message || "Unknown",
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

      console.log(
        `❌ Payment failed for user ${userId}: ${invoice.last_payment_error?.message}`,
      );
    }
  } catch (error) {
    console.error("❌ Error handling payment failed:", error);
  }
}

/**
 * Handle trial ending soon
 */
async function handleTrialWillEnd(subscription) {
  try {
    const customer = await stripe.customers.retrieve(subscription.customer);
    const userId = customer.metadata.firebaseUid;

    if (userId) {
      console.log(`ℹ️ Trial ending soon for user ${userId}`);
      // Could implement notification logic here
    }
  } catch (error) {
    console.error("❌ Error handling trial will end:", error);
  }
}

// ===== STRIPE UTILITY FUNCTIONS =====

/**
 * Get tier information
 */
function getTierInfo(tier) {
  const tierMapping = {
    1: { name: "Bronze Contributor ($5)", flair: "bronze" },
    2: { name: "Silver Supporter ($10)", flair: "silver" },
    3: { name: "Gold Patron ($20)", flair: "gold" },
  };
  return tierMapping[tier] || { name: "Free Member", flair: null };
}

/**
 * Get tier name
 */
function getTierName(tier) {
  return getTierInfo(parseInt(tier)).name;
}
