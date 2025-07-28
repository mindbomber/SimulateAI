/**
 * Professional Donor Wall Component
 * Manages donor carousel, filtering, personalization, and Firebase integration
 * Features: Automated carousel, optional personalization, privacy controls
 *
 * Performance Optimizations:
 * - DOM element caching to reduce querySelector calls
 * - Batched DOM operations and element reuse
 * - Optimized state change detection and updates
 *
 * DataHandler Integration:
 * - Centralized donor data management and analytics
 * - User preference persistence across sessions
 * - Cross-device synchronization for authenticated users
 * - Offline interaction queuing and smart caching
 */

class ProfessionalDonorWall {
  constructor(app = null) {
    // DataHandler integration for centralized data management
    this.app = app;
    this.dataHandler = app?.dataHandler || null;

    this.currentSlide = 0;
    this.currentFilter = "recent";
    this.donors = [];
    this.filteredDonors = [];
    this.cardsPerView = this.getCardsPerView();
    this.autoplayInterval = null;
    this.isAutoplayPaused = false;

    // Performance optimization: DOM element cache
    this.domCache = new Map();
    this.lastRenderedData = null; // For change detection

    // DataHandler integration: User preferences tracking
    this.userPreferences = {
      lastFilter: "recent",
      lastSlidePosition: 0,
      autoplayEnabled: true,
      viewPreferences: {},
    };

    this.init();
  }
  async init() {
    this.cacheDOMElements(); // Cache frequently accessed elements
    await this.loadUserPreferences(); // Load user preferences via DataHandler
    this.setupEventListeners();
    this.loadDonorData();
    this.startAutoplay();
    this.handleResponsive();

    // Initialize accessibility features
    this.setupAccessibility();

    console.log("Professional Donor Wall initialized with DataHandler support");
  }

  /**
   * Load user preferences with DataHandler integration
   */
  async loadUserPreferences() {
    if (!this.dataHandler) {
      // Fallback to localStorage for non-DataHandler environments
      this.loadPreferencesFromLocalStorage();
      return;
    }

    try {
      const stored = await this.dataHandler.getData("donorWall_preferences");
      if (stored && Object.keys(stored).length > 0) {
        this.userPreferences = { ...this.userPreferences, ...stored };

        // Apply restored preferences
        this.currentFilter = this.userPreferences.lastFilter || "recent";
        this.currentSlide = this.userPreferences.lastSlidePosition || 0;

        console.log("[DonorWall] Preferences loaded from DataHandler");
      } else {
        // Check for existing localStorage data to migrate
        this.migratePreferencesFromLocalStorage();
      }
    } catch (error) {
      console.warn("[DonorWall] Failed to load preferences:", error);
      this.loadPreferencesFromLocalStorage();
    }
  }

  /**
   * Save user preferences via DataHandler
   */
  async saveUserPreferences() {
    // Update current state
    this.userPreferences.lastFilter = this.currentFilter;
    this.userPreferences.lastSlidePosition = this.currentSlide;
    this.userPreferences.timestamp = Date.now();

    if (this.dataHandler) {
      try {
        await this.dataHandler.saveData(
          "donorWall_preferences",
          this.userPreferences,
        );
        console.log("[DonorWall] Preferences saved to DataHandler");
      } catch (error) {
        console.warn(
          "[DonorWall] Failed to save preferences to DataHandler:",
          error,
        );
        // Fallback to localStorage
        this.savePreferencesToLocalStorage();
      }
    } else {
      this.savePreferencesToLocalStorage();
    }
  }

  /**
   * Migrate existing localStorage preferences to DataHandler
   */
  async migratePreferencesFromLocalStorage() {
    if (!this.dataHandler) return;

    try {
      const localData = localStorage.getItem(
        "simulateai_donor_wall_preferences",
      );
      if (localData) {
        const parsed = JSON.parse(localData);
        await this.dataHandler.saveData("donorWall_preferences", parsed);
        console.log(
          "[DonorWall] Migrated preferences from localStorage to DataHandler",
        );

        // Clean up old localStorage entry
        localStorage.removeItem("simulateai_donor_wall_preferences");
      }
    } catch (error) {
      console.warn("[DonorWall] Failed to migrate preferences:", error);
    }
  }

  /**
   * Fallback preference loading from localStorage
   */
  loadPreferencesFromLocalStorage() {
    try {
      const stored = localStorage.getItem("simulateai_donor_wall_preferences");
      if (stored) {
        const parsed = JSON.parse(stored);
        this.userPreferences = { ...this.userPreferences, ...parsed };
        this.currentFilter = this.userPreferences.lastFilter || "recent";
        this.currentSlide = this.userPreferences.lastSlidePosition || 0;
      }
    } catch (error) {
      console.warn(
        "[DonorWall] Failed to load preferences from localStorage:",
        error,
      );
    }
  }

  /**
   * Fallback preference saving to localStorage
   */
  savePreferencesToLocalStorage() {
    try {
      localStorage.setItem(
        "simulateai_donor_wall_preferences",
        JSON.stringify(this.userPreferences),
      );
    } catch (error) {
      console.warn(
        "[DonorWall] Failed to save preferences to localStorage:",
        error,
      );
    }
  }

  /**
   * Cache frequently accessed DOM elements for performance
   */
  cacheDOMElements() {
    const elementsToCache = [
      { key: "container", selector: ".donor-cards-container" },
      { key: "prevBtn", selector: ".carousel-prev" },
      { key: "nextBtn", selector: ".carousel-next" },
      { key: "carousel", selector: ".donor-carousel-container" },
      { key: "indicators", selector: ".carousel-indicators" },
      {
        key: "filterBtns",
        selector: ".donor-wall-filters .filter-btn",
        all: true,
      },
      { key: "ariaLive", selector: "#aria-live-polite" },
      {
        key: "totalDonorsStat",
        selector: '.stat-number[data-stat="total-donors"]',
      },
      {
        key: "thisMonthStat",
        selector: '.stat-number[data-stat="this-month"]',
      },
      { key: "countriesStat", selector: '.stat-number[data-stat="countries"]' },
    ];

    elementsToCache.forEach(({ key, selector, all }) => {
      if (all) {
        this.domCache.set(key, document.querySelectorAll(selector));
      } else {
        this.domCache.set(key, document.querySelector(selector));
      }
    });
  }

  /**
   * Get cached DOM element efficiently
   */
  getCachedElement(key) {
    return this.domCache.get(key);
  }

  /**
   * Generate data hash for change detection
   */
  generateDataHash(data) {
    return JSON.stringify({
      filteredDonors: data.map((d) => `${d.id}-${d.timestamp}`),
      currentSlide: this.currentSlide,
      cardsPerView: this.cardsPerView,
    });
  }

  /**
   * Load donor data with enhanced DataHandler integration
   */
  loadDonorData() {
    // Check if Firebase is available for real-time data
    if (window.firebase && window.firebase.firestore) {
      this.loadDonorDataFromFirebase();
    } else {
      // Enhanced fallback with DataHandler caching
      this.loadSampleDonorDataWithCaching();
    }
  }

  /**
   * Enhanced sample data loading with DataHandler caching
   */
  async loadSampleDonorDataWithCaching() {
    // Try to load cached donor data first
    if (this.dataHandler) {
      try {
        const cachedDonors = await this.dataHandler.getData(
          "donorWall_sampleData",
        );
        if (
          cachedDonors &&
          Array.isArray(cachedDonors) &&
          cachedDonors.length > 0
        ) {
          this.donors = cachedDonors;
          this.applyFilter(this.currentFilter);
          this.updateStats();
          console.log(
            "[DonorWall] Loaded cached sample donor data from DataHandler",
          );
          return;
        }
      } catch (error) {
        console.warn("[DonorWall] Failed to load cached donor data:", error);
      }
    }

    // Load sample data and cache it
    this.loadSampleDonorData();

    // Cache the sample data for future use
    if (this.dataHandler && this.donors.length > 0) {
      try {
        await this.dataHandler.saveData("donorWall_sampleData", this.donors);
        console.log("[DonorWall] Cached sample donor data to DataHandler");
      } catch (error) {
        console.warn("[DonorWall] Failed to cache sample donor data:", error);
      }
    }
  }

  /**
   * Load real-time donor data from Firebase
   */
  async loadDonorDataFromFirebase() {
    try {
      const db = window.firebase.firestore();

      // Listen for real-time updates to donations collection
      this.unsubscribe = db
        .collection("donations")
        .where("visibility", "!=", "hidden")
        .orderBy("timestamp", "desc")
        .limit(50) // Limit to recent 50 donations
        .onSnapshot(
          (snapshot) => {
            this.donors = [];

            snapshot.forEach((doc) => {
              const donationData = doc.data();

              // Convert Firestore data to donor card format
              const donor = {
                id: doc.id,
                displayName: this.getDisplayName(donationData),
                supportSince: donationData.timestamp?.toDate() || new Date(),
                donationAmount: donationData.amount || 0,
                tier: this.calculateTier(donationData.amount || 0),
                visibility: donationData.visibility || "username",
                reflection: donationData.message || null,
                isRecent: this.isRecentDonation(
                  donationData.timestamp?.toDate(),
                ),
                timestamp:
                  donationData.timestamp?.toDate().getTime() || Date.now(),
                userId: donationData.userId || null,
                isAnonymous: donationData.visibility === "anonymous",
              };

              this.donors.push(donor);
            });

            // Update the display
            this.applyFilter(this.currentFilter);
            console.log(`Loaded ${this.donors.length} donors from Firebase`);
          },
          (error) => {
            console.error("Error loading donor data from Firebase:", error);
            // Fallback to sample data on error
            this.loadSampleDonorData();
          },
        );
    } catch (error) {
      console.error("Firebase initialization error:", error);
      this.loadSampleDonorData();
    }
  }

  /**
   * Get display name based on visibility preferences
   */
  getDisplayName(donationData) {
    if (donationData.visibility === "anonymous") {
      return "Anonymous Supporter";
    }

    if (donationData.visibility === "username" && donationData.displayName) {
      return donationData.displayName;
    }

    // Fallback for authenticated users without display name
    if (donationData.userEmail) {
      return donationData.userEmail.split("@")[0];
    }

    return "Anonymous Supporter";
  }

  /**
   * Calculate tier based on donation amount
   */
  calculateTier(amount) {
    if (amount >= 50) return "premium";
    if (amount >= 20) return "gold";
    if (amount >= 10) return "silver";
    return "bronze";
  }

  /**
   * Check if donation is recent (within last 30 days)
   */
  isRecentDonation(date) {
    if (!date) return false;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return date > thirtyDaysAgo;
  }

  /**
   * Load sample donor data (fallback)
   */
  loadSampleDonorData() {
    // Sample donor data with different visibility levels and personalization
    this.donors = [
      {
        id: "1",
        name: "Alex Chen",
        displayName: "Alex Chen",
        visibility: "username",
        avatar: "src/assets/avatars/alex-chen.jpg",
        tier: "gold",
        supportSince: "2024-11-01",
        donationAmount: 500, // Never shown unless explicitly permitted
        country: "Canada",
        reflection:
          "Ethical AI education is the foundation of our digital future.",
        timestamp: new Date("2024-11-01"),
        isRecent: true,
        showAmount: false,
      },
      {
        id: "2",
        name: "Dr. Sarah Williams",
        displayName: "Dr. Sarah Williams",
        visibility: "username",
        avatar: "src/assets/avatars/sarah-williams.jpg",
        tier: "silver",
        supportSince: "2024-12-15",
        donationAmount: 150,
        country: "United States",
        reflection: "Supporting the next generation of ethical technologists.",
        timestamp: new Date("2024-12-15"),
        isRecent: true,
        showAmount: false,
      },
      {
        id: "3",
        name: "Anonymous",
        displayName: "Anonymous Supporter",
        visibility: "anonymous",
        avatar: null,
        tier: "bronze",
        supportSince: "2025-01-03",
        donationAmount: 50,
        country: "Germany",
        reflection: null,
        timestamp: new Date("2025-01-03"),
        isRecent: true,
        showAmount: false,
      },
      {
        id: "4",
        name: "Emma Thompson",
        displayName: "Emma T.",
        visibility: "partial",
        avatar: "src/assets/avatars/emma-thompson.jpg",
        tier: "silver",
        supportSince: "2024-10-20",
        donationAmount: 200,
        country: "United Kingdom",
        reflection: "Every student deserves to understand AI ethics.",
        timestamp: new Date("2024-10-20"),
        isRecent: false,
        showAmount: false,
      },
      {
        id: "5",
        name: "David Kim",
        displayName: "David Kim",
        visibility: "username",
        avatar: "src/assets/avatars/david-kim.jpg",
        tier: "gold",
        supportSince: "2024-09-15",
        donationAmount: 750,
        country: "South Korea",
        reflection: "Building responsible AI starts with education.",
        timestamp: new Date("2024-09-15"),
        isRecent: false,
        showAmount: false,
      },
      {
        id: "6",
        name: "Anonymous",
        displayName: "Anonymous Contributor",
        visibility: "anonymous",
        avatar: null,
        tier: "bronze",
        supportSince: "2025-01-10",
        donationAmount: 25,
        country: "Australia",
        reflection: null,
        timestamp: new Date("2025-01-10"),
        isRecent: true,
        showAmount: false,
      },
      {
        id: "7",
        name: "Maria Rodriguez",
        displayName: "Maria Rodriguez",
        visibility: "username",
        avatar: "src/assets/avatars/maria-rodriguez.jpg",
        tier: "silver",
        supportSince: "2024-11-28",
        donationAmount: 300,
        country: "Spain",
        reflection: "AI ethics education should be accessible to everyone.",
        timestamp: new Date("2024-11-28"),
        isRecent: true,
        showAmount: false,
      },
      {
        id: "8",
        name: "James Wilson",
        displayName: "J. Wilson",
        visibility: "partial",
        avatar: "src/assets/avatars/james-wilson.jpg",
        tier: "bronze",
        supportSince: "2024-12-05",
        donationAmount: 75,
        country: "Canada",
        reflection: "Supporting ethical tech education for future generations.",
        timestamp: new Date("2024-12-05"),
        isRecent: true,
        showAmount: false,
      },
    ];

    this.applyFilter(this.currentFilter);
    this.updateStats();
  }

  /**
   * Apply filter to donor list with DataHandler preference persistence
   */
  async applyFilter(filterType) {
    this.currentFilter = filterType;

    switch (filterType) {
      case "recent":
        this.filteredDonors = this.donors
          .filter((donor) => donor.isRecent)
          .sort((a, b) => b.timestamp - a.timestamp);
        break;

      case "top":
        this.filteredDonors = this.donors
          .sort((a, b) => b.donationAmount - a.donationAmount)
          .slice(0, 12); // Top 12 contributors
        break;

      case "messages":
        this.filteredDonors = this.donors
          .filter((donor) => donor.reflection)
          .sort((a, b) => b.timestamp - a.timestamp);
        break;

      default:
        this.filteredDonors = [...this.donors];
    }

    this.currentSlide = 0;
    this.renderDonorCards();
    this.updateCarouselIndicators();

    // Save filter preference via DataHandler
    await this.saveUserPreferences();

    // Track filter usage for analytics
    await this.trackFilterUsage(filterType);
  }

  /**
   * Track filter usage analytics via DataHandler
   */
  async trackFilterUsage(filterType) {
    if (!this.dataHandler) return;

    try {
      // Get existing analytics data
      const analytics = (await this.dataHandler.getData(
        "donorWall_analytics",
      )) || {
        filterUsage: {},
        totalInteractions: 0,
        lastUpdated: Date.now(),
      };

      // Update filter usage count
      analytics.filterUsage[filterType] =
        (analytics.filterUsage[filterType] || 0) + 1;
      analytics.totalInteractions++;
      analytics.lastUpdated = Date.now();

      // Save updated analytics
      await this.dataHandler.saveData("donorWall_analytics", analytics);
      console.log(`[DonorWall] Tracked filter usage: ${filterType}`);
    } catch (error) {
      console.warn("[DonorWall] Failed to track filter usage:", error);
    }
  }

  /**
   * Render donor cards in the carousel with change detection and caching
   */
  renderDonorCards() {
    const container = this.getCachedElement("container");
    if (!container) return;

    // Optimize: Only re-render if data actually changed
    const currentDataHash = this.generateDataHash(this.filteredDonors);
    if (this.lastRenderedData === currentDataHash) {
      return; // No changes, skip expensive DOM operations
    }

    container.innerHTML = "";

    this.filteredDonors.forEach((donor, index) => {
      const card = this.createDonorCard(donor);
      container.appendChild(card);

      // Add entrance animation
      setTimeout(() => {
        card.classList.add("animate-in");
      }, index * 100);
    });

    this.lastRenderedData = currentDataHash; // Mark as rendered
    this.updateCarouselState();
  }

  /**
   * Create individual donor card element with optimized DOM operations
   */
  createDonorCard(donor) {
    const card = document.createElement("div");
    card.className = "donor-card";
    card.setAttribute("data-visibility", donor.visibility);
    card.setAttribute("data-donor-id", donor.id);

    // Create avatar section
    const avatar = this.createAvatar(donor);

    // Create donor info section with batched element creation
    const info = document.createElement("div");
    info.className = "donor-info";

    // Batch create info elements using innerHTML for better performance
    const infoHTML = `
      <h4 class="donor-name">${donor.displayName}</h4>
      <p class="donor-since">Supporting since ${this.formatDate(donor.supportSince)}</p>
    `;
    info.innerHTML = infoHTML;

    // Add reflection if available and user has opted in
    if (donor.reflection && donor.visibility !== "anonymous") {
      const reflection = document.createElement("div");
      reflection.className = "donor-reflection";
      reflection.innerHTML = `<p>${donor.reflection}</p>`;
      info.appendChild(reflection);
    }

    // Assemble card efficiently
    card.appendChild(avatar);
    card.appendChild(info);

    // Add hover analytics
    card.addEventListener("mouseenter", () => {
      this.trackInteraction("donor_card_hover", { donorId: donor.id });
    });

    return card;
  }

  /**
   * Create avatar element for donor
   */
  createAvatar(donor) {
    const avatarContainer = document.createElement("div");
    avatarContainer.className = "donor-avatar";

    if (donor.visibility === "anonymous" || !donor.avatar) {
      const anonymousAvatar = document.createElement("div");
      anonymousAvatar.className = "anonymous-avatar";
      anonymousAvatar.setAttribute("aria-label", "Anonymous contributor");
      avatarContainer.appendChild(anonymousAvatar);
    } else {
      const img = document.createElement("img");
      img.src = donor.avatar;
      img.alt = `${donor.displayName} avatar`;
      img.onerror = () => {
        // Fallback to anonymous avatar if image fails to load
        img.style.display = "none";
        const fallback = document.createElement("div");
        fallback.className = "anonymous-avatar";
        fallback.setAttribute("aria-label", "Contributor avatar");
        avatarContainer.appendChild(fallback);
      };
      avatarContainer.appendChild(img);
    }

    // Add tier badge
    const badge = document.createElement("div");
    badge.className = `donor-badge ${donor.tier}-tier`;
    badge.setAttribute("aria-label", `${donor.tier} tier contributor`);
    avatarContainer.appendChild(badge);

    return avatarContainer;
  }

  /**
   * Setup event listeners with cached elements for performance
   */
  setupEventListeners() {
    // Filter buttons - use cached elements
    const filterBtns = this.getCachedElement("filterBtns");
    if (filterBtns) {
      filterBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          const filter = btn.getAttribute("data-filter");
          this.setActiveFilter(btn);
          this.applyFilter(filter);
          this.trackInteraction("filter_change", { filter });
        });
      });
    }

    // Carousel navigation - use cached elements
    const prevBtn = this.getCachedElement("prevBtn");
    const nextBtn = this.getCachedElement("nextBtn");

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        this.previousSlide();
        this.pauseAutoplay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        this.nextSlide();
        this.pauseAutoplay();
      });
    }

    // Carousel indicators
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("indicator")) {
        const slideIndex = parseInt(e.target.getAttribute("data-slide"));
        this.goToSlide(slideIndex);
        this.pauseAutoplay();
      }
    });

    // Pause autoplay on hover - use cached element
    const carousel = this.getCachedElement("carousel");
    if (carousel) {
      carousel.addEventListener("mouseenter", () => this.pauseAutoplay());
      carousel.addEventListener("mouseleave", () => this.resumeAutoplay());
    }

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (e.target.closest(".donor-carousel-container")) {
        switch (e.key) {
          case "ArrowLeft":
            e.preventDefault();
            this.previousSlide();
            break;
          case "ArrowRight":
            e.preventDefault();
            this.nextSlide();
            break;
        }
      }
    });

    // Responsive handling
    window.addEventListener("resize", () => {
      this.handleResponsive();
    });
  }

  /**
   * Set active filter button with cached elements
   */
  setActiveFilter(clickedBtn) {
    const filterBtns = this.getCachedElement("filterBtns");
    if (filterBtns) {
      filterBtns.forEach((btn) => {
        btn.classList.remove("active");
        btn.setAttribute("aria-selected", "false");
      });
    }

    clickedBtn.classList.add("active");
    clickedBtn.setAttribute("aria-selected", "true");
  }

  /**
   * Get number of cards per view based on screen size
   */
  getCardsPerView() {
    const width = window.innerWidth;
    if (width < 480) return 1;
    if (width < 768) return 2;
    if (width < 1024) return 3;
    return 4;
  }

  /**
   * Handle responsive behavior
   */
  handleResponsive() {
    const newCardsPerView = this.getCardsPerView();
    if (newCardsPerView !== this.cardsPerView) {
      this.cardsPerView = newCardsPerView;
      this.updateCarouselState();
      this.updateCarouselIndicators();
    }
  }

  /**
   * Calculate maximum slides
   */
  getMaxSlides() {
    return Math.max(
      0,
      Math.ceil(this.filteredDonors.length / this.cardsPerView) - 1,
    );
  }

  /**
   * Go to next slide with preference persistence
   */
  async nextSlide() {
    const maxSlides = this.getMaxSlides();
    this.currentSlide =
      this.currentSlide >= maxSlides ? 0 : this.currentSlide + 1;
    this.updateCarouselState();

    // Save slide position for session persistence
    await this.saveUserPreferences();
  }

  /**
   * Go to previous slide with preference persistence
   */
  async previousSlide() {
    const maxSlides = this.getMaxSlides();
    this.currentSlide =
      this.currentSlide <= 0 ? maxSlides : this.currentSlide - 1;
    this.updateCarouselState();

    // Save slide position for session persistence
    await this.saveUserPreferences();
  }

  /**
   * Go to specific slide with preference persistence
   */
  async goToSlide(slideIndex) {
    const maxSlides = this.getMaxSlides();
    this.currentSlide = Math.max(0, Math.min(slideIndex, maxSlides));
    this.updateCarouselState();

    // Save slide position for session persistence
    await this.saveUserPreferences();
  }

  /**
   * Update carousel visual state with cached elements
   */
  updateCarouselState() {
    const container = this.getCachedElement("container");
    const prevBtn = this.getCachedElement("prevBtn");
    const nextBtn = this.getCachedElement("nextBtn");

    if (!container) return;

    // Calculate transform
    const cardWidth = 280 + 24; // card width + gap
    const transform = -this.currentSlide * cardWidth * this.cardsPerView;
    container.style.transform = `translateX(${transform}px)`;

    // Update navigation buttons
    const maxSlides = this.getMaxSlides();

    if (prevBtn) {
      prevBtn.disabled = this.currentSlide === 0;
    }

    if (nextBtn) {
      nextBtn.disabled = this.currentSlide >= maxSlides;
    }

    // Update indicators
    this.updateIndicators();
  }

  /**
   * Update carousel indicators with cached elements
   */
  updateCarouselIndicators() {
    const indicatorsContainer = this.getCachedElement("indicators");
    if (!indicatorsContainer) return;

    const maxSlides = this.getMaxSlides();

    indicatorsContainer.innerHTML = "";

    for (let i = 0; i <= maxSlides; i++) {
      const indicator = document.createElement("button");
      indicator.className = "indicator";
      indicator.setAttribute("data-slide", i);
      indicator.setAttribute("role", "tab");
      indicator.setAttribute("aria-label", `Page ${i + 1}`);
      indicator.setAttribute(
        "aria-selected",
        i === this.currentSlide ? "true" : "false",
      );

      if (i === this.currentSlide) {
        indicator.classList.add("active");
      }

      indicatorsContainer.appendChild(indicator);
    }
  }

  /**
   * Update individual indicators
   */
  updateIndicators() {
    document.querySelectorAll(".indicator").forEach((indicator, index) => {
      const isActive = index === this.currentSlide;
      indicator.classList.toggle("active", isActive);
      indicator.setAttribute("aria-selected", isActive ? "true" : "false");
    });
  }

  /**
   * Start autoplay
   */
  startAutoplay() {
    this.autoplayInterval = setInterval(() => {
      if (!this.isAutoplayPaused) {
        this.nextSlide();
      }
    }, 5000); // 5 seconds
  }

  /**
   * Pause autoplay
   */
  pauseAutoplay() {
    this.isAutoplayPaused = true;
    setTimeout(() => {
      this.isAutoplayPaused = false;
    }, 10000); // Resume after 10 seconds of inactivity
  }

  /**
   * Resume autoplay
   */
  resumeAutoplay() {
    this.isAutoplayPaused = false;
  }

  /**
   * Update donor statistics with cached elements
   */
  updateStats() {
    const totalDonors = this.donors.length;
    const thisMonth = this.donors.filter((donor) => {
      const donorDate = new Date(donor.supportSince);
      const now = new Date();
      return (
        donorDate.getMonth() === now.getMonth() &&
        donorDate.getFullYear() === now.getFullYear()
      );
    }).length;

    const countries = new Set(this.donors.map((donor) => donor.country)).size;

    // Animate counter updates using cached elements
    this.animateCounter(this.getCachedElement("totalDonorsStat"), totalDonors);
    this.animateCounter(this.getCachedElement("thisMonthStat"), thisMonth);
    this.animateCounter(this.getCachedElement("countriesStat"), countries);
  }

  /**
   * Animate counter number with cached element
   */
  animateCounter(element, targetValue) {
    if (!element) return;

    const currentValue = parseInt(element.textContent) || 0;
    const increment = Math.ceil((targetValue - currentValue) / 20);

    const updateCounter = () => {
      const current = parseInt(element.textContent) || 0;
      if (current < targetValue) {
        element.textContent = Math.min(current + increment, targetValue);
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = targetValue;
      }
    };

    updateCounter();
  }

  /**
   * Format date for display
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  }

  /**
   * Setup accessibility features
   */
  setupAccessibility() {
    // Add ARIA labels and descriptions
    const carousel = document.querySelector(".donor-carousel-container");
    if (carousel) {
      carousel.setAttribute("aria-roledescription", "carousel");
      carousel.setAttribute("aria-label", "Donor appreciation carousel");
    }

    // Announce filter changes to screen readers
    const filterButtons = document.querySelectorAll(
      ".donor-wall-filters .filter-btn",
    );
    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const filter = btn.getAttribute("data-filter");
        this.announceToScreenReader(`Showing ${filter} donors`);
      });
    });
  }

  /**
   * Announce message to screen readers using cached element
   */
  announceToScreenReader(message) {
    const announcement = this.getCachedElement("ariaLive");
    if (announcement) {
      announcement.textContent = message;
      setTimeout(() => {
        announcement.textContent = "";
      }, 1000);
    }
  }

  /**
   * Enhanced interaction tracking with DataHandler persistence
   * @param {string} action - Type of interaction (click, navigate, filter, etc.)
   * @param {Object} data - Interaction details
   */
  async trackInteraction(action, data = {}) {
    const timestamp = new Date().toISOString();
    const interaction = {
      timestamp,
      action,
      currentSlide: this.currentSlide,
      currentFilter: this.currentFilter,
      visibleDonors: this.currentDonors.length,
      ...data,
    };

    try {
      // Track via DataHandler for persistence and analytics
      if (this.dataHandler) {
        await this.dataHandler.trackUserInteraction("donor-wall", interaction);
      }

      // Fallback to console for debugging
      console.log("Donor Wall Interaction:", interaction);

      // Send to Google Analytics if available
      if (typeof window !== "undefined" && typeof window.gtag !== "undefined") {
        window.gtag("event", action, {
          event_category: "donor_wall",
          event_label: JSON.stringify(data),
        });
      }
    } catch (error) {
      console.warn("Failed to track donor wall interaction:", error);
    }
  }

  /**
   * Firebase integration methods (for production)
   */

  /**
   * Save donor preferences to Firebase
   */
  async saveDonorPreferences(donorId, preferences) {
    // Implementation for Firebase integration
    console.log("Saving donor preferences:", { donorId, preferences });
  }

  /**
   * Clean up Firebase listeners when component is destroyed
   */
  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  /**
   * Handle Stripe webhook for new donations
   */
  async handleStripeWebhook(donationData) {
    // Implementation for Stripe webhook integration
    console.log("Processing new donation:", donationData);
  }
}

// Initialize Professional Donor Wall when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Check if donor wall container exists on the page
  if (document.querySelector(".donor-appreciation-section")) {
    // Initialize with app instance for DataHandler integration
    // Access global app instance if available
    const app = window.app || window.simulateAI || null;
    window.professionalDonorWall = new ProfessionalDonorWall(app);

    // Clean up on page unload
    window.addEventListener("beforeunload", () => {
      if (window.professionalDonorWall) {
        window.professionalDonorWall.destroy();
      }
    });
  }
});

// Export for module usage
if (
  typeof window !== "undefined" &&
  typeof window.module !== "undefined" &&
  typeof window.module.exports !== "undefined"
) {
  window.module.exports = ProfessionalDonorWall;
}
