/**
 * Professional Donor Wall Component
 * Manages donor carousel, filtering, personalization, and Firebase integration
 * Features: Automated carousel, optional personalization, privacy controls
 */

class ProfessionalDonorWall {
  constructor() {
    this.currentSlide = 0;
    this.currentFilter = "recent";
    this.donors = [];
    this.filteredDonors = [];
    this.cardsPerView = this.getCardsPerView();
    this.autoplayInterval = null;
    this.isAutoplayPaused = false;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadDonorData();
    this.startAutoplay();
    this.handleResponsive();

    // Initialize accessibility features
    this.setupAccessibility();

    console.log("Professional Donor Wall initialized");
  }

  /**
   * Load donor data (in production, this would come from Firebase)
   */
  loadDonorData() {
    // Check if Firebase is available for real-time data
    if (window.firebase && window.firebase.firestore) {
      this.loadDonorDataFromFirebase();
    } else {
      // Fallback to sample data
      this.loadSampleDonorData();
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
   * Apply filter to donor list
   */
  applyFilter(filterType) {
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
  }

  /**
   * Render donor cards in the carousel
   */
  renderDonorCards() {
    const container = document.querySelector(".donor-cards-container");
    if (!container) return;

    container.innerHTML = "";

    this.filteredDonors.forEach((donor, index) => {
      const card = this.createDonorCard(donor);
      container.appendChild(card);

      // Add entrance animation
      setTimeout(() => {
        card.classList.add("animate-in");
      }, index * 100);
    });

    this.updateCarouselState();
  }

  /**
   * Create individual donor card element
   */
  createDonorCard(donor) {
    const card = document.createElement("div");
    card.className = "donor-card";
    card.setAttribute("data-visibility", donor.visibility);
    card.setAttribute("data-donor-id", donor.id);

    // Create avatar section
    const avatar = this.createAvatar(donor);

    // Create donor info section
    const info = document.createElement("div");
    info.className = "donor-info";

    const name = document.createElement("h4");
    name.className = "donor-name";
    name.textContent = donor.displayName;

    const since = document.createElement("p");
    since.className = "donor-since";
    since.textContent = `Supporting since ${this.formatDate(donor.supportSince)}`;

    info.appendChild(name);
    info.appendChild(since);

    // Add reflection if available and user has opted in
    if (donor.reflection && donor.visibility !== "anonymous") {
      const reflection = document.createElement("div");
      reflection.className = "donor-reflection";
      const reflectionText = document.createElement("p");
      reflectionText.textContent = donor.reflection;
      reflection.appendChild(reflectionText);
      info.appendChild(reflection);
    }

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
   * Setup event listeners
   */
  setupEventListeners() {
    // Filter buttons
    document
      .querySelectorAll(".donor-wall-filters .filter-btn")
      .forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          const filter = btn.getAttribute("data-filter");
          this.setActiveFilter(btn, filter);
          this.applyFilter(filter);
          this.trackInteraction("filter_change", { filter });
        });
      });

    // Carousel navigation
    const prevBtn = document.querySelector(".carousel-prev");
    const nextBtn = document.querySelector(".carousel-next");

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

    // Pause autoplay on hover
    const carousel = document.querySelector(".donor-carousel-container");
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
   * Set active filter button
   */
  setActiveFilter(clickedBtn, filter) {
    document
      .querySelectorAll(".donor-wall-filters .filter-btn")
      .forEach((btn) => {
        btn.classList.remove("active");
        btn.setAttribute("aria-selected", "false");
      });

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
   * Go to next slide
   */
  nextSlide() {
    const maxSlides = this.getMaxSlides();
    this.currentSlide =
      this.currentSlide >= maxSlides ? 0 : this.currentSlide + 1;
    this.updateCarouselState();
  }

  /**
   * Go to previous slide
   */
  previousSlide() {
    const maxSlides = this.getMaxSlides();
    this.currentSlide =
      this.currentSlide <= 0 ? maxSlides : this.currentSlide - 1;
    this.updateCarouselState();
  }

  /**
   * Go to specific slide
   */
  goToSlide(slideIndex) {
    const maxSlides = this.getMaxSlides();
    this.currentSlide = Math.max(0, Math.min(slideIndex, maxSlides));
    this.updateCarouselState();
  }

  /**
   * Update carousel visual state
   */
  updateCarouselState() {
    const container = document.querySelector(".donor-cards-container");
    const prevBtn = document.querySelector(".carousel-prev");
    const nextBtn = document.querySelector(".carousel-next");

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
   * Update carousel indicators
   */
  updateCarouselIndicators() {
    const indicatorsContainer = document.querySelector(".carousel-indicators");
    if (!indicatorsContainer) return;

    const maxSlides = this.getMaxSlides();
    const totalIndicators = maxSlides + 1;

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
   * Update donor statistics
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

    // Animate counter updates
    this.animateCounter('.stat-number[data-stat="total-donors"]', totalDonors);
    this.animateCounter('.stat-number[data-stat="this-month"]', thisMonth);
    this.animateCounter('.stat-number[data-stat="countries"]', countries);
  }

  /**
   * Animate counter number
   */
  animateCounter(selector, targetValue) {
    const element = document.querySelector(selector);
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
   * Announce message to screen readers
   */
  announceToScreenReader(message) {
    const announcement = document.getElementById("aria-live-polite");
    if (announcement) {
      announcement.textContent = message;
      setTimeout(() => {
        announcement.textContent = "";
      }, 1000);
    }
  }

  /**
   * Track user interactions for analytics
   */
  trackInteraction(action, data = {}) {
    // In production, this would send to your analytics service
    console.log("Donor Wall Interaction:", {
      action,
      data,
      timestamp: new Date(),
    });

    // Example: Send to Google Analytics or custom analytics
    if (typeof gtag !== "undefined") {
      gtag("event", action, {
        event_category: "donor_wall",
        event_label: JSON.stringify(data),
      });
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
    window.professionalDonorWall = new ProfessionalDonorWall();

    // Clean up on page unload
    window.addEventListener("beforeunload", () => {
      if (window.professionalDonorWall) {
        window.professionalDonorWall.destroy();
      }
    });
  }
});

// Export for module usage
if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = ProfessionalDonorWall;
}
