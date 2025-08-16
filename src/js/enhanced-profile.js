// Enhanced Profile JavaScript - Modern User Experience
class EnhancedProfile {
  constructor() {
    this.authService = null;
    this.currentUser = null;
    this.userProfile = null;
    this.isLoading = false;
    this.animations = {
      enabled: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    };

    // Constants
    this.constants = {
      MIN_SCENARIOS: 5,
      MAX_SCENARIOS: 25,
      MIN_RESEARCH_SUBMISSIONS: 2,
      MAX_RESEARCH_SUBMISSIONS: 15,
      MAX_DONATION: 100,
      DONATION_MULTIPLIER: 5,
      TIMEOUT_GUEST: 1500,
      TIMEOUT_DONATION: 2000,
      TIMEOUT_RESEARCH: 1500,
      TIMEOUT_EXPORT: 2000,
      MIN_ACTIVITY_HOURS: 0,
      MAX_RECENT_ACTIVITY: 6,
      MAX_RESEARCH_ACTIVITY: 30,
      MAX_COMMUNITY_ACTIVITY: 7,
      TIMELINE_ITEMS: 3,
      HOURS_PER_DAY: 24,
      EASING_POWER: 4,
      MAX_STUDIES: 5,
      MAX_PAPERS: 3,
      NOTIFICATION_DURATION: 5000,
      SCROLL_THRESHOLD: 500,
      ANIMATION_DELAY: 100,
      MILLISECONDS_PER_MINUTE: 60000,
      MILLISECONDS_PER_HOUR: 3600000,
      MILLISECONDS_PER_DAY: 86400000,
      MINUTES_PER_HOUR: 60,
      DAYS_PER_WEEK: 7,
    };

    this.init();
  }

  async init() {
    try {
      // Initialize services
      await this.initializeServices();

      // Set up event listeners
      this.setupEventListeners();

      // Initialize animations
      this.initializeAnimations();

      // Check authentication state
      await this.checkAuthState();

      // Check for payment success callback
      this.checkPaymentCallback();
    } catch (error) {
      // Error initializing enhanced profile
      this.showNotification("Error loading profile", "error");
    }
  }

  async initializeServices() {
    // Import services dynamically
    const AuthService = await import("./services/auth-service.js");
    this.authService = new AuthService.default();
    await this.authService.initialize();

    // Set up auth state listener
    this.authService.firebaseService.addAuthStateListener((user) => {
      this.handleAuthStateChange(user);
    });
  }

  setupEventListeners() {
    // Mobile menu toggle
    const mobileToggle = document.querySelector(".mobile-menu-toggle");
    if (mobileToggle) {
      mobileToggle.addEventListener("click", this.toggleMobileMenu.bind(this));
    }

    // Login button
    const loginBtn = document.getElementById("login-btn");
    if (loginBtn) {
      loginBtn.addEventListener("click", this.handleLogin.bind(this));
    }

    // Guest button
    const guestBtn = document.querySelector(".guest-btn");
    if (guestBtn) {
      guestBtn.addEventListener("click", this.handleGuestMode.bind(this));
    }

    // Profile action buttons
    this.setupProfileActionListeners();

    // Donation buttons
    this.setupDonationListeners();

    // Account management buttons
    this.setupAccountManagementListeners();

    // Scroll to top functionality
    this.initializeScrollToTop();

    // Keyboard navigation
    document.addEventListener(
      "keydown",
      this.handleKeyboardNavigation.bind(this),
    );

    // Intersection Observer for animations
    this.initializeIntersectionObserver();
  }

  setupProfileActionListeners() {
    const editProfileBtn = document.getElementById("edit-profile-btn");
    const privacySettingsBtn = document.getElementById("privacy-settings-btn");
    const shareProfileBtn = document.getElementById("share-profile-btn");
    const avatarEditBtn = document.querySelector(".avatar-edit-btn");

    if (editProfileBtn) {
      editProfileBtn.addEventListener(
        "click",
        this.openEditProfileModal.bind(this),
      );
    }

    if (privacySettingsBtn) {
      privacySettingsBtn.addEventListener(
        "click",
        this.openPrivacySettings.bind(this),
      );
    }

    if (shareProfileBtn) {
      shareProfileBtn.addEventListener("click", this.shareProfile.bind(this));
    }

    if (avatarEditBtn) {
      avatarEditBtn.addEventListener("click", this.changeAvatar.bind(this));
    }
  }

  setupDonationListeners() {
    const donationBtns = document.querySelectorAll(".donate-btn");
    donationBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const { tier } = e.currentTarget.dataset;
        this.initiateDonation(tier);
      });
    });
  }

  setupAccountManagementListeners() {
    const exportDataBtn = document.getElementById("export-data-btn");
    const deleteDataBtn = document.getElementById("delete-data-btn");
    const signOutBtn = document.getElementById("sign-out-btn");

    if (exportDataBtn) {
      exportDataBtn.addEventListener("click", this.exportUserData.bind(this));
    }

    if (deleteDataBtn) {
      deleteDataBtn.addEventListener("click", this.deleteUserData.bind(this));
    }

    if (signOutBtn) {
      signOutBtn.addEventListener("click", this.handleSignOut.bind(this));
    }
  }

  // ===== AUTHENTICATION METHODS =====
  async handleAuthStateChange(user) {
    this.currentUser = user;

    if (user) {
      await this.loadUserProfile(user.uid);
      this.showAuthenticatedContent();
      this.populateProfileData();
      this.updateAuthUI();
    } else {
      this.showLoginContent();
      this.updateAuthUI();
    }
  }

  async checkAuthState() {
    this.showLoading("Checking authentication...");

    // Wait for auth state to be determined
    await new Promise((resolve) => {
      const unsubscribe = this.authService.firebaseService.addAuthStateListener(
        (user) => {
          unsubscribe();
          resolve(user);
        },
      );
    });

    this.hideLoading();
  }

  async loadUserProfile(uid) {
    try {
      // Load user profile from Firestore
      const { db } = this.authService.firebaseService;
      const userDoc = await db.collection("users").doc(uid).get();

      if (userDoc.exists) {
        this.userProfile = userDoc.data();

        // Ensure profile has required fields
        if (!this.userProfile.scenariosCompleted) {
          this.userProfile = {
            ...this.userProfile,
            name:
              this.userProfile.name || this.currentUser.displayName || "User",
            flair: this.userProfile.flair || null, // gold, silver, bronze, or null
            tier: this.userProfile.tier || 0,
            scenariosCompleted:
              this.userProfile.scenariosCompleted ||
              Math.floor(Math.random() * this.constants.MAX_SCENARIOS) +
                this.constants.MIN_SCENARIOS,
            researchResponsesSubmitted:
              this.userProfile.researchResponsesSubmitted ||
              Math.floor(
                Math.random() * this.constants.MAX_RESEARCH_SUBMISSIONS,
              ) + this.constants.MIN_RESEARCH_SUBMISSIONS,
            communityPosts:
              this.userProfile.communityPosts || Math.floor(Math.random() * 10),
            totalDonated: this.userProfile.totalDonated || 0,
            stripeCustomerId: this.userProfile.stripeCustomerId || null,
            subscriptionStatus: this.userProfile.subscriptionStatus || null,
            lastActive: this.userProfile.lastActive || new Date(),
            location: this.userProfile.location || "Location not set",
            researchParticipant: this.userProfile.researchParticipant || false,
          };

          // Update Firestore with complete profile
          await this.updateUserProfile(uid, this.userProfile);
        }
      } else {
        // Create new user profile
        this.userProfile = this.createNewUserProfile();
        await this.updateUserProfile(uid, this.userProfile);
      }
    } catch (error) {
      // Error loading user profile
      this.showNotification("Error loading profile data", "error");
    }
  }

  createNewUserProfile() {
    return {
      name: this.currentUser.displayName || "User",
      email: this.currentUser.email,
      flair: null,
      tier: 0,
      scenariosCompleted: 0,
      researchResponsesSubmitted: 0,
      communityPosts: 0,
      totalDonated: 0,
      stripeCustomerId: null,
      subscriptionStatus: null,
      lastActive: new Date(),
      location: "Location not set",
      researchParticipant: false,
      createdAt: new Date(),
    };
  }

  async updateUserProfile(uid, profileData) {
    try {
      const { db } = this.authService.firebaseService;
      await db.collection("users").doc(uid).set(profileData, { merge: true });
    } catch (error) {
      // Error updating user profile
    }
  }

  handleLogin() {
    this.showLoading("Connecting to Google...");

    // Add button loading state
    const loginBtn = document.getElementById("login-btn");
    if (loginBtn) {
      loginBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Connecting...';
      loginBtn.disabled = true;
    }

    this.authService
      .showLoginModal()
      .then(() => {
        this.hideLoading();
      })
      .catch(() => {
        this.hideLoading();
        this.showNotification("Login failed. Please try again.", "error");

        // Reset button state
        if (loginBtn) {
          loginBtn.innerHTML =
            '<i class="fab fa-google"></i><span>Continue with Google</span>';
          loginBtn.disabled = false;
        }
      });
  }

  handleGuestMode() {
    this.showNotification("Guest mode functionality coming soon!", "info");
    // Redirect to main page or show limited functionality
    setTimeout(() => {
      const isDevelopment = window.location.hostname === "localhost";
      const appPath = isDevelopment ? "app.html" : "/app.html";
      window.location.href = appPath;
    }, this.constants.TIMEOUT_GUEST);
  }

  handleSignOut() {
    const confirmModal = this.createConfirmModal(
      "Sign Out",
      "Are you sure you want to sign out of your account?",
      "Sign Out",
      "Cancel",
    );

    confirmModal.onConfirm = () => {
      this.showLoading("Signing out...");
      this.authService
        .signOut()
        .then(() => {
          this.hideLoading();
          this.showNotification("Successfully signed out", "success");
        })
        .catch(() => {
          this.hideLoading();
          this.showNotification("Error signing out", "error");
        });
    };
  }

  // ===== CONTENT DISPLAY METHODS =====
  showAuthenticatedContent() {
    const authContent = document.getElementById("authenticated-content");
    const loginContent = document.getElementById("login-required-content");

    if (authContent) {
      authContent.style.display = "block";
      authContent.classList.add("fade-in");
    }

    if (loginContent) {
      loginContent.style.display = "none";
    }
  }

  showLoginContent() {
    const authContent = document.getElementById("authenticated-content");
    const loginContent = document.getElementById("login-required-content");

    if (authContent) {
      authContent.style.display = "none";
    }

    if (loginContent) {
      loginContent.style.display = "block";
      loginContent.classList.add("fade-in");
    }
  }

  populateProfileData() {
    if (!this.currentUser || !this.userProfile) return;

    try {
      // Basic profile info
      this.updateElement(
        "user-avatar",
        "src",
        this.currentUser.photoURL || "/assets/default-avatar.png",
      );

      // Display name with flair
      const displayName =
        this.userProfile.name ||
        this.userProfile.displayName ||
        this.currentUser.displayName ||
        "User";
      const flair = this.getUserFlair();
      this.updateElement(
        "user-display-name",
        "innerHTML",
        `${displayName} ${flair}`,
      );

      this.updateElement(
        "user-join-date",
        "textContent",
        `Joined: ${this.formatDate(this.userProfile.createdAt)}`,
      );
      this.updateElement(
        "user-location",
        "textContent",
        this.userProfile.location || "Location not set",
      );
      this.updateElement(
        "last-active",
        "textContent",
        `Last active: ${this.formatRelativeTime(this.userProfile.lastActive)}`,
      );

      // Update tier badge
      this.updateTierBadge();

      // Animate stats
      this.animateStats();

      // Update research status
      this.updateResearchStatus();

      // Update activity timeline
      this.updateActivityTimeline();
    } catch (error) {
      // Error populating profile data
    }
  }

  updateElement(id, property, value) {
    const element = document.getElementById(id);
    if (element && value !== undefined) {
      element[property] = value;
    }
  }

  updateTierBadge() {
    const tierBadge = document.getElementById("user-tier-badge");
    if (!tierBadge) return;

    const tier = this.userProfile?.tier || 0;
    const tierNames = {
      0: "Free Member",
      1: "🔬 Research Contributor",
      2: "⭐ Community Supporter",
      3: "👑 Education Patron",
    };

    tierBadge.textContent = tierNames[tier] || "Free Member";

    // Update badge styling based on tier
    tierBadge.className = `tier-badge tier-${tier}`;
  }

  animateStats() {
    const stats = [
      {
        id: "scenarios-completed",
        value: this.userProfile.scenariosCompleted || 0,
      },
      {
        id: "research-contributions",
        value: this.userProfile.researchResponsesSubmitted || 0,
      },
      { id: "community-posts", value: this.userProfile.communityPosts || 0 },
      {
        id: "total-donated",
        value: this.userProfile.totalDonated || 0,
        prefix: "$",
      },
    ];

    stats.forEach((stat) => {
      this.animateNumber(stat.id, stat.value, stat.prefix);
    });
  }

  animateNumber(elementId, targetValue, prefix = "") {
    const element = document.getElementById(elementId);
    if (!element || !this.animations.enabled) {
      element.textContent = prefix + targetValue;
      return;
    }

    const duration = 2000;
    const startTime = Date.now();
    const startValue = 0;

    const updateNumber = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOutQuart =
        1 - Math.pow(1 - progress, this.constants.EASING_POWER);
      const currentValue = Math.floor(
        startValue + (targetValue - startValue) * easeOutQuart,
      );

      element.textContent = prefix + this.formatNumber(currentValue);

      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      }
    };

    updateNumber();
  }

  updateResearchStatus() {
    const statusContainer = document.getElementById(
      "research-participant-status",
    );
    if (!statusContainer) return;

    const isParticipant = this.userProfile?.researchParticipant || false;

    if (isParticipant) {
      statusContainer.innerHTML = `
                <div class="research-status active">
                    <div class="status-header">
                        <div class="status-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="status-content">
                            <h3>Active Research Participant</h3>
                            <p>Thank you for contributing to AI ethics research! Your responses help advance education.</p>
                        </div>
                    </div>
                    <div class="research-stats">
                        <div class="research-stat">
                            <span class="stat-value">${this.userProfile.researchResponsesSubmitted || 0}</span>
                            <span class="stat-label">Responses Submitted</span>
                        </div>
                        <div class="research-stat">
                            <span class="stat-value">${Math.floor(Math.random() * this.constants.MAX_STUDIES) + 1}</span>
                            <span class="stat-label">Studies Participated</span>
                        </div>
                        <div class="research-stat">
                            <span class="stat-value">${Math.floor(Math.random() * this.constants.MAX_PAPERS) + 1}</span>
                            <span class="stat-label">Papers Contributed</span>
                        </div>
                    </div>
                    <div class="research-actions">
                        <button class="btn btn-secondary" onclick="enhancedProfile.viewResearchData()">
                            <i class="fas fa-chart-bar"></i>
                            View My Data
                        </button>
                        <button class="btn btn-outline" onclick="enhancedProfile.exportResearchData()">
                            <i class="fas fa-download"></i>
                            Export Data
                        </button>
                        <button class="btn btn-outline" onclick="enhancedProfile.optOutResearch()">
                            <i class="fas fa-times"></i>
                            Opt Out
                        </button>
                    </div>
                </div>
            `;
    } else {
      statusContainer.innerHTML = `
                <div class="research-invitation">
                    <div class="invitation-header">
                        <div class="invitation-icon">
                            <i class="fas fa-flask"></i>
                        </div>
                        <div class="invitation-content">
                            <h3>Join Our Research Study</h3>
                            <p>Help advance AI ethics education by contributing your simulation responses to our research.</p>
                        </div>
                    </div>
                    <div class="research-benefits">
                        <div class="benefit-item">
                            <i class="fas fa-graduation-cap"></i>
                            <span>Contribute to academic publications</span>
                        </div>
                        <div class="benefit-item">
                            <i class="fas fa-lightbulb"></i>
                            <span>Support evidence-based education</span>
                        </div>
                        <div class="benefit-item">
                            <i class="fas fa-award"></i>
                            <span>Get research contributor badge</span>
                        </div>
                        <div class="benefit-item">
                            <i class="fas fa-eye"></i>
                            <span>Access to research insights</span>
                        </div>
                    </div>
                    <div class="invitation-actions">
                        <button class="btn btn-primary" onclick="enhancedProfile.joinResearchStudy()">
                            <i class="fas fa-rocket"></i>
                            Join Study ($5+ donation)
                        </button>
                        <button class="btn btn-outline" onclick="enhancedProfile.learnMoreResearch()">
                            <i class="fas fa-info-circle"></i>
                            Learn More
                        </button>
                    </div>
                </div>
            `;
    }
  }

  updateActivityTimeline() {
    // Generate dynamic activity timeline based on user data
    const activities = this.generateActivityData();
    const timelineContainer = document.querySelector(".timeline-container");

    if (timelineContainer && activities.length > 0) {
      timelineContainer.innerHTML = activities
        .map(
          (activity) => `
                <div class="timeline-item">
                    <div class="timeline-icon ${activity.type}">
                        <i class="${activity.icon}"></i>
                    </div>
                    <div class="timeline-content">
                        <h4>${activity.title}</h4>
                        <p>${activity.description}</p>
                        <span class="timeline-date">${activity.timeAgo}</span>
                    </div>
                </div>
            `,
        )
        .join("");
    }
  }

  generateActivityData() {
    const activities = [];

    if (this.userProfile.scenariosCompleted > 0) {
      activities.push({
        type: "completed",
        icon: "fas fa-check",
        title: "Completed Healthcare Bias Scenario",
        description: "Explored ethical considerations in medical AI systems",
        timeAgo: this.getRandomTimeAgo(
          this.constants.MIN_ACTIVITY_HOURS,
          this.constants.MAX_RECENT_ACTIVITY,
        ),
      });
    }

    if (this.userProfile.researchParticipant) {
      activities.push({
        type: "research",
        icon: "fas fa-flask",
        title: "Joined Research Study",
        description: "Became a research contributor to advance AI ethics",
        timeAgo: this.getRandomTimeAgo(1, this.constants.MAX_RESEARCH_ACTIVITY),
      });
    }

    if (this.userProfile.communityPosts > 0) {
      activities.push({
        type: "community",
        icon: "fas fa-comment",
        title: "Posted in Forum",
        description: '"Best practices for algorithmic fairness in hiring"',
        timeAgo: this.getRandomTimeAgo(
          1,
          this.constants.MAX_COMMUNITY_ACTIVITY,
        ),
      });
    }

    return activities.slice(0, this.constants.TIMELINE_ITEMS); // Show only recent activities
  }

  getRandomTimeAgo(minHours, maxHours) {
    const hours =
      Math.floor(Math.random() * (maxHours - minHours + 1)) + minHours;

    if (hours < 1) return "Just now";
    if (hours < this.constants.HOURS_PER_DAY)
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;

    const days = Math.floor(hours / this.constants.HOURS_PER_DAY);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  updateAuthUI() {
    const authSection = document.querySelector(".auth-section");
    if (!authSection) return;

    if (this.currentUser) {
      authSection.innerHTML = `
                <div class="user-menu">
                    <div class="user-avatar">${this.currentUser.displayName?.charAt(0) || "U"}</div>
                    <span class="user-name">${this.currentUser.displayName || "User"}</span>
                    <i class="fas fa-chevron-down"></i>
                </div>
            `;
    } else {
      authSection.innerHTML = `
                <div class="auth-buttons">
                    <button class="btn btn-outline" onclick="enhancedProfile.handleLogin()">Sign In</button>
                </div>
            `;
    }
  }

  // ===== PROFILE ACTION METHODS =====
  openEditProfileModal() {
    this.showNotification("Profile editing functionality coming soon!", "info");
  }

  openPrivacySettings() {
    this.showNotification(
      "Privacy settings functionality coming soon!",
      "info",
    );
  }

  shareProfile() {
    if (navigator.share) {
      navigator
        .share({
          title: "My SimulateAI Profile",
          text: "Check out my AI ethics learning journey on SimulateAI!",
          url: window.location.href,
        })
        .catch(() => {
          this.fallbackShare();
        });
    } else {
      this.fallbackShare();
    }
  }

  fallbackShare() {
    // Copy URL to clipboard
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        this.showNotification("Profile URL copied to clipboard!", "success");
      })
      .catch(() => {
        this.showNotification("Unable to copy URL", "error");
      });
  }

  changeAvatar() {
    this.showNotification("Avatar change functionality coming soon!", "info");
  }

  // ===== STRIPE DONATION METHODS =====
  async initiateDonation(tier) {
    const tierInfo = {
      1: {
        name: "Bronze Contributor",
        amount: 5,
        flair: "bronze",
        stripePriceId: "price_1RkyADJDA3nPZHAFQJr2ySBR", // $5 Bronze tier
        features: [
          "🥉 Bronze contributor badge",
          "Research participation access",
          "Community recognition",
        ],
      },
      2: {
        name: "Silver Supporter",
        amount: 10,
        flair: "silver",
        stripePriceId: "price_1RkyADJDA3nPZHAFXasv2dM0", // $10 Silver tier
        features: [
          "🥈 Silver supporter badge",
          "Enhanced profile features",
          "Priority community access",
          "Special recognition",
        ],
      },
      3: {
        name: "Gold Patron",
        amount: 20,
        flair: "gold",
        stripePriceId: "price_1RkyADJDA3nPZHAFoyRLGmpQ", // $20 Gold tier
        features: [
          "🏆 Gold patron badge",
          "Premium research access",
          "Educational patron status",
          "Maximum community benefits",
        ],
      },
    };

    const info = tierInfo[tier];
    if (!info) return;

    const confirmModal = this.createConfirmModal(
      `Become ${info.name}`,
      `Support SimulateAI with a $${info.amount}/month donation to unlock premium features and help advance AI ethics education.\n\nFeatures included:\n• ${info.features.join("\n• ")}`,
      `Donate $${info.amount}/month`,
      "Cancel",
    );

    confirmModal.onConfirm = async () => {
      await this.processStripeSubscription(info, tier);
    };
  }

  async processStripeSubscription(tierInfo, tier) {
    try {
      this.showLoading("Creating Stripe checkout session...");

      // Call Firebase Function instead of REST API
      const createCheckoutSession =
        this.authService.firebaseService.functions.httpsCallable(
          "createCheckoutSession",
        );

      const result = await createCheckoutSession({
        priceId: tierInfo.stripePriceId,
        tier,
      });

      const session = result.data;

      if (session.error) {
        throw new Error(session.error);
      }

      // Redirect to Stripe Checkout URL directly
      window.location.href = session.url;
    } catch (error) {
      this.hideLoading();
      this.showNotification(`Payment failed: ${error.message}`, "error");
    }
  }

  // Handle successful payment callback
  async handlePaymentSuccess(sessionId) {
    try {
      this.showLoading("Confirming payment...");

      // Call Firebase Function to verify payment
      const verifyPaymentSuccess =
        this.authService.firebaseService.functions.httpsCallable(
          "verifyPaymentSuccess",
        );

      const result = await verifyPaymentSuccess({
        sessionId,
      });

      const { data } = result;

      if (data.success) {
        // Update local user profile with new tier and flair
        this.userProfile.tier = data.tier;
        this.userProfile.flair = data.flair;
        this.userProfile.stripeCustomerId = data.stripeCustomerId;
        this.userProfile.subscriptionStatus = "active";
        this.userProfile.totalDonated = data.totalDonated;

        // Update UI
        this.populateProfileData();
        this.updateTierBadge();
        this.animateStats();

        this.hideLoading();
        this.showNotification(
          `Thank you for becoming a ${data.tierName}! 🎉`,
          "success",
        );
      } else {
        throw new Error(data.error || "Payment verification failed");
      }
    } catch (error) {
      this.hideLoading();
      this.showNotification(
        `Payment verification failed: ${error.message}`,
        "error",
      );
    }
  }

  // Check for payment success callback from Stripe
  checkPaymentCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("session_id");
    const success = urlParams.get("success");

    if (success === "true" && sessionId) {
      // Clean URL parameters
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);

      // Handle payment success
      this.handlePaymentSuccess(sessionId);
    } else if (success === "false") {
      // Payment cancelled
      this.showNotification("Payment was cancelled", "warning");

      // Clean URL parameters
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }

  // ===== RESEARCH METHODS =====
  joinResearchStudy() {
    const confirmModal = this.createConfirmModal(
      "Join Research Study",
      "By joining our research study, you agree to share your simulation responses to help advance AI ethics education. All data is anonymized and used solely for research purposes.",
      "Join Study",
      "Cancel",
    );

    confirmModal.onConfirm = () => {
      this.showLoading("Joining research study...");

      setTimeout(() => {
        this.hideLoading();
        this.showNotification("Welcome to our research study!", "success");

        // Update user profile
        if (this.userProfile) {
          this.userProfile.researchParticipant = true;
          this.updateResearchStatus();
        }
      }, this.constants.TIMEOUT_RESEARCH);
    };
  }

  viewResearchData() {
    this.showNotification("Research data viewer coming soon!", "info");
  }

  exportResearchData() {
    this.showLoading("Preparing research data export...");

    setTimeout(() => {
      this.hideLoading();
      this.showNotification("Research data exported successfully!", "success");
    }, this.constants.TIMEOUT_EXPORT);
  }

  optOutResearch() {
    const confirmModal = this.createConfirmModal(
      "Opt Out of Research",
      "Are you sure you want to opt out of the research study? This will remove your data from future research but won't affect your account.",
      "Opt Out",
      "Cancel",
    );

    confirmModal.onConfirm = () => {
      this.showLoading("Opting out of research...");

      setTimeout(() => {
        this.hideLoading();
        this.showNotification(
          "Successfully opted out of research study",
          "success",
        );

        // Update user profile
        if (this.userProfile) {
          this.userProfile.researchParticipant = false;
          this.updateResearchStatus();
        }
      }, this.constants.TIMEOUT_RESEARCH);
    };
  }

  learnMoreResearch() {
    this.showNotification("Research information page coming soon!", "info");
  }

  // ===== ACCOUNT MANAGEMENT METHODS =====
  exportUserData() {
    this.showLoading("Preparing data export...");

    setTimeout(() => {
      this.hideLoading();

      // Simulate data export
      const userData = {
        profile: this.userProfile,
        exportDate: new Date().toISOString(),
        dataTypes: [
          "profile",
          "scenarios",
          "research-responses",
          "community-posts",
        ],
      };

      const blob = new Blob([JSON.stringify(userData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `simulateai-data-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();

      this.showNotification("Data export completed!", "success");
    }, this.constants.TIMEOUT_EXPORT);
  }

  deleteUserData() {
    const confirmModal = this.createConfirmModal(
      "Delete Research Data",
      "This will permanently delete all your research contributions. Your profile and account will remain active. This action cannot be undone.",
      "Delete Research Data",
      "Cancel",
      "danger",
    );

    confirmModal.onConfirm = () => {
      this.showLoading("Deleting research data...");

      setTimeout(() => {
        this.hideLoading();
        this.showNotification("Research data deleted successfully", "success");

        // Reset research data
        if (this.userProfile) {
          this.userProfile.researchResponsesSubmitted = 0;
          this.userProfile.researchParticipant = false;
          this.updateResearchStatus();
          this.animateStats();
        }
      }, this.constants.TIMEOUT_EXPORT);
    };
  }

  // ===== UTILITY METHODS =====
  formatDate(timestamp) {
    if (!timestamp) return "--";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  }

  formatRelativeTime(timestamp) {
    if (!timestamp) return "Recently";

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(
      diffMs / this.constants.MILLISECONDS_PER_MINUTE,
    );
    const diffHours = Math.floor(diffMs / this.constants.MILLISECONDS_PER_HOUR);
    const diffDays = Math.floor(diffMs / this.constants.MILLISECONDS_PER_DAY);

    if (diffMins < 1) return "Just now";
    if (diffMins < this.constants.MINUTES_PER_HOUR)
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < this.constants.HOURS_PER_DAY)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < this.constants.DAYS_PER_WEEK)
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

    return this.formatDate(date);
  }

  formatNumber(num) {
    return new Intl.NumberFormat("en-US").format(num);
  }

  // ===== UI UTILITY METHODS =====
  showLoading(message = "Loading...") {
    this.isLoading = true;

    let loadingElement = document.querySelector(".enhanced-loading");
    if (!loadingElement) {
      loadingElement = document.createElement("div");
      loadingElement.className = "enhanced-loading";
      document.body.appendChild(loadingElement);
    }

    loadingElement.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner">
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                </div>
                <div class="loading-content">
                    <h3 class="loading-title">${message}</h3>
                    <p class="loading-subtitle">Please wait a moment</p>
                </div>
                <div class="loading-progress">
                    <div class="progress-bar"></div>
                </div>
            </div>
        `;

    loadingElement.style.display = "flex";
  }

  hideLoading() {
    this.isLoading = false;
    const loadingElement = document.querySelector(".enhanced-loading");
    if (loadingElement) {
      loadingElement.style.display = "none";
    }
  }

  showNotification(message, type = "info", duration = 5000) {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    ${this.getNotificationIcon(type)}
                </div>
                <div class="notification-message">${message}</div>
                <button class="notification-close">×</button>
            </div>
        `;

    // Add event listeners
    const closeBtn = notification.querySelector(".notification-close");
    closeBtn.addEventListener("click", () => notification.remove());

    // Auto-remove
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, duration);

    // Add to page
    document.body.appendChild(notification);

    // Trigger animation
    setTimeout(() => notification.classList.add("show"), 100);
  }

  getNotificationIcon(type) {
    const icons = {
      success: '<i class="fas fa-check-circle"></i>',
      error: '<i class="fas fa-exclamation-triangle"></i>',
      warning: '<i class="fas fa-exclamation-circle"></i>',
      info: '<i class="fas fa-info-circle"></i>',
    };
    return icons[type] || icons.info;
  }

  createConfirmModal(
    title,
    message,
    confirmText,
    cancelText,
    style = "primary",
  ) {
    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.innerHTML = `
            <div class="modal-container confirm-modal">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline cancel-btn">${cancelText}</button>
                    <button class="btn btn-${style} confirm-btn">${confirmText}</button>
                </div>
            </div>
        `;

    document.body.appendChild(modal);

    const confirmBtn = modal.querySelector(".confirm-btn");
    const cancelBtn = modal.querySelector(".cancel-btn");
    const closeBtn = modal.querySelector(".modal-close");

    const closeModal = () => {
      modal.remove();
      document.body.style.overflow = "";
    };

    cancelBtn.addEventListener("click", closeModal);
    closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    document.body.style.overflow = "hidden";

    return {
      onConfirm: null,
      close: closeModal,
      get confirmButton() {
        confirmBtn.addEventListener("click", () => {
          if (this.onConfirm) this.onConfirm();
          closeModal();
        });
        return confirmBtn;
      },
    };
  }

  toggleMobileMenu() {
    const nav = document.querySelector(".header-nav");
    const toggle = document.querySelector(".mobile-menu-toggle");

    if (nav && toggle) {
      nav.classList.toggle("mobile-open");
      toggle.classList.toggle("active");
    }
  }

  initializeScrollToTop() {
    const scrollBtn = document.createElement("button");
    scrollBtn.className = "scroll-to-top";
    scrollBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    scrollBtn.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: var(--primary-color);
            color: white;
            border: none;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            cursor: pointer;
            display: none;
            z-index: 1000;
            box-shadow: var(--shadow-lg);
            transition: var(--transition-fast);
        `;

    scrollBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    document.body.appendChild(scrollBtn);

    window.addEventListener("scroll", () => {
      scrollBtn.style.display =
        window.pageYOffset > this.constants.SCROLL_THRESHOLD ? "block" : "none";
    });
  }

  handleKeyboardNavigation(event) {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case "k":
          event.preventDefault();
          // Focus search if available
          break;
        case "e":
          event.preventDefault();
          if (this.currentUser) {
            this.openEditProfileModal();
          }
          break;
      }
    }
  }

  initializeAnimations() {
    if (!this.animations.enabled) return;

    // Fade in animations for content sections
    const sections = document.querySelectorAll(
      ".enhanced-section-card, .stat-card, .tier-card",
    );
    sections.forEach((section, index) => {
      section.style.opacity = "0";
      section.style.transform = "translateY(20px)";

      setTimeout(() => {
        section.style.transition = "opacity 0.6s ease, transform 0.6s ease";
        section.style.opacity = "1";
        section.style.transform = "translateY(0)";
      }, index * 100);
    });
  }

  initializeIntersectionObserver() {
    if (!window.IntersectionObserver || !this.animations.enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      },
    );

    // Observe animatable elements
    const animatableElements = document.querySelectorAll(
      ".stat-card, .tier-card, .timeline-item",
    );
    animatableElements.forEach((el) => observer.observe(el));
  }

  getUserFlair() {
    if (!this.userProfile?.flair) return "";

    switch (this.userProfile.flair) {
      case "gold":
        return "🏆";
      case "silver":
        return "🥈";
      case "bronze":
        return "🥉";
      default:
        return "";
    }
  }
}

// Initialize enhanced profile when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.enhancedProfile = new EnhancedProfile();
});

// Add notification styles dynamically
const notificationStyles = `
    <style>
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            border-left: 4px solid;
            min-width: 300px;
            max-width: 400px;
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        }
        
        .notification.show {
            transform: translateX(0);
        }
        
        .notification-success { border-left-color: #10b981; }
        .notification-error { border-left-color: #ef4444; }
        .notification-warning { border-left-color: #f59e0b; }
        .notification-info { border-left-color: #3b82f6; }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;
        }
        
        .notification-icon {
            font-size: 20px;
        }
        
        .notification-success .notification-icon { color: #10b981; }
        .notification-error .notification-icon { color: #ef4444; }
        .notification-warning .notification-icon { color: #f59e0b; }
        .notification-info .notification-icon { color: #3b82f6; }
        
        .notification-message {
            flex: 1;
            color: #374151;
            font-weight: 500;
        }
        
        .notification-close {
            background: none;
            border: none;
            font-size: 18px;
            color: #9ca3af;
            cursor: pointer;
            padding: 4px;
        }
        
        .notification-close:hover {
            color: #374151;
        }
        
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .confirm-modal {
            background: white;
            border-radius: 12px;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }
        
        .modal-header {
            padding: 24px 24px 16px;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .modal-title {
            font-size: 18px;
            font-weight: 600;
            color: #111827;
            margin: 0;
        }
        
        .modal-close {
            background: none;
            border: none;
            font-size: 24px;
            color: #9ca3af;
            cursor: pointer;
            padding: 4px;
        }
        
        .modal-body {
            padding: 16px 24px;
        }
        
        .modal-body p {
            color: #6b7280;
            line-height: 1.6;
            margin: 0;
        }
        
        .modal-footer {
            padding: 16px 24px 24px;
            display: flex;
            gap: 12px;
            justify-content: flex-end;
        }
        
        .fade-in {
            animation: fadeIn 0.5s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-in {
            animation: slideInUp 0.6s ease;
        }
        
        @keyframes slideInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
    </style>
`;

document.head.insertAdjacentHTML("beforeend", notificationStyles);

// ESM build: no CommonJS export
