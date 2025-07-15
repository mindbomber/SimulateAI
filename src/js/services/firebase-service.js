/**
 * Firebase Service for SimulateAI Research Community
 * Handles authentication, database, and analytics
 */

// Firebase imports
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  GithubAuthProvider,
  signOut,
  onAuthStateChanged,
  linkWithPopup,
  linkWithRedirect,
  fetchSignInMethodsForEmail,
  EmailAuthProvider,
  linkWithCredential,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence,
  inMemoryPersistence,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  updateDoc,
  deleteDoc,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import {
  getAnalytics,
  logEvent,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js';

/**
 * Firebase configuration and initialization
 */
const getFirebaseConfig = () => {
  // Try to get from environment config utility first
  if (window.envConfig) {
    return window.envConfig.getFirebaseConfig();
  }

  // Fallback to import.meta.env (Vite environment variables)
  if (import.meta.env) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    };
  }

  // Last resort fallback (for development only)
  console.error('Firebase configuration not found in environment variables');
  throw new Error(
    'Firebase configuration missing - please set environment variables'
  );
};

const firebaseConfig = getFirebaseConfig();

/**
 * Main Firebase Service Class
 */
export class FirebaseService {
  constructor() {
    this.app = null;
    this.auth = null;
    this.db = null;
    this.analytics = null;
    this.currentUser = null;
    this.authStateListeners = [];
    this.persistenceMode = 'local'; // Default to persistent sessions

    // Rate limiting system
    this.rateLimiter = {
      attempts: new Map(), // Track attempts by IP/identifier
      cooldowns: new Map(), // Track cooldown periods
      settings: {
        maxAttempts: 5, // Max attempts per window
        windowMs: 15 * 60 * 1000, // 15 minutes
        cooldownMs: 30 * 60 * 1000, // 30 minutes lockout
        progressiveCooldown: true, // Increase cooldown with repeated violations
      },
    };
  }

  /**
   * Set authentication persistence mode
   * @param {string} mode - 'local', 'session', or 'memory'
   * @param {Object} options - Additional options like autoSignOut timer
   */
  async setAuthPersistence(mode = 'local', options = {}) {
    if (!this.auth) {
      throw new Error('Firebase auth not initialized');
    }

    try {
      let persistence;

      switch (mode) {
        case 'local':
          // Persist across browser sessions (default)
          persistence = browserLocalPersistence;
          this.persistenceMode = 'local';
          break;

        case 'session':
          // Only persist during browser session
          persistence = browserSessionPersistence;
          this.persistenceMode = 'session';
          break;

        case 'memory':
          // No persistence - user signed out when tab closes
          persistence = inMemoryPersistence;
          this.persistenceMode = 'memory';
          break;

        default:
          throw new Error(`Invalid persistence mode: ${mode}`);
      }

      await setPersistence(this.auth, persistence);

      // Set up auto-signout timer if specified
      if (options.autoSignOutMinutes && mode !== 'memory') {
        this.setupAutoSignOut(options.autoSignOutMinutes);
      }

      console.log(`✅ Auth persistence set to: ${mode}`);

      // Track persistence setting for analytics
      this.trackEvent('auth_persistence_set', {
        mode,
        auto_signout: options.autoSignOutMinutes || null,
      });

      return { success: true, mode };
    } catch (error) {
      console.error('❌ Failed to set auth persistence:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Setup automatic sign-out timer for shared computer environments
   */
  setupAutoSignOut(minutes) {
    // Clear any existing timer
    if (this.autoSignOutTimer) {
      clearTimeout(this.autoSignOutTimer);
    }

    const milliseconds = minutes * 60 * 1000;

    this.autoSignOutTimer = setTimeout(async () => {
      if (this.isAuthenticated()) {
        console.log(`🕐 Auto sign-out after ${minutes} minutes of inactivity`);
        await this.signOutUser();

        // Notify user about auto sign-out
        if (window.authService) {
          window.authService.showInfoMessage(
            `You've been automatically signed out after ${minutes} minutes for security.`
          );
        }

        this.trackEvent('auto_signout_triggered', {
          timeout_minutes: minutes,
          persistence_mode: this.persistenceMode,
        });
      }
    }, milliseconds);

    // Reset timer on user activity
    this.setupActivityDetection(minutes);
  }

  /**
   * Setup activity detection to reset auto-signout timer
   */
  setupActivityDetection(minutes) {
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
    ];

    // Remove existing listeners if any
    if (this.activityListeners) {
      this.activityListeners.forEach(({ event, handler }) => {
        document.removeEventListener(event, handler);
      });
    }

    // Activity handler that resets the timer
    const resetTimer = () => {
      if (this.autoSignOutTimer) {
        clearTimeout(this.autoSignOutTimer);
        this.setupAutoSignOut(minutes); // Reset the timer
      }
    };

    // Throttle activity detection to avoid excessive timer resets
    let throttleTimeout;
    const throttledReset = () => {
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          resetTimer();
          throttleTimeout = null;
        }, 30000); // Only reset timer once per 30 seconds
      }
    };

    // Add activity listeners
    this.activityListeners = events.map(event => {
      const handler = throttledReset;
      document.addEventListener(event, handler, { passive: true });
      return { event, handler };
    });
  }

  /**
   * Get recommended persistence mode based on environment
   */
  getRecommendedPersistence() {
    // Detect if likely on a shared/public computer
    const isSharedComputer = this.detectSharedComputer();

    if (isSharedComputer) {
      return {
        mode: 'session',
        autoSignOutMinutes: 15,
        reason:
          'Shared computer detected - using session persistence with 15min timeout',
      };
    }

    // Check if user is on mobile (more personal device)
    const isMobile = this.isMobileDevice();

    if (isMobile) {
      return {
        mode: 'local',
        reason: 'Mobile device - using persistent sessions for convenience',
      };
    }

    // Default for personal computers
    return {
      mode: 'local',
      reason: 'Personal computer - using persistent sessions',
    };
  }

  /**
   * Simple heuristic to detect shared computers
   */
  detectSharedComputer() {
    // Basic detection - could be enhanced with more sophisticated logic
    const userAgent = navigator.userAgent.toLowerCase();
    const { hostname } = window.location;

    // Check for common shared computer indicators
    const sharedIndicators = [
      'kiosk',
      'public',
      'lab',
      'library',
      'school',
      'edu',
      'university',
      'college',
    ];

    return sharedIndicators.some(
      indicator => userAgent.includes(indicator) || hostname.includes(indicator)
    );
  }

  /**
   * Initialize Firebase services
   */
  async initialize() {
    try {
      // Initialize Firebase
      this.app = initializeApp(firebaseConfig);
      this.auth = getAuth(this.app);
      this.db = getFirestore(this.app);
      this.analytics = getAnalytics(this.app);

      // Set smart authentication persistence
      await this.initializeSmartPersistence();

      // Set up auth state listener
      this.setupAuthStateListener();

      // Check for redirect result (for mobile auth)
      await this.handleAuthRedirectResult();

      console.log('🔥 Firebase initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Firebase initialization failed:', error);
      return false;
    }
  }

  /**
   * Initialize smart persistence based on environment and user preferences
   */
  async initializeSmartPersistence() {
    try {
      // Check if user has a saved preference
      const savedPreference = localStorage.getItem(
        'simulateai_auth_persistence'
      );

      if (savedPreference) {
        const { mode, autoSignOutMinutes } = JSON.parse(savedPreference);
        await this.setAuthPersistence(mode, { autoSignOutMinutes });
        return;
      }

      // Use smart detection for first-time users
      const recommendation = this.getRecommendedPersistence();
      await this.setAuthPersistence(recommendation.mode, {
        autoSignOutMinutes: recommendation.autoSignOutMinutes,
      });

      console.log('🤖 Smart persistence:', recommendation.reason);
    } catch (error) {
      console.warn('⚠️ Smart persistence setup failed, using default:', error);
      // Fallback to default persistence
      await this.setAuthPersistence('local');
    }
  }

  /**
   * Handle redirect result for mobile authentication
   */
  async handleAuthRedirectResult() {
    try {
      const result = await getRedirectResult(this.auth);
      if (result && result.user) {
        // User signed in via redirect
        await this.createOrUpdateUserProfile(result.user);

        this.trackEvent('user_sign_in', {
          method: this.getProviderFromResult(result),
          user_id: result.user.uid,
          auth_method: 'redirect',
        });
      }
    } catch (error) {
      console.error('❌ Redirect authentication failed:', error);
      // Show user-friendly error message
      this.showRedirectError(error);
    }
  }

  /**
   * Get provider name from auth result
   */
  getProviderFromResult(result) {
    if (!result.providerId) return 'unknown';

    const providerMap = {
      'google.com': 'google',
      'facebook.com': 'facebook',
      'twitter.com': 'twitter',
      'github.com': 'github',
    };

    return providerMap[result.providerId] || 'unknown';
  }

  /**
   * Show redirect authentication error
   */
  showRedirectError(error) {
    // This will be called by auth service to show user-friendly errors
    if (window.authService) {
      window.authService.showErrorMessage(
        `Authentication failed: ${error.message}`
      );
    }
  }

  /**
   * Detect if user is on mobile device
   */
  isMobileDevice() {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth <= 768
    );
  }

  /**
   * Set up authentication state monitoring
   */
  setupAuthStateListener() {
    onAuthStateChanged(this.auth, user => {
      this.currentUser = user;
      this.notifyAuthStateListeners(user);

      if (user) {
        console.log('✅ User signed in:', user.displayName || user.email);
        this.trackEvent('user_sign_in', { method: 'google' });
      } else {
        console.log('👋 User signed out');
      }
    });
  }

  /**
   * Add listener for authentication state changes
   */
  addAuthStateListener(callback) {
    this.authStateListeners.push(callback);
  }

  /**
   * Firebase-style onAuthStateChanged method for external use
   * Returns unsubscribe function following Firebase API pattern
   */
  onAuthStateChanged(callback) {
    this.addAuthStateListener(callback);

    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all auth state listeners
   */
  notifyAuthStateListeners(user) {
    this.authStateListeners.forEach(callback => callback(user));
  }

  /**
   * Sign in with Google (smart mobile/desktop detection)
   */
  async signInWithGoogle() {
    return this.authenticateWithRateLimit(async () => {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');

      return await this.authenticateWithProvider(provider, 'google');
    }, 'google_signin');
  }

  /**
   * Sign in with Facebook (smart mobile/desktop detection)
   */
  async signInWithFacebook() {
    return this.authenticateWithRateLimit(async () => {
      const provider = new FacebookAuthProvider();
      provider.addScope('email');
      provider.addScope('public_profile');

      return await this.authenticateWithProvider(provider, 'facebook');
    }, 'facebook_signin');
  }

  /**
   * Sign in with Twitter (smart mobile/desktop detection)
   */
  async signInWithTwitter() {
    return this.authenticateWithRateLimit(async () => {
      const provider = new TwitterAuthProvider();

      return await this.authenticateWithProvider(provider, 'twitter');
    }, 'twitter_signin');
  }

  /**
   * Sign in with GitHub (smart mobile/desktop detection)
   */
  async signInWithGitHub() {
    return this.authenticateWithRateLimit(async () => {
      const provider = new GithubAuthProvider();
      provider.addScope('user:email');

      return await this.authenticateWithProvider(provider, 'github');
    }, 'github_signin');
  }

  /**
   * Smart authentication with provider (mobile redirect vs desktop popup)
   * Now includes account linking for better user experience
   */
  async authenticateWithProvider(provider, providerName) {
    try {
      const isMobile = this.isMobileDevice();

      if (isMobile) {
        // Use redirect for mobile devices
        await signInWithRedirect(this.auth, provider);

        // Return pending state - actual result will be handled in handleAuthRedirectResult
        return {
          success: true,
          pending: true,
          message: 'Redirecting to authentication...',
          method: 'redirect',
        };
      } else {
        // Use popup for desktop with account linking support
        try {
          const result = await signInWithPopup(this.auth, provider);
          const { user } = result;

          // Create or update user profile
          await this.createOrUpdateUserProfile(user);

          this.trackEvent('user_sign_in', {
            method: providerName,
            user_id: user.uid,
            auth_method: 'popup',
          });

          return { success: true, user, method: 'popup' };
        } catch (error) {
          // Handle account linking if user exists with different provider
          if (error.code === 'auth/account-exists-with-different-credential') {
            return await this.handleAccountLinking(
              error,
              provider,
              providerName
            );
          }
          throw error;
        }
      }
    } catch (error) {
      this.handleAuthError(error, `${providerName}_authentication`);
      return {
        success: false,
        error: this.getHumanReadableErrorMessage(error),
      };
    }
  }

  /**
   * Handle account linking when user exists with different credential
   */
  async handleAccountLinking(error, newProvider, providerName) {
    try {
      // Get the email from the error
      const email = error.customData?.email;
      if (!email) {
        return {
          success: false,
          error: 'Unable to retrieve email for account linking',
        };
      }

      // Find existing sign-in methods for this email
      const signInMethods = await fetchSignInMethodsForEmail(this.auth, email);

      if (signInMethods.length === 0) {
        return { success: false, error: 'No existing account found' };
      }

      // For simplicity, we'll prompt the user about account linking
      // In a production app, you might want a more sophisticated UI
      const shouldLink = confirm(
        `An account with email ${email} already exists. ` +
          `Current sign-in methods: ${signInMethods.join(', ')}. ` +
          `Would you like to link your ${providerName} account?`
      );

      if (!shouldLink) {
        return { success: false, error: 'User declined account linking' };
      }

      // Sign in with existing method first
      const existingProvider = this.getProviderForMethod(signInMethods[0]);
      if (!existingProvider) {
        return { success: false, error: 'Unsupported existing sign-in method' };
      }

      // Sign in with existing provider
      const existingResult = await signInWithPopup(this.auth, existingProvider);
      const { user } = existingResult;

      // Now link the new provider
      const linkResult = await linkWithPopup(user, newProvider);

      // Update user profile to reflect linked accounts
      await this.createOrUpdateUserProfile(linkResult.user);

      this.trackEvent('account_linked', {
        user_id: user.uid,
        linked_provider: providerName,
        existing_methods: signInMethods,
      });

      return {
        success: true,
        user: linkResult.user,
        method: 'popup',
        linked: true,
        message: `Successfully linked ${providerName} account!`,
      };
    } catch (linkError) {
      console.error('❌ Account linking failed:', linkError);
      return {
        success: false,
        error: `Account linking failed: ${linkError.message}`,
      };
    }
  }

  /**
   * Get provider instance for a sign-in method
   */
  getProviderForMethod(method) {
    const providerMap = {
      'google.com': new GoogleAuthProvider(),
      'facebook.com': new FacebookAuthProvider(),
      'twitter.com': new TwitterAuthProvider(),
      'github.com': new GithubAuthProvider(),
      password: null, // Email/password requires different handling
    };

    return providerMap[method] || null;
  }

  /**
   * Link additional provider to current user account
   */
  async linkProviderToCurrentUser(providerName) {
    try {
      if (!this.currentUser) {
        return { success: false, error: 'No user currently signed in' };
      }

      const provider = this.getProviderForMethod(`${providerName}.com`);
      if (!provider) {
        return { success: false, error: 'Unsupported provider' };
      }

      const isMobile = this.isMobileDevice();

      if (isMobile) {
        await linkWithRedirect(this.currentUser, provider);
        return {
          success: true,
          pending: true,
          message: 'Redirecting to link account...',
        };
      } else {
        const result = await linkWithPopup(this.currentUser, provider);

        // Update user profile
        await this.createOrUpdateUserProfile(result.user);

        this.trackEvent('provider_linked', {
          user_id: this.currentUser.uid,
          linked_provider: providerName,
        });

        return {
          success: true,
          user: result.user,
          message: `Successfully linked ${providerName} account!`,
        };
      }
    } catch (error) {
      console.error(`❌ Failed to link ${providerName} provider:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all linked providers for current user
   */
  getUserLinkedProviders() {
    if (!this.currentUser) return [];

    return this.currentUser.providerData.map(provider => ({
      providerId: provider.providerId,
      displayName: provider.displayName,
      email: provider.email,
      photoURL: provider.photoURL,
    }));
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email, password) {
    return this.authenticateWithRateLimit(async () => {
      try {
        const result = await signInWithEmailAndPassword(
          this.auth,
          email,
          password
        );
        const { user } = result;

        // Create or update user profile
        await this.createOrUpdateUserProfile(user);

        this.trackEvent('user_sign_in', {
          method: 'email',
          user_id: user.uid,
        });

        return { success: true, user };
      } catch (error) {
        this.handleAuthError(error, 'email_signin');
        return {
          success: false,
          error: this.getHumanReadableErrorMessage(error),
        };
      }
    }, 'email_signin');
  }

  /**
   * Create account with email and password
   */
  async createAccountWithEmail(email, password, displayName = null) {
    return this.authenticateWithRateLimit(async () => {
      try {
        const result = await createUserWithEmailAndPassword(
          this.auth,
          email,
          password
        );
        const { user } = result;

        // Update display name if provided
        if (displayName) {
          await user.updateProfile({ displayName });
        }

        // Create or update user profile
        await this.createOrUpdateUserProfile(user);

        this.trackEvent('user_sign_up', {
          method: 'email',
          user_id: user.uid,
        });

        return { success: true, user };
      } catch (error) {
        this.handleAuthError(error, 'email_signup');
        return {
          success: false,
          error: this.getHumanReadableErrorMessage(error),
        };
      }
    }, 'email_signup');
  }

  /**
   * Send password reset email
   */
  async resetPassword(email) {
    return this.authenticateWithRateLimit(async () => {
      try {
        await sendPasswordResetEmail(this.auth, email);

        this.trackEvent('password_reset_requested', {
          method: 'email',
        });

        return { success: true };
      } catch (error) {
        this.handleAuthError(error, 'password_reset');
        return {
          success: false,
          error: this.getHumanReadableErrorMessage(error),
        };
      }
    }, 'password_reset');
  }

  /**
   * Sign out current user
   */
  async signOutUser() {
    try {
      await signOut(this.auth);
      this.trackEvent('user_sign_out');
      return { success: true };
    } catch (error) {
      console.error('❌ Sign out failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create or update user profile in Firestore
   */
  async createOrUpdateUserProfile(user) {
    try {
      const userRef = doc(this.db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      const now = new Date();

      if (!userSnap.exists()) {
        // Create new user profile
        await setDoc(userRef, {
          displayName: user.displayName || 'Anonymous User',
          email: user.email,
          photoURL: user.photoURL || null,
          tier: 0, // 0=free, 1=research($5+), 2=supporter($25+), etc.
          researchParticipant: false,
          totalDonated: 0,
          flair: {
            color: '#666666', // Default gray
            badge: '', // No badge for free tier
            title: '', // Badge title flair
            displayName: user.displayName || 'Anonymous User', // Custom display name
          },
          badges: [], // Array of earned badges
          customization: {
            displayName: user.displayName || 'Anonymous User',
            photoURL: user.photoURL || null,
            selectedBadgeFlair: null, // User-selected badge for flair
            profileTheme: 'default',
          },
          createdAt: now,
          updatedAt: now,
          lastLoginAt: now,
          scenariosCompleted: 0,
          researchResponsesSubmitted: 0,
        });

        this.trackEvent('user_profile_created', { user_id: user.uid });
      } else {
        // Update existing user's last login
        await updateDoc(userRef, {
          lastLoginAt: now,
          updatedAt: now,
        });
      }

      return true;
    } catch (error) {
      console.error('❌ Failed to create/update user profile:', error);
      return false;
    }
  }

  /**
   * Update user profile with Firebase Auth and Firestore sync
   * Includes badge flair management and display name customization
   */
  async updateUserProfile(userId, profileData) {
    try {
      const uid = userId || this.currentUser?.uid;
      if (!uid) {
        return { success: false, error: 'No user ID provided' };
      }

      const userRef = doc(this.db, 'users', uid);
      const updateData = {
        updatedAt: new Date(),
      };

      // Update Firebase Auth profile if display name or photo changes
      if (
        this.currentUser &&
        (profileData.displayName || profileData.photoURL)
      ) {
        const authUpdateData = {};

        if (profileData.displayName) {
          authUpdateData.displayName = profileData.displayName;
          updateData['customization.displayName'] = profileData.displayName;
        }

        if (profileData.photoURL) {
          authUpdateData.photoURL = profileData.photoURL;
          updateData['customization.photoURL'] = profileData.photoURL;
        }

        // Update Firebase Auth profile
        await this.currentUser.updateProfile(authUpdateData);
      }

      // Update Firestore profile
      if (profileData.selectedBadgeFlair) {
        updateData['customization.selectedBadgeFlair'] =
          profileData.selectedBadgeFlair;

        // Update flair display
        const badge = await this.getBadgeById(profileData.selectedBadgeFlair);
        if (badge) {
          updateData.flair = {
            ...updateData.flair,
            title: badge.title,
            badge: badge.icon,
            color: badge.color,
          };
        }
      }

      if (profileData.profileTheme) {
        updateData['customization.profileTheme'] = profileData.profileTheme;
      }

      await updateDoc(userRef, updateData);

      this.trackEvent('user_profile_updated', {
        user_id: uid,
        updated_fields: Object.keys(profileData),
        has_badge_flair: !!profileData.selectedBadgeFlair,
      });

      return { success: true, updatedFields: Object.keys(profileData) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Award badge to user and update their collection
   */
  async awardBadge(userId, badgeData) {
    try {
      const uid = userId || this.currentUser?.uid;
      if (!uid) {
        return { success: false, error: 'No user ID provided' };
      }

      const userRef = doc(this.db, 'users', uid);
      const userProfile = await this.getUserProfile(uid);

      if (!userProfile) {
        return { success: false, error: 'User profile not found' };
      }

      // Check if badge already awarded
      const existingBadges = userProfile.badges || [];
      const badgeExists = existingBadges.some(
        b => b.category === badgeData.category && b.tier === badgeData.tier
      );

      if (badgeExists) {
        return { success: false, error: 'Badge already awarded' };
      }

      // Create badge record
      const badge = {
        id: `${badgeData.category}_${badgeData.tier}`,
        category: badgeData.category,
        tier: badgeData.tier,
        title: badgeData.title,
        description: badgeData.description,
        icon: badgeData.icon,
        color: badgeData.color,
        awardedAt: new Date(),
        ...badgeData,
      };

      // Update user profile with new badge
      const updatedBadges = [...existingBadges, badge];

      await updateDoc(userRef, {
        badges: updatedBadges,
        updatedAt: new Date(),
      });

      this.trackEvent('badge_awarded', {
        user_id: uid,
        badge_category: badgeData.category,
        badge_tier: badgeData.tier,
        badge_title: badgeData.title,
        total_badges: updatedBadges.length,
      });

      return {
        success: true,
        badge,
        totalBadges: updatedBadges.length,
        newlyUnlocked: true,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user's badge collection with flair options
   */
  async getUserBadges(userId = null) {
    try {
      const profile = await this.getUserProfile(userId);
      if (!profile) return { success: false, badges: [] };

      const badges = profile.badges || [];
      const selectedFlair = profile.customization?.selectedBadgeFlair;

      // Enhance badges with selection status
      const enhancedBadges = badges.map(badge => ({
        ...badge,
        isSelectedFlair: badge.id === selectedFlair,
        canBeUsedAsFlair: true,
        uniqueTitle: `${badge.title} ${badge.tier > 0 ? `(Tier ${badge.tier})` : ''}`,
      }));

      return {
        success: true,
        badges: enhancedBadges,
        selectedFlair,
        totalCount: badges.length,
      };
    } catch (error) {
      return { success: false, error: error.message, badges: [] };
    }
  }

  /**
   * Get badge by ID for flair display
   */
  async getBadgeById(badgeId) {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) return null;

      const profile = await this.getUserProfile(currentUser.uid);
      if (!profile || !profile.badges) return null;

      return profile.badges.find(badge => badge.id === badgeId) || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get user's display name with badge flair
   */
  getDisplayNameWithFlair(userProfile) {
    if (!userProfile) return 'Anonymous User';

    const baseName =
      userProfile.customization?.displayName ||
      userProfile.displayName ||
      'Anonymous User';

    const { flair } = userProfile;
    if (flair && flair.title && flair.badge) {
      return `${flair.badge} ${baseName} [${flair.title}]`;
    }

    return baseName;
  }

  /**
   * Generate suggested badge flairs for user
   */
  generateBadgeFlairSuggestions(userProfile) {
    const badges = userProfile.badges || [];
    if (badges.length === 0) return [];

    // Sort badges by tier and recency for best suggestions
    const sortedBadges = badges.sort((a, b) => {
      // Prefer higher tier badges
      if (a.tier !== b.tier) return b.tier - a.tier;
      // Then prefer more recent badges
      return new Date(b.awardedAt) - new Date(a.awardedAt);
    });

    return sortedBadges.slice(0, 5).map(badge => ({
      id: badge.id,
      title: badge.title,
      icon: badge.icon,
      color: badge.color,
      previewName: `${badge.icon} ${userProfile.customization?.displayName || 'Your Name'} [${badge.title}]`,
      tier: badge.tier,
      category: badge.category,
    }));
  }

  /**
   * Track analytics events
   */
  trackEvent(eventName, parameters = {}) {
    if (this.analytics) {
      logEvent(this.analytics, eventName, parameters);
    }
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return this.currentUser !== null;
  }

  /**
   * Get current user's ID token for secure API calls
   * This token is verified by Firebase Functions to prevent spoofing
   */
  async getCurrentUserToken() {
    try {
      if (!this.currentUser) {
        throw new Error('No user currently signed in');
      }

      // Force refresh token to ensure it's not expired
      const idToken = await this.currentUser.getIdToken(true);
      return idToken;
    } catch (error) {
      console.error('❌ Failed to get user token:', error);
      throw error;
    }
  }

  /**
   * Make authenticated API call to Firebase Functions
   * Automatically includes user token for verification
   */
  async makeSecureAPICall(functionName, data = null, method = 'POST') {
    try {
      const token = await this.getCurrentUserToken();
      const functionUrl = `https://us-central1-simulateai-research.cloudfunctions.net/${functionName}`;

      const requestOptions = {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        requestOptions.body = JSON.stringify(data);
      }

      const response = await fetch(functionUrl, requestOptions);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'API call failed');
      }

      return { success: true, data: result };
    } catch (error) {
      console.error(`❌ Secure API call failed (${functionName}):`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Submit research response via secure Firebase Function
   * Server validates user identity and research participation status
   */
  async submitSecureResearchResponse(scenarioData) {
    try {
      if (!this.isAuthenticated()) {
        return { success: false, error: 'User not authenticated' };
      }

      const result = await this.makeSecureAPICall('submitResearchData', {
        scenarioId: scenarioData.scenarioId,
        responses: scenarioData.responses,
        ethicsScores: scenarioData.ethicsScores,
        completionTime: scenarioData.completionTime,
        reflectionAnswers: scenarioData.reflectionAnswers || [],
      });

      if (result.success) {
        this.trackEvent('secure_research_response_submitted', {
          scenario_id: scenarioData.scenarioId,
          submission_id: result.data.submissionId,
          method: 'secure_function',
        });
      }

      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update user profile via secure Firebase Function
   * Server validates user identity and input sanitization
   */
  async updateSecureUserProfile(profileData) {
    try {
      if (!this.isAuthenticated()) {
        return { success: false, error: 'User not authenticated' };
      }

      const result = await this.makeSecureAPICall(
        'updateUserProfile',
        profileData,
        'PUT'
      );

      if (result.success) {
        this.trackEvent('secure_profile_updated', {
          user_id: this.currentUser.uid,
          updated_fields: result.data.updatedFields || [],
          method: 'secure_function',
        });
      }

      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Award badge via secure Firebase Function
   * Requires admin privileges to prevent badge spoofing
   */
  async awardSecureBadge(targetUserId, badgeData, adminKey) {
    try {
      if (!this.isAuthenticated()) {
        return { success: false, error: 'User not authenticated' };
      }

      const functionUrl =
        'https://us-central1-simulateai-research.cloudfunctions.net/awardBadge';
      const token = await this.getCurrentUserToken();

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'X-Admin-Key': adminKey,
        },
        body: JSON.stringify({
          targetUserId,
          badgeData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Badge awarding failed');
      }

      this.trackEvent('secure_badge_awarded', {
        target_user: targetUserId,
        badge_category: badgeData.category,
        badge_tier: badgeData.tier,
        awarded_by: this.currentUser.uid,
        method: 'secure_function',
      });

      return { success: true, data: result };
    } catch (error) {
      console.error('❌ Secure badge awarding failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user analytics via secure Firebase Function
   * Server validates user identity and returns only authorized data
   */
  async getSecureUserAnalytics() {
    try {
      if (!this.isAuthenticated()) {
        return { success: false, error: 'User not authenticated' };
      }

      const result = await this.makeSecureAPICall(
        'getUserAnalytics',
        null,
        'GET'
      );

      if (result.success) {
        this.trackEvent('secure_analytics_accessed', {
          user_id: this.currentUser.uid,
          method: 'secure_function',
        });
      }

      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Validate current user token status
   * Useful for checking if token needs refresh
   */
  async validateCurrentToken() {
    try {
      if (!this.currentUser) {
        return { valid: false, reason: 'No user signed in' };
      }

      // Get token without forcing refresh to check current status
      const token = await this.currentUser.getIdToken(false);

      // Decode token to check expiration (client-side check only)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp < now;

      return {
        valid: !isExpired,
        expiresAt: new Date(payload.exp * 1000),
        issuedAt: new Date(payload.iat * 1000),
        needsRefresh: isExpired || payload.exp - now < 300, // Refresh if expires in 5 minutes
      };
    } catch (error) {
      return { valid: false, reason: error.message };
    }
  }

  /**
   * Get unique identifier for rate limiting
   * Uses multiple factors to identify potential attackers
   */
  getRateLimitIdentifier() {
    // Combine multiple factors for more robust identification
    const factors = [
      // IP address (if available via service)
      this.getClientIP(),
      // Browser fingerprint
      navigator.userAgent,
      // Screen resolution
      `${screen.width}x${screen.height}`,
      // Timezone
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      // Language
      navigator.language,
    ];

    // Create hash of combined factors
    return btoa(factors.join('|'))
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 32);
  }

  /**
   * Get client IP address (simplified version)
   * In production, this would be handled server-side
   */
  getClientIP() {
    // This is a simplified approach - in production you'd get this from server
    return 'unknown';
  }

  /**
   * Check if authentication request is rate limited
   */
  isRateLimited(identifier, operation = 'auth') {
    const now = Date.now();
    const key = `${identifier}_${operation}`;

    // Check if currently in cooldown
    const cooldownEnd = this.rateLimiter.cooldowns.get(key);
    if (cooldownEnd && now < cooldownEnd) {
      const remainingMs = cooldownEnd - now;
      return {
        limited: true,
        remainingMs,
        remainingMinutes: Math.ceil(remainingMs / (60 * 1000)),
        reason: 'cooldown',
      };
    }

    // Check current attempts in window
    const attempts = this.rateLimiter.attempts.get(key) || [];
    const windowStart = now - this.rateLimiter.settings.windowMs;

    // Filter attempts to current window
    const recentAttempts = attempts.filter(
      timestamp => timestamp > windowStart
    );

    if (recentAttempts.length >= this.rateLimiter.settings.maxAttempts) {
      // Trigger cooldown
      this.triggerCooldown(key, recentAttempts.length);

      return {
        limited: true,
        attempts: recentAttempts.length,
        maxAttempts: this.rateLimiter.settings.maxAttempts,
        reason: 'max_attempts',
      };
    }

    return { limited: false };
  }

  /**
   * Record authentication attempt
   */
  recordAuthAttempt(identifier, operation = 'auth', success = false) {
    const now = Date.now();
    const key = `${identifier}_${operation}`;

    // Get existing attempts
    const attempts = this.rateLimiter.attempts.get(key) || [];

    // Add current attempt
    attempts.push(now);

    // Clean old attempts outside window
    const windowStart = now - this.rateLimiter.settings.windowMs;
    const recentAttempts = attempts.filter(
      timestamp => timestamp > windowStart
    );

    // Update attempts
    this.rateLimiter.attempts.set(key, recentAttempts);

    // If successful, clear the attempts and cooldown
    if (success) {
      this.rateLimiter.attempts.delete(key);
      this.rateLimiter.cooldowns.delete(key);
    }

    // Track analytics
    this.trackEvent('auth_attempt_recorded', {
      operation,
      success,
      attempts_count: recentAttempts.length,
      identifier_hash: btoa(identifier).substring(0, 8), // Partial hash for analytics
    });
  }

  /**
   * Trigger cooldown period
   */
  triggerCooldown(key, attemptCount) {
    const now = Date.now();
    let cooldownDuration = this.rateLimiter.settings.cooldownMs;

    // Progressive cooldown - increase duration for repeat offenders
    if (this.rateLimiter.settings.progressiveCooldown) {
      const violations = Math.floor(
        attemptCount / this.rateLimiter.settings.maxAttempts
      );
      cooldownDuration *= Math.pow(2, violations - 1); // Exponential backoff

      // Cap at 24 hours
      cooldownDuration = Math.min(cooldownDuration, 24 * 60 * 60 * 1000);
    }

    this.rateLimiter.cooldowns.set(key, now + cooldownDuration);

    // Track security event
    this.trackEvent('auth_rate_limit_triggered', {
      attempt_count: attemptCount,
      cooldown_minutes: Math.ceil(cooldownDuration / (60 * 1000)),
      violations: Math.floor(
        attemptCount / this.rateLimiter.settings.maxAttempts
      ),
    });
  }

  /**
   * Enhanced authentication wrapper with rate limiting
   */
  async authenticateWithRateLimit(authFunction, operation, ...args) {
    const identifier = this.getRateLimitIdentifier();

    // Check rate limit
    const rateLimitCheck = this.isRateLimited(identifier, operation);
    if (rateLimitCheck.limited) {
      const error = new Error(
        rateLimitCheck.reason === 'cooldown'
          ? `Too many failed attempts. Please wait ${rateLimitCheck.remainingMinutes} minutes before trying again.`
          : `Too many attempts. Please wait before trying again.`
      );
      error.code = 'auth/too-many-requests';
      error.rateLimitInfo = rateLimitCheck;

      // Record the blocked attempt
      this.recordAuthAttempt(identifier, operation, false);

      throw error;
    }

    try {
      // Attempt authentication
      const result = await authFunction.apply(this, args);

      // Record successful attempt
      this.recordAuthAttempt(identifier, operation, true);

      return result;
    } catch (error) {
      // Record failed attempt
      this.recordAuthAttempt(identifier, operation, false);

      // Check if it's a network error and handle accordingly
      const networkResult = this.handleNetworkAwareError(
        error,
        `auth_${operation}`
      );
      if (networkResult.networkError) {
        // Return the network-aware result instead of throwing
        return networkResult;
      }

      // Re-throw the original error for non-network issues
      throw error;
    }
  }

  /**
   * Get rate limit status for user feedback
   */
  getRateLimitStatus(operation = 'auth') {
    const identifier = this.getRateLimitIdentifier();
    const key = `${identifier}_${operation}`;
    const now = Date.now();

    // Check cooldown
    const cooldownEnd = this.rateLimiter.cooldowns.get(key);
    if (cooldownEnd && now < cooldownEnd) {
      return {
        status: 'cooldown',
        remainingMs: cooldownEnd - now,
        remainingMinutes: Math.ceil((cooldownEnd - now) / (60 * 1000)),
      };
    }

    // Check current attempts
    const attempts = this.rateLimiter.attempts.get(key) || [];
    const windowStart = now - this.rateLimiter.settings.windowMs;
    const recentAttempts = attempts.filter(
      timestamp => timestamp > windowStart
    );

    return {
      status: 'active',
      attempts: recentAttempts.length,
      maxAttempts: this.rateLimiter.settings.maxAttempts,
      remaining: this.rateLimiter.settings.maxAttempts - recentAttempts.length,
      windowMinutes: this.rateLimiter.settings.windowMs / (60 * 1000),
    };
  }

  /**
   * Handle Firebase authentication errors with graceful network error handling
   */
  handleAuthError(error, context = 'authentication') {
    // Log error for debugging (but not in production)
    if (this.isDevelopment()) {
      console.error(`🔥 Firebase Auth Error [${context}]:`, error);
    }

    // Track authentication errors for analytics
    this.logAnalytics('auth_error', {
      error_code: error.code || 'unknown',
      error_message: error.message || 'Unknown error',
      context,
      network_available: navigator.onLine,
      timestamp: Date.now(),
    });

    return error;
  }

  /**
   * Enhanced error handling that integrates with network status monitoring
   */
  handleNetworkAwareError(error, context = 'general') {
    // Handle network errors with the network status monitor
    if (typeof window !== 'undefined' && window.NetworkStatusMonitor) {
      const wasHandled = window.NetworkStatusMonitor.handleNetworkError(
        error,
        context
      );
      if (wasHandled) {
        return {
          success: false,
          error: this.getHumanReadableErrorMessage(error),
          networkError: true,
          handled: true,
        };
      }
    }

    // Fall back to regular error handling
    this.handleAuthError(error, context);
    return {
      success: false,
      error: this.getHumanReadableErrorMessage(error),
      networkError: false,
      handled: false,
    };
  }

  /**
   * Get user-friendly error messages for Firebase auth errors
   */
  getHumanReadableErrorMessage(error) {
    if (!error) return 'An unexpected error occurred';

    const errorCode = error.code || '';
    const errorMessage = error.message || error.toString();

    // Network-related errors - priority handling
    if (
      errorCode === 'auth/network-request-failed' ||
      errorMessage.includes('network') ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('NetworkError') ||
      !navigator.onLine
    ) {
      return this.getNetworkErrorMessage();
    }

    // Specific Firebase auth error codes
    const errorMessages = {
      // Network and connectivity
      'auth/timeout':
        'The request timed out. Please check your connection and try again.',
      'auth/too-many-requests':
        'Too many attempts. Please wait a few minutes before trying again.',

      // User account errors
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password should be at least 6 characters long.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/invalid-credential':
        'Invalid login credentials. Please check your email and password.',

      // Provider-specific errors
      'auth/popup-blocked':
        'Sign-in popup was blocked. Please allow popups and try again.',
      'auth/popup-closed-by-user': 'Sign-in was cancelled. Please try again.',
      'auth/cancelled-popup-request':
        'Sign-in was cancelled. Please try again.',
      'auth/redirect-cancelled-by-user':
        'Sign-in was cancelled. Please try again.',
      'auth/unauthorized-domain':
        'This domain is not authorized for authentication.',

      // Account linking errors
      'auth/account-exists-with-different-credential':
        'An account already exists with the same email but different sign-in credentials.',
      'auth/credential-already-in-use':
        'This credential is already associated with a different account.',
      'auth/provider-already-linked':
        'This account is already linked with this provider.',

      // Token and session errors
      'auth/invalid-api-key':
        'Authentication service is temporarily unavailable.',
      'auth/app-deleted': 'Authentication service is temporarily unavailable.',
      'auth/expired-action-code': 'This verification link has expired.',
      'auth/invalid-action-code': 'This verification link is invalid.',

      // Rate limiting
      'auth/quota-exceeded': 'Too many requests. Please try again later.',

      // Generic fallbacks
      'auth/operation-not-allowed': 'This sign-in method is not enabled.',
      'auth/requires-recent-login':
        'Please sign in again to complete this action.',
    };

    // Return specific message or generate a friendly fallback
    if (errorMessages[errorCode]) {
      return errorMessages[errorCode];
    }

    // Handle generic network/connection issues
    if (
      errorMessage.includes('fetch') ||
      errorMessage.includes('CORS') ||
      errorMessage.includes('ERR_NETWORK') ||
      errorMessage.includes('ERR_INTERNET_DISCONNECTED')
    ) {
      return this.getNetworkErrorMessage();
    }

    // Generic fallback with helpful context
    if (errorCode.startsWith('auth/')) {
      return `Authentication failed. Please try again or contact support if the problem persists.`;
    }

    // Last resort fallback
    return 'Something went wrong. Please check your connection and try again.';
  }

  /**
   * Get network-specific error message with troubleshooting tips
   */
  getNetworkErrorMessage() {
    const isOnline = navigator.onLine;

    if (!isOnline) {
      return 'No internet connection detected. Please check your network and try again.';
    }

    // Online but network issues
    const tips = [
      'Check your internet connection',
      'Try refreshing the page',
      "Disable VPN if you're using one",
      'Try again in a few moments',
    ];

    return `Network connection problem. Please try the following:\n• ${tips.join('\n• ')}`;
  }

  /**
   * Check if running in development mode
   */
  isDevelopment() {
    return (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.protocol === 'file:'
    );
  }

  /**
   * Delete current user account (GDPR compliant)
   */
  async deleteCurrentUser() {
    try {
      if (!this.auth.currentUser) {
        throw new Error('No authenticated user found');
      }

      // Import deleteUser function
      const { deleteUser } = await import(
        'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js'
      );

      // Delete the user from Firebase Authentication
      await deleteUser(this.auth.currentUser);

      this.trackEvent('user_account_deleted', {
        deletion_timestamp: new Date().toISOString(),
        method: 'user_initiated',
      });

      return { success: true };
    } catch (error) {
      console.error('❌ Account deletion failed:', error);
      return { success: false, error: error.message };
    }
  }
}

export default FirebaseService;
