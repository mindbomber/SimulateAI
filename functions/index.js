const functions = require('firebase-functions');
const admin = require('firebase-admin');

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
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized: Missing or invalid authorization header',
        code: 'auth/missing-token',
      });
    }

    const idToken = authHeader.split('Bearer ')[1];

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
      `✅ Token verified for user: ${decodedToken.uid} (${decodedToken.email})`
    );

    next();
  } catch (error) {
    console.error('❌ Token verification failed:', error);

    // Provide specific error messages based on the error type
    let errorMessage = 'Invalid authentication token';
    let errorCode = 'auth/invalid-token';

    if (error.code === 'auth/id-token-expired') {
      errorMessage = 'Authentication token has expired';
      errorCode = 'auth/token-expired';
    } else if (error.code === 'auth/id-token-revoked') {
      errorMessage = 'Authentication token has been revoked';
      errorCode = 'auth/token-revoked';
    } else if (error.code === 'auth/invalid-id-token') {
      errorMessage = 'Invalid authentication token format';
      errorCode = 'auth/invalid-format';
    }

    return res.status(401).json({
      error: errorMessage,
      code: errorCode,
      details:
        process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Secured endpoint for submitting research data
 * Only authenticated users can submit simulation responses
 */
exports.submitResearchData = functions.https.onRequest(async (req, res) => {
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
});

/**
 * Secured endpoint for updating user profiles
 * Validates user identity and prevents privilege escalation
 */
exports.updateUserProfile = functions.https.onRequest(async (req, res) => {
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
});

/**
 * Secured endpoint for awarding badges
 * Only authorized systems can award badges to prevent spoofing
 */
exports.awardBadge = functions.https.onRequest(async (req, res) => {
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
});

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
 */
exports.getUserAnalytics = functions.https.onRequest(async (req, res) => {
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
});
