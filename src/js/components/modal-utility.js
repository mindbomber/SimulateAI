/**
 * Simple Modal Utility using advanced-ui-components.css modal system
 * Replacement for ReusableModal to consolidate modal implementations
 */

import logger from "../utils/logger.js";

class ModalUtility {
  constructor({
    title = "",
    content = "",
    footer = "",
    onClose = null,
    closeOnBackdrop = true,
    closeOnEscape = true,
    className = "",
    size = "medium",
  } = {}) {
    this.title = title;
    this.content = content;
    this.footer = footer;
    this.onClose = onClose;
    this.closeOnBackdrop = closeOnBackdrop;
    this.closeOnEscape = closeOnEscape;
    this.className = className;
    this.size = size;
    this.isOpen = false;
    this.element = null;

    // Generate unique ID using timestamp and random string
    const BASE_36 = 36;
    const RANDOM_STRING_LENGTH = 9;
    this.id = `modal-${Date.now()}-${Math.random()
      .toString(BASE_36)
      .substring(2, RANDOM_STRING_LENGTH + 2)}`;

    this._build();
    this._setupEventListeners();
  }

  _build() {
    // Create modal structure using advanced-ui-components.css classes
    this.element = document.createElement("div");
    this.element.id = this.id;
    this.element.className = `modal-backdrop${this.className ? ` ${this.className}` : ""}`;
    this.element.setAttribute("role", "dialog");
    this.element.setAttribute("aria-modal", "true");
    this.element.setAttribute("aria-labelledby", `${this.id}-title`);
    this.element.style.display = "none";
    // Use inert instead of aria-hidden for better accessibility
    this.element.inert = true;

    this.element.innerHTML = `
            <div class="modal-dialog modal-${this.size}">
                <div class="modal-header">
                    <h2 id="${this.id}-title" class="modal-title">${this.title}</h2>
                    <button class="modal-close" aria-label="Close modal" type="button">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    ${this.content}
                </div>
                ${
                  this.footer
                    ? `
                    <div class="modal-footer">
                        ${this.footer}
                    </div>
                `
                    : ""
                }
            </div>
        `;

    document.body.appendChild(this.element);
  }

  _setupEventListeners() {
    // Close button
    const closeBtn = this.element.querySelector(".modal-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.close());
    }

    // Backdrop click
    if (this.closeOnBackdrop) {
      this.element.addEventListener("click", (e) => {
        if (e.target === this.element) {
          this.close();
        }
      });
    }

    // Escape key
    if (this.closeOnEscape) {
      this._escapeHandler = (e) => {
        if (e.key === "Escape" && this.isOpen) {
          this.close();
        }
      };
      document.addEventListener("keydown", this._escapeHandler);
    }
  }

  open() {
    if (this.isOpen) return;

    this.isOpen = true;

    // Make modal interactable first
    this.element.inert = false;

    // Show the modal
    this.element.style.display = "flex";

    // Check if onboarding is active and adjust modal behavior accordingly
    const isOnboardingActive =
      document.body.classList.contains("onboarding-active");
    if (isOnboardingActive) {
      // Allow onboarding interactions by making modal backdrop less intrusive
      this.element.style.pointerEvents = "none";
      // But keep the modal dialog interactive
      const modalDialog = this.element.querySelector(".modal-dialog");
      if (modalDialog) {
        modalDialog.style.pointerEvents = "auto";
      }
    }

    // Make the rest of the page non-interactable while modal is open
    this._setPageInert(true);

    // Add visible class in next frame for CSS transition
    requestAnimationFrame(() => {
      this.element.classList.add("visible");
    });

    // Focus management - delay to ensure modal is visible and transition started
    setTimeout(() => {
      const firstFocusable = this.element.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }, 100);

    // Add body class to prevent scrolling
    document.body.style.overflow = "hidden";
  }

  close() {
    if (!this.isOpen) return;

    this.isOpen = false;
    this.element.classList.remove("visible");

    // Make modal non-interactable
    this.element.inert = true;

    // Restore normal pointer events for modal
    this.element.style.pointerEvents = "";
    const modalDialog = this.element.querySelector(".modal-dialog");
    if (modalDialog) {
      modalDialog.style.pointerEvents = "";
    }

    // Restore page interactability
    this._setPageInert(false);

    // Wait for animation before hiding
    const animationDuration = 300; // ms
    setTimeout(() => {
      if (!this.isOpen) {
        // Double check in case modal was reopened
        this.element.style.display = "none";
      }
    }, animationDuration);

    // Restore body scrolling
    document.body.style.overflow = "";

    // Call onClose callback if provided
    if (this.onClose && typeof this.onClose === "function") {
      this.onClose();
    }
  }

  _setPageInert(inert) {
    // Get all direct children of body except our modal and onboarding elements
    const bodyChildren = Array.from(document.body.children);
    bodyChildren.forEach((child) => {
      if (
        child !== this.element &&
        !child.classList.contains("onboarding-overlay") &&
        !child.classList.contains("onboarding-spotlight") &&
        !child.classList.contains("onboarding-coach-mark")
      ) {
        child.inert = inert;
      }
    });
  }

  destroy() {
    this.close();

    if (this._escapeHandler) {
      document.removeEventListener("keydown", this._escapeHandler);
    }

    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }

    this.element = null;
  }

  /**
   * Check if modal element exists in DOM and clean up if orphaned
   */
  static cleanupOrphanedModals() {
    // Clean up modals with generated IDs
    const orphanedModals = document.querySelectorAll(
      '[id^="modal-"]:not([style*="display: flex"])',
    );
    orphanedModals.forEach((modal) => {
      // Check if modal is hidden or has no active class
      if (
        modal.style.display === "none" ||
        !modal.classList.contains("visible")
      ) {
        modal.remove();
        logger.info("ModalUtility", "Cleaned up orphaned modal:", modal.id);
      }
    });

    // Clean up generic modal structure elements that may be orphaned
    const modalBackdrops = document.querySelectorAll(".modal-backdrop");
    modalBackdrops.forEach((backdrop) => {
      // Check if backdrop has no visible content or is empty
      const hasVisibleContent = backdrop.querySelector(
        ".modal-dialog .modal-body *:not(:empty)",
      );
      const hasActiveModal =
        backdrop.closest('[id^="modal-"]') ||
        backdrop.querySelector('[id^="modal-"]');

      if (!hasVisibleContent && !hasActiveModal) {
        backdrop.remove();
        logger.info("ModalUtility", "Cleaned up orphaned modal backdrop");
      }
    });

    // Clean up simulation modal specifically
    const simulationModal = document.getElementById("simulation-modal");
    if (simulationModal) {
      // Check if it's actually being used
      const isVisible =
        simulationModal.style.display === "flex" ||
        simulationModal.classList.contains("show") ||
        simulationModal.classList.contains("visible");

      if (!isVisible) {
        simulationModal.remove();
        logger.info("ModalUtility", "Cleaned up orphaned simulation modal");
      }
    }

    // Clean up any standalone modal-dialog or modal-body elements
    const orphanedDialogs = document.querySelectorAll(
      ".modal-dialog:not(.modal-backdrop .modal-dialog)",
    );
    orphanedDialogs.forEach((dialog) => {
      if (
        !dialog.closest(".modal-backdrop") &&
        !dialog.closest('[id^="modal-"]')
      ) {
        dialog.remove();
        logger.info("ModalUtility", "Cleaned up orphaned modal dialog");
      }
    });

    const orphanedBodies = document.querySelectorAll(
      ".modal-body:not(.modal-dialog .modal-body)",
    );
    orphanedBodies.forEach((body) => {
      if (!body.closest(".modal-dialog") && !body.closest('[id^="modal-"]')) {
        body.remove();
        logger.info("ModalUtility", "Cleaned up orphaned modal body");
      }
    });
  }

  /**
   * Force destroy a specific modal by ID
   */
  static destroyModalById(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.remove();
      logger.info("ModalUtility", "Force destroyed modal:", modalId);
      return true;
    }
    return false;
  }

  /**
   * Aggressive cleanup of all modal-related elements - use with caution
   * This removes ALL modal elements that are not actively displayed
   */
  static aggressiveModalCleanup() {
    logger.info("ModalUtility", "Starting aggressive modal cleanup");

    // Clean up all modal backdrops that are not actively showing content
    const allBackdrops = document.querySelectorAll(".modal-backdrop");
    allBackdrops.forEach((backdrop) => {
      const isVisible =
        backdrop.style.display === "flex" ||
        backdrop.classList.contains("show") ||
        backdrop.classList.contains("visible");

      if (!isVisible) {
        backdrop.remove();
        logger.info("ModalUtility", "Aggressively removed modal backdrop");
      }
    });

    // Clean up simulation modal if not active
    const simulationModal = document.getElementById("simulation-modal");
    if (simulationModal) {
      const isActive =
        simulationModal.style.display === "flex" ||
        simulationModal.classList.contains("show") ||
        simulationModal.classList.contains("visible");

      if (!isActive) {
        simulationModal.remove();
        logger.info("ModalUtility", "Aggressively removed simulation modal");
      }
    }

    // Clean up all orphaned modal dialogs
    const allDialogs = document.querySelectorAll(".modal-dialog");
    allDialogs.forEach((dialog) => {
      const hasActiveParent =
        dialog.closest('.modal-backdrop[style*="display: flex"]') ||
        dialog.closest('[id^="modal-"][style*="display: flex"]') ||
        dialog.closest(".show") ||
        dialog.closest(".visible");

      if (!hasActiveParent) {
        dialog.remove();
        logger.info("ModalUtility", "Aggressively removed modal dialog");
      }
    });

    // Clean up all orphaned modal bodies
    const allBodies = document.querySelectorAll(".modal-body");
    allBodies.forEach((body) => {
      const hasActiveParent =
        body.closest(".modal-dialog") ||
        body.closest('.modal-backdrop[style*="display: flex"]') ||
        body.closest('[id^="modal-"][style*="display: flex"]') ||
        body.closest(".show") ||
        body.closest(".visible");

      if (!hasActiveParent) {
        body.remove();
        logger.info("ModalUtility", "Aggressively removed modal body");
      }
    });

    // Clean up any remaining modal elements with generated IDs
    const allGeneratedModals = document.querySelectorAll('[id^="modal-"]');
    allGeneratedModals.forEach((modal) => {
      const isVisible =
        modal.style.display === "flex" ||
        modal.classList.contains("show") ||
        modal.classList.contains("visible");

      if (!isVisible) {
        modal.remove();
        logger.info(
          "ModalUtility",
          "Aggressively removed generated modal:",
          modal.id,
        );
      }
    });

    logger.info("ModalUtility", "Aggressive modal cleanup completed");
  }

  // Update content methods
  setTitle(title) {
    this.title = title;
    const titleEl = this.element.querySelector(".modal-title");
    if (titleEl) {
      titleEl.textContent = title;
    }
  }

  setContent(content) {
    this.content = content;
    const bodyEl = this.element.querySelector(".modal-body");
    if (bodyEl) {
      bodyEl.innerHTML = content;
    }
  }

  setFooter(footer) {
    this.footer = footer;
    let footerEl = this.element.querySelector(".modal-footer");

    if (footer) {
      if (!footerEl) {
        footerEl = document.createElement("div");
        footerEl.className = "modal-footer";
        this.element.querySelector(".modal-dialog").appendChild(footerEl);
      }
      footerEl.innerHTML = footer;
    } else if (footerEl) {
      footerEl.remove();
    }
  }
}

// Export for both ES6 and global usage
export default ModalUtility;

// Make available globally for backward compatibility
if (typeof window !== "undefined") {
  window.ModalUtility = ModalUtility;
  // Also provide as ModalDialog for auth service compatibility
  window.ModalDialog = ModalUtility;
  // TEMPORARILY COMMENTED OUT - might be causing conflicts
  // Also provide as ReusableModal for drop-in replacement
  // window.ReusableModal = ModalUtility;
}
