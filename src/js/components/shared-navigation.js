/**
 * Shared Navigation Component
 * Loads and manages the shared navigation HTML across all pages
 */

import { UI } from "../utils/constants.js";
import DataHandler from "../core/data-handler.js";
import scrollLockManager from "../utils/scroll-lock-manager.js";

class SharedNavigation {
  constructor(app = null) {
    // Initialize DataHandler integration
    this.app = app;
    this.dataHandler = app?.dataHandler || null;

    // If no app provided, create standalone DataHandler
    if (!this.dataHandler) {
      this.dataHandler = new DataHandler({
        storageKey: "navigationData",
        analyticsEnabled: true,
        syncEnabled: true,
      });
    }

    this.navHTML = null;
    this.currentPage = null;
    this.isInitialized = false;
    this.loadingPromise = null;

    // DOM element cache for performance
    this.domCache = new Map();

    // Enterprise-grade configuration
    this.config = {
      retryAttempts: 3,
      retryDelay: 1000,
      cacheTimeout: 5 * 60 * 1000, // 5 minutes
      performanceMode: "balanced", // 'high', 'balanced', 'compatibility'
      accessibilityLevel: "AA", // 'A', 'AA', 'AAA'
      enableAnalytics: true,
      enableTelemetry: false,
      enablePrefetch: true,
    };

    // Performance monitoring
    this.metrics = {
      initTime: 0,
      renderTime: 0,
      navigationChanges: 0,
      errorCount: 0,
      lastUpdate: Date.now(),
    };

    // Scroll-aware navbar properties
    this.lastScrollY = 0;
    this.scrollThreshold = 5; // Minimum scroll distance to trigger hide/show
    this.headerHeight = UI.HEADER_HEIGHT; // Use constant instead of magic number
    this.isScrolling = false;
    this.scrollTimeout = null;

    // Enterprise error tracking
    this.errorQueue = [];
    this.maxErrorQueue = 50;

    // Event listener management
    this.eventListeners = new Map();
    this.isListenersSetup = false;
  }

  /**
   * Get cached DOM element or query and cache it
   * @param {string} key - Cache key for the element
   * @param {string} selector - CSS selector for the element
   * @returns {Element|null} The cached or newly queried element
   */
  getCachedElement(key, selector) {
    if (!this.domCache.has(key)) {
      const element = document.querySelector(selector);
      if (element) {
        this.domCache.set(key, element);
      }
      return element;
    }
    return this.domCache.get(key);
  }

  /**
   * Get cached DOM elements or query and cache them
   * @param {string} key - Cache key for the elements
   * @param {string} selector - CSS selector for the elements
   * @returns {NodeList|Array} The cached or newly queried elements
   */
  getCachedElements(key, selector) {
    if (!this.domCache.has(key)) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        this.domCache.set(key, Array.from(elements));
      }
      return elements;
    }
    return this.domCache.get(key);
  }

  /**
   * Clear DOM cache when navigation is re-injected
   */
  clearDOMCache() {
    this.domCache.clear();
  }

  /**
   * Initialize the shared navigation system with enterprise-grade features
   * @param {Object} options - Configuration options
   * @param {string} options.currentPage - Current page identifier for active state
   * @param {string} options.navPath - Path to the navigation HTML file
   * @param {Object} options.config - Enterprise configuration overrides
   */
  async init(options = {}) {
    if (this.isInitialized) {
      return;
    }

    const startTime = performance.now();

    try {
      // Merge enterprise configuration
      this.config = { ...this.config, ...(options.config || {}) };

      // Initialize performance monitoring
      this.initializePerformanceMonitoring();

      // Initialize telemetry if enabled
      if (this.config.enableTelemetry) {
        this.initializeTelemetry();
      }

      // Set configuration
      this.currentPage = options.currentPage || this.detectCurrentPage();
      const navPath =
        options.navPath || "src/components/shared-navigation.html";

      // Load navigation HTML with retry logic
      await this.loadNavigationHTMLWithRetry(navPath);

      // Inject into page
      this.injectNavigation();

      // Setup event listeners
      this.setupEventListeners();

      // Set active page state
      this.setActivePage(this.currentPage);

      // Initialize mobile navigation
      this.initializeMobileNavigation();

      // Initialize mega menu
      this.initializeMegaMenu();

      // Initialize dropdowns
      this.initializeDropdowns();

      // Initialize scroll-aware navbar
      this.initializeScrollAwareNavbar();

      // Enterprise features
      if (this.config.enablePrefetch) {
        this.initializePrefetching();
      }

      // Add moderation link for privileged users (after a delay to allow auth to load)
      setTimeout(() => {
        this.addModerationLink();
      }, 1000);

      // Set active page state for hash navigation without scrolling
      // Let browser handle initial scroll to hash naturally
      if (window.location.hash === "#categories") {
        this.setActivePage("simulation-hub");
      }

      // Calculate performance metrics
      this.metrics.initTime = performance.now() - startTime;
      this.metrics.lastUpdate = Date.now();

      this.isInitialized = true;

      // Log successful initialization
      this.logTelemetry("navigation_initialized", {
        initTime: this.metrics.initTime,
        currentPage: this.currentPage,
        userAgent: navigator.userAgent,
      });
    } catch (error) {
      this.handleEnterpriseError(error, "initialization");
      throw error; // Re-throw for upstream handling
    }
  }

  /**
   * Load navigation HTML with enterprise retry logic
   * @param {string} navPath - Path to navigation HTML file
   */
  async loadNavigationHTMLWithRetry(navPath) {
    let lastError;

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        await this.loadNavigationHTML(navPath);
        return; // Success
      } catch (error) {
        lastError = error;
        this.logTelemetry("navigation_load_retry", {
          attempt,
          error: error.message,
          navPath,
        });

        if (attempt < this.config.retryAttempts) {
          await this.delay(this.config.retryDelay * attempt); // Exponential backoff
        }
      }
    }

    // All retries failed
    throw new Error(
      `Failed to load navigation after ${this.config.retryAttempts} attempts: ${lastError.message}`,
    );
  }

  /**
   * Initialize performance monitoring
   */
  initializePerformanceMonitoring() {
    // Monitor navigation performance
    if ("performance" in window && "PerformanceObserver" in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name.includes("navigation")) {
              this.logTelemetry("navigation_performance", {
                name: entry.name,
                duration: entry.duration,
                startTime: entry.startTime,
              });
            }
          }
        });

        observer.observe({ entryTypes: ["measure", "navigation"] });
      } catch (error) {
        // PerformanceObserver not supported, continue without it
        this.logTelemetry("performance_monitoring_unavailable", {
          error: error.message,
        });
      }
    }
  }

  /**
   * Initialize telemetry system
   */
  initializeTelemetry() {
    this.telemetryQueue = [];
    this.telemetryBatchSize = 10;

    // Batch send telemetry data
    setInterval(() => {
      this.flushTelemetry();
    }, 30000); // Every 30 seconds
  }

  /**
   * Initialize prefetching for better performance
   */
  initializePrefetching() {
    // Prefetch critical navigation resources
    const prefetchLinks = [
      "app.html",
      "about.html",
      "blog.html",
      "profile.html",
    ];

    prefetchLinks.forEach((href) => {
      if (document.head) {
        const link = document.createElement("link");
        link.rel = "prefetch";
        link.href = href;
        document.head.appendChild(link);
      }
    });
  }

  /**
   * Enterprise-grade error handling
   */
  handleEnterpriseError(error, context = "unknown") {
    this.metrics.errorCount++;

    const errorData = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      metrics: { ...this.metrics },
    };

    // Add to error queue
    this.errorQueue.push(errorData);
    if (this.errorQueue.length > this.maxErrorQueue) {
      this.errorQueue.shift(); // Remove oldest error
    }

    // Log to telemetry
    this.logTelemetry("navigation_error", errorData);

    // Log to console in development
    if (this.config.performanceMode === "high") {
      console.error("SharedNavigation Error:", errorData);
    }

    // Try to recover
    this.attemptRecovery(context);
  }

  /**
   * Attempt to recover from errors
   */
  attemptRecovery(context) {
    switch (context) {
      case "initialization":
        // Try fallback navigation
        if (!document.querySelector("header.header")) {
          document.body.insertAdjacentHTML(
            "afterbegin",
            this.createFallbackNavigation(),
          );
          this.reinitializeAfterInjection();
        }
        break;
      case "mobile_navigation":
        // Reset mobile navigation state
        this.closeMobileNav();
        break;
      case "dropdown":
        // Close all dropdowns
        this.closeAllDropdowns();
        this.closeMegaMenu();
        break;
      default:
        // Generic recovery - reinitialize if possible
        if (this.isInitialized) {
          this.reinitializeAfterInjection();
        }
    }
  }

  /**
   * Log telemetry data
   */
  logTelemetry(event, data = {}) {
    if (!this.config.enableTelemetry) return;

    const telemetryData = {
      event,
      data,
      timestamp: Date.now(),
      sessionId: this.getSessionId(),
      userId: this.getUserId(),
    };

    if (this.telemetryQueue) {
      this.telemetryQueue.push(telemetryData);
    }
  }

  /**
   * Flush telemetry data with DataHandler integration
   */
  async flushTelemetry() {
    if (!this.telemetryQueue || this.telemetryQueue.length === 0) return;

    const batch = this.telemetryQueue.splice(0, this.telemetryBatchSize);

    // Send to analytics endpoint (if available)
    if (window.analytics && typeof window.analytics.track === "function") {
      batch.forEach((item) => {
        window.analytics.track(item.event, item.data);
      });
    }

    // Store in DataHandler first
    try {
      const existing = await this.getStoredTelemetry();
      const updated = [...existing, ...batch];

      // Keep only last 100 entries
      if (updated.length > 100) {
        updated.splice(0, updated.length - 100);
      }

      await this.dataHandler.saveData("nav_telemetry", updated);
      console.log("📊 Navigation telemetry saved to DataHandler");
    } catch (error) {
      console.warn("Failed to save telemetry to DataHandler:", error);

      // Fallback to localStorage
      try {
        const stored = localStorage.getItem("nav_telemetry") || "[]";
        const existing = JSON.parse(stored);
        existing.push(...batch);

        // Keep only last 100 entries
        if (existing.length > 100) {
          existing.splice(0, existing.length - 100);
        }

        localStorage.setItem("nav_telemetry", JSON.stringify(existing));
      } catch (localError) {
        console.warn("Failed to save telemetry to localStorage:", localError);
      }
    }
  }

  /**
   * Get stored telemetry data from DataHandler with localStorage fallback
   */
  async getStoredTelemetry() {
    try {
      // Try DataHandler first
      const stored = await this.dataHandler.getData("nav_telemetry");
      if (stored && Array.isArray(stored)) {
        return stored;
      }

      // Fallback to localStorage
      const localData = localStorage.getItem("nav_telemetry");
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          if (Array.isArray(parsed)) {
            // Migrate to DataHandler
            await this.dataHandler.saveData("nav_telemetry", parsed);
            console.log(
              "📊 Navigation telemetry migrated from localStorage to DataHandler",
            );
            return parsed;
          }
        } catch (parseError) {
          console.warn(
            "Failed to parse navigation telemetry from localStorage:",
            parseError,
          );
          // Clear corrupted data
          localStorage.removeItem("nav_telemetry");
        }
      }

      return [];
    } catch (error) {
      console.warn("Error retrieving stored telemetry:", error);
      return [];
    }
  }

  /**
   * Get session ID for telemetry with DataHandler integration
   */
  async getSessionId() {
    if (!this.sessionId) {
      // Try to get from DataHandler first
      try {
        this.sessionId = await this.dataHandler.getData("nav_session_id");
      } catch (error) {
        console.warn("Failed to get session ID from DataHandler:", error);
      }

      // Fallback to sessionStorage or generate new
      if (!this.sessionId) {
        this.sessionId =
          sessionStorage.getItem("nav_session_id") ||
          `nav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Store in both DataHandler and sessionStorage
        try {
          await this.dataHandler.saveData("nav_session_id", this.sessionId);
        } catch (error) {
          console.warn("Failed to save session ID to DataHandler:", error);
        }
        sessionStorage.setItem("nav_session_id", this.sessionId);
      }
    }
    return this.sessionId;
  }

  /**
   * Get user ID for telemetry
   */
  getUserId() {
    // Try to get from authentication service
    if (window.authService && window.authService.userProfile) {
      return window.authService.userProfile.uid || "anonymous";
    }
    return "anonymous";
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  async loadNavigationHTML(navPath) {
    // Prevent multiple simultaneous loads
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = fetch(navPath)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load navigation: ${response.status}`);
        }
        return response.text();
      })
      .then((html) => {
        this.navHTML = html;
        return html;
      })
      .catch((error) => {
        // Error loading navigation HTML - fallback to basic navigation
        console.warn("Failed to load navigation HTML:", error.message);
        this.navHTML = this.createFallbackNavigation();
        return this.navHTML;
      });

    return this.loadingPromise;
  }

  /**
   * Inject the navigation HTML into the page
   */
  injectNavigation() {
    if (!this.navHTML) {
      return;
    }

    // Priority order for injection targets
    const navigationContainer = document.getElementById("navigation-container");
    const existingHeader = document.querySelector("header.header");

    if (navigationContainer) {
      // Inject into designated navigation container
      navigationContainer.innerHTML = this.navHTML;
    } else if (existingHeader) {
      // Replace existing header
      existingHeader.outerHTML = this.navHTML;
    } else {
      // Fallback: inject at body start
      const { body } = document;
      if (body) {
        body.insertAdjacentHTML("afterbegin", this.navHTML);
      } else {
        // Fallback: inject after body loads
        document.addEventListener("DOMContentLoaded", () => {
          document.body.insertAdjacentHTML("afterbegin", this.navHTML);
          this.reinitializeAfterInjection();
        });
        return;
      }
    }

    // Re-initialize after injection
    this.reinitializeAfterInjection();
  }

  /**
   * Re-initialize components after navigation injection with cache management
   */
  reinitializeAfterInjection() {
    // Clear DOM cache since new elements have been injected
    this.clearDOMCache();

    // Clean up existing event listeners
    this.removeAllEventListeners();

    // Reset listener setup flags
    this.isListenersSetup = false;

    // Re-setup event listeners since DOM has changed
    this.setupEventListeners();
    this.setActivePage(this.currentPage);
    this.initializeMobileNavigation();
    this.initializeMegaMenu();
    this.initializeDropdowns();

    // Mark listeners as setup
    this.isListenersSetup = true;
  }

  /**
   * Detect current page from URL or meta tags
   */
  detectCurrentPage() {
    // Check for meta tag with page identifier
    const pageMetaTag = document.querySelector('meta[name="page-id"]');
    if (pageMetaTag) {
      return pageMetaTag.getAttribute("content");
    }

    // Detect from URL
    const { pathname } = window.location;
    const filename = pathname.split("/").pop() || "index.html";

    // Map filenames to page identifiers
    const pageMap = {
      "index.html": "home",
      "app.html": "simulation-hub",
      "about.html": "about",
      "blog.html": "blog",
      "forum.html": "forum",
      "profile.html": "profile",
      "privacy-notice.html": "privacy",
      "donate.html": "donate",
      "": "home", // Root path
    };

    return pageMap[filename] || "home";
  }

  /**
   * Set the active page state in navigation with optimized DOM operations
   * @param {string} pageId - Page identifier
   * @param {boolean} immediate - Whether to apply changes immediately (for user interactions)
   */
  setActivePage(pageId, immediate = false) {
    // Skip if already the current page to prevent unnecessary work
    if (this.currentPage === pageId) {
      return;
    }

    // Use cached elements for better performance
    const navLinks = this.getCachedElements("navLinks", ".nav-link");

    const updateActiveState = () => {
      // Remove existing active states efficiently
      navLinks.forEach((link) => {
        if (link.classList.contains("active")) {
          link.classList.remove("active");
          link.removeAttribute("aria-current");
        }
      });

      // Set new active state
      const activeLink = document.querySelector(`[data-page="${pageId}"]`);
      if (activeLink) {
        activeLink.classList.add("active");
        activeLink.setAttribute("aria-current", "page");
      }

      this.currentPage = pageId;
    };

    if (immediate) {
      // Apply changes immediately for smooth user interactions
      updateActiveState();
    } else {
      // Batch DOM operations for better performance
      requestAnimationFrame(updateActiveState);
    }
  }

  /**
   * Setup event listeners for navigation functionality
   */
  setupEventListeners() {
    // General navigation link handlers
    this.setupNavigationLinkHandlers();

    // Simulation Library navigation
    this.setupSimulationHubNavigation();

    // Mega menu toggle
    this.setupMegaMenuListeners();

    // Dropdown menus
    this.setupDropdownListeners();

    // Action buttons (tour, surprise me, etc.)
    this.setupActionButtonListeners();

    // Mobile navigation
    this.setupMobileNavigationListeners();

    // Search functionality in mega menu
    this.setupMegaMenuSearch();
  }

  /**
   * Setup general navigation link handlers for active state management
   */
  setupNavigationLinkHandlers() {
    // Use cached elements for better performance
    const mainNavigation = this.getCachedElement(
      "mainNavigation",
      "#main-navigation",
    );
    if (!mainNavigation) return;

    const navLinks = this.getCachedElements(
      "navLinksWithData",
      ".nav-link[data-page]",
    );

    navLinks.forEach((link) => {
      // Skip simulation-hub as it has its own handler
      if (link.getAttribute("data-page") === "simulation-hub") {
        return;
      }

      const clickHandler = () => {
        const pageId = link.getAttribute("data-page");
        if (pageId) {
          this.setActivePage(pageId);
        }

        // Close mobile navigation when a nav link is clicked
        this.closeMobileNav();
      };

      link.addEventListener("click", clickHandler);
      // Store for cleanup
      this.eventListeners.set(link, { click: clickHandler });
    });

    // Also add listeners for dropdown items to close mobile menu
    const dropdownItems = this.getCachedElements(
      "dropdownItems",
      ".dropdown-item[data-page], .dropdown-item[href]",
    );

    dropdownItems.forEach((item) => {
      const clickHandler = () => {
        // Close mobile navigation when a dropdown item is clicked
        this.closeMobileNav();

        // Close any open dropdowns
        this.closeAllDropdowns();
      };

      item.addEventListener("click", clickHandler);
      // Store for cleanup
      if (!this.eventListeners.has(item)) {
        this.eventListeners.set(item, { click: clickHandler });
      }
    });
  }

  /**
   * Handle hash navigation for user-initiated navigation only
   * Simplified - main scrolling now handled by navigateToSimulationHub
   */
  handleHashNavigation() {
    const { hash } = window.location;

    if (hash === "#categories") {
      // Set the active state for simulation-hub
      this.setActivePage("simulation-hub");
      // Note: Scrolling is now handled by navigateToSimulationHub to prevent competition
    }
  }

  /**
   * Setup Simulation Library navigation functionality
   */
  setupSimulationHubNavigation() {
    const mainNavigation = this.getCachedElement(
      "mainNavigation",
      "#main-navigation",
    );
    if (!mainNavigation) return;

    const simulationHubLink = mainNavigation.querySelector(
      'a[data-page="simulation-hub"]',
    );

    if (!simulationHubLink) {
      return;
    }

    const clickHandler = (e) => {
      e.preventDefault();
      // Set flag to prevent hash navigation delay
      this.isUserNavigation = true;
      this.navigateToSimulationHub();
      // Clear flag after a short delay
      setTimeout(() => {
        this.isUserNavigation = false;
      }, 200);

      // Close mobile navigation when Simulation Library is clicked
      this.closeMobileNav();
    };

    simulationHubLink.addEventListener("click", clickHandler);
    // Store for cleanup
    this.eventListeners.set(simulationHubLink, { click: clickHandler });
  }

  /**
   * Navigate to the Simulation Library section
   */
  navigateToSimulationHub() {
    const currentPage =
      window.location.pathname.split("/").pop() || "index.html";
    const targetSelector = "#categories > div.main-section-header";

    // If we're already on app.html, just scroll to the target
    if (currentPage === "app.html") {
      // Update active state immediately for smooth scrolling
      this.setActivePage("simulation-hub", true);

      // Update hash FIRST to prevent competition, then scroll immediately
      history.replaceState(null, null, "#categories");

      // Use native browser scrolling - much faster than scroll manager
      const targetElement = document.querySelector(targetSelector);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    } else {
      // Update active state to simulation-hub
      this.setActivePage("simulation-hub");
      // Navigate to app.html and then scroll to the target
      window.location.href = `app.html#categories`;
    }
  }

  /**
   * Setup mega menu event listeners
   */
  setupMegaMenuListeners() {
    const categoriesDropdown = document.querySelector(
      '.nav-item-dropdown .nav-link[aria-haspopup="true"]',
    );
    const megaMenu = document.querySelector(".mega-menu");

    if (!categoriesDropdown || !megaMenu) return;

    // Toggle mega menu on click - support second click to close
    categoriesDropdown.addEventListener("click", (e) => {
      e.preventDefault();

      const isOpen = megaMenu.classList.contains("open");

      if (isOpen) {
        // Second click - close the mega menu
        this.closeMegaMenu();
      } else {
        // First click - open mega menu
        this.openMegaMenu();
      }
    });

    // Close mega menu when clicking outside (but not on toolbar buttons)
    document.addEventListener("click", (e) => {
      // Skip if clicking on main-grid toolbar elements
      if (
        e.target.closest(".filter-btn") ||
        e.target.closest(".sort-btn") ||
        e.target.closest(".filter-dropdown") ||
        e.target.closest(".sort-dropdown")
      ) {
        return;
      }

      if (
        !categoriesDropdown.contains(e.target) &&
        !megaMenu.contains(e.target)
      ) {
        this.closeMegaMenu();
      }
    });

    // Handle mega menu item clicks
    const megaMenuItems = document.querySelectorAll(".mega-menu-item");
    megaMenuItems.forEach((item) => {
      item.addEventListener("click", () => {
        const category = item.getAttribute("data-category");
        if (category) {
          this.handleCategorySelection(category);
        }
      });
    });

    // Keyboard navigation for mega menu
    categoriesDropdown.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const isOpen = megaMenu.classList.contains("open");
        if (isOpen) {
          this.closeMegaMenu();
        } else {
          this.openMegaMenu();
        }
      }
    });
  }

  /**
   * Setup dropdown menu listeners for community and about sections
   */ setupDropdownListeners() {
    const dropdownTriggers = document.querySelectorAll(
      '.nav-item-dropdown .nav-link[aria-haspopup="true"]',
    );

    dropdownTriggers.forEach((trigger) => {
      // Skip mega menu (handled separately)
      if (trigger.closest(".nav-item-dropdown").querySelector(".mega-menu")) {
        return;
      }

      // Skip settings dropdown (handled by settings-manager)
      if (trigger.id === "settings-nav") {
        return;
      }

      const dropdown = trigger.nextElementSibling;

      if (!dropdown || !dropdown.classList.contains("dropdown-menu")) {
        return;
      }

      // Toggle dropdown on click - works for both desktop and mobile
      trigger.addEventListener("click", (e) => {
        e.preventDefault();

        const isOpen = dropdown.classList.contains("open");

        if (isOpen) {
          // Second click - close the dropdown
          this.closeDropdown(trigger, dropdown);
        } else {
          // First click - open dropdown and close others
          this.toggleDropdown(trigger, dropdown);
        }
      });

      // Open dropdown on hover (desktop only - mouseenter)
      trigger.addEventListener("mouseenter", () => {
        // Only auto-open on hover if we're not on mobile
        if (window.innerWidth > 480) {
          this.openDropdown(trigger, dropdown);
        }
      });

      // Close dropdown when leaving the entire dropdown area (trigger + menu)
      const dropdownContainer = trigger.closest(".nav-item-dropdown");
      if (dropdownContainer) {
        dropdownContainer.addEventListener("mouseleave", () => {
          // Only auto-close on hover if we're not on mobile
          if (window.innerWidth > 480) {
            this.closeDropdown(trigger, dropdown);
          }
        });
      }

      // Close dropdown when clicking outside (but not on toolbar buttons)
      document.addEventListener("click", (e) => {
        // Skip if clicking on main-grid toolbar elements
        if (
          e.target.closest(".filter-btn") ||
          e.target.closest(".sort-btn") ||
          e.target.closest(".filter-dropdown") ||
          e.target.closest(".sort-dropdown")
        ) {
          return;
        }

        if (!trigger.contains(e.target) && !dropdown.contains(e.target)) {
          this.closeDropdown(trigger, dropdown);
        }
      });
    });

    // Keyboard support for primary dropdown triggers
    const aboutTrigger = document.getElementById("about-nav");
    const settingsTrigger = document.getElementById("settings-nav");

    const attachKeyHandler = (triggerEl) => {
      if (!triggerEl) return;
      const menu = triggerEl.nextElementSibling;
      if (!menu || !menu.classList.contains("dropdown-menu")) return;
      const keyHandler = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const isOpen = menu.classList.contains("open");
          if (isOpen) {
            this.closeDropdown(triggerEl, menu);
          } else {
            this.toggleDropdown(triggerEl, menu);
          }
        }
      };
      triggerEl.addEventListener("keydown", keyHandler);
      // Track for cleanup
      const existing = this.eventListeners.get(triggerEl) || {};
      this.eventListeners.set(triggerEl, { ...existing, keydown: keyHandler });
    };

    attachKeyHandler(aboutTrigger);
    attachKeyHandler(settingsTrigger);
  }

  /**
   * Setup action button listeners (tour, surprise me, donate) with proper cleanup
   */
  setupActionButtonListeners() {
    // Prevent duplicate listener setup
    if (this.isListenersSetup) {
      return;
    }

    // Surprise Me button - use proper cleanup instead of cloning
    const surpriseBtn = this.getCachedElement(
      "surpriseBtn",
      "#surprise-me-nav",
    );
    if (surpriseBtn) {
      // Remove existing listener if any
      if (this.eventListeners.has(surpriseBtn)) {
        const handlers = this.eventListeners.get(surpriseBtn);
        Object.entries(handlers).forEach(([event, handler]) => {
          surpriseBtn.removeEventListener(event, handler);
        });
      }

      // Add fresh listener
      const clickHandler = (e) => {
        e.preventDefault();
        this.handleSurpriseAction();
      };
      surpriseBtn.addEventListener("click", clickHandler);
      this.eventListeners.set(surpriseBtn, { click: clickHandler });
    }

    // Authentication buttons
    const signInBtn = this.getCachedElement("signInBtn", "#sign-in-nav");
    const signOutBtn = this.getCachedElement("signOutBtn", "#sign-out-nav");
    const profileSignout = document.getElementById("profile-signout");

    if (signInBtn) {
      // Remove existing to avoid duplicates
      if (this.eventListeners.has(signInBtn)) {
        const handlers = this.eventListeners.get(signInBtn);
        Object.entries(handlers).forEach(([event, handler]) => {
          signInBtn.removeEventListener(event, handler);
        });
      }
      const signInHandler = () => this.handleSignIn();
      signInBtn.addEventListener("click", signInHandler);
      this.eventListeners.set(signInBtn, { click: signInHandler });
    }

    if (signOutBtn) {
      // Remove existing to avoid duplicates
      if (this.eventListeners.has(signOutBtn)) {
        const handlers = this.eventListeners.get(signOutBtn);
        Object.entries(handlers).forEach(([event, handler]) => {
          signOutBtn.removeEventListener(event, handler);
        });
      }
      const signOutHandler = () => this.handleSignOut();
      signOutBtn.addEventListener("click", signOutHandler);
      this.eventListeners.set(signOutBtn, { click: signOutHandler });
    }

    if (profileSignout) {
      // Remove existing listeners
      if (this.eventListeners.has(profileSignout)) {
        const handlers = this.eventListeners.get(profileSignout);
        Object.entries(handlers).forEach(([event, handler]) => {
          profileSignout.removeEventListener(event, handler);
        });
      }

      const profileSignoutHandler = async (e) => {
        e.preventDefault();
        try {
          // Prefer centralized auth service
          const auth =
            (window.app && window.app.authService) || window.authService;
          if (auth && typeof auth.signOut === "function") {
            await auth.signOut();
          }
        } finally {
          // Close dropdown after action
          const trigger = document.getElementById("profile-nav");
          const menu = document.getElementById("profile-menu");
          if (trigger && menu) this.closeDropdown(trigger, menu);
        }
      };
      profileSignout.addEventListener("click", profileSignoutHandler);
      this.eventListeners.set(profileSignout, { click: profileSignoutHandler });
    }
  }

  /**
   * Setup mobile navigation listeners with proper cleanup
   */
  setupMobileNavigationListeners() {
    // Prevent duplicate listener setup
    if (this.isListenersSetup) {
      return;
    }

    const navToggle = this.getCachedElement("navToggle", ".nav-toggle");
    const mainNav = this.getCachedElement("mainNav", "#main-navigation");

    if (!navToggle || !mainNav) {
      return;
    }

    // Remove existing listeners if any
    if (this.eventListeners.has(navToggle)) {
      const handlers = this.eventListeners.get(navToggle);
      Object.entries(handlers).forEach(([event, handler]) => {
        navToggle.removeEventListener(event, handler);
      });
    }

    // Add fresh listener
    const clickHandler = (e) => {
      e.preventDefault();
      this.toggleMobileNav();
    };

    navToggle.addEventListener("click", clickHandler);
    this.eventListeners.set(navToggle, { click: clickHandler });

    // Setup mobile-specific dropdown listeners
    this.setupMobileDropdownListeners();

    // Close mobile nav when clicking backdrop
    const navBackdrop = this.getCachedElement("navBackdrop", ".nav-backdrop");
    if (navBackdrop) {
      const backdropHandler = () => {
        this.closeMobileNav();
      };
      navBackdrop.addEventListener("click", backdropHandler);
      this.eventListeners.set(navBackdrop, { click: backdropHandler });
    }

    // Close mobile nav on escape key - only set once
    if (!this.eventListeners.has(document)) {
      const keydownHandler = (e) => {
        if (e.key === "Escape" && mainNav.classList.contains("open")) {
          this.closeMobileNav();
        }
      };
      document.addEventListener("keydown", keydownHandler);

      // Close mobile nav when clicking outside the navigation
      const documentClickHandler = (e) => {
        if (!mainNav.classList.contains("open")) return;

        // Check if click is outside the navigation area
        const isClickInsideNav = mainNav.contains(e.target);
        const isClickOnToggle = navToggle.contains(e.target);
        const isClickOnBackdrop = navBackdrop && navBackdrop.contains(e.target);

        // Close mobile nav if clicked outside navigation (but not on toggle or backdrop)
        if (!isClickInsideNav && !isClickOnToggle && !isClickOnBackdrop) {
          this.closeMobileNav();
        }
      };
      document.addEventListener("click", documentClickHandler);

      this.eventListeners.set(document, {
        keydown: keydownHandler,
        click: documentClickHandler,
      });
    }
  }

  /**
   * Setup mobile-specific dropdown listeners
   */
  setupMobileDropdownListeners() {
    const mainNavigation = document.querySelector("#main-navigation");
    if (!mainNavigation) return;

    // Find ALL dropdown triggers, including those with href
    const allDropdownTriggers = mainNavigation.querySelectorAll(
      '.nav-item-dropdown .nav-link[aria-haspopup="true"]',
    );

    allDropdownTriggers.forEach((trigger) => {
      const dropdown = trigger.nextElementSibling;

      if (!dropdown) {
        return;
      }

      // Check if this is the categories mega menu
      const isMegaMenu = dropdown.classList.contains("mega-menu");

      if (isMegaMenu) {
        trigger.addEventListener("click", (e) => {
          e.preventDefault(); // Prevent navigation in mobile

          const isOpen = dropdown.classList.contains("open");
          if (isOpen) {
            this.closeMegaMenu();
          } else {
            // Close other dropdowns first
            this.closeAllDropdowns();
            this.openMegaMenu();
          }
        });
        return;
      }

      // For regular dropdowns (Community, About)
      if (dropdown.classList.contains("dropdown-menu")) {
        trigger.addEventListener("click", (e) => {
          e.preventDefault();

          const isOpen = dropdown.classList.contains("open");

          if (isOpen) {
            this.closeDropdown(trigger, dropdown);
          } else {
            // Close other dropdowns first (including mega menu)
            this.closeAllDropdownsExcept(dropdown);
            this.closeMegaMenu();
            this.openDropdown(trigger, dropdown);
          }
        });
      }
    });

    // Close dropdowns when clicking elsewhere in mobile nav
    if (mainNavigation) {
      mainNavigation.addEventListener("click", (e) => {
        // If click is not on a dropdown trigger or dropdown content
        const clickedDropdown = e.target.closest(".nav-item-dropdown");
        if (!clickedDropdown) {
          this.closeAllDropdowns();
          this.closeMegaMenu();
        }
      });
    }
  }

  /**
   * Setup mega menu search functionality
   */
  setupMegaMenuSearch() {
    const searchInput = document.querySelector(".mega-menu-search");
    if (!searchInput) return;

    searchInput.addEventListener("input", (e) => {
      this.filterMegaMenuItems(e.target.value);
    });
  }

  /**
   * Initialize mobile navigation functionality
   */
  initializeMobileNavigation() {
    // Mobile navigation is handled by event listeners
    // This method can be used for additional mobile-specific setup
  }

  /**
   * Initialize mega menu functionality
   */
  initializeMegaMenu() {
    // Mega menu is handled by event listeners
    // This method can be used for additional mega menu setup
  }

  /**
   * Initialize dropdown functionality
   */
  initializeDropdowns() {
    // Dropdowns are handled by event listeners
    // This method can be used for additional dropdown setup
  }

  /**
   * Initialize scroll-aware navbar functionality
   */
  initializeScrollAwareNavbar() {
    // Store initial scroll position
    this.lastScrollY = window.scrollY || window.pageYOffset || 0;

    // Add scroll event listener with throttling
    this.handleScroll = this.throttle(this.onScroll.bind(this), 16); // ~60fps
    window.addEventListener("scroll", this.handleScroll, { passive: true });

    // Set initial state based on current scroll position
    this.updateNavbarVisibility();
  }

  /**
   * Handle scroll events to show/hide navbar with cached header element
   */
  onScroll() {
    const currentScrollY = window.scrollY || window.pageYOffset || 0;
    const scrollDelta = currentScrollY - this.lastScrollY;
    const header = this.getCachedElement("header", ".header");

    if (!header) return;

    // Add scrolled class for enhanced styling when past header height
    if (currentScrollY > this.headerHeight) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    // Don't hide navbar if we're at the top of the page
    if (currentScrollY <= this.headerHeight) {
      this.showNavbar();
      this.lastScrollY = currentScrollY;
      return;
    }

    // Don't hide navbar if mobile menu is open or dropdowns are active
    if (this.shouldAlwaysShowNavbar()) {
      this.showNavbar();
      this.lastScrollY = currentScrollY;
      return;
    }

    // Check if scroll movement is significant enough
    if (Math.abs(scrollDelta) < this.scrollThreshold) {
      return;
    }

    // Hide navbar when scrolling down, show when scrolling up
    if (scrollDelta > 0 && !header.classList.contains("header-hidden")) {
      // Scrolling down - hide navbar
      this.hideNavbar();
    } else if (
      scrollDelta < 0 &&
      !header.classList.contains("header-visible")
    ) {
      // Scrolling up - show navbar
      this.showNavbar();
    }

    this.lastScrollY = currentScrollY;

    // Clear any existing timeout and set a new one to detect scroll end
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    this.isScrolling = true;
    this.scrollTimeout = setTimeout(() => {
      this.isScrolling = false;
    }, 150); // Scroll detection timeout
  }

  /**
   * Check if navbar should always be shown (e.g., when menus are open)
   */
  shouldAlwaysShowNavbar() {
    // Check if mobile menu is open - use consistent selector
    const mobileNav = document.querySelector("#main-navigation.open");
    if (mobileNav) return true;

    // Check if any dropdowns are open
    const openDropdowns = document.querySelectorAll(
      ".dropdown-menu.open, .mega-menu.open",
    );
    if (openDropdowns.length > 0) return true;

    // Check if settings menu is open (display block or hover state)
    const settingsMenu = document.querySelector(
      '.settings-menu[style*="display: block"]',
    );
    if (settingsMenu) return true;

    // Check if settings nav is being hovered
    const settingsNavDropdown = document.querySelector(
      ".nav-item-dropdown:hover",
    );
    if (
      settingsNavDropdown &&
      settingsNavDropdown.querySelector("#settings-nav")
    ) {
      return true;
    }

    return false;
  }

  /**
   * Hide the navbar with smooth animation
   */
  hideNavbar() {
    const header = document.querySelector(".header");
    if (!header) return;

    header.classList.add("header-hidden");
    header.classList.remove("header-visible");
  }

  /**
   * Show the navbar with smooth animation
   */
  showNavbar() {
    const header = document.querySelector(".header");
    if (!header) return;

    header.classList.add("header-visible");
    header.classList.remove("header-hidden");
  }

  /**
   * Update navbar visibility based on current state
   */
  updateNavbarVisibility() {
    const currentScrollY = window.scrollY || window.pageYOffset || 0;
    const header = document.querySelector(".header");

    if (!header) return;

    if (currentScrollY <= this.headerHeight) {
      this.showNavbar();
      header.classList.remove("scrolled");
    } else {
      header.classList.add("scrolled");
    }
  }

  /**
   * Throttle function to limit scroll event frequency
   */
  throttle(func, delay) {
    let timeoutId;
    let lastExecTime = 0;

    return function (...args) {
      const currentTime = Date.now();

      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(
          () => {
            func.apply(this, args);
            lastExecTime = Date.now();
          },
          delay - (currentTime - lastExecTime),
        );
      }
    };
  }

  /**
   * Toggle mega menu visibility
   */
  toggleMegaMenu() {
    const megaMenu = document.querySelector(".mega-menu");
    const trigger = document.querySelector(
      '.nav-item-dropdown .nav-link[aria-haspopup="true"]',
    );

    if (!megaMenu || !trigger) return;

    const isOpen = megaMenu.classList.contains("open");

    if (isOpen) {
      this.closeMegaMenu();
    } else {
      this.openMegaMenu();
    }
  }

  /**
   * Open mega menu
   */
  openMegaMenu() {
    const megaMenu = document.querySelector(".mega-menu");
    const trigger = document.querySelector(
      '.nav-item-dropdown .nav-link[aria-haspopup="true"]',
    );

    if (!megaMenu || !trigger) return;

    // Close other dropdowns first
    this.closeAllDropdowns();

    megaMenu.classList.add("open");
    megaMenu.classList.add("force-visible"); // CSS class instead of inline styles
    trigger.setAttribute("aria-expanded", "true");

    // Focus first menu item for accessibility
    const firstItem = megaMenu.querySelector(".mega-menu-item");
    if (firstItem) {
      firstItem.focus();
    }
  }

  /**
   * Close mega menu
   */
  closeMegaMenu() {
    const megaMenu = document.querySelector(".mega-menu");
    const trigger = document.querySelector(
      '.nav-item-dropdown .nav-link[aria-haspopup="true"]',
    );

    if (!megaMenu || !trigger) return;

    megaMenu.classList.remove("open");
    megaMenu.classList.remove("force-visible"); // Remove CSS class instead of inline styles
    trigger.setAttribute("aria-expanded", "false");
  }

  /**
   * Toggle dropdown menu
   */
  toggleDropdown(trigger, dropdown) {
    const isOpen = dropdown.classList.contains("open");

    if (!isOpen) {
      // Close all OTHER dropdowns first (exclude current one)
      this.closeAllDropdownsExcept(dropdown);

      dropdown.classList.add("open");
      dropdown.classList.add("force-visible"); // CSS class instead of inline styles
      trigger.setAttribute("aria-expanded", "true");
    } else {
      this.closeDropdown(trigger, dropdown);
    }
  }
  /**
   * Open specific dropdown (for hover events)
   */
  openDropdown(trigger, dropdown) {
    const isOpen = dropdown.classList.contains("open");

    if (!isOpen) {
      // Close all OTHER dropdowns first (exclude current one)
      this.closeAllDropdownsExcept(dropdown);

      dropdown.classList.add("open");
      dropdown.classList.add("force-visible"); // CSS class instead of inline styles
      trigger.setAttribute("aria-expanded", "true");
    }
  }

  /**
   * Close specific dropdown
   */
  closeDropdown(trigger, dropdown) {
    dropdown.classList.remove("open");
    dropdown.classList.remove("force-visible"); // Remove CSS class instead of inline styles
    trigger.setAttribute("aria-expanded", "false");
  }

  /**
   * Close all open dropdowns
   */
  closeAllDropdowns() {
    const dropdowns = document.querySelectorAll(".dropdown-menu");
    const triggers = document.querySelectorAll(
      '.nav-link[aria-haspopup="true"]',
    );

    dropdowns.forEach((dropdown) => {
      dropdown.classList.remove("open");
      // Reset inline styles to allow CSS to take control
      dropdown.style.visibility = "";
      dropdown.style.opacity = "";
      dropdown.style.display = "";
    });
    triggers.forEach((trigger) =>
      trigger.setAttribute("aria-expanded", "false"),
    );
  }

  /**
   * Close all open dropdowns except the specified one
   */
  closeAllDropdownsExcept(exceptDropdown) {
    const dropdowns = document.querySelectorAll(".dropdown-menu");
    const triggers = document.querySelectorAll(
      '.nav-link[aria-haspopup="true"]',
    );

    dropdowns.forEach((dropdown) => {
      if (dropdown !== exceptDropdown) {
        dropdown.classList.remove("open");
        // Reset inline styles to allow CSS to take control
        dropdown.style.visibility = "";
        dropdown.style.opacity = "";
        dropdown.style.display = "";
      }
    });

    triggers.forEach((trigger) => {
      const associatedDropdown = trigger.nextElementSibling;
      if (associatedDropdown !== exceptDropdown) {
        trigger.setAttribute("aria-expanded", "false");
      }
    });
  }

  /**
   * Toggle mobile navigation with cached elements
   */
  toggleMobileNav() {
    const navToggle = this.getCachedElement("navToggle", ".nav-toggle");
    const mainNav = this.getCachedElement("mainNav", "#main-navigation");

    if (!navToggle || !mainNav) {
      return;
    }

    const isOpen = mainNav.classList.contains("open");

    if (isOpen) {
      this.closeMobileNav();
    } else {
      this.openMobileNav();
    }
  }

  /**
   * Open mobile navigation with cached elements
   */
  openMobileNav() {
    const navToggle = this.getCachedElement("navToggle", ".nav-toggle");
    const mainNav = this.getCachedElement("mainNav", "#main-navigation");
    const navBackdrop = this.getCachedElement("navBackdrop", ".nav-backdrop");

    if (!navToggle || !mainNav) {
      return;
    }

    // Close all mega menus and dropdowns first
    this.closeMegaMenu();
    this.closeAllDropdowns();

    // Add classes for mobile navigation
    mainNav.classList.add("open");
    mainNav.classList.add("mobile-force-visible"); // CSS class instead of inline styles
    navToggle.setAttribute("aria-expanded", "true");
    mainNav.setAttribute("aria-hidden", "false");

    if (navBackdrop) {
      navBackdrop.classList.add("open");
    }

    // Prevent body scroll
    scrollLockManager.lock("mobile-nav");
  }

  /**
   * Close mobile navigation with cached elements
   */
  closeMobileNav() {
    const navToggle = this.getCachedElement("navToggle", ".nav-toggle");
    const mainNav = this.getCachedElement("mainNav", "#main-navigation");
    const navBackdrop = this.getCachedElement("navBackdrop", ".nav-backdrop");

    if (!navToggle || !mainNav) return;

    mainNav.classList.remove("open");
    mainNav.classList.remove("mobile-force-visible"); // Remove CSS class instead of inline styles
    navToggle.setAttribute("aria-expanded", "false");
    // Important: Do NOT set aria-hidden="true" on the main navigation.
    // A global CSS rule ([aria-hidden="true"]) hides elements completely,
    // which removed the nav on desktop after clicking links.
    // Ensure the nav remains perceivable to assistive tech and visible.
    mainNav.setAttribute("aria-hidden", "false");

    if (navBackdrop) {
      navBackdrop.classList.remove("open");
    }

    // Restore body scroll
    scrollLockManager.unlock("mobile-nav");
  }

  /**
   * Filter mega menu items based on search query
   */
  filterMegaMenuItems(query) {
    const items = document.querySelectorAll(".mega-menu-item");
    const normalizedQuery = query.toLowerCase().trim();

    items.forEach((item) => {
      const title = item.querySelector("h4")?.textContent.toLowerCase() || "";
      const description =
        item.querySelector("p")?.textContent.toLowerCase() || "";

      const matches =
        title.includes(normalizedQuery) ||
        description.includes(normalizedQuery);

      if (matches || normalizedQuery === "") {
        item.style.display = "";
      } else {
        item.style.display = "none";
      }
    });
  }

  /**
   * Handle category selection from mega menu
   */
  handleCategorySelection(category) {
    // Category selected: ${category}

    // Close mega menu
    this.closeMegaMenu();

    // Close mobile navigation if open
    this.closeMobileNav();

    // Navigate to category or trigger category selection
    if (
      typeof window.app !== "undefined" &&
      window.app.handleCategorySelection
    ) {
      window.app.handleCategorySelection(category);
    } else {
      // Fallback: scroll to categories or navigate to categories page
      this.navigateToCategory(category);
    }
  }

  /**
   * Navigate to category (fallback method) - consolidated to prevent scroll competition
   */
  navigateToCategory(category) {
    // If on home page, delegate to main navigation to avoid competing scroll operations
    if (this.currentPage === "home") {
      // Delegate to the main navigation method to avoid duplication
      this.navigateToSimulationHub();
      return;
    }

    // Otherwise navigate to scenarios page with category filter
    window.location.href = `app.html?category=${category}`;
  }

  /**
   * Handle tour action
   */
  handleTourAction() {
    // Prevent rapid successive calls
    if (this._tourActionInProgress) {
      return;
    }

    this._tourActionInProgress = true;

    // Reset the flag after a short delay
    setTimeout(() => {
      this._tourActionInProgress = false;
    }, 1000);

    // Close mobile nav if open
    this.closeMobileNav();

    // Trigger tour through app instance or fallback
    if (typeof window.app !== "undefined" && window.app.startOnboardingTour) {
      window.app.startOnboardingTour();
    } else {
      // Tour functionality not available
    }
  }

  /**
   * Handle surprise me action
   */
  handleSurpriseAction() {
    // Surprise me action triggered

    // Close mobile nav if open
    this.closeMobileNav();

    // Trigger surprise action through app instance or fallback
    if (typeof window.app !== "undefined" && window.app.launchRandomScenario) {
      window.app.launchRandomScenario();
    } else {
      // Surprise me functionality not available
    }
  }

  /**
   * Handle sign in action
   */
  handleSignIn() {
    // Sign in action triggered

    // Trigger sign in through app instance or fallback
    if (typeof window.app !== "undefined" && window.app.authService) {
      window.app.authService.showLoginModal();
    } else {
      // Authentication not available, try to show a simple alert or redirect
      alert(
        "Please refresh the page and try again. Authentication service is not available.",
      );
    }
  }

  /**
   * Handle profile button click - navigate to profile page
   */
  handleProfileClick() {
    // Navigate to profile page
    window.location.href = "profile.html";
  }

  /**
   * Handle sign out action
   */
  handleSignOut() {
    // Sign out action triggered

    // Trigger sign out through app instance or fallback
    if (typeof window.app !== "undefined" && window.app.authService) {
      window.app.authService.signOut();
    } else {
      // Authentication not available
    }
  }

  /**
   * Handle link accounts action
   */
  handleLinkAccounts() {
    // Link accounts action triggered

    // Trigger link accounts through app instance or fallback
    if (typeof window.app !== "undefined" && window.app.authService) {
      window.app.authService.linkAccounts();
    } else {
      // Authentication not available
    }
  }

  /**
   * Update user display in navigation
   */
  updateUserDisplay(user) {
    const guestContent = document.querySelector("[data-guest-content]");
    const userContent = document.querySelector("[data-user-content]");
    const profileBtn = document.getElementById("profile-nav");

    if (user) {
      // User is signed in - show profile dropdown, hide sign in
      if (guestContent) guestContent.style.display = "none";
      if (userContent) userContent.style.display = "block";

      // Update profile button text with user info
      if (profileBtn) {
        const displayName = user.displayName || user.email || "User";
        const firstName = displayName.split(" ")[0]; // Get first name
        profileBtn.innerHTML = `${firstName} <span class="dropdown-arrow" aria-hidden="true">▼</span>`;
        profileBtn.title = `${displayName}'s profile menu`;
      }
    } else {
      // User is not signed in - show sign in button, hide profile
      if (guestContent) guestContent.style.display = "block";
      if (userContent) userContent.style.display = "none";
    }
  }

  /**
   * Create fallback navigation HTML if loading fails
   */
  createFallbackNavigation() {
    return `
            <header class="header" role="banner">
                <div class="header-container">
                    <a href="index.html" class="logo" aria-label="SimulateAI - Go to homepage">
                        <img src="src/assets/icons/logo.svg" alt="SimulateAI Educational Platform" class="logo-image logo-full">
                        <img src="src/assets/icons/logo-compact.svg" alt="SimulateAI" class="logo-image logo-compact">
                    </a>
                    <nav class="main-nav" role="navigation" aria-label="Main navigation" id="main-navigation">
                        <div class="nav-group nav-group-primary">
                            <ul class="nav-list">
                                <li><a href="app.html" class="nav-link" data-page="scenarios">Scenarios</a></li>
                                <li><a href="blog.html" class="nav-link" data-page="blog">Blog</a></li>
                                <li><a href="profile.html" class="nav-link" data-page="profile">Profile</a></li>
                                <li><a href="donate.html" class="nav-link donate-btn" data-page="donate">💖 Donate</a></li>
                            </ul>
                        </div>
                    </nav>
                </div>
            </header>
        `;
  }

  /**
   * Handle errors in navigation loading or functionality
   */
  handleError(error) {
    console.warn("Navigation error:", error);

    // Try to ensure basic navigation is available
    if (!document.querySelector("header.header")) {
      document.body.insertAdjacentHTML(
        "afterbegin",
        this.createFallbackNavigation(),
      );
      this.reinitializeAfterInjection();
    }
  }

  /**
   * Enterprise-grade cleanup with comprehensive resource management
   */
  destroy() {
    try {
      // Flush any pending telemetry
      if (this.config.enableTelemetry) {
        this.flushTelemetry();
      }

      // Remove scroll event listener
      if (this.handleScroll) {
        window.removeEventListener("scroll", this.handleScroll);
      }

      // Clear all timeouts and intervals
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout);
      }

      // Clear cache
      this.cache.clear();

      // Remove performance observers
      if (this.performanceObserver) {
        this.performanceObserver.disconnect();
      }

      // Clear error queue
      this.errorQueue = [];

      // Remove all event listeners
      this.removeAllEventListeners();

      // Reset state
      this.isInitialized = false;
      this.navHTML = null;
      this.loadingPromise = null;
      this.handleScroll = null;

      this.logTelemetry("navigation_destroyed", {
        metrics: { ...this.metrics },
        lifetime: Date.now() - this.metrics.lastUpdate,
      });
    } catch (error) {
      this.handleEnterpriseError(error, "cleanup");
    }
  }

  /**
   * Remove all event listeners for complete cleanup
   */
  removeAllEventListeners() {
    // Remove all tracked event listeners
    for (const [element, handlers] of this.eventListeners) {
      Object.entries(handlers).forEach(([event, handler]) => {
        element.removeEventListener(event, handler);
      });
    }
    this.eventListeners.clear();

    // Remove scroll listener
    if (this.handleScroll) {
      window.removeEventListener("scroll", this.handleScroll);
    }
  }

  /**
   * Validate navigation accessibility (Enterprise AA/AAA compliance)
   */
  validateAccessibility() {
    const issues = [];
    const mainNav = document.querySelector("#main-navigation");

    if (!mainNav) {
      issues.push({
        level: "error",
        message: "Main navigation container not found",
        wcag: "1.3.1",
      });
      return issues;
    }

    // Check for proper ARIA labels
    const navLinks = mainNav.querySelectorAll(".nav-link");
    navLinks.forEach((link, index) => {
      if (!link.getAttribute("aria-label") && !link.textContent.trim()) {
        issues.push({
          level: "error",
          message: `Navigation link ${index + 1} missing accessible text`,
          wcag: "2.4.4",
          element: link,
        });
      }
    });

    // Check dropdown accessibility
    const dropdownTriggers = mainNav.querySelectorAll('[aria-haspopup="true"]');
    dropdownTriggers.forEach((trigger, index) => {
      if (!trigger.getAttribute("aria-expanded")) {
        issues.push({
          level: "warning",
          message: `Dropdown trigger ${index + 1} missing aria-expanded`,
          wcag: "4.1.2",
          element: trigger,
        });
      }
    });

    // Check keyboard navigation
    const focusableElements = mainNav.querySelectorAll(
      'a, button, [tabindex]:not([tabindex="-1"])',
    );
    if (focusableElements.length === 0) {
      issues.push({
        level: "error",
        message: "No focusable elements found in navigation",
        wcag: "2.1.1",
      });
    }

    // Log accessibility audit results
    this.logTelemetry("accessibility_audit", {
      issueCount: issues.length,
      errorCount: issues.filter((i) => i.level === "error").length,
      warningCount: issues.filter((i) => i.level === "warning").length,
      level: this.config.accessibilityLevel,
    });

    return issues;
  }

  /**
   * Get comprehensive navigation health metrics
   */
  getHealthMetrics() {
    const accessibility = this.validateAccessibility();
    const performance = this.getPerformanceMetrics();

    return {
      isHealthy: accessibility.filter((i) => i.level === "error").length === 0,
      accessibility: {
        score:
          accessibility.length === 0
            ? 100
            : Math.max(0, 100 - accessibility.length * 10),
        issues: accessibility,
      },
      performance,
      errors: {
        total: this.metrics.errorCount,
        recent: this.errorQueue.slice(-10),
      },
      telemetry: {
        enabled: this.config.enableTelemetry,
        queueSize: this.telemetryQueue?.length || 0,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return {
      initTime: this.metrics.initTime,
      renderTime: this.metrics.renderTime,
      navigationChanges: this.metrics.navigationChanges,
      memoryUsage: this.getMemoryUsage(),
      cacheSize: this.cache.size,
      uptime: Date.now() - this.metrics.lastUpdate,
    };
  }

  /**
   * Get memory usage if available
   */
  getMemoryUsage() {
    if ("memory" in performance) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
      };
    }
    return null;
  }

  /**
   * Enterprise configuration validation
   */
  static validateConfig(config) {
    const requiredFields = ["retryAttempts", "retryDelay", "performanceMode"];
    const validPerformanceModes = ["high", "balanced", "compatibility"];
    const validAccessibilityLevels = ["A", "AA", "AAA"];

    const errors = [];

    requiredFields.forEach((field) => {
      if (!(field in config)) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    if (
      config.retryAttempts &&
      (config.retryAttempts < 1 || config.retryAttempts > 10)
    ) {
      errors.push("retryAttempts must be between 1 and 10");
    }

    if (
      config.performanceMode &&
      !validPerformanceModes.includes(config.performanceMode)
    ) {
      errors.push(
        `performanceMode must be one of: ${validPerformanceModes.join(", ")}`,
      );
    }

    if (
      config.accessibilityLevel &&
      !validAccessibilityLevels.includes(config.accessibilityLevel)
    ) {
      errors.push(
        `accessibilityLevel must be one of: ${validAccessibilityLevels.join(", ")}`,
      );
    }

    return errors;
  }

  /**
   * Add moderation link for privileged users
   */
  async addModerationLink() {
    // Check if user has moderation privileges
    if (!this.canModerate()) return;

    const navList = document.querySelector(".nav-list");
    if (!navList) return;

    // Check if moderation link already exists
    if (document.querySelector('[data-page="moderation"]')) return;

    // Create moderation link
    const moderationItem = document.createElement("li");
    moderationItem.innerHTML = `
      <a href="moderation.html" class="nav-link moderation-link" data-page="moderation">
        🛡️ Moderation
      </a>
    `;

    // Insert before the last item (usually donate button)
    const lastItem = navList.lastElementChild;
    if (lastItem) {
      navList.insertBefore(moderationItem, lastItem);
    } else {
      navList.appendChild(moderationItem);
    }
  }

  /**
   * Check if current user can moderate
   */
  canModerate() {
    const MODERATOR_TIER_THRESHOLD = 3;

    // Import auth service to check user privileges
    if (typeof window !== "undefined" && window.authService) {
      const { userProfile } = window.authService;
      return (
        userProfile?.role === "moderator" ||
        userProfile?.role === "admin" ||
        userProfile?.tier >= MODERATOR_TIER_THRESHOLD
      );
    }
    return false;
  }
}

// ============================================================================
// ENTERPRISE STATIC UTILITIES
// ============================================================================

/**
 * Enterprise-grade navigation utilities and debugging tools
 */
SharedNavigation.Utils = {
  /**
   * Global health check for all navigation instances
   */
  globalHealthCheck() {
    const instances = [];
    if (window.sharedNav) {
      instances.push(window.sharedNav);
    }

    return instances.map((instance) => ({
      id: instance.getSessionId(),
      health: instance.getHealthMetrics(),
      config: instance.config,
    }));
  },

  /**
   * Debug navigation performance across the application
   */
  debugPerformance() {
    const navigationEntries = performance.getEntriesByType("navigation");
    const resourceEntries = performance.getEntriesByType("resource");

    const navigationResources = resourceEntries.filter(
      (entry) =>
        entry.name.includes("navigation") ||
        entry.name.includes("nav") ||
        entry.name.includes("header"),
    );

    return {
      navigation: navigationEntries,
      resources: navigationResources,
      memory: "memory" in performance ? performance.memory : null,
      timing: performance.timing,
    };
  },

  /**
   * Accessibility compliance checker
   */
  checkAccessibilityCompliance(level = "AA") {
    const nav = window.sharedNav;
    if (!nav) {
      return { error: "Navigation instance not found" };
    }

    const oldLevel = nav.config.accessibilityLevel;
    nav.config.accessibilityLevel = level;
    const results = nav.validateAccessibility();
    nav.config.accessibilityLevel = oldLevel;

    return {
      level,
      compliant: results.filter((r) => r.level === "error").length === 0,
      issues: results,
      recommendations:
        SharedNavigation.Utils.getAccessibilityRecommendations(results),
    };
  },

  /**
   * Get accessibility improvement recommendations
   */
  getAccessibilityRecommendations(issues) {
    const recommendations = [];

    issues.forEach((issue) => {
      switch (issue.wcag) {
        case "1.3.1":
          recommendations.push(
            "Add semantic HTML structure with proper landmarks",
          );
          break;
        case "2.4.4":
          recommendations.push(
            "Ensure all links have descriptive text or aria-labels",
          );
          break;
        case "4.1.2":
          recommendations.push(
            "Add proper ARIA states and properties to interactive elements",
          );
          break;
        case "2.1.1":
          recommendations.push(
            "Ensure all functionality is keyboard accessible",
          );
          break;
        default:
          recommendations.push(`Review WCAG guideline ${issue.wcag}`);
      }
    });

    return [...new Set(recommendations)]; // Remove duplicates
  },

  /**
   * Generate enterprise compliance report
   */
  generateComplianceReport() {
    const healthCheck = SharedNavigation.Utils.globalHealthCheck();
    const performance = SharedNavigation.Utils.debugPerformance();
    const accessibility =
      SharedNavigation.Utils.checkAccessibilityCompliance("AA");

    return {
      timestamp: new Date().toISOString(),
      summary: {
        instanceCount: healthCheck.length,
        overallHealth: healthCheck.every((h) => h.health.isHealthy),
        accessibilityCompliant: accessibility.compliant,
        performanceGrade:
          SharedNavigation.Utils.calculatePerformanceGrade(performance),
      },
      details: {
        instances: healthCheck,
        performance,
        accessibility,
      },
      recommendations: [
        ...accessibility.recommendations,
        ...SharedNavigation.Utils.getPerformanceRecommendations(performance),
      ],
    };
  },

  /**
   * Calculate performance grade
   */
  calculatePerformanceGrade(performance) {
    if (!performance.navigation || performance.navigation.length === 0) {
      return "Unknown";
    }

    const nav = performance.navigation[0];
    const totalTime = nav.loadEventEnd - nav.navigationStart;

    if (totalTime < 1000) return "A+";
    if (totalTime < 2000) return "A";
    if (totalTime < 3000) return "B";
    if (totalTime < 5000) return "C";
    return "D";
  },

  /**
   * Get performance improvement recommendations
   */
  getPerformanceRecommendations(performance) {
    const recommendations = [];

    if (performance.resources.length > 10) {
      recommendations.push(
        "Consider reducing the number of navigation-related resources",
      );
    }

    if (performance.memory && performance.memory.used > 50 * 1024 * 1024) {
      recommendations.push(
        "Monitor memory usage - navigation components using significant memory",
      );
    }

    const nav = performance.navigation[0];
    if (nav && nav.loadEventEnd - nav.navigationStart > 3000) {
      recommendations.push(
        "Navigation loading time is slow - consider optimizing resource loading",
      );
    }

    return recommendations;
  },
};

// ============================================================================
// ENTERPRISE MONITORING & TELEMETRY
// ============================================================================

/**
 * Global navigation monitoring for enterprise deployments
 */
SharedNavigation.Monitor = {
  instances: new Set(),

  /**
   * Register navigation instance for monitoring
   */
  register(instance) {
    this.instances.add(instance);
    console.log(
      `[Navigation Monitor] Registered instance: ${instance.getSessionId()}`,
    );
  },

  /**
   * Unregister navigation instance
   */
  unregister(instance) {
    this.instances.delete(instance);
    console.log(
      `[Navigation Monitor] Unregistered instance: ${instance.getSessionId()}`,
    );
  },

  /**
   * Get aggregated telemetry from all instances
   */
  getAggregatedTelemetry() {
    const telemetry = {
      totalInstances: this.instances.size,
      totalErrors: 0,
      totalNavigations: 0,
      averageInitTime: 0,
      timestamp: new Date().toISOString(),
    };

    let initTimeSum = 0;

    this.instances.forEach((instance) => {
      const metrics = instance.metrics;
      telemetry.totalErrors += metrics.errorCount;
      telemetry.totalNavigations += metrics.navigationChanges;
      initTimeSum += metrics.initTime;
    });

    if (this.instances.size > 0) {
      telemetry.averageInitTime = initTimeSum / this.instances.size;
    }

    return telemetry;
  },

  /**
   * Start continuous monitoring
   */
  startMonitoring(intervalMs = 60000) {
    this.monitoringInterval = setInterval(() => {
      const telemetry = this.getAggregatedTelemetry();
      console.log("[Navigation Monitor] Telemetry:", telemetry);

      // Send to external monitoring service if available
      if (window.enterpriseMonitoring) {
        window.enterpriseMonitoring.send("navigation_telemetry", telemetry);
      }
    }, intervalMs);
  },

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  },
};

// Create global instance - prevent multiple instances
window.SharedNavigation = SharedNavigation;

// Debug function for manual testing
window.debugMobileNav = function () {
  const nav = window.sharedNav;
  if (nav) {
    nav.toggleMobileNav();
  } else {
    console.warn("SharedNavigation not initialized");
  }
};

// Auto-initialize if DOM is ready - with better duplicate prevention
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    if (!window.sharedNav) {
      window.sharedNav = new SharedNavigation();
      window.sharedNav.init();
    } else {
      console.log("SharedNavigation already initialized");
    }
  });
} else {
  // DOM is already ready
  if (!window.sharedNav) {
    window.sharedNav = new SharedNavigation();
    window.sharedNav.init();
  } else {
    console.log("SharedNavigation already initialized");
  }
}
