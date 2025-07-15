/**
 * Authentication Service for SimulateAI
 * Handles user authentication and profile management
 */

import FirebaseService from './firebase-service.js';
import { FirestoreService } from './firestore-service.js';
import { initializeUIDNormalizer } from '../utils/uid-normalizer.js';

export class AuthService {
  constructor() {
    this.firebaseService = new FirebaseService();
    this.currentUser = null;
    this.userProfile = null;
    this.initialized = false;
    this.rateLimitStatus = null;
    this.logoutManager = null;
    this.uidNormalizer = null;
    this.firestoreService = null;

    // Initialize components when available
    this.initializeRateLimitStatus();
    this.initializeNetworkStatusMonitor();
    this.initializeLogoutManager();
    this.initializeFirestoreService();
  }

  /**
   * Initialize network status monitor
   */
  initializeNetworkStatusMonitor() {
    // Check if NetworkStatusMonitor is available
    if (typeof window !== 'undefined' && window.NetworkStatusMonitor) {
      window.networkStatusMonitor = new window.NetworkStatusMonitor();
    } else {
      // Load the component if not available
      this.loadNetworkStatusMonitor();
    }
  }

  /**
   * Dynamically load the network status monitor
   */
  async loadNetworkStatusMonitor() {
    try {
      // Import the component script if not already loaded
      if (!document.querySelector('script[src*="network-status-monitor"]')) {
        const script = document.createElement('script');
        script.src = '/src/js/components/network-status-monitor.js';
        script.onload = () => {
          if (window.NetworkStatusMonitor) {
            window.networkStatusMonitor = new window.NetworkStatusMonitor();
          }
        };
        document.head.appendChild(script);
      }
    } catch (error) {
      // Network status monitor is optional, continue without it
    }
  }

  /**
   * Initialize rate limit status component
   */
  initializeRateLimitStatus() {
    // Check if RateLimitStatus is available
    if (typeof window !== 'undefined' && window.RateLimitStatus) {
      this.rateLimitStatus = new window.RateLimitStatus();
    } else {
      // Load the component if not available
      this.loadRateLimitStatusComponent();
    }
  }

  /**
   * Dynamically load the rate limit status component
   */
  async loadRateLimitStatusComponent() {
    try {
      // Import the component script if not already loaded
      if (!document.querySelector('script[src*="rate-limit-status"]')) {
        const script = document.createElement('script');
        script.src = '/src/js/components/rate-limit-status.js';
        script.onload = () => {
          if (window.RateLimitStatus) {
            this.rateLimitStatus = new window.RateLimitStatus();
          }
        };
        document.head.appendChild(script);
      }
    } catch (error) {
      // Rate limit status is optional, continue without it
    }
  }

  /**
   * Initialize the authentication service
   */
  async initialize() {
    try {
      const firebaseReady = await this.firebaseService.initialize();
      if (!firebaseReady) {
        throw new Error('Firebase initialization failed');
      }

      // Initialize UID normalizer
      this.uidNormalizer = initializeUIDNormalizer(this);

      // Set up auth state listener
      this.firebaseService.addAuthStateListener(user => {
        this.handleAuthStateChange(user);
      });

      this.initialized = true;
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Handle authentication state changes
   */
  async handleAuthStateChange(user) {
    const previousUser = this.currentUser;
    this.currentUser = user;

    if (user) {
      // Load user profile using centralized UID
      const currentUID = this.getCurrentUID();
      this.userProfile = await this.firebaseService.getUserProfile(currentUID);

      // Apply saved persistence preferences
      await this.applySavedPersistencePreferences();

      this.updateUIForAuthenticatedUser();

      // Initialize session tracking for logout manager
      if (this.logoutManager && !previousUser) {
        this.logoutManager.extendSession();
        try {
          localStorage.setItem('session_start_time', Date.now().toString());
        } catch (error) {
          // Ignore storage errors
        }
      }

      // Track user engagement with centralized UID
      this.firebaseService.trackEvent('user_session_start', {
        user_id: currentUID,
        tier: this.userProfile?.tier || 0,
      });
    } else {
      this.userProfile = null;
      this.updateUIForAnonymousUser();

      // Clear session data when user logs out
      if (previousUser) {
        try {
          localStorage.removeItem('session_start_time');
        } catch (error) {
          // Ignore storage errors
        }
      }
    }
  }

  /**
   * Show login modal using existing modal system
   */
  showLoginModal() {
    const loginHTML = `
      <div class="auth-modal">
        <div class="auth-header">
          <h2>Join the SimulateAI Community</h2>
          <p>Sign in to access research features, create blog posts, and participate in discussions.</p>
        </div>
        
        <div class="auth-benefits">
          <div class="benefit-item">
            <span class="benefit-icon">🔬</span>
            <div class="benefit-text">
              <h3>Contribute to Research</h3>
              <p>Help advance AI ethics education</p>
            </div>
          </div>
          
          <div class="benefit-item">
            <span class="benefit-icon">💬</span>
            <div class="benefit-text">
              <h3>Join Discussions</h3>
              <p>Engage with the community</p>
            </div>
          </div>
          
          <div class="benefit-item">
            <span class="benefit-icon">📝</span>
            <div class="benefit-text">
              <h3>Write Blog Posts</h3>
              <p>Share your insights and experiences</p>
            </div>
          </div>
        </div>
        
        <div class="auth-actions">
          <!-- Social Login Options -->
          <div class="social-auth-buttons">
            <button id="google-signin-btn" class="btn btn-primary social-btn google-btn">
              <svg class="social-icon" viewBox="0 0 24 24" width="18" height="18">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            
            <button id="facebook-signin-btn" class="btn btn-primary social-btn facebook-btn">
              <svg class="social-icon" viewBox="0 0 24 24" width="18" height="18" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Continue with Facebook
            </button>
            
            <button id="twitter-signin-btn" class="btn btn-primary social-btn twitter-btn">
              <svg class="social-icon" viewBox="0 0 24 24" width="18" height="18" fill="#1DA1F2">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              Continue with Twitter
            </button>
            
            <button id="github-signin-btn" class="btn btn-primary social-btn github-btn">
              <svg class="social-icon" viewBox="0 0 24 24" width="18" height="18" fill="#333">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Continue with GitHub
            </button>
          </div>
          
          <!-- Divider -->
          <div class="auth-divider">
            <span>or</span>
          </div>
          
          <!-- Email/Password Toggle -->
          <div class="email-auth-toggle">
            <button id="show-email-form-btn" class="btn btn-outline">📧 Use Email Instead</button>
          </div>
          
          <!-- Email/Password Form (initially hidden) -->
          <div id="email-auth-form" class="email-auth-form" style="display: none;">
            <div class="auth-tabs">
              <button id="signin-tab" class="auth-tab active">Sign In</button>
              <button id="signup-tab" class="auth-tab">Create Account</button>
            </div>
            
            <form id="email-signin-form" class="email-form">
              <div class="form-group">
                <input type="email" id="signin-email" placeholder="Email address" required>
              </div>
              <div class="form-group">
                <input type="password" id="signin-password" placeholder="Password" required>
              </div>
              <button type="submit" class="btn btn-primary">Sign In</button>
              <button type="button" id="forgot-password-btn" class="btn btn-link">Forgot Password?</button>
            </form>
            
            <form id="email-signup-form" class="email-form" style="display: none;">
              <div class="form-group">
                <input type="text" id="signup-name" placeholder="Full name" required>
              </div>
              <div class="form-group">
                <input type="email" id="signup-email" placeholder="Email address" required>
              </div>
              <div class="form-group">
                <input type="password" id="signup-password" placeholder="Password (min 6 characters)" required minlength="6">
              </div>
              <div class="form-group">
                <input type="password" id="signup-confirm" placeholder="Confirm password" required>
              </div>
              <button type="submit" class="btn btn-primary">Create Account</button>
            </form>
          </div>
        </div>
        
        <div class="auth-privacy">
          <p class="privacy-note">
            By signing in, you agree to our research terms and privacy policy. 
            Your data is used solely for educational research and platform improvement.
          </p>
        </div>
      </div>
    `;

    // Use existing modal system
    const modal = new window.ModalDialog({
      title: 'Welcome to SimulateAI',
      content: loginHTML,
      size: 'medium',
      closeOnBackdrop: true,
      closeOnEscape: true,
    });

    modal.open();

    // Set up authentication event handlers
    this.setupAuthEventHandlers(modal);
  }

  /**
   * Set up all authentication event handlers
   */
  setupAuthEventHandlers(modal) {
    // Social login handlers
    document
      .getElementById('google-signin-btn')
      ?.addEventListener('click', async () => {
        await this.signInWithProvider('google', modal);
      });

    document
      .getElementById('facebook-signin-btn')
      ?.addEventListener('click', async () => {
        await this.signInWithProvider('facebook', modal);
      });

    document
      .getElementById('twitter-signin-btn')
      ?.addEventListener('click', async () => {
        await this.signInWithProvider('twitter', modal);
      });

    document
      .getElementById('github-signin-btn')
      ?.addEventListener('click', async () => {
        await this.signInWithProvider('github', modal);
      });

    // Email form toggle
    document
      .getElementById('show-email-form-btn')
      ?.addEventListener('click', () => {
        document.getElementById('email-auth-form').style.display = 'block';
        document.getElementById('show-email-form-btn').style.display = 'none';
      });

    // Tab switching
    document.getElementById('signin-tab')?.addEventListener('click', () => {
      this.switchAuthTab('signin');
    });

    document.getElementById('signup-tab')?.addEventListener('click', () => {
      this.switchAuthTab('signup');
    });

    // Email form handlers
    document
      .getElementById('email-signin-form')
      ?.addEventListener('submit', async e => {
        e.preventDefault();
        await this.handleEmailSignIn(modal);
      });

    document
      .getElementById('email-signup-form')
      ?.addEventListener('submit', async e => {
        e.preventDefault();
        await this.handleEmailSignUp(modal);
      });

    // Forgot password handler
    document
      .getElementById('forgot-password-btn')
      ?.addEventListener('click', async () => {
        await this.handleForgotPassword();
      });
  }

  /**
   * Switch between sign in and sign up tabs
   */
  switchAuthTab(tab) {
    const signinTab = document.getElementById('signin-tab');
    const signupTab = document.getElementById('signup-tab');
    const signinForm = document.getElementById('email-signin-form');
    const signupForm = document.getElementById('email-signup-form');

    if (tab === 'signin') {
      signinTab.classList.add('active');
      signupTab.classList.remove('active');
      signinForm.style.display = 'block';
      signupForm.style.display = 'none';
    } else {
      signinTab.classList.remove('active');
      signupTab.classList.add('active');
      signinForm.style.display = 'none';
      signupForm.style.display = 'block';
    }
  }

  /**
   * Handle sign in with various providers
   */
  async signInWithProvider(provider, modal = null) {
    let result;
    try {
      // Show loading state
      const btnId = `${provider}-signin-btn`;
      const signinBtn = document.getElementById(btnId);
      if (signinBtn) {
        signinBtn.disabled = true;
        signinBtn.innerHTML = 'Signing in...';
      }

      switch (provider) {
        case 'google':
          result = await this.handleAuthWithRateLimit(() =>
            this.firebaseService.signInWithGoogle()
          );
          break;
        case 'facebook':
          result = await this.handleAuthWithRateLimit(() =>
            this.firebaseService.signInWithFacebook()
          );
          break;
        case 'twitter':
          result = await this.handleAuthWithRateLimit(() =>
            this.firebaseService.signInWithTwitter()
          );
          break;
        case 'github':
          result = await this.handleAuthWithRateLimit(() =>
            this.firebaseService.signInWithGitHub()
          );
          break;
        default:
          throw new Error('Unsupported provider');
      }

      // Handle rate limiting early return
      if (result.rateLimited) {
        return;
      }

      // Handle network errors
      if (result.networkError) {
        // Network error was already handled by NetworkStatusMonitor
        return;
      }

      if (result.success) {
        if (result.pending && result.method === 'redirect') {
          // For mobile redirect - show loading message and keep modal open
          this.showInfoMessage('Redirecting to sign in... Please wait.');

          // Don't close modal or show success yet - will be handled after redirect
          return;
        } else {
          // For desktop popup - normal flow
          if (modal) modal.close();
          this.showSuccessMessage(
            'Welcome! You have been signed in successfully.'
          );

          // Check if user should be prompted for profile update
          const PROFILE_PROMPT_DELAY = 2000; // 2 seconds
          setTimeout(() => {
            this.promptProfileUpdateAfterSignIn();
          }, PROFILE_PROMPT_DELAY);
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      this.showErrorMessage(`Sign-in failed: ${error.message}`);
    } finally {
      // Reset button state (but only if not redirecting)
      const btnId = `${provider}-signin-btn`;
      const signinBtn = document.getElementById(btnId);
      if (signinBtn && !result?.pending && !result?.rateLimited) {
        signinBtn.disabled = false;
        signinBtn.innerHTML = this.getProviderButtonText(provider);
      }
    }
  }

  /**
   * Get button text for provider
   */
  getProviderButtonText(provider) {
    const texts = {
      google:
        '<svg class="social-icon" viewBox="0 0 24 24" width="18" height="18">...</svg> Continue with Google',
      facebook:
        '<svg class="social-icon" viewBox="0 0 24 24" width="18" height="18" fill="#1877F2">...</svg> Continue with Facebook',
      twitter:
        '<svg class="social-icon" viewBox="0 0 24 24" width="18" height="18" fill="#1DA1F2">...</svg> Continue with Twitter',
      github:
        '<svg class="social-icon" viewBox="0 0 24 24" width="18" height="18" fill="#333">...</svg> Continue with GitHub',
    };
    return texts[provider] || `Continue with ${provider}`;
  }

  /**
   * Handle email sign in
   */
  async handleEmailSignIn(modal) {
    try {
      const email = document.getElementById('signin-email').value;
      const password = document.getElementById('signin-password').value;

      if (!email || !password) {
        this.showErrorMessage('Please enter both email and password.');
        return;
      }

      const result = await this.firebaseService.signInWithEmail(
        email,
        password
      );

      if (result.success) {
        if (modal) modal.close();
        this.showSuccessMessage(
          'Welcome back! You have been signed in successfully.'
        );

        const PROFILE_PROMPT_DELAY = 2000; // 2 seconds
        setTimeout(() => {
          this.promptProfileUpdateAfterSignIn();
        }, PROFILE_PROMPT_DELAY);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      this.showErrorMessage(`Sign-in failed: ${error.message}`);
    }
  }

  /**
   * Handle email sign up
   */
  async handleEmailSignUp(modal) {
    try {
      const name = document.getElementById('signup-name').value;
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
      const confirmPassword = document.getElementById('signup-confirm').value;

      if (!name || !email || !password || !confirmPassword) {
        this.showErrorMessage('Please fill in all fields.');
        return;
      }

      if (password !== confirmPassword) {
        this.showErrorMessage('Passwords do not match.');
        return;
      }

      const MIN_PASSWORD_LENGTH = 6;
      if (password.length < MIN_PASSWORD_LENGTH) {
        this.showErrorMessage('Password must be at least 6 characters long.');
        return;
      }

      const result = await this.firebaseService.createAccountWithEmail(
        email,
        password,
        name
      );

      if (result.success) {
        // Create Firestore user document
        if (this.firestoreService) {
          await this.ensureUserDocument({
            displayName: name,
            email,
            role: 'learner',
            profile: {
              avatar: '',
              bio: '',
              customization: {},
            },
          });
        }

        if (modal) modal.close();
        this.showSuccessMessage(
          'Account created successfully! Welcome to SimulateAI.'
        );

        const PROFILE_PROMPT_DELAY = 2000; // 2 seconds
        setTimeout(() => {
          this.promptProfileUpdateAfterSignIn();
        }, PROFILE_PROMPT_DELAY);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      this.showErrorMessage(`Account creation failed: ${error.message}`);
    }
  }

  /**
   * Handle forgot password
   */
  async handleForgotPassword() {
    const email = document.getElementById('signin-email').value;

    if (!email) {
      this.showErrorMessage('Please enter your email address first.');
      return;
    }

    try {
      const result = await this.firebaseService.resetPassword(email);

      if (result.success) {
        this.showSuccessMessage('Password reset email sent! Check your inbox.');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      this.showErrorMessage(`Password reset failed: ${error.message}`);
    }
  }

  /**
   * Sign out current user
   */
  async signOut(reason = 'user_initiated', logoutData = {}) {
    try {
      // If logout manager is available and this is an intentional logout with reason
      if (this.logoutManager && reason !== 'user_initiated') {
        this.logoutManager.handleIntentionalLogout(reason, logoutData);
        return true;
      }

      const result = await this.firebaseService.signOutUser();
      if (result.success) {
        // For user-initiated logout, show standard success message
        if (reason === 'user_initiated') {
          this.showSuccessMessage('Successfully signed out');
        }
        return true;
      }
      return false;
    } catch (error) {
      this.showErrorMessage('Sign-out failed');
      return false;
    }
  }

  /**
   * Trigger intentional logout with specific reason
   */
  async triggerIntentionalLogout(reason, data = {}) {
    const logoutReasons = {
      inactivity: {
        title: 'Signed Out Due to Inactivity',
        message: 'You have been automatically signed out for security.',
        reason: 'No activity detected for the configured time period.',
        showReauthenticate: true,
        ...data,
      },
      role_change: {
        title: 'Account Role Updated',
        message: 'Your account role has been changed.',
        reason: 'Please sign in again to access your new permissions.',
        showReauthenticate: true,
        ...data,
      },
      security_logout: {
        title: 'Security Logout',
        message: 'You were signed out for security reasons.',
        reason: 'Unusual activity or security event detected.',
        showReauthenticate: true,
        ...data,
      },
      admin_logout: {
        title: 'Administrative Logout',
        message: 'You were signed out by an administrator.',
        reason: 'Contact your administrator if you have questions.',
        showReauthenticate: false,
        ...data,
      },
      maintenance: {
        title: 'System Maintenance',
        message: 'System maintenance in progress.',
        reason: 'Please try signing in again after maintenance is complete.',
        showReauthenticate: false,
        ...data,
      },
      token_expired: {
        title: 'Session Expired',
        message: 'Your authentication session has expired.',
        reason: 'For security, sessions expire periodically.',
        showReauthenticate: true,
        ...data,
      },
      too_many_devices: {
        title: 'Too Many Active Sessions',
        message: 'You have been signed out due to too many active sessions.',
        reason: 'You can only be signed in on a limited number of devices.',
        showReauthenticate: true,
        ...data,
      },
    };

    const logoutInfo = logoutReasons[reason] || {
      title: 'Signed Out',
      message: 'You have been signed out.',
      reason: data.reason || 'Unknown reason.',
      showReauthenticate: true,
      ...data,
    };

    return await this.signOut(reason, logoutInfo);
  }

  /**
   * Convenience methods for triggering specific logout scenarios
   */

  /**
   * Logout user due to inactivity
   */
  async logoutForInactivity(inactiveMinutes = 30) {
    return await this.triggerIntentionalLogout('inactivity', {
      reason: `No activity detected for ${inactiveMinutes} minutes.`,
      inactiveMinutes,
    });
  }

  /**
   * Logout user due to role change
   */
  async logoutForRoleChange(newRole, oldRole = null) {
    return await this.triggerIntentionalLogout('role_change', {
      reason: `Your role has been updated from ${oldRole || 'previous role'} to ${newRole}.`,
      newRole,
      oldRole,
    });
  }

  /**
   * Logout user for security reasons
   */
  async logoutForSecurity(securityReason = 'Unusual activity detected') {
    return await this.triggerIntentionalLogout('security_logout', {
      reason: securityReason,
      securityEvent: securityReason,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Administrative logout
   */
  async logoutByAdmin(adminName = null, adminReason = null) {
    return await this.triggerIntentionalLogout('admin_logout', {
      reason: adminReason || 'Logged out by administrator.',
      adminName,
      adminReason,
    });
  }

  /**
   * Logout for system maintenance
   */
  async logoutForMaintenance(maintenanceWindow = null) {
    return await this.triggerIntentionalLogout('maintenance', {
      reason: maintenanceWindow
        ? `Scheduled maintenance: ${maintenanceWindow}`
        : 'System maintenance in progress.',
      maintenanceWindow,
    });
  }

  /**
   * Logout due to token expiration
   */
  async logoutForTokenExpiration() {
    return await this.triggerIntentionalLogout('token_expired', {
      reason: 'Your authentication token has expired for security.',
      expiredAt: new Date().toISOString(),
    });
  }

  /**
   * Logout due to too many active sessions
   */
  async logoutForTooManyDevices(maxDevices = 3, currentDevices = null) {
    return await this.triggerIntentionalLogout('too_many_devices', {
      reason: `Maximum of ${maxDevices} active sessions allowed.`,
      maxDevices,
      currentDevices,
    });
  }

  /**
   * Check if user should be logged out (can be called periodically)
   */
  async checkLogoutConditions() {
    const uid = this.getCurrentUID();
    if (!uid) return;

    // Check if logout manager has detected any logout conditions
    if (this.logoutManager) {
      // The logout manager handles its own checks internally
      // This method can be extended for additional custom checks

      // Example: Check for role changes using centralized UID
      const currentProfile = await this.firebaseService.getUserProfile(uid);
      if (
        currentProfile &&
        this.userProfile &&
        currentProfile.role !== this.userProfile.role
      ) {
        await this.logoutForRoleChange(
          currentProfile.role,
          this.userProfile.role
        );
        return;
      }

      // Example: Check for security flags
      if (currentProfile?.securityFlags?.forceLogout) {
        await this.logoutForSecurity('Account security flag activated');
        return;
      }
    }
  }

  /**
   * Show welcome message for new users
   */
  showWelcomeMessage(user) {
    const welcomeMessage = `Welcome ${user.displayName}! 🎉`;
    this.showSuccessMessage(welcomeMessage);
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Get user profile
   */
  getUserProfile() {
    return this.userProfile;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return this.currentUser !== null;
  }

  /**
   * Check if user can access research features
   */
  canAccessResearch() {
    return this.userProfile?.researchParticipant === true;
  }

  /**
   * Check if user can create blog posts
   */
  canCreateBlogPosts() {
    return this.userProfile?.tier >= 1;
  }

  /**
   * Enable authenticated features
   */
  enableAuthenticatedFeatures() {
    // Enable features that require authentication
    document.querySelectorAll('.auth-required').forEach(element => {
      element.style.display = 'block';
    });

    // Hide login prompts
    document.querySelectorAll('.login-required').forEach(element => {
      element.style.display = 'none';
    });
  }

  /**
   * Hide authenticated features
   */
  hideAuthenticatedFeatures() {
    // Hide features that require authentication
    document.querySelectorAll('.auth-required').forEach(element => {
      element.style.display = 'none';
    });

    // Show login prompts
    document.querySelectorAll('.login-required').forEach(element => {
      element.style.display = 'block';
    });
  }

  /**
   * Set current user (called by app auth state listener)
   */
  setCurrentUser(user) {
    this.currentUser = user;
  }

  /**
   * Clear current user (called by app auth state listener)
   */
  clearCurrentUser() {
    this.currentUser = null;
    this.userProfile = null;
  }

  /**
   * Update authentication UI elements based on current state
   */
  updateAuthenticationUI(isAuthenticated, user) {
    // Update navigation sign in/out buttons
    const signInBtn = document.getElementById('sign-in-nav');
    const signOutBtn = document.getElementById('sign-out-nav');
    const linkAccountsBtn = document.getElementById('link-accounts-nav');
    const userNameElement = document.getElementById('nav-user-name');

    if (signInBtn) {
      signInBtn.addEventListener('click', () => this.showLoginModal());
    }

    if (signOutBtn) {
      signOutBtn.addEventListener('click', () => this.signOut());
    }

    if (linkAccountsBtn) {
      linkAccountsBtn.addEventListener('click', () =>
        this.showAccountLinkingModal()
      );
    }

    // Update user greeting
    if (userNameElement && user) {
      const displayName =
        user.displayName || user.email?.split('@')[0] || 'User';
      userNameElement.textContent = `Welcome, ${displayName}!`;

      // Show linked provider count as a subtle indicator
      const linkedProviders = this.firebaseService.getUserLinkedProviders();
      if (linkedProviders.length > 1) {
        userNameElement.title = `Linked accounts: ${linkedProviders.map(p => p.providerId.replace('.com', '')).join(', ')}`;
      }
    }
  }

  /**
   * Update UI elements when user is authenticated
   */
  updateUIForAuthenticatedUser() {
    // Enable authenticated features
    this.enableAuthenticatedFeatures();

    // Update authentication UI
    if (this.currentUser) {
      this.updateAuthenticationUI(true, this.currentUser);
    }
  }

  /**
   * Update UI elements when user is not authenticated
   */
  updateUIForAnonymousUser() {
    // Hide authenticated features
    this.hideAuthenticatedFeatures();

    // Update authentication UI
    this.updateAuthenticationUI(false, null);
  }

  /**
   * Show account linking options for current user
   */
  async showAccountLinkingModal() {
    if (!this.firebaseService.isAuthenticated()) {
      this.showErrorMessage('Please sign in first to link additional accounts');
      return;
    }

    const linkedProviders = this.firebaseService.getUserLinkedProviders();
    const availableProviders = [
      { id: 'google', name: 'Google', icon: '🔍' },
      { id: 'facebook', name: 'Facebook', icon: '📘' },
      { id: 'twitter', name: 'Twitter', icon: '🐦' },
      { id: 'github', name: 'GitHub', icon: '🐙' },
    ];

    // Filter out already linked providers
    const linkedProviderIds = linkedProviders.map(p =>
      p.providerId.replace('.com', '')
    );
    const unlinkableProviders = availableProviders.filter(
      p => !linkedProviderIds.includes(p.id)
    );

    if (unlinkableProviders.length === 0) {
      this.showInfoMessage('All available accounts are already linked!');
      return;
    }

    // Show simple confirmation for now - can be enhanced with full modal later
    const providerList = unlinkableProviders.map(p => p.name).join(', ');
    const shouldProceed = confirm(
      `Link additional accounts? Available: ${providerList}`
    );

    if (shouldProceed && unlinkableProviders.length > 0) {
      // Link the first available provider as an example
      await this.linkProvider(unlinkableProviders[0].id);
    }
  }

  /**
   * Link a new provider to current user
   */
  async linkProvider(providerName) {
    try {
      this.showInfoMessage(`Linking ${providerName} account...`);

      const result =
        await this.firebaseService.linkProviderToCurrentUser(providerName);

      if (result.success) {
        if (result.pending) {
          this.showInfoMessage(result.message);
        } else {
          this.showInfoMessage(
            result.message || `Successfully linked ${providerName}!`
          );
        }
      } else {
        this.showErrorMessage(result.error);
      }
    } catch (error) {
      this.showErrorMessage(`Failed to link ${providerName}: ${error.message}`);
    }
  }

  /**
   * Apply saved persistence preferences when user signs in
   */
  async applySavedPersistencePreferences() {
    try {
      const savedPrefs = localStorage.getItem('simulateai_auth_persistence');
      if (!savedPrefs) return;

      const prefs = JSON.parse(savedPrefs);

      // Apply the saved persistence mode
      const options = {};
      if (prefs.autoSignOutMinutes) {
        options.autoSignOutMinutes = prefs.autoSignOutMinutes;
      }

      await this.firebaseService.setAuthPersistence(prefs.mode, options);
    } catch (error) {
      // Persistence preferences could not be applied
    }
  }

  /**
   * Show persistence settings modal for users to control session behavior
   */
  showPersistenceSettings() {
    const currentMode = this.firebaseService.persistenceMode || 'local';
    const recommendation = this.firebaseService.getRecommendedPersistence();

    const modalContent = `
      <div class="persistence-settings">
        <h3>🔐 Session Security Settings</h3>
        <p>Control how long you stay signed in on this device.</p>
        
        <div class="current-setting">
          <strong>Current Setting:</strong> ${this.getPersistenceDisplayName(currentMode)}
        </div>
        
        <div class="persistence-options">
          <label class="persistence-option">
            <input type="radio" name="persistence" value="local" ${currentMode === 'local' ? 'checked' : ''}>
            <div class="option-content">
              <strong>🏠 Stay Signed In</strong>
              <p>Remain signed in until you sign out manually (recommended for personal devices)</p>
            </div>
          </label>
          
          <label class="persistence-option">
            <input type="radio" name="persistence" value="session" ${currentMode === 'session' ? 'checked' : ''}>
            <div class="option-content">
              <strong>🕐 Session Only</strong>
              <p>Sign out when browser closes (recommended for shared computers)</p>
            </div>
          </label>
          
          <label class="persistence-option">
            <input type="radio" name="persistence" value="memory" ${currentMode === 'memory' ? 'checked' : ''}>
            <div class="option-content">
              <strong>🔒 Extra Secure</strong>
              <p>Sign out when tab closes (most secure, least convenient)</p>
            </div>
          </label>
        </div>
        
        <div class="auto-signout-setting">
          <label>
            <input type="checkbox" id="enable-auto-signout">
            Auto sign-out after 
            <select id="auto-signout-minutes">
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
            </select>
            of inactivity
          </label>
        </div>
        
        <div class="recommendation">
          <strong>💡 Recommendation:</strong> ${recommendation.reason}
        </div>
        
        <div class="modal-actions">
          <button class="btn btn-primary" onclick="authService.applyPersistenceSettings()">Apply Settings</button>
          <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
        </div>
      </div>
    `;

    this.showCustomModal('Session Settings', modalContent);

    // Make auth service globally accessible for the button
    window.authService = this;
  }

  /**
   * Apply persistence settings from the modal
   */
  async applyPersistenceSettings() {
    try {
      const selectedMode = document.querySelector(
        'input[name="persistence"]:checked'
      )?.value;
      const enableAutoSignout = document.getElementById(
        'enable-auto-signout'
      )?.checked;
      const autoSignoutMinutes = parseInt(
        document.getElementById('auto-signout-minutes')?.value
      );

      if (!selectedMode) {
        this.showErrorMessage('Please select a persistence mode');
        return;
      }

      const options = {};
      if (enableAutoSignout && autoSignoutMinutes) {
        options.autoSignOutMinutes = autoSignoutMinutes;
      }

      // Apply persistence setting
      const result = await this.firebaseService.setAuthPersistence(
        selectedMode,
        options
      );

      if (result.success) {
        // Save user preference
        localStorage.setItem(
          'simulateai_auth_persistence',
          JSON.stringify({
            mode: selectedMode,
            autoSignOutMinutes: options.autoSignOutMinutes || null,
            setAt: new Date().toISOString(),
          })
        );

        this.showInfoMessage(
          `Session settings updated: ${this.getPersistenceDisplayName(selectedMode)}`
        );

        // Close modal
        document.querySelector('.modal')?.remove();
      } else {
        this.showErrorMessage(result.error);
      }
    } catch (error) {
      this.showErrorMessage(`Failed to update settings: ${error.message}`);
    }
  }

  /**
   * Get user-friendly display name for persistence mode
   */
  getPersistenceDisplayName(mode) {
    const names = {
      local: 'Stay Signed In',
      session: 'Session Only',
      memory: 'Extra Secure',
    };
    return names[mode] || mode;
  }

  /**
   * Show security tips modal
   */
  showSecurityTips() {
    const modalContent = `
      <div class="security-tips">
        <h3>🛡️ Security Tips</h3>
        
        <div class="tip">
          <h4>🏠 Personal Device</h4>
          <p>Use "Stay Signed In" for convenience. Your progress and data will be saved.</p>
        </div>
        
        <div class="tip">
          <h4>🏫 Shared Computer</h4>
          <p>Use "Session Only" to protect your account. Sign out when finished.</p>
        </div>
        
        <div class="tip">
          <h4>🔐 Public Computer</h4>
          <p>Use "Extra Secure" mode and avoid saving sensitive data.</p>
        </div>
        
        <div class="tip">
          <h4>⏰ Auto Sign-out</h4>
          <p>Enable for shared computers to automatically sign out after inactivity.</p>
        </div>
        
        <div class="modal-actions">
          <button class="btn btn-primary" onclick="this.closest('.modal').remove()">Got it!</button>
        </div>
      </div>
    `;

    this.showCustomModal('Security Tips', modalContent);
  }

  /**
   * Show profile customization modal with badge flair options
   */
  async showProfileCustomization() {
    if (!this.currentUser) {
      this.showErrorMessage('Please sign in to customize your profile');
      return;
    }

    try {
      // Get user profile and badges
      const profile = await this.firebaseService.getUserProfile();
      const badgeData = await this.firebaseService.getUserBadges();

      if (!profile) {
        this.showErrorMessage('Could not load profile data');
        return;
      }

      const suggestions =
        this.firebaseService.generateBadgeFlairSuggestions(profile);
      const currentDisplayName =
        profile.customization?.displayName || profile.displayName || '';
      const currentPhotoURL =
        profile.customization?.photoURL || profile.photoURL || '';

      const modalContent = `
        <div class="profile-customization">
          <h3>🎨 Customize Your Profile</h3>
          
          <div class="profile-preview">
            <div class="preview-avatar">
              <img src="${currentPhotoURL || 'https://via.placeholder.com/80x80?text=👤'}" 
                   alt="Profile" class="avatar-preview" id="avatar-preview">
            </div>
            <div class="preview-name" id="name-preview">
              ${this.firebaseService.getDisplayNameWithFlair(profile)}
            </div>
          </div>
          
          <div class="customization-sections">
            <div class="section">
              <h4>✏️ Display Name</h4>
              <input type="text" id="custom-display-name" 
                     value="${currentDisplayName}" 
                     placeholder="Enter your display name"
                     maxlength="50">
              <small>This is how others will see you in simulations and discussions.</small>
            </div>
            
            <div class="section">
              <h4>📸 Profile Photo</h4>
              <input type="url" id="custom-photo-url" 
                     value="${currentPhotoURL}" 
                     placeholder="Enter photo URL (optional)">
              <small>Provide a URL to a profile image, or leave blank for default.</small>
            </div>
            
            ${
              badgeData.badges.length > 0
                ? `
            <div class="section">
              <h4>🏆 Badge Flair</h4>
              <p>Choose a badge to display with your name:</p>
              
              <div class="badge-options">
                <label class="badge-option">
                  <input type="radio" name="badge-flair" value="" 
                         ${!profile.customization?.selectedBadgeFlair ? 'checked' : ''}>
                  <div class="option-content">
                    <span class="badge-preview">🚫</span>
                    <strong>No Badge Flair</strong>
                    <p>Display name only</p>
                  </div>
                </label>
                
                ${badgeData.badges
                  .map(
                    badge => `
                  <label class="badge-option">
                    <input type="radio" name="badge-flair" value="${badge.id}"
                           ${badge.isSelectedFlair ? 'checked' : ''}>
                    <div class="option-content">
                      <span class="badge-preview" style="color: ${badge.color}">${badge.icon}</span>
                      <strong>${badge.title}</strong>
                      <p>${badge.description}</p>
                      <small>Preview: ${badge.icon} Your Name [${badge.title}]</small>
                    </div>
                  </label>
                `
                  )
                  .join('')}
              </div>
            </div>
            `
                : ''
            }
            
            ${
              suggestions.length > 0
                ? `
            <div class="section">
              <h4>💡 Suggested Flairs</h4>
              <p>Based on your achievements:</p>
              <div class="flair-suggestions">
                ${suggestions
                  .map(
                    suggestion => `
                  <button class="suggestion-btn" data-badge-id="${suggestion.id}">
                    ${suggestion.previewName}
                  </button>
                `
                  )
                  .join('')}
              </div>
            </div>
            `
                : ''
            }
          </div>
          
          <div class="modal-actions">
            <button class="btn btn-primary" onclick="authService.applyProfileCustomization()">
              💾 Save Changes
            </button>
            <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">
              Cancel
            </button>
          </div>
        </div>
      `;

      this.showCustomModal('Profile Customization', modalContent);

      // Set up live preview
      this.setupProfilePreview(profile);

      // Set up suggestion buttons
      document.querySelectorAll('.suggestion-btn').forEach(btn => {
        btn.addEventListener('click', e => {
          const { badgeId } = e.target.dataset;
          const radioBtn = document.querySelector(
            `input[name="badge-flair"][value="${badgeId}"]`
          );
          if (radioBtn) {
            radioBtn.checked = true;
            this.updateProfilePreview();
          }
        });
      });
    } catch (error) {
      this.showErrorMessage(
        `Failed to load profile customization: ${error.message}`
      );
    }
  }

  /**
   * Setup live preview for profile customization
   */
  setupProfilePreview(_profile) {
    const nameInput = document.getElementById('custom-display-name');
    const photoInput = document.getElementById('custom-photo-url');
    const badgeInputs = document.querySelectorAll('input[name="badge-flair"]');

    // Update preview on input changes
    if (nameInput) {
      nameInput.addEventListener('input', () => this.updateProfilePreview());
    }

    if (photoInput) {
      photoInput.addEventListener('input', () => this.updateProfilePreview());
    }

    badgeInputs.forEach(input => {
      input.addEventListener('change', () => this.updateProfilePreview());
    });
  }

  /**
   * Update profile preview in real-time
   */
  async updateProfilePreview() {
    const namePreview = document.getElementById('name-preview');
    const avatarPreview = document.getElementById('avatar-preview');

    if (!namePreview || !avatarPreview) return;

    const customName =
      document.getElementById('custom-display-name')?.value || 'Your Name';
    const customPhoto = document.getElementById('custom-photo-url')?.value;
    const selectedBadge = document.querySelector(
      'input[name="badge-flair"]:checked'
    )?.value;

    // Update avatar
    if (customPhoto) {
      avatarPreview.src = customPhoto;
      avatarPreview.onerror = () => {
        avatarPreview.src = 'https://via.placeholder.com/80x80?text=👤';
      };
    }

    // Update name with badge flair
    let displayName = customName;

    if (selectedBadge) {
      const badgeElement = document
        .querySelector(`input[value="${selectedBadge}"]`)
        ?.closest('.badge-option');
      if (badgeElement) {
        const badgeIcon =
          badgeElement.querySelector('.badge-preview')?.textContent;
        const badgeTitle = badgeElement.querySelector('strong')?.textContent;
        if (badgeIcon && badgeTitle) {
          displayName = `${badgeIcon} ${customName} [${badgeTitle}]`;
        }
      }
    }

    namePreview.textContent = displayName;
  }

  /**
   * Apply profile customization changes
   */
  async applyProfileCustomization() {
    try {
      const customName = document.getElementById('custom-display-name')?.value;
      const customPhoto = document.getElementById('custom-photo-url')?.value;
      const selectedBadge = document.querySelector(
        'input[name="badge-flair"]:checked'
      )?.value;

      if (!customName?.trim()) {
        this.showErrorMessage('Display name cannot be empty');
        return;
      }

      const profileData = {
        displayName: customName.trim(),
        selectedBadgeFlair: selectedBadge || null,
      };

      if (customPhoto?.trim()) {
        profileData.photoURL = customPhoto.trim();
      }

      // Use secure profile update instead of direct Firestore
      const result = await this.updateSecureProfile(profileData);

      if (result.success) {
        // Close modal
        document.querySelector('.modal')?.remove();

        // Track customization with security flag
        this.firebaseService.trackEvent('profile_customized_secure', {
          has_custom_name: !!customName,
          has_custom_photo: !!customPhoto,
          has_badge_flair: !!selectedBadge,
          flair_badge_id: selectedBadge || null,
          security_method: 'firebase_function',
        });
      } else {
        // Error already shown in updateSecureProfile
      }
    } catch (error) {
      this.showErrorMessage(`Profile update failed: ${error.message}`);
    }
  }

  /**
   * Show simple profile update modal for display name and avatar
   * Perfect for post-sign-in personalization and narrative games
   */
  showProfileUpdateModal() {
    if (!this.currentUser) {
      this.showErrorMessage('Please sign in to update your profile');
      return;
    }

    const currentDisplayName = this.currentUser.displayName || '';
    const currentPhotoURL = this.currentUser.photoURL || '';
    const userEmail = this.currentUser.email || '';

    const modalContent = `
      <div class="profile-update-modal">
        <div class="profile-header">
          <h3>✨ Personalize Your Profile</h3>
          <p>Make yourself memorable in our interactive narratives!</p>
        </div>
        
        <div class="current-profile">
          <div class="profile-avatar">
            <img src="${currentPhotoURL || 'https://via.placeholder.com/60x60?text=👤'}" 
                 alt="Current avatar" class="current-avatar" id="current-avatar-preview">
          </div>
          <div class="profile-info">
            <div class="current-name" id="current-name-preview">
              ${currentDisplayName || userEmail.split('@')[0] || 'Your Name'}
            </div>
            <div class="user-email">${userEmail}</div>
          </div>
        </div>
        
        <div class="profile-form">
          <div class="form-group">
            <label for="update-display-name">
              <span class="label-icon">📝</span>
              <strong>Display Name</strong>
            </label>
            <input type="text" 
                   id="update-display-name" 
                   value="${currentDisplayName}" 
                   placeholder="How should others see you?"
                   maxlength="50"
                   class="profile-input">
            <small class="help-text">This name appears in scenarios, discussions, and leaderboards</small>
          </div>
          
          <div class="form-group">
            <label for="update-photo-url">
              <span class="label-icon">🖼️</span>
              <strong>Avatar Image</strong>
            </label>
            <input type="url" 
                   id="update-photo-url" 
                   value="${currentPhotoURL}" 
                   placeholder="https://example.com/your-avatar.jpg"
                   class="profile-input">
            <small class="help-text">Enter a URL to your avatar image (optional)</small>
          </div>
          
          <div class="avatar-suggestions">
            <p><strong>💡 Quick Avatar Options:</strong></p>
            <div class="avatar-options">
              <!-- Emoji Avatar Options -->
              <div class="emoji-avatar-section">
                <h4>😊 Emoji Avatars</h4>
                <div class="emoji-grid">
                  <button type="button" class="emoji-avatar-option" data-avatar="😊">😊</button>
                  <button type="button" class="emoji-avatar-option" data-avatar="🤓">🤓</button>
                  <button type="button" class="emoji-avatar-option" data-avatar="🧠">🧠</button>
                  <button type="button" class="emoji-avatar-option" data-avatar="🎓">🎓</button>
                  <button type="button" class="emoji-avatar-option" data-avatar="🔬">🔬</button>
                  <button type="button" class="emoji-avatar-option" data-avatar="⚖️">⚖️</button>
                  <button type="button" class="emoji-avatar-option" data-avatar="🤖">🤖</button>
                  <button type="button" class="emoji-avatar-option" data-avatar="💡">💡</button>
                  <button type="button" class="emoji-avatar-option" data-avatar="🎯">🎯</button>
                  <button type="button" class="emoji-avatar-option" data-avatar="🌟">🌟</button>
                  <button type="button" class="emoji-avatar-option" data-avatar="🔍">🔍</button>
                  <button type="button" class="emoji-avatar-option" data-avatar="📚">📚</button>
                  <button type="button" class="emoji-avatar-option" data-avatar="🎭">🎭</button>
                  <button type="button" class="emoji-avatar-option" data-avatar="💎">💎</button>
                  <button type="button" class="emoji-avatar-option" data-avatar="🚀">🚀</button>
                  <button type="button" class="emoji-avatar-option" data-avatar="🌈">🌈</button>
                </div>
              </div>

              <!-- Traditional Avatar Options -->
              <div class="traditional-avatar-section">
                <h4>🖼️ Traditional Avatars</h4>
                <button type="button" class="avatar-option" data-avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=${userEmail}&backgroundColor=b6e3f4">
                  🎨 Generated Avatar
                </button>
                <button type="button" class="avatar-option" data-avatar="https://ui-avatars.com/api/?name=${encodeURIComponent(currentDisplayName || userEmail.split('@')[0])}&background=4f46e5&color=fff&size=200">
                  🔤 Initials Avatar
                </button>
                <button type="button" class="avatar-option" data-avatar="">
                  🚫 No Avatar
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="profile-benefits">
          <div class="benefit">
            <span class="benefit-icon">🎭</span>
            <span>Enhance your role-playing experience</span>
          </div>
          <div class="benefit">
            <span class="benefit-icon">🏆</span>
            <span>Stand out in leaderboards and discussions</span>
          </div>
          <div class="benefit">
            <span class="benefit-icon">🤝</span>
            <span>Build connections with other participants</span>
          </div>
        </div>
        
        <div class="modal-actions">
          <button class="btn btn-primary" onclick="authService.applyProfileUpdate()">
            💾 Update Profile
          </button>
          <button class="btn btn-secondary" onclick="authService.skipProfileUpdate()">
            ⏭️ Skip for Now
          </button>
        </div>
      </div>
    `;

    // Use existing modal system
    const modal = new window.ModalDialog({
      title: 'Profile Setup',
      content: modalContent,
      closeOnBackdrop: true,
      closeOnEscape: true,
    });

    modal.open();

    // Set up live preview and event handlers
    this.setupProfileUpdateHandlers();

    // Make auth service globally accessible for buttons
    window.authService = this;
  }

  /**
   * Set up event handlers for profile update modal
   */
  setupProfileUpdateHandlers() {
    // Live preview for display name
    const nameInput = document.getElementById('update-display-name');
    if (nameInput) {
      nameInput.addEventListener('input', e => {
        const preview = document.getElementById('current-name-preview');
        if (preview) {
          const newName = e.target.value.trim();
          preview.textContent =
            newName || this.currentUser.email?.split('@')[0] || 'Your Name';
        }
      });
    }

    // Live preview for avatar
    const photoInput = document.getElementById('update-photo-url');
    if (photoInput) {
      photoInput.addEventListener('input', e => {
        const preview = document.getElementById('current-avatar-preview');
        if (preview) {
          const newURL = e.target.value.trim();
          if (newURL) {
            preview.src = newURL;
            preview.onerror = () => {
              preview.src = 'https://via.placeholder.com/60x60?text=❌';
            };
          } else {
            preview.src = 'https://via.placeholder.com/60x60?text=👤';
          }
        }
      });
    }

    // Avatar option buttons (traditional)
    document.querySelectorAll('.avatar-option').forEach(button => {
      button.addEventListener('click', e => {
        const avatarURL = e.target.dataset.avatar;
        const photoInput = document.getElementById('update-photo-url');
        const preview = document.getElementById('current-avatar-preview');

        if (photoInput) {
          photoInput.value = avatarURL;
        }

        if (preview) {
          if (avatarURL) {
            preview.src = avatarURL;
          } else {
            preview.src = 'https://via.placeholder.com/60x60?text=👤';
          }
        }

        // Visual feedback
        document
          .querySelectorAll('.avatar-option, .emoji-avatar-option')
          .forEach(btn => btn.classList.remove('selected'));
        e.target.classList.add('selected');
      });
    });

    // Emoji avatar option buttons
    document.querySelectorAll('.emoji-avatar-option').forEach(button => {
      button.addEventListener('click', e => {
        const emoji = e.target.dataset.avatar;
        const photoInput = document.getElementById('update-photo-url');
        const preview = document.getElementById('current-avatar-preview');

        // Create a data URL for the emoji
        const emojiDataURL = this.createEmojiAvatar(emoji);

        if (photoInput) {
          photoInput.value = `emoji:${emoji}`;
        }

        if (preview) {
          preview.src = emojiDataURL;
          preview.style.fontSize = '2rem';
          preview.style.textAlign = 'center';
          preview.style.lineHeight = '60px';
          preview.style.background =
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
          preview.style.color = 'white';
          preview.style.borderRadius = '50%';
        }

        // Visual feedback
        document
          .querySelectorAll('.avatar-option, .emoji-avatar-option')
          .forEach(btn => btn.classList.remove('selected'));
        e.target.classList.add('selected');
      });
    });
  }

  /**
   * Apply profile updates from the modal
   */
  async applyProfileUpdate() {
    try {
      const displayName = document
        .getElementById('update-display-name')
        ?.value?.trim();
      const photoURL = document
        .getElementById('update-photo-url')
        ?.value?.trim();

      if (!displayName && !photoURL) {
        this.showErrorMessage(
          'Please enter at least a display name or avatar URL'
        );
        return;
      }

      // Show loading state
      const updateBtn = document.querySelector('.btn-primary');
      if (updateBtn) {
        updateBtn.disabled = true;
        updateBtn.innerHTML = '⏳ Updating Profile...';
      }

      // Prepare update data
      const updateData = {};
      if (displayName) {
        updateData.displayName = displayName;
      }
      if (photoURL) {
        updateData.photoURL = photoURL;
      }

      // Update Firebase Auth profile using FirebaseService with centralized UID
      const uid = this.getValidatedUID();
      const result = await this.firebaseService.updateUserProfile(
        uid,
        updateData
      );

      if (result.success) {
        // Also update Firestore user document
        if (this.firestoreService) {
          await this.firestoreService.updateUserDocument({
            profile: {
              displayName: displayName || this.currentUser?.displayName,
              avatar: photoURL || this.currentUser?.photoURL,
            },
            displayName: displayName || this.currentUser?.displayName,
          });
        }

        // Close modal
        document.querySelector('.modal')?.remove();

        // Show success message
        this.showSuccessMessage(
          `🎉 Profile updated successfully! Welcome, ${displayName || this.currentUser.displayName}!`
        );

        // Track the profile update with centralized UID
        const uid = this.getCurrentUID();
        this.firebaseService.trackEvent('profile_updated_post_signin', {
          user_id: uid,
          updated_display_name: !!displayName,
          updated_photo: !!photoURL,
          method: 'post_signin_modal',
        });

        // Trigger UI updates
        this.updateUIForAuthenticatedUser();

        // Dispatch custom event for other components to react
        window.dispatchEvent(
          new CustomEvent('userProfileUpdated', {
            detail: {
              user: this.currentUser,
              updates: updateData,
            },
          })
        );
      } else {
        throw new Error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      this.showErrorMessage(`Profile update failed: ${error.message}`);

      // Reset button state
      const updateBtn = document.querySelector('.btn-primary');
      if (updateBtn) {
        updateBtn.disabled = false;
        updateBtn.innerHTML = '💾 Update Profile';
      }
    }
  }

  /**
   * Skip profile update and close modal
   */
  skipProfileUpdate() {
    // Close modal
    document.querySelector('.modal')?.remove();

    // Track that user skipped with centralized UID
    const uid = this.getCurrentUID();
    this.firebaseService.trackEvent('profile_update_skipped', {
      user_id: uid,
      method: 'post_signin_modal',
    });

    this.showInfoMessage(
      'You can update your profile anytime from your account settings'
    );
  }

  /**
   * Prompt user to update profile after sign-in (for narrative games)
   */
  async promptProfileUpdateAfterSignIn() {
    if (!this.currentUser) return;

    // Check if user has a basic profile setup
    const hasDisplayName =
      this.currentUser.displayName && this.currentUser.displayName.trim();
    const hasAvatar =
      this.currentUser.photoURL && this.currentUser.photoURL.trim();

    // If user doesn't have both, suggest updating
    if (!hasDisplayName || !hasAvatar) {
      // Wait a bit for sign-in success message to show
      const PROFILE_PROMPT_DELAY = 2000; // 2 seconds
      setTimeout(() => {
        const shouldUpdate = confirm(
          `👋 Welcome! Would you like to personalize your profile for a better experience in our narrative scenarios?\n\n🎭 Add a display name and avatar to enhance your role-playing experience!`
        );

        if (shouldUpdate) {
          this.showProfileUpdateModal();
        }
      }, PROFILE_PROMPT_DELAY);
    }
  }

  /**
   * Quick profile update for display name only (useful for narrative onboarding)
   */
  async quickUpdateDisplayName(newDisplayName) {
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    if (!newDisplayName || !newDisplayName.trim()) {
      throw new Error('Display name cannot be empty');
    }

    try {
      const uid = this.requireAuthentication('profile update');
      const result = await this.firebaseService.updateUserProfile(uid, {
        displayName: newDisplayName.trim(),
      });

      if (result.success) {
        // Track the quick update with centralized UID
        const uid = this.getCurrentUID();
        this.firebaseService.trackEvent('quick_display_name_update', {
          user_id: uid,
          method: 'narrative_onboarding',
        });

        return { success: true };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw new Error(`Failed to update display name: ${error.message}`);
    }
  }

  /**
   * Initialize intentional logout manager
   */
  initializeLogoutManager() {
    // Check if IntentionalLogoutManager is available
    if (typeof window !== 'undefined' && window.IntentionalLogoutManager) {
      this.logoutManager = new window.IntentionalLogoutManager(this);
    } else {
      // Load the component if not available
      this.loadIntentionalLogoutManager();
    }
  }

  /**
   * Dynamically load the intentional logout manager
   */
  async loadIntentionalLogoutManager() {
    try {
      // Import the component script if not already loaded
      if (
        !document.querySelector('script[src*="intentional-logout-manager"]')
      ) {
        const script = document.createElement('script');
        script.src = '/src/js/components/intentional-logout-manager.js';
        script.onload = () => {
          if (window.IntentionalLogoutManager) {
            this.logoutManager = new window.IntentionalLogoutManager(this);
          }
        };
        document.head.appendChild(script);
      }
    } catch (error) {
      // Intentional logout manager is optional, continue without it
    }
  }

  /**
   * Initialize Firestore service
   */
  initializeFirestoreService() {
    try {
      this.firestoreService = new FirestoreService(this.firebaseService, this);
    } catch (error) {
      // Firestore service is optional, continue without it
    }
  }

  /**
   * Get the current user's UID - central method for all UID access
   * This ensures consistent UID usage across all services
   */
  getCurrentUID() {
    return this.currentUser?.uid || null;
  }

  /**
   * Validate that a UID exists and is properly formatted
   */
  isValidUID(uid) {
    if (!uid || typeof uid !== 'string') return false;
    // Firebase UIDs are typically 28 characters long and alphanumeric
    return /^[a-zA-Z0-9]{20,}$/.test(uid);
  }

  /**
   * Get UID with validation - throws error if invalid
   */
  getValidatedUID(providedUID = null) {
    const uid = providedUID || this.getCurrentUID();

    if (!uid) {
      throw new Error('No authenticated user found - UID required');
    }

    if (!this.isValidUID(uid)) {
      throw new Error('Invalid UID format detected');
    }

    return uid;
  }

  /**
   * Ensure user is authenticated before proceeding with UID-based operations
   */
  requireAuthentication(operation = 'operation') {
    if (!this.currentUser) {
      throw new Error(`Authentication required for ${operation}`);
    }
    return this.getCurrentUID();
  }

  /**
   * Handle authentication with rate limiting protection
   */
  async handleAuthWithRateLimit(authFunction) {
    try {
      // Check if rate limit status component is available
      if (this.rateLimitStatus && this.rateLimitStatus.isRateLimited) {
        const rateLimitInfo = this.rateLimitStatus.getRateLimitInfo();
        return {
          success: false,
          rateLimited: true,
          error: `Rate limited. Please wait ${rateLimitInfo.timeRemaining} seconds before trying again.`,
          timeRemaining: rateLimitInfo.timeRemaining,
        };
      }

      // Execute the authentication function
      const result = await authFunction();

      // Track successful auth attempt if rate limit status is available
      if (this.rateLimitStatus && this.rateLimitStatus.trackAuthAttempt) {
        this.rateLimitStatus.trackAuthAttempt(true);
      }

      return result;
    } catch (error) {
      // Track failed auth attempt if rate limit status is available
      if (this.rateLimitStatus && this.rateLimitStatus.trackAuthAttempt) {
        this.rateLimitStatus.trackAuthAttempt(false);
      }

      // Check if this is a network error
      if (
        error.code === 'auth/network-request-failed' ||
        error.message.includes('network') ||
        error.message.includes('fetch')
      ) {
        return {
          success: false,
          networkError: true,
          error:
            'Network connection error. Please check your internet connection.',
        };
      }

      // Return the original error
      throw error;
    }
  }

  // ============================================================================
  // FIRESTORE INTEGRATION METHODS
  // ============================================================================

  /**
   * Create user document in Firestore after successful authentication
   */
  async createUserDocument(userData = {}) {
    if (!this.firestoreService) {
      return { success: false, error: 'Firestore service not available' };
    }

    const uid = this.getCurrentUID();
    if (!uid) {
      return { success: false, error: 'No authenticated user' };
    }

    // Merge current user data with provided data
    const userDocData = {
      displayName: this.currentUser?.displayName || '',
      email: this.currentUser?.email || '',
      role: 'learner',
      ...userData,
    };

    return await this.firestoreService.createUserDocument(userDocData);
  }

  /**
   * Get user document from Firestore
   */
  async getUserDocument(uid = null) {
    if (!this.firestoreService) {
      return { success: false, error: 'Firestore service not available' };
    }

    return await this.firestoreService.getUserDocument(uid);
  }

  /**
   * Update user document in Firestore
   */
  async updateUserDocument(updateData, uid = null) {
    if (!this.firestoreService) {
      return { success: false, error: 'Firestore service not available' };
    }

    return await this.firestoreService.updateUserDocument(updateData, uid);
  }

  /**
   * Save simulation progress using Firestore
   */
  async saveSimulationProgress(simulationId, progressData) {
    if (!this.firestoreService) {
      return { success: false, error: 'Firestore service not available' };
    }

    return await this.firestoreService.saveSimulationProgress(
      simulationId,
      progressData
    );
  }

  /**
   * Get user's simulation history
  
   */
  async getUserSimulations() {
    if (!this.firestoreService) {
      return { success: false, error: 'Firestore service not available' };
    }

    return await this.firestoreService.getUserSimulations();
  }

  /**
   * Award a badge to the current user
   */
  async awardBadge(badgeId, badgeData) {
    if (!this.firestoreService) {
      return { success: false, error: 'Firestore service not available' };
    }

    return await this.firestoreService.awardBadge(badgeId, badgeData);
  }

  /**
   * Get user's badges
   */
  async getUserBadges() {
    if (!this.firestoreService) {
      return { success: false, error: 'Firestore service not available' };
    }

    return await this.firestoreService.getUserBadges();
  }

  /**
   * Update learning progress for a category
   */
  async updateCategoryProgress(categoryId, progressData) {
    if (!this.firestoreService) {
      return { success: false, error: 'Firestore service not available' };
    }

    return await this.firestoreService.updateCategoryProgress(
      categoryId,
      progressData
    );
  }

  /**
   * Get user's learning progress
   */
  async getUserProgress() {
    if (!this.firestoreService) {
      return { success: false, error: 'Firestore service not available' };
    }

    return await this.firestoreService.getUserProgress();
  }

  /**
   * Start a user session
   */
  async startUserSession(sessionData = {}) {
    if (!this.firestoreService) {
      return { success: false, error: 'Firestore service not available' };
    }

    return await this.firestoreService.startSession(sessionData);
  }

  /**
   * End a user session
   */
  async endUserSession(sessionId, sessionData = {}) {
    if (!this.firestoreService) {
      return { success: false, error: 'Firestore service not available' };
    }

    return await this.firestoreService.endSession(sessionId, sessionData);
  }

  /**
   * Save scenario completion data to Firestore
   */
  async saveScenarioCompletion(scenarioData) {
    if (!this.isAuthenticated() || !this.firestoreService) {
      // If user not authenticated or Firestore not available, skip saving
      return { success: false, reason: 'not_authenticated_or_no_firestore' };
    }

    try {
      const completionData = {
        type: 'scenario_completion',
        scenarioId: scenarioData.scenarioId,
        categoryId: scenarioData.categoryId,
        selectedOption: scenarioData.selectedOption,
        optionText: scenarioData.optionText,
        impact: scenarioData.impact,
        completedAt: new Date(),
        timestamp: Date.now(),
        sessionId: this.getSessionId?.() || `session_${Date.now()}`,
      };

      // Save to user's simulations subcollection
      const result = await this.firestoreService.saveSimulationProgress(
        `scenario_${scenarioData.scenarioId}`,
        completionData
      );

      if (result.success) {
        // Also track category progress using existing method
        await this.updateCategoryProgress(scenarioData.categoryId, {
          completedScenarios: {
            [scenarioData.scenarioId]: {
              completedAt: new Date(),
              timestamp: Date.now(),
            },
          },
        });
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get session ID for tracking
   */
  getSessionId() {
    try {
      return (
        localStorage.getItem('session_start_time') || `session_${Date.now()}`
      );
    } catch (error) {
      return `session_${Date.now()}`;
    }
  }

  /**
   * Ensure user document exists (create if doesn't exist)
   */
  async ensureUserDocument(userData = {}) {
    if (!this.firestoreService) {
      return { success: false, error: 'Firestore service not available' };
    }

    return await this.firestoreService.ensureUserDocument(userData);
  }

  /**
   * Delete user account and all associated data (GDPR compliant)
   */
  async deleteUserAccount() {
    if (!this.currentUser) {
      throw new Error('No authenticated user found');
    }

    try {
      const uid = this.getCurrentUID();

      // Step 1: Delete all Firestore data
      if (this.firestoreService) {
        await this.firestoreService.deleteAllUserData(uid);
      }

      // Step 2: Delete Firebase Authentication account
      const deleteResult = await this.firebaseService.deleteCurrentUser();

      if (deleteResult.success) {
        // Step 3: Clear local data
        this.clearLocalUserData();

        // Step 4: Update UI for anonymous state
        this.updateUIForAnonymousUser();

        // Step 5: Track deletion (anonymized)
        this.firebaseService.trackEvent('user_account_deleted', {
          deletion_method: 'user_initiated',
          had_firestore_data: !!this.firestoreService,
          timestamp: new Date().toISOString(),
        });

        return {
          success: true,
          message:
            'Your account and all associated data have been permanently deleted.',
        };
      } else {
        throw new Error(deleteResult.error || 'Failed to delete account');
      }
    } catch (error) {
      throw new Error(`Account deletion failed: ${error.message}`);
    }
  }

  /**
   * Clear all local user data (localStorage, sessionStorage, etc.)
   */
  clearLocalUserData() {
    try {
      // Clear auth-related localStorage items
      const authKeys = [
        'session_start_time',
        'simulateai_auth_persistence',
        'user_preferences',
        'learning_progress',
      ];

      authKeys.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          // Ignore individual removal errors
        }
      });

      // Clear any sessionStorage data
      try {
        sessionStorage.clear();
      } catch (error) {
        // Ignore sessionStorage errors
      }

      // Clear user properties
      this.currentUser = null;
      this.userProfile = null;
    } catch (error) {
      // Local data clearing is best effort
    }
  }

  /**
   * Display success message to user
   */
  showSuccessMessage(message) {
    if (window.NotificationToast) {
      window.NotificationToast.show({
        message,
        type: 'success',
        duration: 4000,
      });
    } else {
      // Fallback if toast system not available
      // Message will be visible in network dev tools
    }
  }

  /**
   * Display error message to user
   */
  showErrorMessage(message) {
    if (window.NotificationToast) {
      window.NotificationToast.show({
        message,
        type: 'error',
        duration: 6000,
      });
    } else {
      // Fallback if toast system not available
      // Error will be tracked in analytics
    }
  }

  /**
   * Display info message to user
   */
  showInfoMessage(message) {
    if (window.NotificationToast) {
      window.NotificationToast.show({
        message,
        type: 'info',
        duration: 4000,
      });
    } else {
      // Fallback if toast system not available
      // Message logged in analytics events
    }
  }

  /**
   * Show custom modal (used by some persistence settings methods)
   */
  showCustomModal(title, content) {
    const modal = new window.ModalDialog({
      title,
      content,
      closeOnBackdrop: true,
      closeOnEscape: true,
    });
    modal.open();
  }

  /**
   * Create a data URL for emoji avatar
   */
  createEmojiAvatar(emoji, size = 80) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = size;
    canvas.height = size;

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');

    // Draw circle background
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
    ctx.fill();

    // Draw emoji
    const EMOJI_SIZE_RATIO = 0.6;
    ctx.font = `${size * EMOJI_SIZE_RATIO}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    ctx.fillText(emoji, size / 2, size / 2);

    return canvas.toDataURL();
  }

  /**
   * Check if avatar is an emoji type
   */
  isEmojiAvatar(avatarURL) {
    return avatarURL && avatarURL.startsWith('emoji:');
  }

  /**
   * Get emoji from emoji avatar URL
   */
  getEmojiFromAvatar(avatarURL) {
    if (this.isEmojiAvatar(avatarURL)) {
      return avatarURL.replace('emoji:', '');
    }
    return null;
  }

  /**
   * Render emoji avatar in UI
   */
  renderEmojiAvatar(element, avatarURL) {
    if (this.isEmojiAvatar(avatarURL)) {
      const emoji = this.getEmojiFromAvatar(avatarURL);
      const dataURL = this.createEmojiAvatar(emoji);

      if (element.tagName === 'IMG') {
        element.src = dataURL;
      } else {
        element.innerHTML = emoji;
        element.style.background =
          'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        element.style.borderRadius = '50%';
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
        element.style.fontSize = '1.5rem';
        element.style.color = 'white';
      }
      return true;
    }
    return false;
  }
}

export default AuthService;
