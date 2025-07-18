/**
 * Shared Navigation Component
 * Loads and manages the shared navigation HTML across all pages
 */

class SharedNavigation {
  constructor() {
    this.navHTML = null;
    this.currentPage = null;
    this.isInitialized = false;
    this.loadingPromise = null;
  }

  /**
   * Initialize the shared navigation system
   * @param {Object} options - Configuration options
   * @param {string} options.currentPage - Current page identifier for active state
   * @param {string} options.navPath - Path to the navigation HTML file
   */
  async init(options = {}) {
    if (this.isInitialized) {
      return;
    }

    try {
      // Set configuration
      this.currentPage = options.currentPage || this.detectCurrentPage();
      const navPath =
        options.navPath || 'src/components/shared-navigation.html';

      // Load navigation HTML
      await this.loadNavigationHTML(navPath);

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

      // Add moderation link for privileged users (after a delay to allow auth to load)
      setTimeout(() => {
        this.addModerationLink();
      }, 1000);

      this.isInitialized = true;
      // SharedNavigation initialized successfully
    } catch (error) {
      // Failed to initialize SharedNavigation
      this.handleError(error);
    }
  }

  /**
   * Load the navigation HTML from file
   * @param {string} navPath - Path to navigation HTML file
   */
  async loadNavigationHTML(navPath) {
    // Prevent multiple simultaneous loads
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = fetch(navPath)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load navigation: ${response.status}`);
        }
        return response.text();
      })
      .then(html => {
        this.navHTML = html;
        return html;
      })
      .catch(_error => {
        // Error loading navigation HTML
        // Fallback to basic navigation
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
      // No navigation HTML to inject
      return;
    }

    // Find existing header or create injection point
    const targetElement = document.querySelector('header.header');

    if (targetElement) {
      // Replace existing header
      targetElement.outerHTML = this.navHTML;
    } else {
      // Find body or create at document start
      const { body } = document;
      if (body) {
        body.insertAdjacentHTML('afterbegin', this.navHTML);
      } else {
        // Fallback: inject after body loads
        document.addEventListener('DOMContentLoaded', () => {
          document.body.insertAdjacentHTML('afterbegin', this.navHTML);
          this.reinitializeAfterInjection();
        });
        return;
      }
    }

    // Re-initialize after injection
    this.reinitializeAfterInjection();
  }

  /**
   * Re-initialize components after navigation injection
   */
  reinitializeAfterInjection() {
    // Re-setup event listeners since DOM has changed
    this.setupEventListeners();
    this.setActivePage(this.currentPage);
    this.initializeMobileNavigation();
    this.initializeMegaMenu();
    this.initializeDropdowns();
  }

  /**
   * Detect current page from URL or meta tags
   */
  detectCurrentPage() {
    // Check for meta tag with page identifier
    const pageMetaTag = document.querySelector('meta[name="page-id"]');
    if (pageMetaTag) {
      return pageMetaTag.getAttribute('content');
    }

    // Detect from URL
    const { pathname } = window.location;
    const filename = pathname.split('/').pop() || 'index.html';

    // Map filenames to page identifiers
    const pageMap = {
      'index.html': 'home',
      'app.html': 'scenarios',
      'about.html': 'about',
      'blog.html': 'blog',
      'forum.html': 'forum',
      'profile.html': 'profile',
      'privacy-notice.html': 'privacy',
      'donate.html': 'donate',
      '': 'home', // Root path
    };

    return pageMap[filename] || 'home';
  }

  /**
   * Set the active page state in navigation
   * @param {string} pageId - Page identifier
   */
  setActivePage(pageId) {
    // Remove existing active states
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    });

    // Set new active state
    const activeLink = document.querySelector(`[data-page="${pageId}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
      activeLink.setAttribute('aria-current', 'page');
    }

    this.currentPage = pageId;
  }

  /**
   * Setup event listeners for navigation functionality
   */
  setupEventListeners() {
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
   * Setup mega menu event listeners
   */
  setupMegaMenuListeners() {
    const categoriesDropdown = document.querySelector(
      '.nav-item-dropdown .nav-link[aria-haspopup="true"]'
    );
    const megaMenu = document.querySelector('.mega-menu');

    if (!categoriesDropdown || !megaMenu) return;

    // Toggle mega menu on click - support second click to close
    categoriesDropdown.addEventListener('click', e => {
      e.preventDefault();

      const isOpen = megaMenu.classList.contains('open');

      if (isOpen) {
        // Second click - close the mega menu
        this.closeMegaMenu();
      } else {
        // First click - open mega menu
        this.openMegaMenu();
      }
    });

    // Close mega menu when clicking outside
    document.addEventListener('click', e => {
      if (
        !categoriesDropdown.contains(e.target) &&
        !megaMenu.contains(e.target)
      ) {
        this.closeMegaMenu();
      }
    });

    // Handle mega menu item clicks
    const megaMenuItems = document.querySelectorAll('.mega-menu-item');
    megaMenuItems.forEach(item => {
      item.addEventListener('click', () => {
        const category = item.getAttribute('data-category');
        if (category) {
          this.handleCategorySelection(category);
        }
      });
    });

    // Keyboard navigation for mega menu
    categoriesDropdown.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const isOpen = megaMenu.classList.contains('open');
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
      '.nav-item-dropdown .nav-link[aria-haspopup="true"]'
    );

    dropdownTriggers.forEach(trigger => {
      // Skip mega menu (handled separately)
      if (trigger.closest('.nav-item-dropdown').querySelector('.mega-menu')) {
        return;
      }

      // Skip settings dropdown (handled by settings-manager)
      if (trigger.id === 'settings-nav') {
        return;
      }

      const dropdown = trigger.nextElementSibling;

      if (!dropdown || !dropdown.classList.contains('dropdown-menu')) {
        return;
      }

      // Toggle dropdown on click - works for both desktop and mobile
      trigger.addEventListener('click', e => {
        e.preventDefault();

        const isOpen = dropdown.classList.contains('open');

        if (isOpen) {
          // Second click - close the dropdown
          this.closeDropdown(trigger, dropdown);
        } else {
          // First click - open dropdown and close others
          this.toggleDropdown(trigger, dropdown);
        }
      });

      // Open dropdown on hover (desktop only - mouseenter)
      trigger.addEventListener('mouseenter', () => {
        // Only auto-open on hover if we're not on mobile
        if (window.innerWidth > 480) {
          this.openDropdown(trigger, dropdown);
        }
      });

      // Close dropdown when leaving the entire dropdown area (trigger + menu)
      const dropdownContainer = trigger.closest('.nav-item-dropdown');
      if (dropdownContainer) {
        dropdownContainer.addEventListener('mouseleave', () => {
          // Only auto-close on hover if we're not on mobile
          if (window.innerWidth > 480) {
            this.closeDropdown(trigger, dropdown);
          }
        });
      }

      // Close dropdown when clicking outside
      document.addEventListener('click', e => {
        if (!trigger.contains(e.target) && !dropdown.contains(e.target)) {
          this.closeDropdown(trigger, dropdown);
        }
      });
    });
  }

  /**
   * Setup action button listeners (tour, surprise me, donate)
   */
  setupActionButtonListeners() {
    // Prevent duplicate listener setup
    if (this._actionListenersSetup) {
      return;
    }

    // Note: Take Tour button has been moved to floating tour tab component
    // No longer setting up tour button listeners here

    // Surprise Me button - remove existing listeners first
    const surpriseBtn = document.getElementById('surprise-me-nav');
    if (surpriseBtn) {
      // Remove any existing listeners by cloning the element
      const newSurpriseBtn = surpriseBtn.cloneNode(true);
      surpriseBtn.parentNode.replaceChild(newSurpriseBtn, surpriseBtn);

      // Add fresh listener
      newSurpriseBtn.addEventListener('click', e => {
        e.preventDefault();
        this.handleSurpriseAction();
      });
    }

    // Authentication buttons
    const signInBtn = document.getElementById('sign-in-nav');
    const signOutBtn = document.getElementById('sign-out-nav');
    const linkAccountsBtn = document.getElementById('link-accounts-nav');

    if (signInBtn) {
      signInBtn.addEventListener('click', () => this.handleSignIn());
    }
    if (signOutBtn) {
      signOutBtn.addEventListener('click', () => this.handleSignOut());
    }
    if (linkAccountsBtn) {
      linkAccountsBtn.addEventListener('click', () =>
        this.handleLinkAccounts()
      );
    }

    // Mark action listeners as set up to prevent duplicates
    this._actionListenersSetup = true;
    console.log('SharedNavigation: Action listeners setup completed');
  }

  /**
   * Setup mobile navigation listeners
   */
  setupMobileNavigationListeners() {
    // Prevent duplicate listener setup
    if (this._mobileListenersSetup) {
      console.log('Mobile listeners already set up, skipping');
      return;
    }

    const navToggle = document.querySelector('.nav-toggle');
    const mainNav = document.querySelector('.main-nav');

    // console.log('setupMobileNavigationListeners called');
    // console.log('navToggle found:', navToggle);
    // console.log('mainNav found:', mainNav);

    if (!navToggle || !mainNav) {
      // console.log('Mobile nav elements not found - skipping mobile nav setup');
      return;
    }

    // console.log('Setting up mobile nav click listener');

    // Remove any existing listeners by cloning the button
    const newNavToggle = navToggle.cloneNode(true);
    navToggle.parentNode.replaceChild(newNavToggle, navToggle);

    // Add fresh listener to the new button
    newNavToggle.addEventListener('click', e => {
      e.preventDefault();
      // console.log('Hamburger menu clicked!');
      this.toggleMobileNav();
    });

    // Setup mobile-specific dropdown listeners
    this.setupMobileDropdownListeners();

    // Close mobile nav when clicking backdrop
    const navBackdrop = document.querySelector('.nav-backdrop');
    if (navBackdrop) {
      navBackdrop.addEventListener('click', () => {
        this.closeMobileNav();
      });
    }

    // Close mobile nav on escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && mainNav.classList.contains('open')) {
        this.closeMobileNav();
      }
    });

    // Mark mobile listeners as set up
    this._mobileListenersSetup = true;
    // console.log('Mobile navigation listeners setup completed');
  }

  /**
   * Setup mobile-specific dropdown listeners
   */
  setupMobileDropdownListeners() {
    // console.log('Setting up mobile dropdown listeners');

    // Find ALL dropdown triggers, including those with href
    const allDropdownTriggers = document.querySelectorAll(
      '.nav-item-dropdown .nav-link[aria-haspopup="true"]'
    );

    // console.log('Found dropdown triggers:', allDropdownTriggers.length);

    allDropdownTriggers.forEach(trigger => {
      const dropdown = trigger.nextElementSibling;

      /* console.log(
        'Processing trigger:',
        trigger.textContent.trim(),
        'has dropdown:',
        !!dropdown
      ); */

      if (!dropdown) {
        return;
      }

      // Check if this is the categories mega menu
      const isMegaMenu = dropdown.classList.contains('mega-menu');

      if (isMegaMenu) {
        // console.log('Setting up categories mega menu for mobile');
        trigger.addEventListener('click', e => {
          e.preventDefault(); // Prevent navigation in mobile
          // console.log('Categories mega menu clicked in mobile');

          const isOpen = dropdown.classList.contains('open');
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
      if (dropdown.classList.contains('dropdown-menu')) {
        /* console.log(
          'Setting up regular dropdown for:',
          trigger.textContent.trim()
        ); */
        trigger.addEventListener('click', e => {
          e.preventDefault();
          // console.log('Dropdown clicked:', trigger.textContent.trim());

          const isOpen = dropdown.classList.contains('open');
          console.log('Current state - isOpen:', isOpen);

          if (isOpen) {
            console.log('Closing dropdown');
            this.closeDropdown(trigger, dropdown);
          } else {
            console.log('Opening dropdown, closing others first');
            // Close other dropdowns first (including mega menu)
            this.closeAllDropdownsExcept(dropdown);
            this.closeMegaMenu();
            this.openDropdown(trigger, dropdown);
          }
        });
      }
    });

    // Close dropdowns when clicking elsewhere in mobile nav
    const mainNav = document.querySelector('.main-nav');
    if (mainNav) {
      mainNav.addEventListener('click', e => {
        // If click is not on a dropdown trigger or dropdown content
        const clickedDropdown = e.target.closest('.nav-item-dropdown');
        if (!clickedDropdown) {
          console.log('Clicked outside dropdowns, closing all');
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
    const searchInput = document.querySelector('.mega-menu-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', e => {
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
   * Toggle mega menu visibility
   */
  toggleMegaMenu() {
    const megaMenu = document.querySelector('.mega-menu');
    const trigger = document.querySelector(
      '.nav-item-dropdown .nav-link[aria-haspopup="true"]'
    );

    if (!megaMenu || !trigger) return;

    const isOpen = megaMenu.classList.contains('open');

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
    const megaMenu = document.querySelector('.mega-menu');
    const trigger = document.querySelector(
      '.nav-item-dropdown .nav-link[aria-haspopup="true"]'
    );

    if (!megaMenu || !trigger) return;

    // Close other dropdowns first
    this.closeAllDropdowns();

    megaMenu.classList.add('open');
    trigger.setAttribute('aria-expanded', 'true');

    // Force visibility with inline styles for mobile compatibility
    megaMenu.style.setProperty('display', 'block', 'important');
    megaMenu.style.setProperty('visibility', 'visible', 'important');
    megaMenu.style.setProperty('opacity', '1', 'important');

    // Focus first menu item for accessibility
    const firstItem = megaMenu.querySelector('.mega-menu-item');
    if (firstItem) {
      firstItem.focus();
    }
  }

  /**
   * Close mega menu
   */
  closeMegaMenu() {
    const megaMenu = document.querySelector('.mega-menu');
    const trigger = document.querySelector(
      '.nav-item-dropdown .nav-link[aria-haspopup="true"]'
    );

    if (!megaMenu || !trigger) return;

    megaMenu.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');

    // Reset inline styles to allow CSS to take control
    megaMenu.style.removeProperty('display');
    megaMenu.style.removeProperty('visibility');
    megaMenu.style.removeProperty('opacity');
  }

  /**
   * Toggle dropdown menu
   */
  toggleDropdown(trigger, dropdown) {
    const isOpen = dropdown.classList.contains('open');

    if (!isOpen) {
      // Close all OTHER dropdowns first (exclude current one)
      this.closeAllDropdownsExcept(dropdown);

      dropdown.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');

      // Remove any conflicting styles first
      dropdown.style.removeProperty('display');
      dropdown.style.removeProperty('visibility');
      dropdown.style.removeProperty('opacity');

      // Force visibility with inline styles to override any CSS conflicts
      dropdown.style.setProperty('display', 'block', 'important');
      dropdown.style.setProperty('visibility', 'visible', 'important');
      dropdown.style.setProperty('opacity', '1', 'important');
      dropdown.style.setProperty('position', 'absolute', 'important');
      dropdown.style.setProperty('z-index', '9999', 'important');
    } else {
      this.closeDropdown(trigger, dropdown);
    }
  }
  /**
   * Open specific dropdown (for hover events)
   */
  openDropdown(trigger, dropdown) {
    const isOpen = dropdown.classList.contains('open');

    if (!isOpen) {
      // Close all OTHER dropdowns first (exclude current one)
      this.closeAllDropdownsExcept(dropdown);

      dropdown.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');

      // Remove any conflicting styles first
      dropdown.style.removeProperty('display');
      dropdown.style.removeProperty('visibility');
      dropdown.style.removeProperty('opacity');

      // Force visibility with inline styles to override any CSS conflicts
      dropdown.style.setProperty('display', 'block', 'important');
      dropdown.style.setProperty('visibility', 'visible', 'important');
      dropdown.style.setProperty('opacity', '1', 'important');
      dropdown.style.setProperty('position', 'absolute', 'important');
      dropdown.style.setProperty('z-index', '9999', 'important');
    }
  }

  /**
   * Close specific dropdown
   */
  closeDropdown(trigger, dropdown) {
    dropdown.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');

    // Reset inline styles to allow CSS to take control
    dropdown.style.removeProperty('display');
    dropdown.style.removeProperty('visibility');
    dropdown.style.removeProperty('opacity');
    dropdown.style.removeProperty('position');
    dropdown.style.removeProperty('z-index');
  }

  /**
   * Close all open dropdowns
   */
  closeAllDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown-menu');
    const triggers = document.querySelectorAll(
      '.nav-link[aria-haspopup="true"]'
    );

    dropdowns.forEach(dropdown => {
      dropdown.classList.remove('open');
      // Reset inline styles to allow CSS to take control
      dropdown.style.visibility = '';
      dropdown.style.opacity = '';
      dropdown.style.display = '';
    });
    triggers.forEach(trigger => trigger.setAttribute('aria-expanded', 'false'));
  }

  /**
   * Close all open dropdowns except the specified one
   */
  closeAllDropdownsExcept(exceptDropdown) {
    const dropdowns = document.querySelectorAll('.dropdown-menu');
    const triggers = document.querySelectorAll(
      '.nav-link[aria-haspopup="true"]'
    );

    dropdowns.forEach(dropdown => {
      if (dropdown !== exceptDropdown) {
        dropdown.classList.remove('open');
        // Reset inline styles to allow CSS to take control
        dropdown.style.visibility = '';
        dropdown.style.opacity = '';
        dropdown.style.display = '';
      }
    });

    triggers.forEach(trigger => {
      const associatedDropdown = trigger.nextElementSibling;
      if (associatedDropdown !== exceptDropdown) {
        trigger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /**
   * Toggle mobile navigation
   */
  toggleMobileNav() {
    console.log('toggleMobileNav called');
    const navToggle = document.querySelector('.nav-toggle');
    const mainNav = document.querySelector('.main-nav');
    const navBackdrop = document.querySelector('.nav-backdrop');

    console.log('navToggle:', navToggle);
    console.log('mainNav:', mainNav);
    console.log('navBackdrop:', navBackdrop);

    if (!navToggle || !mainNav) {
      console.log('Required elements not found for mobile nav toggle');
      return;
    }

    const isOpen = mainNav.classList.contains('open');
    console.log('Current state - isOpen:', isOpen);

    if (isOpen) {
      console.log('Closing mobile nav');
      this.closeMobileNav();
    } else {
      console.log('Opening mobile nav');
      this.openMobileNav();
    }
  }

  /**
   * Open mobile navigation
   */
  openMobileNav() {
    console.log('openMobileNav called');
    const navToggle = document.querySelector('.nav-toggle');
    const mainNav = document.querySelector('.main-nav');
    const navBackdrop = document.querySelector('.nav-backdrop');

    if (!navToggle || !mainNav) {
      console.log('Elements not found in openMobileNav');
      return;
    }

    // Close all mega menus and dropdowns first
    this.closeMegaMenu();
    this.closeAllDropdowns();

    console.log('Before opening - mainNav classes:', mainNav.className);
    console.log(
      'Before opening - mainNav computed display:',
      window.getComputedStyle(mainNav).display
    );
    console.log(
      'Before opening - mainNav computed right:',
      window.getComputedStyle(mainNav).right
    );
    console.log(
      'Before opening - mainNav computed transform:',
      window.getComputedStyle(mainNav).transform
    );

    // Add class
    mainNav.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
    mainNav.setAttribute('aria-hidden', 'false');

    // Force visibility with inline styles to override any CSS conflicts - RIGHT side
    mainNav.style.setProperty('position', 'fixed', 'important');
    mainNav.style.setProperty('top', '0', 'important');
    mainNav.style.setProperty('right', '0', 'important');
    mainNav.style.setProperty('left', 'auto', 'important');
    mainNav.style.setProperty('width', '100%', 'important');
    mainNav.style.setProperty('height', '100vh', 'important');
    mainNav.style.setProperty('background', 'white', 'important');
    mainNav.style.setProperty('z-index', '9999', 'important');
    mainNav.style.setProperty('display', 'flex', 'important');
    mainNav.style.setProperty('visibility', 'visible', 'important');
    mainNav.style.setProperty('opacity', '1', 'important');
    mainNav.style.setProperty('transform', 'translateX(0)', 'important');

    // Wait a moment then check the result
    setTimeout(() => {
      console.log('After opening - mainNav classes:', mainNav.className);
      console.log(
        'After opening - mainNav computed display:',
        window.getComputedStyle(mainNav).display
      );
      console.log(
        'After opening - mainNav computed right:',
        window.getComputedStyle(mainNav).right
      );
      console.log(
        'After opening - mainNav computed transform:',
        window.getComputedStyle(mainNav).transform
      );
      console.log(
        'After opening - mainNav computed z-index:',
        window.getComputedStyle(mainNav).zIndex
      );
      console.log(
        'After opening - mainNav bounding rect:',
        mainNav.getBoundingClientRect()
      );
    }, 100);

    if (navBackdrop) {
      navBackdrop.classList.add('open');
    }

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  /**
   * Close mobile navigation
   */
  closeMobileNav() {
    const navToggle = document.querySelector('.nav-toggle');
    const mainNav = document.querySelector('.main-nav');
    const navBackdrop = document.querySelector('.nav-backdrop');

    if (!navToggle || !mainNav) return;

    mainNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    mainNav.setAttribute('aria-hidden', 'true');

    // Reset all inline styles to allow CSS to take control
    mainNav.style.removeProperty('position');
    mainNav.style.removeProperty('top');
    mainNav.style.removeProperty('left');
    mainNav.style.removeProperty('right');
    mainNav.style.removeProperty('width');
    mainNav.style.removeProperty('height');
    mainNav.style.removeProperty('background');
    mainNav.style.removeProperty('z-index');
    mainNav.style.removeProperty('display');
    mainNav.style.removeProperty('visibility');
    mainNav.style.removeProperty('opacity');
    mainNav.style.removeProperty('transform');

    if (navBackdrop) {
      navBackdrop.classList.remove('open');
    }

    // Restore body scroll
    document.body.style.overflow = '';
  }

  /**
   * Filter mega menu items based on search query
   */
  filterMegaMenuItems(query) {
    const items = document.querySelectorAll('.mega-menu-item');
    const normalizedQuery = query.toLowerCase().trim();

    items.forEach(item => {
      const title = item.querySelector('h4')?.textContent.toLowerCase() || '';
      const description =
        item.querySelector('p')?.textContent.toLowerCase() || '';

      const matches =
        title.includes(normalizedQuery) ||
        description.includes(normalizedQuery);

      if (matches || normalizedQuery === '') {
        item.style.display = '';
      } else {
        item.style.display = 'none';
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
      typeof window.app !== 'undefined' &&
      window.app.handleCategorySelection
    ) {
      window.app.handleCategorySelection(category);
    } else {
      // Fallback: scroll to categories or navigate to categories page
      this.navigateToCategory(category);
    }
  }

  /**
   * Navigate to category (fallback method)
   */
  navigateToCategory(category) {
    // If on home page, scroll to specific category or categories section
    if (this.currentPage === 'home') {
      // First try to scroll to the specific category section
      const specificCategorySection = document.getElementById(
        `category-${category}`
      );
      if (specificCategorySection) {
        specificCategorySection.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
        return;
      }

      // Fallback to general categories section
      const categoriesSection = document.getElementById('categories');
      if (categoriesSection) {
        categoriesSection.scrollIntoView({ behavior: 'smooth' });
        return;
      }
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
      console.log(
        'SharedNavigation: Tour action already in progress, ignoring duplicate call'
      );
      return;
    }

    this._tourActionInProgress = true;

    // Reset the flag after a short delay
    setTimeout(() => {
      this._tourActionInProgress = false;
    }, 1000);

    console.log('SharedNavigation: Tour action triggered');

    // Close mobile nav if open
    this.closeMobileNav();

    // Trigger tour through app instance or fallback
    if (typeof window.app !== 'undefined' && window.app.startOnboardingTour) {
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
    if (typeof window.app !== 'undefined' && window.app.launchRandomScenario) {
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
    if (typeof window.app !== 'undefined' && window.app.authService) {
      window.app.authService.signIn();
    } else {
      // Authentication not available
    }
  }

  /**
   * Handle sign out action
   */
  handleSignOut() {
    // Sign out action triggered

    // Trigger sign out through app instance or fallback
    if (typeof window.app !== 'undefined' && window.app.authService) {
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
    if (typeof window.app !== 'undefined' && window.app.authService) {
      window.app.authService.linkAccounts();
    } else {
      // Authentication not available
    }
  }

  /**
   * Update user display in navigation
   */
  updateUserDisplay(user) {
    const guestContent = document.querySelector('[data-guest-content]');
    const userContent = document.querySelector('[data-user-content]');
    const userNameElement = document.getElementById('nav-user-name');

    if (user) {
      // User is signed in
      if (guestContent) guestContent.style.display = 'none';
      if (userContent) userContent.style.display = 'block';
      if (userNameElement) {
        userNameElement.textContent = `Welcome, ${user.displayName || user.email || 'User'}!`;
      }
    } else {
      // User is not signed in
      if (guestContent) guestContent.style.display = 'block';
      if (userContent) userContent.style.display = 'none';
    }
  }

  /**
   * Create fallback navigation HTML if loading fails
   */
  createFallbackNavigation() {
    return `
            <header class="header" role="banner">
                <div class="header-container">
                    <div class="logo">
                        <img src="src/assets/icons/logo.svg" alt="SimulateAI Educational Platform" class="logo-image">
                        <h1 class="site-title">SimulateAI</h1>
                    </div>
                    <nav class="main-nav" role="navigation" aria-label="Main navigation">
                        <ul class="nav-list">
                            <li><a href="index.html" class="nav-link" data-page="home">Home</a></li>
                            <li><a href="app.html" class="nav-link" data-page="scenarios">Scenarios</a></li>
                            <li><a href="blog.html" class="nav-link" data-page="blog">Blog</a></li>
                            <li><a href="profile.html" class="nav-link" data-page="profile">Profile</a></li>
                            <li><a href="donate.html" class="nav-link donate-btn" data-page="donate">💖 Donate</a></li>
                        </ul>
                    </nav>
                </div>
            </header>
        `;
  }

  /**
   * Handle errors in navigation loading or functionality
   */
  handleError(_error) {
    // SharedNavigation error occurred

    // Try to ensure basic navigation is available
    if (!document.querySelector('header.header')) {
      document.body.insertAdjacentHTML(
        'afterbegin',
        this.createFallbackNavigation()
      );
      this.reinitializeAfterInjection();
    }
  }

  /**
   * Clean up event listeners and resources
   */
  destroy() {
    // Remove event listeners
    // (In a real implementation, you'd store references to listeners for removal)

    this.isInitialized = false;
    this.navHTML = null;
    this.loadingPromise = null;
  }

  /**
   * Add moderation link for privileged users
   */
  async addModerationLink() {
    // Check if user has moderation privileges
    if (!this.canModerate()) return;

    const navList = document.querySelector('.nav-list');
    if (!navList) return;

    // Check if moderation link already exists
    if (document.querySelector('[data-page="moderation"]')) return;

    // Create moderation link
    const moderationItem = document.createElement('li');
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
    if (typeof window !== 'undefined' && window.authService) {
      const { userProfile } = window.authService;
      return (
        userProfile?.role === 'moderator' ||
        userProfile?.role === 'admin' ||
        userProfile?.tier >= MODERATOR_TIER_THRESHOLD
      );
    }
    return false;
  }
}

// Create global instance - prevent multiple instances
window.SharedNavigation = SharedNavigation;

// Debug function for manual testing
window.debugMobileNav = function () {
  const nav = window.sharedNav;
  if (nav) {
    console.log('Manual mobile nav toggle');
    nav.toggleMobileNav();
  } else {
    console.log('SharedNavigation instance not found');
  }
};

// Auto-initialize if DOM is ready - with better duplicate prevention
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.sharedNav) {
      console.log('SharedNavigation: Initializing on DOMContentLoaded');
      window.sharedNav = new SharedNavigation();
      window.sharedNav.init();
    } else {
      console.log(
        'SharedNavigation: Instance already exists, skipping DOMContentLoaded initialization'
      );
    }
  });
} else {
  // DOM is already ready
  if (!window.sharedNav) {
    console.log('SharedNavigation: Initializing immediately (DOM ready)');
    window.sharedNav = new SharedNavigation();
    window.sharedNav.init();
  } else {
    console.log(
      'SharedNavigation: Instance already exists, skipping immediate initialization'
    );
  }
}
