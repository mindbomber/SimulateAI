/**
 * Enhanced Modal Component Coordinator - Phase 3 Component Integration
 * Consolidates and coordinates multiple modal systems for better integration
 *
 * Consolidates:
 * - modal-utility.js (418 lines)
 * - reusable-modal.js (~100 lines)
 * - Multiple modal coordination patterns across components
 *
 * @version 3.0.0 - Unified Modal Architecture
 * @author SimulateAI Development Team
 */

import logger from "../utils/logger.js";
import scrollLockManager from "../utils/scroll-lock-manager.js";

// Enhanced modal constants
const MODAL_CONSTANTS = {
  CLOSE_ANIMATION_DELAY: 200,
  MODAL_Z_INDEX_BASE: 1000,
  MODAL_Z_INDEX_INCREMENT: 10,
  MODAL_STACK_LIMIT: 5,
  CLEANUP_DELAY: 300,
  BACKDROP_TRANSITION: 150,
  MODAL_TRANSITION: 200,
  FOCUS_TRAP_DELAY: 50,
};

// Modal size configurations
const MODAL_SIZES = {
  small: { width: "400px", maxWidth: "90vw" },
  medium: { width: "600px", maxWidth: "90vw" },
  large: { width: "800px", maxWidth: "95vw" },
  xlarge: { width: "1000px", maxWidth: "98vw" },
  fullscreen: { width: "100vw", height: "100vh" },
};

// Modal event types
const MODAL_EVENTS = {
  BEFORE_OPEN: "modal:before-open",
  OPENED: "modal:opened",
  BEFORE_CLOSE: "modal:before-close",
  CLOSED: "modal:closed",
  STACK_CHANGE: "modal:stack-change",
};

/**
 * Modal Stack Manager - Coordinates multiple modals
 */
class ModalStackManager {
  constructor() {
    this.stack = [];
    this.listeners = new Map();
  }

  push(modal) {
    if (this.stack.length >= MODAL_CONSTANTS.MODAL_STACK_LIMIT) {
      logger.warn("ModalStackManager", "Modal stack limit reached", {
        limit: MODAL_CONSTANTS.MODAL_STACK_LIMIT,
      });
      return false;
    }

    this.stack.push(modal);
    this.updateZIndices();
    this.emit(MODAL_EVENTS.STACK_CHANGE, { stack: this.stack });

    logger.debug("ModalStackManager", "Modal added to stack", {
      stackSize: this.stack.length,
      modalId: modal.id,
    });

    return true;
  }

  pop(modal) {
    const index = this.stack.findIndex((m) => m.id === modal.id);
    if (index !== -1) {
      this.stack.splice(index, 1);
      this.updateZIndices();
      this.emit(MODAL_EVENTS.STACK_CHANGE, { stack: this.stack });

      logger.debug("ModalStackManager", "Modal removed from stack", {
        stackSize: this.stack.length,
        modalId: modal.id,
      });

      return true;
    }
    return false;
  }

  getTop() {
    return this.stack.length > 0 ? this.stack[this.stack.length - 1] : null;
  }

  getAll() {
    return [...this.stack];
  }

  updateZIndices() {
    this.stack.forEach((modal, index) => {
      const zIndex =
        MODAL_CONSTANTS.MODAL_Z_INDEX_BASE +
        index * MODAL_CONSTANTS.MODAL_Z_INDEX_INCREMENT;
      modal.updateZIndex(zIndex);
    });
  }

  closeAll() {
    const modalsToClose = [...this.stack];
    modalsToClose.reverse().forEach((modal) => {
      modal.close();
    });
  }

  on(event, listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(listener);
  }

  off(event, listener) {
    if (this.listeners.has(event)) {
      const listeners = this.listeners.get(event);
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          logger.error("ModalStackManager", "Event listener error", {
            event,
            error,
          });
        }
      });
    }
  }
}

// Global modal stack manager instance
const modalStackManager = new ModalStackManager();

/**
 * Enhanced Modal Class - Unified modal implementation
 */
export class EnhancedModal {
  constructor(options = {}) {
    this.id = this.generateId();
    this.options = {
      title: "",
      content: "",
      footer: "",
      size: "medium",
      closeOnBackdrop: true,
      closeOnEscape: true,
      showCloseButton: true,
      keyboard: true,
      backdrop: true,
      animation: true,
      focus: true,
      trapFocus: true,
      restoreScrollPosition: true,
      className: "",
      onBeforeOpen: null,
      onOpen: null,
      onBeforeClose: null,
      onClose: null,
      ...options,
    };

    this.element = null;
    this.backdrop = null;
    this.isOpen = false;
    this.isAnimating = false;
    this.focusTrap = null;
    this.originalActiveElement = null;
    this.scrollPosition = { x: 0, y: 0 };
    this.zIndex = MODAL_CONSTANTS.MODAL_Z_INDEX_BASE;

    this.eventHandlers = {
      keydown: this.handleKeydown.bind(this),
      click: this.handleClick.bind(this),
      resize: this.handleResize.bind(this),
    };

    this.build();
    logger.debug("EnhancedModal", "Modal created", {
      id: this.id,
      options: this.options,
    });
  }

  generateId() {
    return `enhanced-modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  build() {
    // Create backdrop
    if (this.options.backdrop) {
      this.backdrop = document.createElement("div");
      this.backdrop.className = "enhanced-modal-backdrop";
      this.backdrop.setAttribute("aria-hidden", "true");
    }

    // Create modal container
    this.element = document.createElement("div");
    this.element.className = `enhanced-modal enhanced-modal-${this.options.size}`;
    this.element.id = this.id;
    this.element.setAttribute("role", "dialog");
    this.element.setAttribute("aria-modal", "true");
    this.element.setAttribute("tabindex", "-1");

    if (this.options.className) {
      this.element.classList.add(this.options.className);
    }

    // Create modal dialog
    const dialog = document.createElement("div");
    dialog.className = "enhanced-modal-dialog";

    // Create modal content
    const content = document.createElement("div");
    content.className = "enhanced-modal-content";

    // Header
    if (this.options.title || this.options.showCloseButton) {
      const header = this.createHeader();
      content.appendChild(header);
    }

    // Body
    const body = this.createBody();
    content.appendChild(body);

    // Footer
    if (this.options.footer) {
      const footer = this.createFooter();
      content.appendChild(footer);
    }

    dialog.appendChild(content);
    this.element.appendChild(dialog);

    this.setupEventListeners();
  }

  createHeader() {
    const header = document.createElement("div");
    header.className = "enhanced-modal-header";

    if (this.options.title) {
      const title = document.createElement("h3");
      title.className = "enhanced-modal-title";
      title.textContent = this.options.title;
      title.id = `${this.id}-title`;
      this.element.setAttribute("aria-labelledby", `${this.id}-title`);
      header.appendChild(title);
    }

    if (this.options.showCloseButton) {
      const closeButton = document.createElement("button");
      closeButton.type = "button";
      closeButton.className = "enhanced-modal-close";
      closeButton.setAttribute("aria-label", "Close modal");
      closeButton.innerHTML = "&times;";
      closeButton.addEventListener("click", () => this.close());
      header.appendChild(closeButton);
    }

    return header;
  }

  createBody() {
    const body = document.createElement("div");
    body.className = "enhanced-modal-body";
    body.id = `${this.id}-body`;

    if (this.options.content) {
      if (typeof this.options.content === "string") {
        body.innerHTML = this.options.content;
      } else if (this.options.content instanceof Node) {
        body.appendChild(this.options.content);
      }
    }

    return body;
  }

  createFooter() {
    const footer = document.createElement("div");
    footer.className = "enhanced-modal-footer";

    if (typeof this.options.footer === "string") {
      footer.innerHTML = this.options.footer;
    } else if (this.options.footer instanceof Node) {
      footer.appendChild(this.options.footer);
    }

    return footer;
  }

  setupEventListeners() {
    if (this.options.closeOnEscape || this.options.keyboard) {
      document.addEventListener("keydown", this.eventHandlers.keydown);
    }

    if (this.options.closeOnBackdrop && this.backdrop) {
      this.backdrop.addEventListener("click", this.eventHandlers.click);
    }

    window.addEventListener("resize", this.eventHandlers.resize);
  }

  removeEventListeners() {
    document.removeEventListener("keydown", this.eventHandlers.keydown);

    if (this.backdrop) {
      this.backdrop.removeEventListener("click", this.eventHandlers.click);
    }

    window.removeEventListener("resize", this.eventHandlers.resize);
  }

  handleKeydown(event) {
    if (!this.isOpen || this.isAnimating) return;

    // Only handle events for the top modal
    const topModal = modalStackManager.getTop();
    if (topModal && topModal.id !== this.id) return;

    if (event.key === "Escape" && this.options.closeOnEscape) {
      event.preventDefault();
      this.close();
    }

    // Handle tab trapping
    if (event.key === "Tab" && this.options.trapFocus) {
      this.handleTabTrapping(event);
    }
  }

  handleClick(event) {
    if (event.target === this.backdrop && this.options.closeOnBackdrop) {
      this.close();
    }
  }

  handleResize() {
    if (this.isOpen) {
      this.updatePosition();
    }
  }

  handleTabTrapping(event) {
    const focusableElements = this.getFocusableElements();
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  }

  getFocusableElements() {
    const focusableSelectors = [
      "button:not([disabled])",
      "input:not([disabled])",
      "textarea:not([disabled])",
      "select:not([disabled])",
      "a[href]",
      '[tabindex]:not([tabindex="-1"])',
    ].join(", ");

    return Array.from(this.element.querySelectorAll(focusableSelectors)).filter(
      (el) => el.offsetParent !== null,
    ); // Only visible elements
  }

  async open() {
    if (this.isOpen || this.isAnimating) {
      logger.warn("EnhancedModal", "Modal already open or animating", {
        id: this.id,
      });
      return;
    }

    logger.debug("EnhancedModal", "Opening modal", { id: this.id });

    // Emit before open event
    this.emit(MODAL_EVENTS.BEFORE_OPEN);
    if (this.options.onBeforeOpen) {
      const result = await this.options.onBeforeOpen();
      if (result === false) {
        logger.debug("EnhancedModal", "Modal open cancelled by onBeforeOpen", {
          id: this.id,
        });
        return;
      }
    }

    this.isAnimating = true;

    // Store scroll position
    if (this.options.restoreScrollPosition) {
      this.scrollPosition = {
        x: window.pageXOffset || document.documentElement.scrollLeft,
        y: window.pageYOffset || document.documentElement.scrollTop,
      };
    }

    // Store current active element for focus restoration
    this.originalActiveElement = document.activeElement;

    // Add to modal stack
    modalStackManager.push(this);

    // Add to DOM
    if (this.backdrop) {
      document.body.appendChild(this.backdrop);
    }
    document.body.appendChild(this.element);

    // Prevent body scroll
    this.setBodyScrolling(false);

    // Apply initial styles
    this.applyOpenStyles();

    // Trigger reflow for smooth animation
    this.element.offsetHeight;

    // Start opening animation
    if (this.options.animation) {
      await this.animateOpen();
    } else {
      this.finishOpen();
    }
  }

  async close() {
    if (!this.isOpen || this.isAnimating) {
      logger.warn("EnhancedModal", "Modal not open or already animating", {
        id: this.id,
      });
      return;
    }

    logger.debug("EnhancedModal", "Closing modal", { id: this.id });

    // Emit before close event
    this.emit(MODAL_EVENTS.BEFORE_CLOSE);
    if (this.options.onBeforeClose) {
      const result = await this.options.onBeforeClose();
      if (result === false) {
        logger.debug(
          "EnhancedModal",
          "Modal close cancelled by onBeforeClose",
          { id: this.id },
        );
        return;
      }
    }

    this.isAnimating = true;

    // Remove from modal stack
    modalStackManager.pop(this);

    // Start closing animation
    if (this.options.animation) {
      await this.animateClose();
    } else {
      this.finishClose();
    }
  }

  applyOpenStyles() {
    if (this.backdrop) {
      this.backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: ${this.zIndex - 1};
        opacity: 0;
        transition: opacity ${MODAL_CONSTANTS.BACKDROP_TRANSITION}ms ease-out;
      `;
    }

    const sizeConfig = MODAL_SIZES[this.options.size] || MODAL_SIZES.medium;

    this.element.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: ${this.zIndex};
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transform: scale(0.9);
      transition: opacity ${MODAL_CONSTANTS.MODAL_TRANSITION}ms ease-out,
                  transform ${MODAL_CONSTANTS.MODAL_TRANSITION}ms ease-out;
    `;

    const dialog = this.element.querySelector(".enhanced-modal-dialog");
    if (dialog) {
      dialog.style.cssText = `
        background: white;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        width: ${sizeConfig.width};
        max-width: ${sizeConfig.maxWidth};
        max-height: 90vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      `;

      if (sizeConfig.height) {
        dialog.style.height = sizeConfig.height;
      }
    }
  }

  async animateOpen() {
    return new Promise((resolve) => {
      // Start animations
      if (this.backdrop) {
        this.backdrop.style.opacity = "1";
      }

      this.element.style.opacity = "1";
      this.element.style.transform = "scale(1)";

      setTimeout(() => {
        this.finishOpen();
        resolve();
      }, MODAL_CONSTANTS.MODAL_TRANSITION);
    });
  }

  async animateClose() {
    return new Promise((resolve) => {
      // Start animations
      if (this.backdrop) {
        this.backdrop.style.opacity = "0";
      }

      this.element.style.opacity = "0";
      this.element.style.transform = "scale(0.9)";

      setTimeout(() => {
        this.finishClose();
        resolve();
      }, MODAL_CONSTANTS.MODAL_TRANSITION);
    });
  }

  finishOpen() {
    this.isOpen = true;
    this.isAnimating = false;

    // Setup focus management
    if (this.options.focus) {
      setTimeout(() => {
        this.setInitialFocus();
      }, MODAL_CONSTANTS.FOCUS_TRAP_DELAY);
    }

    // Emit opened event
    this.emit(MODAL_EVENTS.OPENED);
    if (this.options.onOpen) {
      this.options.onOpen();
    }

    logger.debug("EnhancedModal", "Modal opened successfully", { id: this.id });
  }

  finishClose() {
    this.isOpen = false;
    this.isAnimating = false;

    // Remove from DOM
    if (this.backdrop && this.backdrop.parentNode) {
      this.backdrop.parentNode.removeChild(this.backdrop);
    }

    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }

    // Restore body scrolling if no other modals
    if (modalStackManager.getAll().length === 0) {
      this.setBodyScrolling(true);

      // Restore scroll position
      if (this.options.restoreScrollPosition) {
        window.scrollTo(this.scrollPosition.x, this.scrollPosition.y);
      }
    }

    // Restore focus
    if (this.originalActiveElement && this.options.focus) {
      try {
        this.originalActiveElement.focus();
      } catch (error) {
        // Focus restoration failed, focus body instead
        document.body.focus();
      }
    }

    // Remove event listeners
    this.removeEventListeners();

    // Emit closed event
    this.emit(MODAL_EVENTS.CLOSED);
    if (this.options.onClose) {
      this.options.onClose();
    }

    logger.debug("EnhancedModal", "Modal closed successfully", { id: this.id });
  }

  setInitialFocus() {
    const focusableElements = this.getFocusableElements();
    const autofocusElement = this.element.querySelector("[autofocus]");

    if (autofocusElement) {
      autofocusElement.focus();
    } else if (focusableElements.length > 0) {
      focusableElements[0].focus();
    } else {
      this.element.focus();
    }
  }

  setBodyScrolling(enabled) {
    if (enabled) {
      scrollLockManager.unlock('enhanced-modal');
    } else {
      scrollLockManager.lock('enhanced-modal');
    }
  }

  updatePosition() {
    // Recalculate position if needed
    // This method can be overridden for custom positioning
  }

  updateZIndex(zIndex) {
    this.zIndex = zIndex;
    if (this.backdrop) {
      this.backdrop.style.zIndex = zIndex - 1;
    }
    this.element.style.zIndex = zIndex;
  }

  // Content management methods
  setTitle(title) {
    this.options.title = title;
    const titleElement = this.element.querySelector(".enhanced-modal-title");
    if (titleElement) {
      titleElement.textContent = title;
    }
  }

  setContent(content) {
    this.options.content = content;
    const bodyElement = this.element.querySelector(".enhanced-modal-body");
    if (bodyElement) {
      if (typeof content === "string") {
        bodyElement.innerHTML = content;
      } else if (content instanceof Node) {
        bodyElement.innerHTML = "";
        bodyElement.appendChild(content);
      }
    }
  }

  setFooter(footer) {
    this.options.footer = footer;
    let footerElement = this.element.querySelector(".enhanced-modal-footer");

    if (footer) {
      if (!footerElement) {
        footerElement = this.createFooter();
        this.element
          .querySelector(".enhanced-modal-content")
          .appendChild(footerElement);
      }

      if (typeof footer === "string") {
        footerElement.innerHTML = footer;
      } else if (footer instanceof Node) {
        footerElement.innerHTML = "";
        footerElement.appendChild(footer);
      }
    } else if (footerElement) {
      footerElement.remove();
    }
  }

  // Event system
  emit(event, data = {}) {
    const customEvent = new CustomEvent(event, {
      detail: { modal: this, ...data },
    });
    this.element.dispatchEvent(customEvent);
  }

  on(event, listener) {
    this.element.addEventListener(event, listener);
  }

  off(event, listener) {
    this.element.removeEventListener(event, listener);
  }

  // Cleanup
  destroy() {
    if (this.isOpen) {
      this.close();
    }

    this.removeEventListeners();

    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }

    if (this.backdrop && this.backdrop.parentNode) {
      this.backdrop.parentNode.removeChild(this.backdrop);
    }

    modalStackManager.pop(this);

    logger.debug("EnhancedModal", "Modal destroyed", { id: this.id });
  }
}

/**
 * Modal Utility Class - Provides static methods for common modal operations
 */
export class ModalUtility {
  static instances = new Map();

  // Backward compatibility with existing ModalUtility
  constructor(options = {}) {
    const modal = new EnhancedModal(options);
    this.modal = modal;
    this.element = modal.element;
    this.options = modal.options;

    // Store instance for static methods
    ModalUtility.instances.set(modal.id, modal);

    return modal; // Return the enhanced modal directly
  }

  static create(options = {}) {
    return new ModalUtility(options);
  }

  static alert(message, title = "Alert") {
    const modal = new EnhancedModal({
      title,
      content: `<p>${message}</p>`,
      footer:
        '<button type="button" class="btn btn-primary modal-confirm">OK</button>',
      closeOnBackdrop: false,
      closeOnEscape: true,
      size: "small",
    });

    return new Promise((resolve) => {
      modal.on("click", (event) => {
        if (event.target.classList.contains("modal-confirm")) {
          modal.close();
          resolve(true);
        }
      });

      modal.open();
    });
  }

  static confirm(message, title = "Confirm") {
    const modal = new EnhancedModal({
      title,
      content: `<p>${message}</p>`,
      footer: `
        <button type="button" class="btn btn-secondary modal-cancel">Cancel</button>
        <button type="button" class="btn btn-primary modal-confirm">Confirm</button>
      `,
      closeOnBackdrop: false,
      closeOnEscape: true,
      size: "small",
    });

    return new Promise((resolve) => {
      modal.on("click", (event) => {
        if (event.target.classList.contains("modal-confirm")) {
          modal.close();
          resolve(true);
        } else if (event.target.classList.contains("modal-cancel")) {
          modal.close();
          resolve(false);
        }
      });

      modal.on(MODAL_EVENTS.CLOSED, () => {
        // If closed without button click, assume cancel
        resolve(false);
      });

      modal.open();
    });
  }

  static prompt(message, defaultValue = "", title = "Input") {
    const modal = new EnhancedModal({
      title,
      content: `
        <p>${message}</p>
        <input type="text" class="form-control modal-input" value="${defaultValue}" placeholder="Enter value...">
      `,
      footer: `
        <button type="button" class="btn btn-secondary modal-cancel">Cancel</button>
        <button type="button" class="btn btn-primary modal-confirm">OK</button>
      `,
      closeOnBackdrop: false,
      closeOnEscape: true,
      size: "small",
    });

    return new Promise((resolve) => {
      modal.on("click", (event) => {
        const input = modal.element.querySelector(".modal-input");

        if (event.target.classList.contains("modal-confirm")) {
          modal.close();
          resolve(input ? input.value : null);
        } else if (event.target.classList.contains("modal-cancel")) {
          modal.close();
          resolve(null);
        }
      });

      modal.on(MODAL_EVENTS.OPENED, () => {
        const input = modal.element.querySelector(".modal-input");
        if (input) {
          input.focus();
          input.select();
        }
      });

      modal.on(MODAL_EVENTS.CLOSED, () => {
        resolve(null);
      });

      modal.open();
    });
  }

  // Cleanup methods for backward compatibility
  static cleanupOrphanedModals() {
    const orphanedModals = document.querySelectorAll(
      '.modal-backdrop, [id^="modal-"]:not([style*="display: flex"])',
    );
    orphanedModals.forEach((modal) => {
      const isVisible =
        modal.style.display === "flex" ||
        modal.classList.contains("show") ||
        modal.classList.contains("visible");

      if (!isVisible) {
        modal.remove();
        logger.info("ModalUtility", "Cleaned up orphaned modal", {
          element: modal,
        });
      }
    });
  }

  static aggressiveModalCleanup() {
    logger.info("ModalUtility", "Starting aggressive modal cleanup");

    // Clean up all modal elements that are not currently visible
    const allModals = document.querySelectorAll(
      '.modal-backdrop, .modal, .enhanced-modal, [id^="modal-"], .scenario-modal, .pre-launch-modal',
    );

    allModals.forEach((modal) => {
      const isVisible =
        modal.style.display === "flex" ||
        modal.classList.contains("show") ||
        modal.classList.contains("visible") ||
        modal.style.visibility !== "hidden";

      if (!isVisible) {
        modal.remove();
        logger.info("ModalUtility", "Aggressively removed modal", {
          className: modal.className,
        });
      }
    });

    // Restore body scrolling
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";

    logger.info("ModalUtility", "Aggressive modal cleanup completed");
  }

  static destroyModalById(modalId) {
    const modal = this.instances.get(modalId);
    if (modal) {
      modal.destroy();
      this.instances.delete(modalId);
      return true;
    }

    // Fallback: try to find and remove by DOM ID
    const element = document.getElementById(modalId);
    if (element) {
      element.remove();
      logger.info("ModalUtility", "Force destroyed modal by ID", { modalId });
      return true;
    }

    return false;
  }

  static closeAll() {
    modalStackManager.closeAll();
  }

  static getActiveModals() {
    return modalStackManager.getAll();
  }

  static getStackSize() {
    return modalStackManager.getAll().length;
  }
}

// Export enhanced components
export default EnhancedModal;
export { modalStackManager, MODAL_EVENTS, MODAL_CONSTANTS };

// Global availability for backward compatibility
if (typeof window !== "undefined") {
  window.EnhancedModal = EnhancedModal;
  window.ModalUtility = ModalUtility;
  window.ModalStackManager = modalStackManager;

  // For drop-in replacement compatibility
  window.ReusableModal = EnhancedModal;

  logger.info(
    "EnhancedModalSystem",
    "Enhanced modal system available globally",
  );
}
