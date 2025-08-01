/* global module */
/**
 * Donor Appreciation Module
 * Handles displaying donor recognition and appreciation content
 */

class DonorAppreciation {
  constructor() {
    this.donorContainer = document.getElementById(
      "donor-recognition-container",
    );
    this.donorList = document.getElementById("donor-list");
    this.init();
  }

  init() {
    this.loadDonorData();
    this.setupEventListeners();
  }

  /**
   * Load and display donor data
   * In a real implementation, this would fetch from a database
   */
  loadDonorData() {
    // Sample donor data - in production this would come from your backend
    const sampleDonors = [
      {
        name: "Anonymous Educator",
        level: "gold",
        amount: 100,
        date: "2025-01-15",
      },
      { name: "Dr. Sarah M.", level: "silver", amount: 25, date: "2025-01-14" },
      {
        name: "Ethics Researcher",
        level: "premium",
        amount: 250,
        date: "2025-01-12",
      },
      { name: "AI Student", level: "bronze", amount: 10, date: "2025-01-10" },
      { name: "Professor Chen", level: "gold", amount: 75, date: "2025-01-08" },
    ];

    this.displayDonors(sampleDonors);
  }

  /**
   * Display donor badges in the recognition section
   */
  displayDonors(donors) {
    if (!this.donorList) return;

    // Clear existing content
    this.donorList.innerHTML = "";

    if (donors.length === 0) {
      this.donorList.innerHTML = `
        <p class="no-donors-message">
          Be the first to support our mission! 
          <a href="donate.html" class="inline-link">Make a contribution</a>
        </p>
      `;
      return;
    }

    // Sort donors by date (most recent first)
    const sortedDonors = donors.sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );

    // Display recent donors (last 10)
    const recentDonors = sortedDonors.slice(0, 10);

    recentDonors.forEach((donor) => {
      const donorBadge = this.createDonorBadge(donor);
      this.donorList.appendChild(donorBadge);
    });

    // Add summary statistics
    this.addDonorStats(donors);
  }

  /**
   * Create a donor badge element
   */
  createDonorBadge(donor) {
    const badge = document.createElement("div");
    badge.className = `donor-badge ${donor.level}`;

    const icon = this.getDonorIcon(donor.level);
    const displayName = this.formatDonorName(donor.name);

    badge.innerHTML = `
      <span class="donor-icon">${icon}</span>
      <span class="donor-name">${displayName}</span>
    `;

    badge.title = `Thank you ${donor.name} for your $${donor.amount} contribution!`;

    return badge;
  }

  /**
   * Get appropriate icon for donor level
   */
  getDonorIcon(level) {
    const icons = {
      premium: "💎",
      gold: "🏆",
      silver: "🥈",
      bronze: "🏅",
    };
    return icons[level] || "❤️";
  }

  /**
   * Format donor name for display
   */
  formatDonorName(name) {
    const MAX_NAME_LENGTH = 20;
    const TRUNCATE_LENGTH = 17;
    const ELLIPSIS = "...";

    // If name is too long, truncate it
    if (name.length > MAX_NAME_LENGTH) {
      return `${name.substring(0, TRUNCATE_LENGTH)}${ELLIPSIS}`;
    }
    return name;
  }

  /**
   * Add summary statistics about donations
   */
  addDonorStats(donors) {
    const totalAmount = donors.reduce((sum, donor) => sum + donor.amount, 0);
    const donorCount = donors.length;

    const statsElement = document.createElement("div");
    statsElement.className = "donor-stats";
    statsElement.innerHTML = `
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-number">${donorCount}</span>
          <span class="stat-label">Contributors</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">$${totalAmount.toLocaleString()}</span>
          <span class="stat-label">Raised</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">${this.calculateProgress(totalAmount)}%</span>
          <span class="stat-label">Progress</span>
        </div>
      </div>
    `;

    // Insert stats after the donor list
    this.donorList.parentNode.appendChild(statsElement);
  }

  /**
   * Calculate progress towards funding goals
   */
  calculateProgress(totalAmount) {
    // Example: $5000 funding goal
    const goal = 5000;
    return Math.min(Math.round((totalAmount / goal) * 100), 100);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Listen for donation events to refresh the display
    document.addEventListener("donation-completed", () => {
      this.loadDonorData();
    });

    // Add hover effects to donor badges
    if (this.donorList) {
      this.donorList.addEventListener(
        "mouseenter",
        (e) => {
          if (e.target.classList.contains("donor-badge")) {
            this.animateBadge(e.target, "enter");
          }
        },
        true,
      );

      this.donorList.addEventListener(
        "mouseleave",
        (e) => {
          if (e.target.classList.contains("donor-badge")) {
            this.animateBadge(e.target, "leave");
          }
        },
        true,
      );
    }
  }

  /**
   * Animate donor badge on hover
   */
  animateBadge(badge, action) {
    if (action === "enter") {
      badge.style.transform = "scale(1.1)";
      badge.style.zIndex = "10";
    } else {
      badge.style.transform = "";
      badge.style.zIndex = "";
    }
  }

  /**
   * Add a new donor (called when donation is completed)
   */
  addNewDonor(_donorData) {
    // In a real implementation, this would make an API call
    // For now, we'll just refresh the display
    this.loadDonorData();
  }
}

// Initialize donor appreciation when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new DonorAppreciation();
});

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = DonorAppreciation;
}

export default DonorAppreciation;
