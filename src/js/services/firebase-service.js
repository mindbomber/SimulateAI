/**
 * Copyright 2025 Armando Sori
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Firebase Service for SimulateAI Research Community
 * Handles authentication, database, and analytics
 */

// Firebase imports
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import appCheckService from './app-check-service.js';
import HybridDataService from './hybrid-data-service.js';
import FirebaseStorageService from './firebase-storage-service.js';
import PWAService from './pwa-service.js';
import FirebaseAnalyticsService from './firebase-analytics-service.js';
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
  onSnapshot,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';
import {
  getAnalytics,
  logEvent,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js';
import { getPerformance } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-performance.js';

// Import messaging service
import { MessagingService } from './messaging-service.js';
// Import performance tracing service
import { PerformanceTracing } from './performance-tracing.js';

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

  // Production Firebase configuration for SimulateAI
  return {
    apiKey: 'AIzaSyAwoc3L-43aXyNjNB9ncGbFm7eE-yn5bFA',
    authDomain: 'simulateai-research.firebaseapp.com',
    projectId: 'simulateai-research',
    storageBucket: 'simulateai-research.firebasestorage.app',
    messagingSenderId: '52924445915', // Crucial for FCM!
    appId: '1:52924445915:web:dadca1a93bc382403a08fe',
    measurementId: 'G-XW8H062BMV',
  };
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
    this.storage = null;
    this.analytics = null;
    this.messaging = null;
    this.hybridData = null;
    this.storageService = null;
    this.analyticsService = null;
    this.currentUser = null;
    this.authStateListeners = [];
    this.profileListeners = new Map(); // For real-time profile updates
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

    // PWA service
    this.pwaService = null;
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
   * Get recommended persistence mode based on device and environment
   * @returns {Object} Recommendation with mode, reason, and optional autoSignOutMinutes
   */
  getRecommendedPersistence() {
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

      // Initialize App Check for enhanced security
      await appCheckService.initialize(this.app);
      this.appCheck = appCheckService;

      this.auth = getAuth(this.app);
      this.db = getFirestore(this.app);
      this.storage = getStorage(this.app);
      this.analytics = getAnalytics(this.app);
      this.performance = getPerformance(this.app);

      // Initialize messaging service
      this.messaging = new MessagingService(this.app);
      await this.messaging.init();

      // Initialize hybrid data service
      this.hybridData = new HybridDataService(this.app);
      await this.hybridData.initializeDataConnect();

      // Initialize storage service
      this.storageService = new FirebaseStorageService(
        this.app,
        this.hybridData
      );

      // Initialize analytics service
      this.analyticsService = new FirebaseAnalyticsService(
        this.app,
        this.hybridData
      );

      // Initialize performance tracing service
      this.performanceTracing = new PerformanceTracing(this);

      // Initialize PWA service
      this.pwaService = new PWAService(this);
      await this.pwaService.init();

      // Connect storage service to hybrid data service
      this.hybridData.setStorageService(this.storageService);

      // Set smart authentication persistence
      await this.initializeSmartPersistence();

      // Set up auth state listener
      this.setupAuthStateListener();

      // Check for redirect result (for mobile auth)
      await this.handleAuthRedirectResult();

      return true;
    } catch (error) {
      console.error('❌ Firebase initialization failed:', error);
      return false;
    }
  }

  /**
   * Get App Check instance for token validation
   * @returns {AppCheckService} App Check service instance
   */
  getAppCheck() {
    if (!this.appCheck || !this.appCheck.isReady) {
      throw new Error('App Check not initialized. Call initialize() first.');
    }
    return this.appCheck;
  }

  /**
   * Check if App Check is initialized and working
   * @returns {boolean} True if App Check is ready
   */
  isAppCheckReady() {
    try {
      return this.appCheck && this.appCheck.validateStatus();
    } catch (error) {
      console.warn('⚠️ App Check status check failed:', error);
      return false;
    }
  }

  /**
   * Get App Check token for manual validation
   * @param {string} action - Optional action for token context
   * @returns {Promise<string>} App Check token
   */
  async getAppCheckToken(action = null) {
    try {
      if (!this.isAppCheckReady()) {
        throw new Error('App Check not ready');
      }

      if (action) {
        return await this.appCheck.getTokenForAction(action);
      } else {
        return await this.appCheck.getToken();
      }
    } catch (error) {
      console.error('❌ Failed to get App Check token:', error);
      throw error;
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

        this.trackEvent('user_sign_in', { method: 'google' });
      } else {

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
   * Upload profile picture to Firebase Storage
   * @param {File} file - Image file to upload
   * @param {string} userId - User ID for the file path
   * @returns {Promise<Object>} Upload result with download URL
   */
  async uploadProfilePicture(file, userId = null) {
    try {
      const uid = userId || this.currentUser?.uid;
      if (!uid) {
        return { success: false, error: 'No user ID provided' };
      }

      // Validate file type and size
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
      ];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          error: 'Invalid file type. Please use JPEG, PNG, WebP, or GIF.',
        };
      }

      if (file.size > maxSize) {
        return {
          success: false,
          error: 'File too large. Maximum size is 5MB.',
        };
      }

      // Create storage reference
      const fileName = `profile-pictures/${uid}/${Date.now()}-${file.name}`;
      const storageRef = ref(this.storage, fileName);

      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Update user profile with new photo URL
      await this.updateUserProfile(uid, { photoURL: downloadURL });

      // Delete old profile picture if it exists and is not default
      const userProfile = await this.getUserProfile(uid);
      const oldPhotoURL = userProfile?.photoURL;
      if (oldPhotoURL && oldPhotoURL.includes('firebase')) {
        try {
          const oldRef = ref(this.storage, oldPhotoURL);
          await deleteObject(oldRef);
        } catch (error) {
          // Old file might not exist, that's okay
          console.warn('Could not delete old profile picture:', error);
        }
      }

      this.trackEvent('profile_picture_uploaded', {
        user_id: uid,
        file_size: file.size,
        file_type: file.type,
      });

      return {
        success: true,
        downloadURL,
        fileName: snapshot.ref.name,
      };
    } catch (error) {
      console.error('❌ Profile picture upload failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user profile with real-time updates
   * @param {string} userId - User ID to get profile for
   * @param {Function} callback - Callback function for real-time updates
   * @returns {Function} Unsubscribe function
   */
  async getUserProfileRealtime(userId = null, callback = null) {
    try {
      const uid = userId || this.currentUser?.uid;
      if (!uid) {
        if (callback) callback(null, 'No user ID provided');
        return () => {};
      }

      const userRef = doc(this.db, 'users', uid);

      if (!callback) {
        // One-time read
        const userSnap = await getDoc(userRef);
        return userSnap.exists() ? userSnap.data() : null;
      }

      // Real-time listener
      const unsubscribe = onSnapshot(
        userRef,
        doc => {
          if (doc.exists()) {
            callback(doc.data(), null);
          } else {
            callback(null, 'User profile not found');
          }
        },
        error => {
          callback(null, error.message);
        }
      );

      // Store listener for cleanup
      this.profileListeners.set(uid, unsubscribe);

      return unsubscribe;
    } catch (error) {
      console.error('❌ Failed to get user profile:', error);
      if (callback) callback(null, error.message);
      return () => {};
    }
  }

  /**
   * Enhanced user profile update with real-time sync
   * @param {string} userId - User ID
   * @param {Object} profileData - Profile data to update
   * @param {boolean} realtime - Whether to enable real-time updates
   * @returns {Promise<Object>} Update result
   */
  async updateUserProfileEnhanced(userId, profileData, realtime = false) {
    try {
      const uid = userId || this.currentUser?.uid;
      if (!uid) {
        return { success: false, error: 'No user ID provided' };
      }

      const userRef = doc(this.db, 'users', uid);
      const updateData = {
        ...profileData,
        updatedAt: new Date(),
      };

      // Handle special fields
      if (profileData.preferences) {
        updateData['preferences'] = {
          ...profileData.preferences,
          lastUpdated: new Date(),
        };
      }

      if (profileData.theme) {
        updateData['customization.profileTheme'] = profileData.theme;
      }

      if (profileData.notificationSettings) {
        updateData['preferences.notifications'] =
          profileData.notificationSettings;
      }

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

        await this.currentUser.updateProfile(authUpdateData);
      }

      // Update Firestore
      await updateDoc(userRef, updateData);

      // Set up real-time listener if requested
      if (realtime && !this.profileListeners.has(uid)) {
        this.getUserProfileRealtime(uid, (profile, error) => {
          if (error) {
            console.error('Profile update error:', error);
            return;
          }

          // Emit custom event for profile updates
          window.dispatchEvent(
            new CustomEvent('profileUpdated', {
              detail: { userId: uid, profile },
            })
          );
        });
      }

      this.trackEvent('user_profile_updated_enhanced', {
        user_id: uid,
        updated_fields: Object.keys(profileData),
        has_realtime: realtime,
      });

      return { success: true, updatedFields: Object.keys(profileData) };
    } catch (error) {
      console.error('❌ Enhanced profile update failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Set up profile preferences with validation
   * @param {string} userId - User ID
   * @param {Object} preferences - User preferences object
   */
  async updateUserPreferences(userId, preferences) {
    try {
      const uid = userId || this.currentUser?.uid;
      if (!uid) {
        return { success: false, error: 'No user ID provided' };
      }

      // Validate preferences structure
      const validPreferences = {
        theme: preferences.theme || 'default',
        language: preferences.language || 'en',
        notifications: {
          email: preferences.notifications?.email ?? true,
          browser: preferences.notifications?.browser ?? true,
          research: preferences.notifications?.research ?? true,
          community: preferences.notifications?.community ?? true,
        },
        privacy: {
          profileVisibility: preferences.privacy?.profileVisibility || 'public',
          showBadges: preferences.privacy?.showBadges ?? true,
          showActivity: preferences.privacy?.showActivity ?? true,
        },
        accessibility: {
          highContrast: preferences.accessibility?.highContrast ?? false,
          reducedMotion: preferences.accessibility?.reducedMotion ?? false,
          fontSize: preferences.accessibility?.fontSize || 'medium',
        },
        lastUpdated: new Date(),
      };

      const userRef = doc(this.db, 'users', uid);
      await updateDoc(userRef, {
        preferences: validPreferences,
        updatedAt: new Date(),
      });

      this.trackEvent('user_preferences_updated', {
        user_id: uid,
        theme: validPreferences.theme,
        notifications_enabled: validPreferences.notifications.email,
      });

      return { success: true, preferences: validPreferences };
    } catch (error) {
      console.error('❌ Failed to update preferences:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clean up profile listeners
   * @param {string} userId - User ID to clean up listeners for
   */
  cleanupProfileListeners(userId = null) {
    if (userId) {
      const unsubscribe = this.profileListeners.get(userId);
      if (unsubscribe) {
        unsubscribe();
        this.profileListeners.delete(userId);
      }
    } else {
      // Clean up all listeners
      this.profileListeners.forEach(unsubscribe => {
        unsubscribe();
      });
      this.profileListeners.clear();
    }
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

    return `Network connection problem. Please try the following:\n• ${tips.join(
      '\n• '
    )}`;
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

  /**
   * Initialize push notifications for current user
   */
  async initializePushNotifications() {
    try {
      if (!this.messaging || !this.currentUser) {
        return {
          success: false,
          error: 'Messaging not available or user not authenticated',
        };
      }

      const token = await this.messaging.getRegistrationToken(
        this.currentUser.uid
      );
      if (token) {
        return { success: true, token };
      }

      return { success: false, error: 'Failed to get FCM token' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Subscribe to thread notifications
   */
  async subscribeToThreadNotifications(threadId) {
    try {
      if (!this.messaging || !this.currentUser) {
        throw new Error('Messaging not available or user not authenticated');
      }

      await this.messaging.subscribeToThread(threadId, this.currentUser.uid);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Subscribe to new blog post notifications
   */
  async subscribeToNewPostNotifications() {
    try {
      if (!this.messaging || !this.currentUser) {
        throw new Error('Messaging not available or user not authenticated');
      }

      await this.messaging.subscribeToNewPosts(this.currentUser.uid);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get messaging service instance
   */
  getMessagingService() {
    return this.messaging;
  }

  /**
   * Check if push notifications are supported and enabled
   */
  isPushNotificationSupported() {
    return this.messaging?.isNotificationSupported() || false;
  }

  /**
   * PWA-specific methods
   */

  /**
   * Handle connectivity changes for offline/online sync
   */
  handleConnectivityChange(isOnline) {
    if (isOnline && this.pwaService) {
      // Process any queued offline actions
      this.pwaService.processSyncQueue();
    }
  }

  /**
   * Add action to offline queue for PWA sync
   */
  addToOfflineQueue(actionType, data, options = {}) {
    if (this.pwaService) {
      this.pwaService.addToSyncQueue({
        type: actionType,
        data,
        options,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Get PWA installation status
   */
  getPWAStatus() {
    return this.pwaService
      ? this.pwaService.getStatus()
      : {
          isInstalled: false,
          isOnline: navigator.onLine,
          hasServiceWorker: false,
          syncQueueLength: 0,
          canInstall: false,
        };
  }

  /**
   * Trigger PWA installation prompt
   */
  async installPWA() {
    if (this.pwaService) {
      return await this.pwaService.triggerInstall();
    }
    return false;
  }

  /**
   * Get cache usage information
   */
  async getCacheInfo() {
    if (this.pwaService) {
      return await this.pwaService.getCacheInfo();
    }
    return null;
  }

  /**
   * Force refresh service worker cache
   */
  async refreshCache() {
    if (this.pwaService) {
      return await this.pwaService.refreshCache();
    }
    return false;
  }

  // ====================================
  // SYSTEM ANALYTICS & METADATA METHODS
  // ====================================

  /**
   * Add a batch of system metrics to Firestore
   * @param {Array} metricsBatch - Array of metric objects to store
   * @returns {Promise<Object>} - Result of the batch operation
   */
  async addSystemMetricsBatch(metricsBatch) {
    if (!this.db) {
      throw new Error('Firestore not initialized');
    }

    if (!Array.isArray(metricsBatch) || metricsBatch.length === 0) {
      return { success: true, stored: 0 };
    }

    try {
      const batch = [];
      const timestamp = new Date();

      for (const metric of metricsBatch) {
        // Sanitize and prepare metric data
        const sanitizedMetric = this.sanitizeMetricData(metric);

        // Add common fields
        const enrichedMetric = {
          ...sanitizedMetric,
          storedAt: timestamp,
          version: '1.0',
          source: 'system-metadata-collector',
          environment: this.getEnvironmentInfo(),
        };

        // Store in appropriate collection based on metric type
        const collectionName = this.getCollectionNameForMetric(metric.type);
        const docRef = collection(this.db, collectionName);

        batch.push(addDoc(docRef, enrichedMetric));
      }

      // Execute all batch operations
      const results = await Promise.allSettled(batch);

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      // Log analytics event for successful batch
      if (successful > 0 && this.analytics) {
        logEvent(this.analytics, 'system_metrics_batch_stored', {
          metrics_count: successful,
          batch_size: metricsBatch.length,
          timestamp: timestamp.toISOString(),
        });
      }

      return {
        success: true,
        stored: successful,
        failed,
        total: metricsBatch.length,
      };
    } catch (error) {
      // Log error event
      if (this.analytics) {
        logEvent(this.analytics, 'system_metrics_batch_error', {
          error_message: error.message,
          batch_size: metricsBatch.length,
        });
      }

      return {
        success: false,
        error: error.message,
        stored: 0,
        failed: metricsBatch.length,
        total: metricsBatch.length,
      };
    }
  }

  /**
   * Store individual system metric
   * @param {Object} metric - Single metric object
   * @returns {Promise<Object>} - Result of the operation
   */
  async addSystemMetric(metric) {
    return this.addSystemMetricsBatch([metric]);
  }

  /**
   * Query system metrics with filters
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Array of metrics matching criteria
   */
  async querySystemMetrics(options = {}) {
    if (!this.db) {
      throw new Error('Firestore not initialized');
    }

    try {
      const {
        metricType = 'scenario_performance',
        startDate = null,
        endDate = null,
        limit = 100,
        scenarioId = null,
        categoryId = null,
      } = options;

      const collectionName = this.getCollectionNameForMetric(metricType);
      let q = collection(this.db, collectionName);

      // Apply filters
      const constraints = [];

      if (startDate) {
        constraints.push(where('timestamp', '>=', new Date(startDate)));
      }

      if (endDate) {
        constraints.push(where('timestamp', '<=', new Date(endDate)));
      }

      if (scenarioId) {
        constraints.push(where('scenarioId', '==', scenarioId));
      }

      if (categoryId) {
        constraints.push(where('categoryId', '==', categoryId));
      }

      // Add ordering and limit
      constraints.push(orderBy('timestamp', 'desc'));

      if (limit && limit > 0) {
        constraints.push(limit(limit));
      }

      q = query(q, ...constraints);
      const querySnapshot = await getDocs(q);

      const metrics = [];
      querySnapshot.forEach(doc => {
        metrics.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return metrics;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get aggregated analytics for dashboard
   * @param {Object} options - Aggregation options
   * @returns {Promise<Object>} - Aggregated analytics data
   */
  async getSystemAnalyticsSummary(options = {}) {
    try {
      const {
        timeframe = '7d', // '1d', '7d', '30d', '90d'
        metricTypes = [
          'scenario_performance',
          'framework_engagement',
          'session_tracking',
        ],
      } = options;

      const endDate = new Date();
      const startDate = new Date();

      // Calculate start date based on timeframe
      const DAYS_CONFIG = {
        '1d': 1,
        '7d': 7,
        '30d': 30,
        '90d': 90,
      };

      startDate.setDate(endDate.getDate() - DAYS_CONFIG[timeframe]);

      const summary = {
        timeframe,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        metrics: {},
      };

      // Get metrics for each type
      for (const metricType of metricTypes) {
        const metrics = await this.querySystemMetrics({
          metricType,
          startDate,
          endDate,
          limit: 1000, // Get more data for aggregation
        });

        summary.metrics[metricType] = this.aggregateMetrics(
          metrics,
          metricType
        );
      }

      return summary;
    } catch (error) {
      console.error('Failed to get system analytics summary:', error);
      throw error;
    }
  }

  /**
   * Export system analytics data for research
   * @param {Object} options - Export options
   * @returns {Promise<Object>} - Anonymized export data
   */
  async exportSystemAnalytics(options = {}) {
    try {
      const {
        startDate = null,
        endDate = null,
        anonymizationLevel = 'high', // 'low', 'medium', 'high'
        includeMetadata = false,
        format = 'json', // 'json', 'csv'
      } = options;

      const exportData = {
        exportInfo: {
          timestamp: new Date().toISOString(),
          anonymizationLevel,
          includeMetadata,
          format,
          version: '1.0',
        },
        data: {},
      };

      // Export all metric types
      const metricTypes = [
        'scenario_performance',
        'framework_engagement',
        'session_tracking',
        'platform_metrics',
      ];

      for (const metricType of metricTypes) {
        const metrics = await this.querySystemMetrics({
          metricType,
          startDate,
          endDate,
          limit: null, // No limit for export
        });

        // Apply anonymization
        const anonymizedMetrics = this.anonymizeMetricsForExport(
          metrics,
          anonymizationLevel
        );

        exportData.data[metricType] = anonymizedMetrics;
      }

      // Log export event
      if (this.analytics) {
        logEvent(this.analytics, 'system_analytics_export', {
          anonymization_level: anonymizationLevel,
          record_count: Object.values(exportData.data).reduce(
            (sum, arr) => sum + arr.length,
            0
          ),
          export_format: format,
        });
      }

      return exportData;
    } catch (error) {
      console.error('Failed to export system analytics:', error);
      throw error;
    }
  }

  /**
   * Real-time subscription to system metrics
   * @param {Object} options - Subscription options
   * @param {Function} callback - Callback for new data
   * @returns {Function} - Unsubscribe function
   */
  subscribeToSystemMetrics(options = {}, callback) {
    if (!this.db) {
      throw new Error('Firestore not initialized');
    }

    const { metricType = 'scenario_performance', limit = 50 } = options;

    const collectionName = this.getCollectionNameForMetric(metricType);
    const q = query(
      collection(this.db, collectionName),
      orderBy('timestamp', 'desc'),
      limit(limit)
    );

    return onSnapshot(q, querySnapshot => {
      const metrics = [];
      querySnapshot.forEach(doc => {
        metrics.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      callback(metrics);
    });
  }

  // ====================================
  // HELPER METHODS FOR SYSTEM ANALYTICS
  // ====================================

  /**
   * Sanitize metric data before storage
   * @param {Object} metric - Raw metric data
   * @returns {Object} - Sanitized metric data
   */
  sanitizeMetricData(metric) {
    const sanitized = { ...metric };

    // Remove any potentially sensitive data
    delete sanitized.userAgent;
    delete sanitized.ipAddress;
    delete sanitized.deviceId;

    // Ensure required fields
    if (!sanitized.timestamp) {
      sanitized.timestamp = new Date();
    }

    // Convert timestamp to Firestore timestamp
    if (sanitized.timestamp instanceof Date) {
      sanitized.timestamp = sanitized.timestamp;
    }

    // Limit string lengths to prevent storage abuse
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string' && sanitized[key].length > 1000) {
        sanitized[key] = `${sanitized[key].substring(0, 1000)}...`;
      }
    });

    return sanitized;
  }

  /**
   * Get appropriate Firestore collection name for metric type
   * @param {string} metricType - Type of metric
   * @returns {string} - Collection name
   */
  getCollectionNameForMetric(metricType) {
    const collections = {
      scenario_performance: 'analytics_scenario_performance',
      framework_engagement: 'analytics_framework_engagement',
      session_tracking: 'analytics_session_tracking',
      platform_metrics: 'analytics_platform_metrics',
      user_interactions: 'analytics_user_interactions',
    };

    return collections[metricType] || 'analytics_general';
  }

  /**
   * Get current environment information
   * @returns {Object} - Environment details
   */
  getEnvironmentInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      connectionType: navigator.connection?.effectiveType || 'unknown',
    };
  }

  /**
   * Aggregate metrics for summary reporting
   * @param {Array} metrics - Array of metrics
   * @param {string} metricType - Type of metrics being aggregated
   * @returns {Object} - Aggregated data
   */
  aggregateMetrics(metrics, metricType) {
    if (metrics.length === 0) {
      return { count: 0, summary: 'No data available' };
    }

    const aggregation = {
      count: metrics.length,
      firstDate: new Date(Math.min(...metrics.map(m => new Date(m.timestamp)))),
      lastDate: new Date(Math.max(...metrics.map(m => new Date(m.timestamp)))),
    };

    switch (metricType) {
      case 'scenario_performance': {
        const actions = metrics.reduce((acc, m) => {
          acc[m.action] = (acc[m.action] || 0) + 1;
          return acc;
        }, {});

        aggregation.completionRate =
          actions.complete && actions.view
            ? `${((actions.complete / actions.view) * 100).toFixed(2)}%`
            : '0%';
        aggregation.actionBreakdown = actions;
        break;
      }

      case 'framework_engagement': {
        const frameworks = metrics.reduce((acc, m) => {
          acc[m.frameworkId] = (acc[m.frameworkId] || 0) + 1;
          return acc;
        }, {});

        const TOP_FRAMEWORKS_COUNT = 5;
        aggregation.popularFrameworks = Object.entries(frameworks)
          .sort(([, a], [, b]) => b - a)
          .slice(0, TOP_FRAMEWORKS_COUNT);
        break;
      }

      case 'session_tracking': {
        const sessionDurations = metrics
          .filter(m => m.metadata?.sessionDurationSeconds)
          .map(m => m.metadata.sessionDurationSeconds);

        if (sessionDurations.length > 0) {
          aggregation.averageSessionDuration = Math.round(
            sessionDurations.reduce((a, b) => a + b, 0) /
              sessionDurations.length
          );
        }
        break;
      }
    }

    return aggregation;
  }

  /**
   * Anonymize metrics for export while preserving analytical value
   * @param {Array} metrics - Metrics to anonymize
   * @param {string} level - Anonymization level
   * @returns {Array} - Anonymized metrics
   */
  anonymizeMetricsForExport(metrics, level = 'high') {
    return metrics.map(metric => {
      const anonymized = { ...metric };

      // Remove identifying fields based on anonymization level
      if (level === 'high' || level === 'medium') {
        delete anonymized.sessionId;
        delete anonymized.userId;
        delete anonymized.id; // Document ID
      }
      if (level === 'high') {
        delete anonymized.environment;

        // Add noise to numerical values
        const NOISE_LEVEL = 0.1; // 10% noise
        if (anonymized.metadata?.completionTime) {
          anonymized.metadata.completionTime = this.addNoise(
            anonymized.metadata.completionTime,

            NOISE_LEVEL
          );
        }

        if (anonymized.metadata?.sessionDurationSeconds) {
          anonymized.metadata.sessionDurationSeconds = this.addNoise(
            anonymized.metadata.sessionDurationSeconds,
            NOISE_LEVEL
          );
        }
      }

      return anonymized;
    });
  }

  /**
   * Add statistical noise to numerical values for privacy
   * @param {number} value - Original value
   * @param {number} noiseLevel - Noise level (0.1 =  10%)
   * @returns {number} - Value with added noise
   */
  addNoise(value, noiseLevel = 0.1) {
    const RANDOM_OFFSET = 0.5;
    const NOISE_MULTIPLIER = 2;
    const noise =
      (Math.random() - RANDOM_OFFSET) * NOISE_MULTIPLIER * noiseLevel * value;
    return Math.max(0, Math.round(value + noise));
  }

  /**
   * Get analytics service instance
   * @returns {FirebaseAnalyticsService} Analytics service
   */
  getAnalyticsService() {
    return this.analyticsService;
  }

  /**
   * Track storage event for analytics
   * @param {string} eventType - Type of storage event
   * @param {Object} data - Event data
   * @returns {Promise<Object>} Event tracking result
   */
  async trackStorageEvent(eventType, data = {}) {
    if (!this.analyticsService) {
      throw new Error('Analytics service not initialized');
    }
    return await this.analyticsService.trackStorageEvent(eventType, data);
  }

  /**
   * Track AI analysis event
   * @param {string} analysisType - Type of AI analysis
   * @param {Object} data - Analysis data
   * @returns {Promise<Object>} Event tracking result
   */
  async trackAIAnalysis(analysisType, data = {}) {
    if (!this.analyticsService) {
      throw new Error('Analytics service not initialized');
    }
    return await this.analyticsService.trackAIAnalysis(analysisType, data);
  }

  /**
   * Track security event
   * @param {string} eventType - Type of security event
   * @param {Object} data - Security event data
   * @returns {Promise<Object>} Event tracking result
   */
  async trackSecurityEvent(eventType, data = {}) {
    if (!this.analyticsService) {
      throw new Error('Analytics service not initialized');
    }
    return await this.analyticsService.trackSecurityEvent(eventType, data);
  }

  /**
   * Track search event
   * @param {string} query - Search query
   * @param {Object} results - Search results
   * @returns {Promise<Object>} Event tracking result
   */
  async trackSearchEvent(query, results = {}) {
    if (!this.analyticsService) {
      throw new Error('Analytics service not initialized');
    }
    return await this.analyticsService.trackSearchEvent(query, results);
  }

  /**
   * Get real-time analytics dashboard data
   * @returns {Promise<Object>} Real-time analytics data
   */
  async getRealTimeAnalytics() {
    if (!this.analyticsService) {
      throw new Error('Analytics service not initialized');
    }
    return await this.analyticsService.getRealTimeAnalytics();
  }

  /**
   * Get historical analytics data
   * @param {string} timeRange - Time range (1h, 24h, 7d, 30d, 90d)
   * @returns {Promise<Object>} Historical analytics data
   */
  async getHistoricalAnalytics(timeRange = '7d') {
    if (!this.analyticsService) {
      throw new Error('Analytics service not initialized');
    }
    return await this.analyticsService.getHistoricalAnalytics(timeRange);
  }

  /**
   * Generate daily summary report
   * @param {Date} date - Date for summary (defaults to today)
   * @returns {Promise<Object>} Daily summary data
   */
  async generateDailySummary(date = null) {
    if (!this.analyticsService) {
      throw new Error('Analytics service not initialized');
    }
    return await this.analyticsService.generateDailySummary(date);
  }

  /**
   * Set up real-time analytics listeners
   * @param {Function} callback - Callback for real-time updates
   * @returns {Array} Array of listener unsubscribe functions
   */
  setupAnalyticsListeners(callback) {
    if (!this.analyticsService) {
      throw new Error('Analytics service not initialized');
    }
    return this.analyticsService.setupRealtimeListeners(callback);
  }

  /**
   * Start Firebase Performance trace
   * @param {string} traceName - Name of the trace
   * @returns {string} Trace ID
   */
  startPerformanceTrace(traceName) {
    if (!this.analyticsService) {
      throw new Error('Analytics service not initialized');
    }
    return this.analyticsService.startTrace(traceName);
  }

  /**
   * Stop Firebase Performance trace
   * @param {string} traceName - Name of the trace
   * @param {Object} customAttributes - Custom attributes to add
   * @returns {number} Duration in milliseconds
   */
  stopPerformanceTrace(traceName, customAttributes = {}) {
    if (!this.analyticsService) {
      throw new Error('Analytics service not initialized');
    }
    return this.analyticsService.stopTrace(traceName, customAttributes);
  }

  /**
   * Track user authentication flow
   * @param {string} method - Sign-in method (google, email, etc.)
   * @param {Object} data - Additional data
   * @returns {string} Trace ID
   */
  trackAuthSignIn(method, data = {}) {
    if (!this.performanceTracing) {
      throw new Error('Performance tracing not initialized');
    }
    return this.performanceTracing.trackAuthSignIn(method, data);
  }

  /**
   * Track simulation performance
   * @param {string} scenarioId - Simulation scenario ID
   * @param {Object} data - Additional data
   * @returns {string} Trace ID
   */
  trackSimulationFlow(scenarioId, data = {}) {
    if (!this.performanceTracing) {
      throw new Error('Performance tracing not initialized');
    }
    return this.performanceTracing.trackSimulationFlow(scenarioId, data);
  }

  /**
   * Track AI operation performance
   * @param {string} operation - AI operation type
   * @param {Object} data - Additional data
   * @returns {string} Trace ID
   */
  trackAIOperation(operation, data = {}) {
    if (!this.performanceTracing) {
      throw new Error('Performance tracing not initialized');
    }
    return this.performanceTracing.trackAIOperation(operation, data);
  }
}

export default FirebaseService;
