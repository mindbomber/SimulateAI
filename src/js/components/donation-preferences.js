/**
 * Donation Preferences Manager
 * Allows users to control their donation visibility and message preferences
 */

class DonationPreferences {
  constructor() {
    this.isAuthenticated = false;
    this.currentUser = null;
    this.preferences = {
      visibility: "username", // 'username', 'anonymous', 'hidden'
      allowMessage: true,
      showAmount: false,
    };

    this.init();
  }

  init() {
    this.checkAuthState();
    this.loadUserPreferences();
    this.setupEventListeners();
  }

  /**
   * Check user authentication state
   */
  checkAuthState() {
    if (window.firebase && window.firebase.auth) {
      window.firebase.auth().onAuthStateChanged((user) => {
        this.isAuthenticated = !!user;
        this.currentUser = user;

        if (user) {
          this.loadUserPreferences();
        }
      });
    }
  }

  /**
   * Load user preferences from Firebase or localStorage
   */
  async loadUserPreferences() {
    if (this.isAuthenticated && window.firebase?.firestore) {
      try {
        const db = window.firebase.firestore();
        const userDoc = await db
          .collection("userPreferences")
          .doc(this.currentUser.uid)
          .get();

        if (userDoc.exists) {
          this.preferences = { ...this.preferences, ...userDoc.data() };
        }
      } catch (error) {
        console.error("Error loading user preferences:", error);
        // Fallback to localStorage
        this.loadFromLocalStorage();
      }
    } else {
      // Use localStorage for non-authenticated users
      this.loadFromLocalStorage();
    }
  }

  /**
   * Load preferences from localStorage
   */
  loadFromLocalStorage() {
    const saved = localStorage.getItem("donationPreferences");
    if (saved) {
      try {
        this.preferences = { ...this.preferences, ...JSON.parse(saved) };
      } catch (error) {
        console.error("Error parsing saved preferences:", error);
      }
    }
  }

  /**
   * Save user preferences
   */
  async savePreferences(newPreferences) {
    this.preferences = { ...this.preferences, ...newPreferences };

    if (this.isAuthenticated && window.firebase?.firestore) {
      try {
        const db = window.firebase.firestore();
        await db
          .collection("userPreferences")
          .doc(this.currentUser.uid)
          .set(this.preferences, { merge: true });
        console.log("✅ Preferences saved to Firebase");
      } catch (error) {
        console.error("Error saving preferences to Firebase:", error);
        // Fallback to localStorage
        this.saveToLocalStorage();
      }
    } else {
      this.saveToLocalStorage();
    }

    // Update UI
    this.updatePreferencesUI();

    // Show confirmation
    this.showSaveConfirmation();
  }

  /**
   * Save to localStorage
   */
  saveToLocalStorage() {
    localStorage.setItem(
      "donationPreferences",
      JSON.stringify(this.preferences),
    );
    console.log("✅ Preferences saved to localStorage");
  }

  /**
   * Get current visibility setting for donation processing
   */
  getVisibilityForDonation() {
    return this.preferences.visibility;
  }

  /**
   * Check if user allows donation messages
   */
  allowsMessages() {
    return this.preferences.allowMessage;
  }

  /**
   * Create preferences modal/panel
   */
  createPreferencesModal() {
    const modalHTML = `
      <div class="donation-preferences-modal" id="donation-preferences-modal" style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 10000;
      ">
        <div class="preferences-panel" style="
          background: white;
          border-radius: 12px;
          padding: 2rem;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        ">
          <div class="preferences-header" style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #e5e7eb;
          ">
            <h3 style="margin: 0; color: #1f2937;">🎛️ Donation Preferences</h3>
            <button class="close-preferences" style="
              background: none;
              border: none;
              font-size: 1.5rem;
              cursor: pointer;
              color: #6b7280;
            ">&times;</button>
          </div>

          <div class="preferences-content">
            <div class="preference-group" style="margin-bottom: 1.5rem;">
              <label style="
                display: block;
                font-weight: 600;
                margin-bottom: 0.5rem;
                color: #374151;
              ">👤 Visibility on Donor Wall</label>
              <div class="visibility-options" style="display: flex; flex-direction: column; gap: 0.5rem;">
                <label style="display: flex; align-items: center; gap: 0.5rem; font-weight: normal;">
                  <input type="radio" name="visibility" value="username" ${this.preferences.visibility === "username" ? "checked" : ""}>
                  <span>Show my name and message</span>
                </label>
                <label style="display: flex; align-items: center; gap: 0.5rem; font-weight: normal;">
                  <input type="radio" name="visibility" value="anonymous" ${this.preferences.visibility === "anonymous" ? "checked" : ""}>
                  <span>Show as "Anonymous Supporter"</span>
                </label>
                <label style="display: flex; align-items: center; gap: 0.5rem; font-weight: normal;">
                  <input type="radio" name="visibility" value="hidden" ${this.preferences.visibility === "hidden" ? "checked" : ""}>
                  <span>Don't display my donation</span>
                </label>
              </div>
            </div>

            <div class="preference-group" style="margin-bottom: 1.5rem;">
              <label style="
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-weight: 600;
                color: #374151;
              ">
                <input type="checkbox" id="allow-message" ${this.preferences.allowMessage ? "checked" : ""}>
                💬 Allow messages on my donor card
              </label>
              <p style="
                font-size: 0.875rem;
                color: #6b7280;
                margin: 0.5rem 0 0 1.5rem;
              ">You can add a personal message about why you support AI ethics research</p>
            </div>

            <div class="preference-group" style="margin-bottom: 2rem;">
              <label style="
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-weight: 600;
                color: #374151;
              ">
                <input type="checkbox" id="show-amount" ${this.preferences.showAmount ? "checked" : ""}>
                💰 Show donation amount (if visible)
              </label>
              <p style="
                font-size: 0.875rem;
                color: #6b7280;
                margin: 0.5rem 0 0 1.5rem;
              ">Display your contribution tier publicly</p>
            </div>

            <div class="preferences-actions" style="
              display: flex;
              gap: 1rem;
              justify-content: flex-end;
              padding-top: 1rem;
              border-top: 1px solid #e5e7eb;
            ">
              <button class="btn-cancel" style="
                padding: 0.5rem 1rem;
                border: 1px solid #d1d5db;
                background: white;
                border-radius: 6px;
                cursor: pointer;
              ">Cancel</button>
              <button class="btn-save" style="
                padding: 0.5rem 1rem;
                background: #3b82f6;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
              ">Save Preferences</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal if present
    const existing = document.getElementById("donation-preferences-modal");
    if (existing) {
      existing.remove();
    }

    // Add to DOM
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    // Setup modal event listeners
    this.setupModalEventListeners();
  }

  /**
   * Show preferences modal
   */
  showPreferencesModal() {
    this.createPreferencesModal();
    const modal = document.getElementById("donation-preferences-modal");
    if (modal) {
      modal.style.display = "flex";
    }
  }

  /**
   * Hide preferences modal
   */
  hidePreferencesModal() {
    const modal = document.getElementById("donation-preferences-modal");
    if (modal) {
      modal.style.display = "none";
    }
  }

  /**
   * Setup modal event listeners
   */
  setupModalEventListeners() {
    const modal = document.getElementById("donation-preferences-modal");
    if (!modal) return;

    // Close button
    modal.querySelector(".close-preferences").addEventListener("click", () => {
      this.hidePreferencesModal();
    });

    // Cancel button
    modal.querySelector(".btn-cancel").addEventListener("click", () => {
      this.hidePreferencesModal();
    });

    // Save button
    modal.querySelector(".btn-save").addEventListener("click", () => {
      this.savePreferencesFromModal();
    });

    // Click outside to close
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        this.hidePreferencesModal();
      }
    });
  }

  /**
   * Save preferences from modal form
   */
  savePreferencesFromModal() {
    const modal = document.getElementById("donation-preferences-modal");
    if (!modal) return;

    const visibilityRadio = modal.querySelector(
      'input[name="visibility"]:checked',
    );
    const allowMessage = modal.querySelector("#allow-message").checked;
    const showAmount = modal.querySelector("#show-amount").checked;

    const newPreferences = {
      visibility: visibilityRadio ? visibilityRadio.value : "username",
      allowMessage,
      showAmount,
    };

    this.savePreferences(newPreferences);
    this.hidePreferencesModal();
  }

  /**
   * Update preferences UI elements
   */
  updatePreferencesUI() {
    // Update any UI elements that show current preferences
    const statusElements = document.querySelectorAll(
      ".donation-preferences-status",
    );
    statusElements.forEach((element) => {
      element.textContent = this.getPreferencesStatusText();
    });
  }

  /**
   * Get preferences status text
   */
  getPreferencesStatusText() {
    const visibilityTexts = {
      username: "Showing name and messages",
      anonymous: "Anonymous supporter",
      hidden: "Hidden from donor wall",
    };

    return visibilityTexts[this.preferences.visibility] || "Default settings";
  }

  /**
   * Show save confirmation
   */
  showSaveConfirmation() {
    const notification = document.createElement("div");
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        font-family: var(--font-family);
      ">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span>✅</span>
          <span>Donation preferences saved!</span>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = "fadeOut 0.3s ease";
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 3000);
  }

  /**
   * Setup global event listeners
   */
  setupEventListeners() {
    // Listen for preference button clicks
    document.addEventListener("click", (e) => {
      if (
        e.target.matches(".donation-preferences-btn") ||
        e.target.closest(".donation-preferences-btn")
      ) {
        e.preventDefault();
        this.showPreferencesModal();
      }
    });
  }

  /**
   * Add preferences button to donation widgets
   */
  addPreferencesButton(container) {
    if (!container) return;

    const buttonHTML = `
      <button class="donation-preferences-btn" style="
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: rgba(255, 255, 255, 0.9);
        border-radius: 6px;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s ease;
        margin-top: 0.5rem;
      " onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='transparent'">
        <span>⚙️</span>
        <span>Donation Preferences</span>
      </button>
    `;

    container.insertAdjacentHTML("beforeend", buttonHTML);
  }

  // Static method for easy initialization
  static init() {
    if (!window.donationPreferences) {
      window.donationPreferences = new DonationPreferences();
    }
    return window.donationPreferences;
  }
}

// Auto-initialize
document.addEventListener("DOMContentLoaded", () => {
  DonationPreferences.init();
});

// Make available globally
window.DonationPreferences = DonationPreferences;

// Export for modules
if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = DonationPreferences;
}
