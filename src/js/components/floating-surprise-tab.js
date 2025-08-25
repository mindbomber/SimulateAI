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
 * Floating Surprise Tab Component
 * Professional floating "Surprise Me!" button that slides out on hover/click
 * Enhanced with DataHandler integration for comprehensive analytics and user preferences
 */

// Import DataHandler for enhanced data management
import DataHandler from "../core/data-handler.js";

// Constants
const SURPRISE_MOBILE_BREAKPOINT = 768;
const SURPRISE_MOBILE_AUTO_COLLAPSE_DELAY = 3000;
const SURPRISE_RIPPLE_DURATION = 600;
const SURPRISE_DEBOUNCE_DELAY = 300;
const SURPRISE_RIPPLE_DELAY = 50;
const SURPRISE_FEEDBACK_DURATION = 2000;

class FloatingSurpriseTab {
  constructor() {
    this.isExpanded = false;
    this.isMobile = window.innerWidth <= SURPRISE_MOBILE_BREAKPOINT;
    this.isInitialized = false;
    this.collapseTimeout = null;
    this.lastClickTime = 0;

    // Store bound event handlers to properly remove them later
    this.boundHandlers = {
      resize: this.handleResize.bind(this),
      mouseEnter: this.handleMouseEnter.bind(this),
      mouseLeave: this.handleMouseLeave.bind(this),
      touchStart: this.handleTouchStart.bind(this),
      touchEnd: this.handleTouchEnd.bind(this),
      mobileClick: this.handleMobileClick.bind(this),
      desktopClick: this.handleDesktopClick.bind(this),
      keyDown: this.handleKeyDown.bind(this),
      focus: this.handleFocus.bind(this),
      blur: this.handleBlur.bind(this),
    };

    // DataHandler integration for enhanced analytics and persistence
    this.dataHandler = null;
    this.initializeDataHandler();

    // Enhanced analytics tracking
    this.surpriseMetrics = {
      triggers: 0,
      successes: 0,
      failures: 0,
      hovers: 0,
      expansions: 0,
      averageResponseTime: 0,
      scenariosLaunched: [],
      lastUsed: null,
      sessionStart: Date.now(),
    };

    this.init();
    this.bindEvents();
    this.listenToSettings();
  }

  /**
   * Initialize DataHandler for enhanced data persistence and analytics
   */
  async initializeDataHandler() {
    try {
      this.dataHandler = new DataHandler();
      await this.dataHandler.initialize();
      await this.loadSurpriseMetrics();
      await this.loadUserPreferences();
      try {
        const __verbose =
          (typeof localStorage !== "undefined" &&
            (localStorage.getItem("debug") === "true" ||
              localStorage.getItem("verbose-logs") === "true")) ||
          false;
        if (__verbose) {
          console.log(
            "FloatingSurpriseTab: DataHandler initialized successfully",
          );
        }
      } catch (_) {
        // no-op
      }
    } catch (error) {
      console.warn(
        "[FloatingSurpriseTab] DataHandler initialization failed, using fallback mode:",
        error,
      );
      // Continue without DataHandler - use localStorage fallback
      this.dataHandler = null;
      this.loadSurpriseMetricsFromLocalStorage();
      this.loadPreferencesFromLocalStorage();
    }
  }

  /**
   * Load surprise metrics from DataHandler
   */
  async loadSurpriseMetrics() {
    if (!this.dataHandler) {
      this.loadSurpriseMetricsFromLocalStorage();
      return;
    }

    try {
      const storedMetrics = await this.dataHandler.getData(
        "floatingSurpriseTab_metrics",
      );
      if (storedMetrics) {
        this.surpriseMetrics = {
          ...this.surpriseMetrics,
          ...storedMetrics,
          sessionStart: Date.now(), // Reset session start
        };
      }
    } catch (error) {
      console.warn(
        "[FloatingSurpriseTab] Failed to load surprise metrics from DataHandler, using localStorage:",
        error,
      );
      this.loadSurpriseMetricsFromLocalStorage();
    }
  }

  /**
   * Load surprise metrics from localStorage fallback
   */
  loadSurpriseMetricsFromLocalStorage() {
    try {
      const saved = localStorage.getItem("floatingSurpriseTab_metrics");
      if (saved) {
        const storedMetrics = JSON.parse(saved);
        this.surpriseMetrics = {
          ...this.surpriseMetrics,
          ...storedMetrics,
          sessionStart: Date.now(),
        };
      }
    } catch (error) {
      console.warn(
        "[FloatingSurpriseTab] Error loading metrics from localStorage:",
        error,
      );
    }
  }

  /**
   * Load user preferences from DataHandler
   */
  async loadUserPreferences() {
    if (!this.dataHandler) {
      this.loadPreferencesFromLocalStorage();
      return;
    }

    try {
      const preferences = await this.dataHandler.getData(
        "floatingSurpriseTab_preferences",
      );
      if (preferences) {
        this.userPreferences = preferences;
      }
    } catch (error) {
      console.warn(
        "[FloatingSurpriseTab] Failed to load user preferences from DataHandler, using localStorage:",
        error,
      );
      this.loadPreferencesFromLocalStorage();
    }
  }

  /**
   * Load user preferences from localStorage fallback
   */
  loadPreferencesFromLocalStorage() {
    try {
      const saved = localStorage.getItem("floatingSurpriseTab_preferences");
      if (saved) {
        this.userPreferences = JSON.parse(saved);
      }
    } catch (error) {
      console.warn(
        "[FloatingSurpriseTab] Error loading preferences from localStorage:",
        error,
      );
    }
  }

  /**
   * Save surprise metrics to DataHandler or localStorage
   */
  async saveSurpriseMetrics() {
    const metricsToSave = {
      ...this.surpriseMetrics,
      lastUpdated: Date.now(),
    };

    // Try DataHandler first
    if (this.dataHandler) {
      try {
        await this.dataHandler.saveData(
          "floatingSurpriseTab_metrics",
          metricsToSave,
        );
        return;
      } catch (error) {
        console.warn(
          "[FloatingSurpriseTab] Failed to save surprise metrics to DataHandler, using localStorage fallback:",
          error,
        );
      }
    }

    // Fallback to localStorage
    try {
      localStorage.setItem(
        "floatingSurpriseTab_metrics",
        JSON.stringify(metricsToSave),
      );
    } catch (error) {
      console.error(
        "[FloatingSurpriseTab] Failed to save metrics to localStorage:",
        error,
      );
    }
  }

  /**
   * Track surprise interaction with enhanced analytics
   */
  trackSurpriseInteraction(action, metadata = {}) {
    // Update metrics
    this.surpriseMetrics[action] = (this.surpriseMetrics[action] || 0) + 1;
    this.surpriseMetrics.lastUsed = Date.now();

    // Calculate average response time for triggers
    if (action === "triggers" && metadata.responseTime) {
      const currentAvg = this.surpriseMetrics.averageResponseTime || 0;
      const totalTriggers = this.surpriseMetrics.triggers;
      this.surpriseMetrics.averageResponseTime =
        (currentAvg * (totalTriggers - 1) + metadata.responseTime) /
        totalTriggers;
    }

    // Track launched scenarios
    if (action === "successes" && metadata.scenarioId) {
      this.surpriseMetrics.scenariosLaunched.push({
        scenarioId: metadata.scenarioId,
        timestamp: Date.now(),
      });

      // Keep only last 50 scenarios
      if (this.surpriseMetrics.scenariosLaunched.length > 50) {
        this.surpriseMetrics.scenariosLaunched =
          this.surpriseMetrics.scenariosLaunched.slice(-50);
      }
    }

    // Save metrics (debounced)
    this.saveSurpriseMetrics();

    // Track with app analytics if available
    const app = window.simulateAIApp || window.app || window.simulateAI || null;
    if (app?.analyticsManager) {
      app.analyticsManager.trackEvent("floating_surprise_tab", {
        action,
        isMobile: this.isMobile,
        sessionDuration: Date.now() - this.surpriseMetrics.sessionStart,
        totalUses: this.surpriseMetrics.triggers,
        successRate:
          this.surpriseMetrics.triggers > 0
            ? this.surpriseMetrics.successes / this.surpriseMetrics.triggers
            : 0,
        ...metadata,
      });
    }
  }

  init() {
    if (this.isInitialized) return;

    this.createElement();
    this.attachToDOM();
    this.applyInitialSettings();
    this.isInitialized = true;
  }

  listenToSettings() {
    // Listen for settings changes
    window.addEventListener("settingsChanged", (e) => {
      const { settings } = e.detail;
      const enabled =
        settings.interface_surpriseTabEnabled ??
        settings.surpriseTabEnabled ??
        true;
      this.updateVisibility(!!enabled);
    });

    // Listen for settings manager ready
    window.addEventListener("settingsManagerReady", (e) => {
      const { settings } = e.detail;
      const enabled =
        settings.interface_surpriseTabEnabled ??
        settings.surpriseTabEnabled ??
        true;
      this.updateVisibility(!!enabled);
    });

    // Listen for surprise me requests from other components
    document.addEventListener("surpriseMeRequested", (e) => {
      console.log(
        "FloatingSurpriseTab: Received surpriseMeRequested event:",
        e.detail,
      );
      if (e.detail && e.detail.source !== "floating-tab") {
        this.addSuccessFeedback();
      }
    });
  }

  applyInitialSettings() {
    // Apply initial settings if available
    const applySettings = () => {
      if (window.settingsManager) {
        const enabled =
          window.settingsManager.getSetting("interface_surpriseTabEnabled") ??
          window.settingsManager.getSetting("surpriseTabEnabled") ??
          true;
        this.updateVisibility(!!enabled);
      }
    };

    // Try immediately
    applySettings();

    // Also try on next microtask to catch very-early settings init
    Promise.resolve().then(applySettings);

    // Also try after a short delay in case settings manager isn't ready
    setTimeout(applySettings, 100);
  }

  updateVisibility(enabled) {
    if (this.link) {
      if (enabled) {
        this.link.style.display = "block";
        this.link.setAttribute("aria-hidden", "false");
        this.link.removeAttribute("hidden");
        this.link.removeAttribute("inert");
        this.link.removeAttribute("tabindex");
      } else {
        this.link.style.display = "none";
        this.link.setAttribute("aria-hidden", "true");
        this.link.setAttribute("hidden", "");
        this.link.setAttribute("inert", "");
        this.link.setAttribute("tabindex", "-1");
      }
    }
  }

  createElement() {
    // Create the main container
    this.container = document.createElement("div");
    this.container.className = "floating-surprise-tab";
    this.container.setAttribute("role", "complementary");
    this.container.setAttribute("aria-label", "Surprise Me feature");

    // Create the tab content
    this.container.innerHTML = `
      <div class="floating-surprise-tab-content">
        <div class="floating-surprise-tab-icon">
          🎉
        </div>
        <div class="floating-surprise-tab-text">
          <span class="surprise-tab-title">Surprise Me!</span>
          <span class="surprise-tab-subtitle">Discover a random scenario</span>
        </div>
        <div class="floating-surprise-tab-arrow">
          <svg class="surprise-arrow-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
          </svg>
        </div>
      </div>
      <div class="floating-surprise-tab-ripple"></div>
    `;

    // Create the clickable link
    this.link = document.createElement("a");
    this.link.href = "#";
    this.link.className = "floating-surprise-tab-link";
    this.link.setAttribute(
      "aria-label",
      "Surprise Me - Launch random scenario",
    );
    this.link.setAttribute("data-action", "surprise");
    this.link.id = "surprise-me-floating";

    // Default-hide to avoid flash of content (FOUC) before settings apply
    // Inline style ensures it overrides CSS defaults until we compute visibility
    this.link.style.display = "none";
    this.link.setAttribute("aria-hidden", "true");
    this.link.setAttribute("hidden", "");
    this.link.setAttribute("inert", "");
    this.link.setAttribute("tabindex", "-1");

    // Wrap the container in the link
    this.link.appendChild(this.container);
  }

  attachToDOM() {
    // Add to the end of the body
    document.body.appendChild(this.link);
  }

  bindEvents() {
    // Handle resize events
    window.addEventListener("resize", this.boundHandlers.resize);

    // Handle hover/click events
    if (this.isMobile) {
      this.link.addEventListener("touchstart", this.boundHandlers.touchStart, {
        passive: true,
      });
      this.link.addEventListener("touchend", this.boundHandlers.touchEnd, {
        passive: true,
      });
      this.link.addEventListener("click", this.boundHandlers.mobileClick);
    } else {
      this.link.addEventListener("mouseenter", this.boundHandlers.mouseEnter);
      this.link.addEventListener("mouseleave", this.boundHandlers.mouseLeave);
      this.link.addEventListener("click", this.boundHandlers.desktopClick);
    }

    // Handle keyboard navigation
    this.link.addEventListener("keydown", this.boundHandlers.keyDown);
    this.link.addEventListener("focus", this.boundHandlers.focus);
    this.link.addEventListener("blur", this.boundHandlers.blur);
  }

  handleResize() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth <= SURPRISE_MOBILE_BREAKPOINT;

    if (wasMobile !== this.isMobile) {
      this.unbindEvents();
      this.bindEvents();
    }
  }

  handleMouseEnter() {
    if (!this.isMobile) {
      // Add a small delay to make hover more intentional
      if (this.hoverTimeout) {
        clearTimeout(this.hoverTimeout);
      }
      this.hoverTimeout = setTimeout(() => {
        this.expand();
      }, 100); // 100ms delay
    }
  }

  handleMouseLeave() {
    if (!this.isMobile) {
      // Clear hover timeout if user leaves before delay
      if (this.hoverTimeout) {
        clearTimeout(this.hoverTimeout);
        this.hoverTimeout = null;
      }
      this.collapse();
    }
  }

  handleTouchStart() {
    if (this.isMobile) {
      // Allow default behavior to ensure click events work
      this.createRipple();
    }
  }

  handleTouchEnd() {
    if (this.isMobile) {
      // Allow default behavior to ensure click events work
    }
  }

  handleMobileClick(e) {
    if (this.isMobile) {
      // Check for debouncing
      const now = Date.now();
      if (now - this.lastClickTime < SURPRISE_DEBOUNCE_DELAY) {
        return;
      }
      this.lastClickTime = now;

      if (!this.isExpanded) {
        e.preventDefault();
        this.expand();
        this.scheduleAutoCollapse();
      } else {
        // When expanded, trigger surprise me functionality
        e.preventDefault();
        this.triggerSurpriseMe();
      }
    }
  }

  handleDesktopClick(e) {
    if (!this.isMobile) {
      e.preventDefault();

      // Check for debouncing
      const now = Date.now();
      if (now - this.lastClickTime < SURPRISE_DEBOUNCE_DELAY) {
        return;
      }
      this.lastClickTime = now;

      this.createRipple(e);
      this.triggerSurpriseMe();
      // Remove focus to prevent persistent outline
      this.link.blur();
    }
  }

  handleKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();

      // Check for debouncing
      const now = Date.now();
      if (now - this.lastClickTime < SURPRISE_DEBOUNCE_DELAY) {
        return;
      }
      this.lastClickTime = now;

      this.createRipple(e);
      this.triggerSurpriseMe();
      // Remove focus to prevent persistent outline
      this.link.blur();
    }
  }

  handleFocus() {
    if (!this.isMobile) {
      this.expand();
    }
  }

  handleBlur() {
    if (!this.isMobile) {
      this.collapse();
    }
  }

  expand() {
    this.isExpanded = true;
    this.container.classList.add("expanded");
    this.clearCollapseTimeout();
  }

  collapse() {
    this.isExpanded = false;
    this.container.classList.remove("expanded");
    this.clearCollapseTimeout();
  }

  scheduleAutoCollapse() {
    this.clearCollapseTimeout();
    this.collapseTimeout = setTimeout(() => {
      this.collapse();
    }, SURPRISE_MOBILE_AUTO_COLLAPSE_DELAY);
  }

  clearCollapseTimeout() {
    if (this.collapseTimeout) {
      clearTimeout(this.collapseTimeout);
      this.collapseTimeout = null;
    }
  }

  createRipple() {
    // Reset ripple
    this.container.classList.remove("ripple-active");

    // Trigger ripple effect
    setTimeout(() => {
      this.container.classList.add("ripple-active");
    }, SURPRISE_RIPPLE_DELAY);

    // Remove ripple effect
    setTimeout(() => {
      this.container.classList.remove("ripple-active");
    }, SURPRISE_RIPPLE_DURATION);
  }

  triggerSurpriseMe() {
    console.log("FloatingSurpriseTab: triggerSurpriseMe called");

    // Track surprise trigger attempt
    this.trackSurpriseInteraction("surprise_triggered", {
      timestamp: Date.now(),
      source: "floating_tab",
    });

    // Simplified approach: Find and launch a random uncompleted scenario
    const randomScenario = this.findRandomUncompletedScenario();

    if (randomScenario) {
      console.log(
        "FloatingSurpriseTab: Launching random scenario:",
        randomScenario,
      );
      this.launchScenario(randomScenario);

      // Track successful surprise trigger
      this.trackSurpriseInteraction("surprise_success", {
        method: "direct_scenario_launch",
        scenarioId: randomScenario.id,
        timestamp: Date.now(),
      });

      // Add visual feedback
      this.addSuccessFeedback();
    } else {
      console.log("FloatingSurpriseTab: No uncompleted scenarios found");

      // Track failure
      this.trackSurpriseInteraction("surprise_no_scenarios", {
        timestamp: Date.now(),
      });

      this.addNoScenariosFeedback();
    }
  }

  /**
   * Find a random uncompleted scenario
   */
  findRandomUncompletedScenario() {
    // Get all scenario cards
    const scenarioCards = document.querySelectorAll(".scenario-card");
    const uncompletedScenarios = [];

    scenarioCards.forEach((card) => {
      // Check if scenario is not completed (no completed class or checkmark)
      const isCompleted =
        card.classList.contains("completed") ||
        card.querySelector(".scenario-completed-icon") ||
        card.querySelector(".completion-status.completed");

      if (!isCompleted) {
        const scenarioId = card.dataset.scenarioId || card.id;
        const title = card
          .querySelector(".scenario-title")
          ?.textContent?.trim();
        const categoryId =
          card.dataset.categoryId ||
          card.closest("[data-category-id]")?.dataset.categoryId;

        if (scenarioId && title) {
          uncompletedScenarios.push({
            id: scenarioId,
            title: title,
            categoryId: categoryId,
            element: card,
          });
        }
      }
    });

    // Return random uncompleted scenario
    if (uncompletedScenarios.length > 0) {
      const randomIndex = Math.floor(
        Math.random() * uncompletedScenarios.length,
      );
      return uncompletedScenarios[randomIndex];
    }

    return null;
  }

  /**
   * Launch a scenario using the unified architecture
   * Enhanced with modal state checks and better fallback handling
   */
  launchScenario(scenario) {
    try {
      console.log(
        "FloatingSurpriseTab: Launching scenario via unified architecture:",
        scenario.title,
      );

      // AGGRESSIVE MODAL STATE CLEANUP: Always ensure clean state before launch
      this.forceCleanModalState();

      // Enhanced modal detection with specific selectors for different modal states
      const existingModal = this.detectExistingModals();
      if (existingModal) {
        console.warn(
          "FloatingSurpriseTab: Modal detected, aborting launch:",
          existingModal.type,
        );
        this.addErrorFeedback();
        return false;
      }

      // Method 1: Try to use the main grid's unified launch system
      if (
        window.app &&
        window.app.categoryGrid &&
        window.app.categoryGrid.openScenarioModalDirect
      ) {
        console.log("FloatingSurpriseTab: Using MainGrid unified launch");

        // Double-ensure clean state before launch
        window.app.categoryGrid.isModalOpen = false;
        window.app.categoryGrid.lastModalOpenTime = 0;

        // Verify the modal launch actually works
        const launchSuccess = this.attemptModalLaunch(scenario);
        if (launchSuccess) {
          return true;
        } else {
          console.warn(
            "FloatingSurpriseTab: Main launch failed, trying fallbacks",
          );
          return this.tryFallbackMethods(scenario);
        }
      }

      // If main method fails, try fallbacks
      return this.tryFallbackMethods(scenario);
    } catch (error) {
      console.error("FloatingSurpriseTab: Error launching scenario:", error);
      this.trackSurpriseInteraction("surprise_error", {
        method: "unified_scenario_launch",
        scenarioId: scenario.id,
        error: error.message,
      });
      this.addErrorFeedback();
      return this.tryFallbackMethods(scenario);
    }
  }

  /**
   * Force clean all modal states - aggressive cleanup
   */
  forceCleanModalState() {
    try {
      // Clean up DOM remnants
      const modalElements = document.querySelectorAll(
        '.modal-backdrop, .scenario-modal, [data-modal="scenario"], .modal.show, .enhanced-modal',
      );
      modalElements.forEach((element) => {
        if (
          element.style.display === "none" ||
          element.getAttribute("aria-hidden") === "true"
        ) {
          element.remove();
          console.log("FloatingSurpriseTab: Removed orphaned modal element");
        }
      });

      // Reset app state
      if (window.app?.categoryGrid) {
        window.app.categoryGrid.isModalOpen = false;
        window.app.categoryGrid.lastModalOpenTime = 0;
        window.app.categoryGrid.lastModalRequestKey = null;
      }

      // Reset surprise tab state
      this.lastClickTime = Math.max(0, this.lastClickTime - 1000); // Allow immediate retry

      console.log("FloatingSurpriseTab: Force cleaned modal state");
    } catch (error) {
      console.warn("FloatingSurpriseTab: Error during force cleanup:", error);
    }
  }

  /**
   * Enhanced modal detection with detailed reporting
   */
  detectExistingModals() {
    // Check for visible scenario modals
    const scenarioModal = document.querySelector(
      '.scenario-modal:not([style*="display: none"])',
    );
    if (scenarioModal) {
      return { type: "scenario-modal", element: scenarioModal };
    }

    // Check for visible modal backdrops
    const modalBackdrop = document.querySelector(
      '.modal-backdrop:not([aria-hidden="true"])',
    );
    if (modalBackdrop) {
      return { type: "modal-backdrop", element: modalBackdrop };
    }

    // Check for any visible modals
    const visibleModal = document.querySelector(
      '.modal.show, .modal[style*="display: flex"], .modal[style*="display: block"]',
    );
    if (visibleModal) {
      return { type: "visible-modal", element: visibleModal };
    }

    // Check app state
    if (window.app?.categoryGrid?.isModalOpen) {
      return { type: "app-state", state: window.app.categoryGrid.isModalOpen };
    }

    return null;
  }

  /**
   * Attempt modal launch with verification
   */
  attemptModalLaunch(scenario) {
    try {
      // Call the main grid launch method
      window.app.categoryGrid.openScenarioModalDirect(
        scenario.categoryId,
        scenario.id,
      );

      // Verify launch after a short delay
      setTimeout(() => {
        const modalOpened =
          document.querySelector(".scenario-modal") ||
          document.querySelector(".modal.show") ||
          window.app?.categoryGrid?.isModalOpen;

        if (modalOpened) {
          console.log(
            "FloatingSurpriseTab: Modal launch verified successfully",
          );
          this.trackSurpriseInteraction("surprise_success", {
            method: "main_grid_direct",
            scenarioId: scenario.id,
            timestamp: Date.now(),
          });
        } else {
          console.warn("FloatingSurpriseTab: Modal launch failed verification");
          // Try fallback after verification failure
          setTimeout(() => this.tryFallbackMethods(scenario), 100);
        }
      }, 500);

      return true;
    } catch (error) {
      console.error("FloatingSurpriseTab: Modal launch attempt failed:", error);
      return false;
    }
  }
  tryFallbackMethods(scenario) {
    console.log("FloatingSurpriseTab: Attempting fallback methods");

    // Method 2: Try to use the scenario browser's unified launch system
    if (
      window.scenarioBrowser &&
      window.scenarioBrowser.openScenarioModalDirect
    ) {
      console.log("FloatingSurpriseTab: Using ScenarioBrowser unified launch");
      window.scenarioBrowser.openScenarioModalDirect(
        scenario.categoryId,
        scenario.id,
      );
      return true;
    }

    // Method 3: Try direct ScenarioModal instantiation
    if (window.ScenarioModal || typeof ScenarioModal !== "undefined") {
      console.log(
        "FloatingSurpriseTab: Using direct ScenarioModal instantiation",
      );

      import("../components/scenario-modal.js")
        .then(({ default: ScenarioModal }) => {
          const scenarioModal = new ScenarioModal();
          scenarioModal.open(scenario.id, scenario.categoryId);
        })
        .catch((error) => {
          console.error(
            "FloatingSurpriseTab: Failed to import ScenarioModal:",
            error,
          );
          this.fallbackLaunchMethod(scenario);
        });
      return true;
    }

    // Method 4: Fallback to button simulation (original method)
    const success = this.tryButtonSimulation(scenario);
    if (success) {
      return true;
    }

    // Method 5: Final fallback - custom event dispatch
    const event = new CustomEvent("launchScenario", {
      detail: {
        scenarioId: scenario.id,
        categoryId: scenario.categoryId,
        source: "surprise_tab",
        timestamp: Date.now(),
      },
    });
    document.dispatchEvent(event);

    console.log(
      "FloatingSurpriseTab: Dispatched launchScenario event for:",
      scenario.title,
    );
    return true;
  }

  /**
   * Try button simulation method (legacy fallback)
   */
  tryButtonSimulation(scenario) {
    try {
      // Find the quick start button for this scenario
      const quickStartBtn = scenario.element?.querySelector(
        ".scenario-quick-start-btn",
      );

      if (quickStartBtn) {
        console.log(
          "FloatingSurpriseTab: Clicking quick start button for:",
          scenario.title,
        );
        quickStartBtn.click();
        return true;
      }

      // Fallback: try the regular start button
      const startBtn = scenario.element?.querySelector(".scenario-start-btn");
      if (startBtn) {
        console.log(
          "FloatingSurpriseTab: Clicking start button for:",
          scenario.title,
        );
        startBtn.click();
        return true;
      }

      return false;
    } catch (error) {
      console.error("FloatingSurpriseTab: Button simulation failed:", error);
      return false;
    }
  }

  /**
   * Final fallback launch method
   */
  fallbackLaunchMethod(scenario) {
    console.log("FloatingSurpriseTab: Using final fallback method");

    // Try direct URL navigation as absolute last resort
    const url = `app.html?category=${scenario.categoryId}&scenario=${scenario.id}&source=surprise_tab`;

    // Use window.location for immediate navigation
    window.location.href = url;
  }

  addSuccessFeedback() {
    const title = this.container.querySelector(".surprise-tab-title");
    const subtitle = this.container.querySelector(".surprise-tab-subtitle");

    if (title && subtitle) {
      const originalTitle = title.textContent;
      const originalSubtitle = subtitle.textContent;

      title.textContent = "Loading...";
      subtitle.textContent = "Finding perfect scenario";

      // Reset after a short delay
      setTimeout(() => {
        title.textContent = originalTitle;
        subtitle.textContent = originalSubtitle;
      }, SURPRISE_FEEDBACK_DURATION);
    }
  }

  addErrorFeedback() {
    const title = this.container.querySelector(".surprise-tab-title");
    const subtitle = this.container.querySelector(".surprise-tab-subtitle");

    if (title && subtitle) {
      const originalTitle = title.textContent;
      const originalSubtitle = subtitle.textContent;

      title.textContent = "Oops!";
      subtitle.textContent = "Try again in a moment";

      // Reset after a short delay
      setTimeout(() => {
        title.textContent = originalTitle;
        subtitle.textContent = originalSubtitle;
      }, SURPRISE_FEEDBACK_DURATION);
    }
  }

  addNoScenariosFeedback() {
    const title = this.container.querySelector(".surprise-tab-title");
    const subtitle = this.container.querySelector(".surprise-tab-subtitle");

    if (title && subtitle) {
      const originalTitle = title.textContent;
      const originalSubtitle = subtitle.textContent;

      title.textContent = "All Done! 🎉";
      subtitle.textContent = "You've completed everything!";

      // Reset after a longer delay since this is good news
      setTimeout(() => {
        title.textContent = originalTitle;
        subtitle.textContent = originalSubtitle;
      }, SURPRISE_FEEDBACK_DURATION * 2);
    }
  }

  // === Analytics & Data Methods ===

  async generateSurpriseReport() {
    try {
      const metrics =
        await this.dataHandler.getAnalyticsData("surprise_metrics");
      const totalTriggers = metrics?.trigger_count || 0;
      const successfulTriggers = metrics?.success_count || 0;
      const failureRate =
        totalTriggers > 0
          ? (
              ((totalTriggers - successfulTriggers) / totalTriggers) *
              100
            ).toFixed(1)
          : 0;

      return {
        totalSurpriseTriggers: totalTriggers,
        successfulSurprises: successfulTriggers,
        failureRate: `${failureRate}%`,
        mostUsedMethod: metrics?.most_used_method || "unknown",
        lastUsed: metrics?.last_used
          ? new Date(metrics.last_used).toLocaleDateString()
          : "never",
        avgUsagePerDay: metrics?.daily_average || 0,
      };
    } catch (error) {
      console.error(
        "FloatingSurpriseTab: Error generating surprise report:",
        error,
      );
      return null;
    }
  }

  async exportSurpriseData() {
    try {
      const report = await this.generateSurpriseReport();
      const allMetrics =
        await this.dataHandler.getAnalyticsData("surprise_metrics");

      const exportData = {
        summary: report,
        detailed_metrics: allMetrics,
        export_timestamp: new Date().toISOString(),
        component: "FloatingSurpriseTab",
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(dataBlob);
      link.download = `surprise-tab-analytics-${Date.now()}.json`;
      link.click();

      console.log("FloatingSurpriseTab: Analytics data exported successfully");
      return true;
    } catch (error) {
      console.error(
        "FloatingSurpriseTab: Error exporting analytics data:",
        error,
      );
      return false;
    }
  }

  async resetSurpriseMetrics() {
    try {
      await this.dataHandler.clearAnalyticsData("surprise_metrics");
      console.log("FloatingSurpriseTab: Surprise metrics reset successfully");
      return true;
    } catch (error) {
      console.error(
        "FloatingSurpriseTab: Error resetting surprise metrics:",
        error,
      );
      return false;
    }
  }

  unbindEvents() {
    // Remove window event listeners
    window.removeEventListener("resize", this.boundHandlers.resize);

    // Remove element event listeners
    if (this.link) {
      this.link.removeEventListener(
        "mouseenter",
        this.boundHandlers.mouseEnter,
      );
      this.link.removeEventListener(
        "mouseleave",
        this.boundHandlers.mouseLeave,
      );
      this.link.removeEventListener("click", this.boundHandlers.desktopClick);
      this.link.removeEventListener("click", this.boundHandlers.mobileClick);
      this.link.removeEventListener(
        "touchstart",
        this.boundHandlers.touchStart,
      );
      this.link.removeEventListener("touchend", this.boundHandlers.touchEnd);
      this.link.removeEventListener("keydown", this.boundHandlers.keyDown);
      this.link.removeEventListener("focus", this.boundHandlers.focus);
      this.link.removeEventListener("blur", this.boundHandlers.blur);
    }
  }

  destroy() {
    this.unbindEvents();
    this.clearCollapseTimeout();

    if (this.link && this.link.parentNode) {
      this.link.parentNode.removeChild(this.link);
    }

    this.isInitialized = false;
  }
}

// Initialize the floating surprise tab when the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Prevent multiple initialization
  if (window.floatingSurpriseTab) {
    console.warn("FloatingSurpriseTab: Already initialized, skipping...");
    return;
  }

  // Initialize the floating surprise tab
  window.floatingSurpriseTab = new FloatingSurpriseTab();
});

// Export global function for easy access
window.triggerSurpriseMe = function () {
  // Use the floating surprise tab if available
  if (
    window.floatingSurpriseTab &&
    typeof window.floatingSurpriseTab.triggerSurpriseMe === "function"
  ) {
    window.floatingSurpriseTab.triggerSurpriseMe();
  } else {
    console.warn(
      "FloatingSurpriseTab not available, cannot trigger surprise me",
    );
  }
};

// Export for potential manual initialization
if (typeof window !== "undefined") {
  window.FloatingSurpriseTab = FloatingSurpriseTab;
}
