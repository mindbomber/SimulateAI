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
 * Main Application - SimulateAI Educational Platform
 * Initializes the platform and manages the overall application state
 */

// Import core modules
import EthicsSimulation from './core/simulation.js';
import AccessibilityManager from './core/accessibility.js';
import AnimationManager from './core/animation-manager.js';
import EducatorToolkit from './core/educator-toolkit.js';
import DigitalScienceLab from './core/digital-science-lab.js';
import ScenarioGenerator from './core/scenario-generator.js';

// Import utilities
import { userPreferences, userProgress } from './utils/simple-storage.js';
import { simpleAnalytics } from './utils/simple-analytics.js';
import Helpers from './utils/helpers.js';
import canvasManager from './utils/canvas-manager.js';
import logger from './utils/logger.js';
import focusManager from './utils/focus-manager.js';
import scrollManager from './utils/scroll-manager.js';
import { loopDetector } from './utils/infinite-loop-detector.js';

// Import enhanced objects (loaded dynamically as needed)
// import { EthicsMeter, InteractiveButton, InteractiveSlider } from './objects/enhanced-objects.js';

// Import new modal components
import PreLaunchModal from './components/pre-launch-modal.js';
import { EnhancedSimulationModal } from './components/enhanced-simulation-modal.js';
import { PostSimulationModal } from './components/post-simulation-modal.js';
import ModalFooterManager from './components/modal-footer-manager.js';
import CategoryGrid from './components/category-grid.js';
import RadarChart from './components/radar-chart.js';
import OnboardingTour from './components/onboarding-tour.js';
import { getAllCategories, getCategoryScenarios } from '../data/categories.js';
import MCPIntegrationManager from './integrations/mcp-integration-manager.js';

// Community and Authentication Services
import AuthService from './services/auth-service.js';

// Constants for app configuration
const APP_CONSTANTS = {
  VIEWPORT: {
    MOBILE_BREAKPOINT: 767,
  },
  DEFAULTS: {
    SCORE_VALUE: 0.5,
    SLIDER_VALUE: 50,
    METER_VALUE: 0.5,
    ETHICS_METER_VALUE: 50,
  },
  FEEDBACK: {
    EXCELLENT_THRESHOLD: 70,
    GOOD_THRESHOLD: 50,
  },
  TIMING: {
    ANIMATION_DELAY: 300,
    NOTIFICATION_DURATION: 4000,
    STAGGER_DELAY: 300,
    QUICK_DELAY: 50,
    FOCUS_DELAY: 100,
    NAV_CLOSE_DELAY: 0,
  },
};

// Debug utility to replace console statements
const AppDebug = {
  log: (message, data = null) => {
    if (window.DEBUG_MODE || localStorage.getItem('debug') === 'true') {
      // eslint-disable-next-line no-console
      console.log(`[App] ${message}`, data || '');
    }
  },
  warn: (message, data = null) => {
    if (window.DEBUG_MODE || localStorage.getItem('debug') === 'true') {
      // eslint-disable-next-line no-console
      console.warn(`[App] ${message}`, data || '');
    }
  },
  error: (message, error = null) => {
    // Always show errors
    // eslint-disable-next-line no-console
    console.error(`[App] ${message}`, error || '');
  },
};

class AIEthicsApp {
  constructor() {
    // Version identifier for debugging
    this.version = 'v2.0.1-context-fixes';
    logger.info(`[App] Initializing AIEthicsApp ${this.version}`);

    this.currentSimulation = null;
    this.engine = null;
    this.visualEngine = null;
    this.simulations = new Map();
    this.isInitialized = false;
    this.heroDemo = null;

    // Modernized managers
    this.accessibilityManager = null;
    this.animationManager = null;

    // Core educational modules
    this.educatorToolkit = null;
    this.digitalScienceLab = null;
    this.scenarioGenerator = null;

    // Enhanced objects for UI
    this.ethicsMeters = new Map();
    this.interactiveButtons = new Map();
    this.simulationSliders = new Map();

    // Canvas management IDs
    this.currentSimulationCanvasId = null;
    this.ethicsMetersCanvasId = null;
    this.interactiveButtonsCanvasId = null;
    this.simulationSlidersCanvasId = null;
    this.heroDemoCanvasId = null;

    // UI elements
    this.modal = null;
    this.enhancedModal = null;
    this.simulationContainer = null;
    this.categoriesGrid = null;
    this.lastFocusedElement = null; // For focus restoration

    // Theme and preferences
    this.currentTheme = 'light';
    this.preferences = {
      reducedMotion: false,
      highContrast: false,
      largeText: false,
    };

    // Error handling
    this.errorBoundary = null;
    this.lastError = null;

    // Onboarding tour
    this.onboardingTour = null;

    // MCP Integration Manager
    this.mcpManager = null;
    this.mcpCapabilities = new Set();

    // Community and Authentication Services
    this.firebaseService = null;
    this.authService = null;
    this.currentUser = null;
    this.userWelcomed = false; // Track if user has been welcomed this session

    // Available simulation categories (each containing multiple scenarios)
    // NOTE: These are thematic categories, not individual scenarios
    this.availableSimulations = [
      {
        id: 'bias-fairness',
        title: 'AI Ethics Explorer',
        description:
          'Explore real-world AI scenarios and see how different choices affect various groups in society. No right answers - just learning through cause and effect.',
        difficulty: 'beginner',
        duration: 1200, // 20 minutes
        thumbnail: null, // Placeholder - will use default thumbnail
        tags: ['ethics', 'fairness', 'education', 'scenarios', 'open-ended'],
        useCanvas: false, // HTML-only simulation, no canvas needed
        renderMode: 'html',
      },
      {
        id: 'consent-transparency',
        title: 'Consent & Transparency',
        description:
          'Learn about informed consent and the importance of transparency in AI systems.',
        difficulty: 'beginner',
        duration: 480, // 8 minutes
        thumbnail: 'src/assets/images/consent-transparency-thumb.svg',
        tags: ['consent', 'transparency', 'privacy', 'communication'],
      },
      {
        id: 'autonomy-oversight',
        title: 'Autonomy & Oversight',
        description:
          'Balance AI autonomy with human oversight in critical decision-making scenarios.',
        difficulty: 'intermediate',
        duration: 720, // 12 minutes
        thumbnail: 'src/assets/images/autonomy-oversight-thumb.svg',
        tags: ['autonomy', 'oversight', 'control', 'responsibility'],
      },
      {
        id: 'misinformation-trust',
        title: 'Misinformation & Trust',
        description:
          'Combat misinformation and build trustworthy AI communication systems.',
        difficulty: 'advanced',
        duration: 900, // 15 minutes
        thumbnail: 'src/assets/images/misinformation-trust-thumb.svg',
        tags: ['misinformation', 'trust', 'communication', 'verification'],
      },
    ];
  }
  async init() {
    if (this.isInitialized) return;

    try {
      AppDebug.log('🚀 Starting AIEthicsApp initialization...');

      // Initialize scroll manager first (handles all scroll behavior)
      scrollManager.init();

      // Initialize theme detection first
      this.initializeTheme();

      // Initialize error handling
      this.initializeErrorHandling();

      // Initialize infinite loop detection (development mode only)
      this.initializeLoopDetection();

      // Initialize core systems
      await this.initializeSystems();

      // Setup UI
      this.setupUI();

      // Load simulations
      await this.loadSimulations();

      // Setup event listeners
      this.setupEventListeners();

      // Initialize accessibility
      this.setupAccessibility();

      // Render initial state
      this.render();

      // Initialize hero demo
      await this.initializeHeroDemo();

      // Initialize enhanced objects (after visual engine is set up)
      await this.initializeEnhancedObjects();

      // Initialize modal footer management
      this.initializeModalFooterManager();

      // Initialize ethics radar demo
      await this.initializeEthicsRadarDemo();

      // Initialize onboarding tour for first-time users (prevent multiple instances)
      if (!this.onboardingTour && !window.onboardingTourInstance) {
        this.onboardingTour = new OnboardingTour();

        // Make onboarding tour available globally for debugging
        window.onboardingTourInstance = this.onboardingTour;

        // Instrument onboarding tour for loop detection (development mode)
        this.instrumentOnboardingTour(this.onboardingTour);

        // Check and start onboarding tour for first-time users
        this.checkAndStartOnboardingTour();
      } else {
        AppDebug.warn(
          'OnboardingTour instance already exists, skipping initialization'
        );
      }

      // Initialize scroll reveal header
      this.initializeScrollRevealHeader();

      // Initialize MCP integrations
      await this.initializeMCPIntegrations();

      // Initialize Firebase and Authentication
      await this.initializeFirebaseServices();

      this.isInitialized = true;
      AppDebug.log(
        'AI Ethics App initialized successfully with modernized infrastructure'
      );

      // Track initialization
      simpleAnalytics.trackEvent('app_initialized', {
        simulations_available: this.availableSimulations.length,
        browser: Helpers.getBrowserInfo().browser,
        device: Helpers.getDeviceType(),
        theme: this.currentTheme,
        accessibility_enabled:
          this.preferences.highContrast || this.preferences.largeText,
      });
    } catch (error) {
      AppDebug.error('Failed to initialize app:', error);
      this.handleError(
        error,
        'Failed to initialize the application. Please refresh the page.'
      );
    }
  }

  /**
   * Initialize theme detection and monitoring
   */
  initializeTheme() {
    // Detect system preferences
    const prefersReducedMotion = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const prefersHighContrast = window.matchMedia?.(
      '(prefers-contrast: high)'
    ).matches;

    // Get saved user preferences (they override system preferences)
    const savedPreferences = userPreferences.getAccessibilitySettings();

    // Use saved preferences if they exist, otherwise use system preferences
    this.preferences = {
      reducedMotion:
        savedPreferences.reducedMotion !== undefined
          ? savedPreferences.reducedMotion
          : prefersReducedMotion,
      highContrast:
        savedPreferences.highContrast !== undefined
          ? savedPreferences.highContrast
          : prefersHighContrast,
      largeText: savedPreferences.largeText || false, // Default to false
    };

    this.currentTheme = this.preferences.highContrast
      ? 'high-contrast'
      : 'light';

    // Apply initial theme
    this.applyTheme();

    // Monitor theme changes
    this.setupThemeMonitoring();

    AppDebug.log('Theme initialized:', this.currentTheme, this.preferences);
  }

  /**
   * Initialize scroll reveal header functionality
   */
  initializeScrollRevealHeader() {
    const header = document.querySelector('.header');
    if (!header) return;

    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Don't hide header at the very top of the page
      if (currentScrollY <= 10) {
        header.classList.remove('header-hidden');
        header.classList.add('header-visible');
      } else {
        // Hide header when scrolling down, show when scrolling up
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          // Scrolling down - hide header
          header.classList.add('header-hidden');
          header.classList.remove('header-visible');
        } else if (currentScrollY < lastScrollY) {
          // Scrolling up - show header
          header.classList.remove('header-hidden');
          header.classList.add('header-visible');
        }
      }

      lastScrollY = currentScrollY;
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });

    // Initialize header as visible
    header.classList.add('header-visible');

    AppDebug.log('Scroll reveal header initialized');
  }

  /**
   * Setup theme change monitoring
   */
  setupThemeMonitoring() {
    const reducedMotionQuery = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)'
    );
    const highContrastQuery = window.matchMedia?.('(prefers-contrast: high)');

    const handleThemeChange = () => {
      // Get current saved preferences to check which ones are user-set
      const savedPreferences = userPreferences.getAccessibilitySettings();

      // Only update preferences that haven't been explicitly set by the user
      const newPreferences = { ...this.preferences };

      // Update system-based preferences only if user hasn't overridden them
      if (savedPreferences.reducedMotion === undefined) {
        newPreferences.reducedMotion = reducedMotionQuery?.matches || false;
      }
      if (savedPreferences.highContrast === undefined) {
        newPreferences.highContrast = highContrastQuery?.matches || false;
      }
      // largeText is always user-controlled, so never auto-update it

      if (JSON.stringify(newPreferences) !== JSON.stringify(this.preferences)) {
        this.preferences = newPreferences;
        this.currentTheme = newPreferences.highContrast
          ? 'high-contrast'
          : 'light';
        this.applyTheme();
        this.announceThemeChange();

        AppDebug.log(
          'System theme changed, updated non-user-set preferences:',
          newPreferences
        );
      }
    };

    reducedMotionQuery?.addEventListener?.('change', handleThemeChange);
    highContrastQuery?.addEventListener?.('change', handleThemeChange);
  }

  /**
   * Apply current theme to the application
   */
  applyTheme() {
    const { body } = document;

    // Remove existing theme classes
    body.classList.remove('high-contrast', 'reduced-motion', 'large-text');

    // Apply current theme classes
    if (this.preferences.highContrast) body.classList.add('high-contrast');
    if (this.preferences.reducedMotion) body.classList.add('reduced-motion');
    if (this.preferences.largeText) body.classList.add('large-text');

    // Update button states (aria-pressed attributes)
    this.updateButtonStates();

    // Update theme color meta tag
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      const themeColor = '#1a73e8'; // Always use light theme color
      themeColorMeta.setAttribute('content', themeColor);
    }

    // Update managers if they exist
    if (this.animationManager) {
      // Update the animation manager theme when preferences change
      this.animationManager.updateAnimationDefaults();
    }

    if (this.accessibilityManager) {
      this.accessibilityManager.updateTheme(this.preferences);
    }
  }

  /**
   * Update accessibility button states
   */
  updateButtonStates() {
    const highContrastBtn = document.getElementById('toggle-high-contrast');
    const largeTextBtn = document.getElementById('toggle-large-text');
    const reducedMotionBtn = document.getElementById('toggle-reduced-motion');

    if (highContrastBtn) {
      highContrastBtn.setAttribute(
        'aria-pressed',
        this.preferences.highContrast.toString()
      );
    }
    if (largeTextBtn) {
      largeTextBtn.setAttribute(
        'aria-pressed',
        this.preferences.largeText.toString()
      );
    }
    if (reducedMotionBtn) {
      reducedMotionBtn.setAttribute(
        'aria-pressed',
        this.preferences.reducedMotion.toString()
      );
    }
  }

  /**
   * Announce theme changes for accessibility
   */
  announceThemeChange() {
    const announcement = `Theme changed to ${this.currentTheme.replace('-', ' ')} mode`;

    if (this.accessibilityManager) {
      this.accessibilityManager.announce(announcement);
    } else {
      // Fallback announcement
      const liveRegion = document.getElementById('aria-live-polite');
      if (liveRegion) {
        liveRegion.textContent = announcement;
      }
    }
  }

  /**
   * Initialize error handling and recovery
   */
  initializeErrorHandling() {
    // Create error boundary element
    this.errorBoundary = document.getElementById('error-boundary');

    // Global error handlers
    window.addEventListener('error', event => {
      this.handleError(event.error, 'A JavaScript error occurred');
    });

    window.addEventListener('unhandledrejection', event => {
      this.handleError(event.reason, 'An unhandled promise rejection occurred');
    });

    AppDebug.log('Error handling initialized');
  }

  /**
   * Enhanced error handling with recovery options
   */
  handleError(error, userMessage = 'An unexpected error occurred') {
    this.lastError = error;
    AppDebug.error('App Error:', error);

    // Track error for analytics
    simpleAnalytics.trackEvent('app_error', {
      error_message: error.message || String(error),
      error_stack: error.stack,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });

    // Show error to user
    this.showError(userMessage);

    // Announce error for accessibility
    if (this.accessibilityManager) {
      this.accessibilityManager.announce(`Error: ${userMessage}`, 'assertive');
    }
  }

  /**
   * Show error in error boundary
   */
  showError(message, isRecoverable = true) {
    if (!this.errorBoundary) {
      // Fallback to alert if no error boundary
      alert(message);
      return;
    }

    const errorContent = this.errorBoundary.querySelector('.error-content');
    if (errorContent) {
      const messageEl = errorContent.querySelector('.error-message');
      const retryBtn = errorContent.querySelector('#retry-action');
      const reportBtn = errorContent.querySelector('#report-error');

      if (messageEl) messageEl.textContent = message;

      // Setup retry functionality
      if (retryBtn && isRecoverable) {
        retryBtn.style.display = 'inline-block';
        retryBtn.onclick = () => {
          this.hideError();
          // Attempt to recover by reinitializing
          if (!this.isInitialized) {
            this.init();
          }
        };
      } else if (retryBtn) {
        retryBtn.style.display = 'none';
      }

      // Setup error reporting
      if (reportBtn) {
        reportBtn.onclick = () => {
          this.reportError();
        };
      }
    }

    this.errorBoundary.setAttribute('aria-hidden', 'false');
    this.errorBoundary.style.display = 'flex';
  }

  /**
   * Hide error boundary
   */
  hideError() {
    if (this.errorBoundary) {
      this.errorBoundary.setAttribute('aria-hidden', 'true');
      this.errorBoundary.style.display = 'none';
    }
  }

  /**
   * Report error to analytics/support
   */
  reportError() {
    if (this.lastError) {
      const errorReport = {
        message: this.lastError.message || String(this.lastError),
        stack: this.lastError.stack,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        appState: {
          initialized: this.isInitialized,
          currentSimulation: this.currentSimulation?.id,
          theme: this.currentTheme,
        },
      };

      // Send to analytics
      simpleAnalytics.trackEvent('error_reported', errorReport);

      // Show confirmation
      alert(
        'Error report sent. Thank you for helping us improve the application.'
      );
    }
  }

  async initializeSystems() {
    try {
      // Initialize animation manager with theme preferences
      this.animationManager = new AnimationManager({
        enableAnimations: !this.preferences.reducedMotion,
        reducedMotion: this.preferences.reducedMotion,
        performanceMode: this.preferences.reducedMotion
          ? 'compatibility'
          : 'balanced',
      });

      // Initialize accessibility manager with current preferences
      this.accessibilityManager = new AccessibilityManager(document.body, {
        theme: this.currentTheme,
        preferences: this.preferences,
      });

      // Initialize core educational modules
      await this.initializeCoreModules();

      // Visual Engine will be initialized later when we have canvas elements
      // Just store the configuration for now
      this.visualEngineConfig = {
        renderMode: 'canvas',
        accessibility: true,
        highPerformance: !this.preferences.reducedMotion,
        debug: false,
        highContrast: this.preferences.highContrast,
        reducedMotion: this.preferences.reducedMotion,
      };

      // Systems are already initialized via their modules
      // Simple analytics auto-initializes
      AppDebug.log('Core systems initialized with modernized infrastructure');
    } catch (error) {
      AppDebug.error('Failed to initialize systems:', error);
      throw error;
    }
  }

  /**
   * Initialize core educational modules
   */
  async initializeCoreModules() {
    try {
      // Initialize Educator Toolkit
      this.educatorToolkit = new EducatorToolkit();
      AppDebug.log('Educator Toolkit initialized');

      // Initialize Digital Science Lab
      this.digitalScienceLab = new DigitalScienceLab();
      AppDebug.log('Digital Science Lab initialized');

      // Initialize Scenario Generator
      this.scenarioGenerator = new ScenarioGenerator();
      AppDebug.log('Scenario Generator initialized');

      // Connect the modules for integrated functionality
      this.connectEducationalModules();
    } catch (error) {
      AppDebug.error('Failed to initialize core educational modules:', error);
      throw error;
    }
  }

  /**
   * Connect educational modules for integrated functionality
   */
  connectEducationalModules() {
    // Connect scenario generator to educator toolkit for assessment alignment
    if (this.educatorToolkit && this.scenarioGenerator) {
      this.educatorToolkit.setScenarioGenerator(this.scenarioGenerator);
    }

    // Connect digital science lab to both toolkit and generator
    if (this.digitalScienceLab) {
      if (this.educatorToolkit) {
        this.digitalScienceLab.setEducatorToolkit(this.educatorToolkit);
      }
      if (this.scenarioGenerator) {
        this.digitalScienceLab.setScenarioGenerator(this.scenarioGenerator);
      }
    }

    AppDebug.log('Educational modules connected successfully');
  }

  /**
   * Connect core educational modules to a simulation instance
   * @param {Object} simulation - The simulation instance
   * @param {Object} config - The simulation configuration
   */
  connectModulesToSimulation(simulation, config) {
    try {
      // Connect Educator Toolkit
      if (this.educatorToolkit && simulation) {
        simulation.educatorToolkit = this.educatorToolkit;

        // Get curriculum alignment for this simulation
        const curriculumAlignment = this.educatorToolkit.getCurriculumAlignment(
          config.tags || []
        );
        if (curriculumAlignment) {
          simulation.curriculumAlignment = curriculumAlignment;
        }

        // Get assessment tools for this simulation
        const assessmentTools = this.educatorToolkit.getAssessmentTools(
          config.difficulty
        );
        if (assessmentTools) {
          simulation.assessmentTools = assessmentTools;
        }
      }

      // Connect Digital Science Lab
      if (this.digitalScienceLab && simulation) {
        simulation.digitalScienceLab = this.digitalScienceLab;

        // Get relevant lab stations for this simulation
        const relevantStations = this.digitalScienceLab.getRelevantStations(
          config.tags || []
        );
        if (relevantStations) {
          simulation.labStations = relevantStations;
        }
      }

      // Connect Scenario Generator
      if (this.scenarioGenerator && simulation) {
        simulation.scenarioGenerator = this.scenarioGenerator;

        // If this simulation can use generated scenarios, provide them
        if (simulation.supportsGeneratedScenarios) {
          const generatedScenarios = this.scenarioGenerator.generateScenarios(
            config.tags?.[0] || 'general',
            config.difficulty || 'beginner'
          );
          if (generatedScenarios) {
            simulation.generatedScenarios = generatedScenarios;
          }
        }
      }

      AppDebug.log(
        `Educational modules connected to simulation: ${simulation.id || 'unknown'}`
      );
    } catch (error) {
      AppDebug.error(
        'Failed to connect educational modules to simulation:',
        error
      );
      // Non-critical error - simulation can still function without full integration
    }
  }

  setupUI() {
    // Get key UI elements
    this.modal = document.getElementById('simulation-modal');
    this.simulationContainer = document.getElementById('simulation-container');
    this.categoriesGrid = document.querySelector('.categories-grid');
    this.loading = document.getElementById('loading');

    if (!this.categoriesGrid) {
      AppDebug.error('Categories grid not found');
      return;
    }

    // Initialize CategoryGrid
    this.initializeCategoryGrid();
  }

  /**
   * Initialize the new category grid system
   */
  initializeCategoryGrid() {
    try {
      AppDebug.log('Attempting to initialize CategoryGrid...');
      this.categoryGrid = new CategoryGrid();
      AppDebug.log('Category grid initialized successfully');
    } catch (error) {
      AppDebug.error('Failed to initialize category grid:', error);
      // Fallback to legacy simulation loading if category grid fails
      this.loadLegacySimulations();
    }
  }

  /**
   * Fallback method for legacy simulation loading
   */
  loadLegacySimulations() {
    AppDebug.log('Loading legacy simulation cards as fallback');
    // This will be populated with existing simulation loading logic if needed
    // For now, just log that we're in fallback mode
  }

  async loadSimulations() {
    // Simulations are loaded dynamically in createSimulationInstance()
    // Store available simulation configs in the simulations Map
    this.availableSimulations.forEach(simConfig => {
      this.simulations.set(simConfig.id, simConfig);
    });
  }

  /**
   * Initialize hero demo component
   * Currently using radar chart demo instead of HeroDemo class
   */
  async initializeHeroDemo() {
    // The HeroDemo class is designed for a different hero layout
    // that's not currently implemented. The radar chart demo is working fine.
    logger.info('Hero demo: Using radar chart demo instead of HeroDemo class');
  }

  /**
   * Initialize enhanced objects (visual components)
   */
  async initializeEnhancedObjects() {
    try {
      // Enhanced objects are loaded dynamically when needed
      // This method is kept for future initialization if needed
      logger.info('Enhanced objects system ready for dynamic loading');
    } catch (error) {
      logger.error('Failed to initialize enhanced objects:', error);
      // Non-critical error - app can continue with basic functionality
    }
  }

  /**
   * Initialize modal footer management system
   */
  initializeModalFooterManager() {
    try {
      // Initialize the modal footer manager
      this.modalFooterManager = new ModalFooterManager();

      // Store reference for cleanup
      this.modalFooterManager.app = this;

      logger.info('Modal footer manager initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize modal footer manager:', error);
      // Non-critical error - modals will still work with basic functionality
    }
  }

  /**
   * Initialize ethics radar demo system
   */
  async initializeEthicsRadarDemo() {
    try {
      // Only initialize if the hero demo container exists
      const demoContainer = document.getElementById('hero-ethics-chart');
      if (demoContainer) {
        // Initialize the ethics radar demo
        ethicsDemo = new EthicsRadarDemo();

        logger.info('Ethics radar demo initialized successfully');
      } else {
        logger.warn(
          'Hero ethics chart container not found, skipping radar demo initialization'
        );
      }
    } catch (error) {
      logger.error('Failed to initialize ethics radar demo:', error);
      // Non-critical error - the demo is optional
    }
  }

  setupEventListeners() {
    // Mobile navigation functionality
    this.setupMobileNavigation();

    // Surprise Me functionality
    this.setupSurpriseMe();

    // Hero section buttons
    const startLearningBtn = document.getElementById('start-learning');

    if (startLearningBtn) {
      startLearningBtn.addEventListener('click', () => {
        this.scrollToSimulations();
      });
    }

    // Debug: Test scenario modal button
    const testScenarioBtn = document.getElementById('test-scenario-modal');
    if (testScenarioBtn) {
      testScenarioBtn.addEventListener('click', () => {
        this.testScenarioModal();
      });
    }

    // Take Tour button in navigation
    const tourBtn = document.getElementById('start-tour-nav');
    if (tourBtn) {
      tourBtn.addEventListener('click', e => {
        e.preventDefault(); // Prevent default link behavior
        this.startOnboardingTour();

        // Close mobile navigation if open, with proper focus management
        const navToggle = document.querySelector('.nav-toggle');
        const mainNav = document.querySelector('.main-nav');
        if (mainNav && mainNav.classList.contains('open')) {
          // Move focus away from the clicked tour button before hiding navigation
          if (navToggle) {
            navToggle.focus();
          } else {
            document.body.focus();
          }

          // Close navigation after focus has moved
          setTimeout(() => {
            mainNav.classList.remove('open');
            navToggle?.setAttribute('aria-expanded', 'false');
            mainNav.setAttribute('aria-hidden', 'true');

            // Also handle nav backdrop if present
            const navBackdrop = document.querySelector('.nav-backdrop');
            if (navBackdrop) {
              navBackdrop.classList.remove('open');
            }
          }, 0);
        }
      });
    }

    // Modal controls
    if (this.modal) {
      const closeBtn = this.modal.querySelector('.modal-close');
      const resetBtn = document.getElementById('reset-simulation');
      const nextBtn = document.getElementById('next-scenario');

      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.closeSimulation());

        // Add focus trapping to the modal
        this.modal.addEventListener('keydown', e => {
          if (e.key === 'Tab') {
            this.trapFocusInModal(e);
          }
        });
      }

      if (resetBtn) {
        resetBtn.addEventListener('click', () => this.resetCurrentSimulation());
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', () => this.nextScenario());
      }

      // Close modal on backdrop click
      this.modal.addEventListener('click', e => {
        if (e.target === this.modal) {
          this.closeSimulation();
        }
      });

      // Close modal on Escape key
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !this.modal.hasAttribute('aria-hidden')) {
          this.closeSimulation();
        }
      });
    }

    // Enhanced simulation card buttons (delegated event handling)
    document.addEventListener('click', e => {
      if (e.target.classList.contains('enhanced-sim-button')) {
        e.preventDefault();
        const simulationId = e.target.getAttribute('data-simulation');
        if (simulationId) {
          // Learning Lab button - go through pre-launch modal
          this.startSimulation.call(this, simulationId);
        }
      } else if (e.target.classList.contains('simulation-quick-start-btn')) {
        e.preventDefault();
        const simulationId = e.target.getAttribute('data-simulation');
        if (simulationId) {
          // Quick start button - skip pre-launch modal
          this.launchSimulationDirect.call(this, simulationId);
        }
      }
    });
  }

  /**
   * Check if this is a first-time visit and start onboarding tour
   */
  checkAndStartOnboardingTour() {
    if (!this.onboardingTour) {
      return;
    }

    // Check if user has completed the tour
    if (this.onboardingTour.hasCompletedTour()) {
      AppDebug.log('User has already completed onboarding tour');
      return;
    }

    // Check if this is a first-time visit
    if (this.onboardingTour.isFirstTimeVisit()) {
      AppDebug.log('First-time visit detected, starting onboarding tour');
      // Small delay to ensure all UI is ready
      const UI_READY_DELAY = 500; // ms
      setTimeout(() => {
        this.onboardingTour.startTour(1);
      }, UI_READY_DELAY);
    }
  }

  /**
   * Manually start the onboarding tour (for testing)
   */
  startOnboardingTour() {
    if (!this.onboardingTour && !window.onboardingTourInstance) {
      this.onboardingTour = new OnboardingTour();
      // Make onboarding tour available globally for debugging
      window.onboardingTourInstance = this.onboardingTour;
    } else if (window.onboardingTourInstance) {
      this.onboardingTour = window.onboardingTourInstance;
    }

    // Clear localStorage to force tour to start
    localStorage.removeItem('has_visited');
    localStorage.removeItem('tour_completed');

    AppDebug.log('Manually starting onboarding tour');
    this.onboardingTour.startTour(1);
  }

  setupAccessibility() {
    // Preferences are now loaded in initializeTheme(), so we just need to ensure
    // the theme is applied (which was already done in initializeTheme)
    // This method is kept for future accessibility setup if needed
  }

  render() {
    // Skip rendering the old simulations grid if CategoryGrid is active
    if (!this.categoryGrid) {
      this.renderSimulationsGrid();
    }
    // Hero demo is now handled by the HeroDemo class
  }

  renderSimulationsGrid() {
    if (!this.categoriesGrid) return;

    this.categoriesGrid.innerHTML = '';

    this.availableSimulations.forEach(sim => {
      const card = this.createSimulationCard(sim);
      this.categoriesGrid.appendChild(card);
    });
  }

  createSimulationCard(simulation) {
    const card = Helpers.createElement('div', 'simulation-card', {
      role: 'gridcell',
      tabindex: '0',
      'aria-label': `${simulation.title} simulation`,
    });

    const progress = userProgress.getSimulationProgress(simulation.id);
    const isCompleted = progress.completed || false;
    const score = progress.score || 0;

    card.innerHTML = `
            <div class="card-thumbnail">
                <img src="${simulation.thumbnail}" alt="${simulation.title}" onerror="this.src='src/assets/images/default-thumb.svg'">
                ${isCompleted ? '<div class="completion-badge">✓</div>' : ''}
            </div>
            
            <div class="card-content">
                <h3 class="card-title">${simulation.title}</h3>
                <p class="card-description">${simulation.description}</p>
                
                <div class="card-meta">
                    <span class="difficulty difficulty-${simulation.difficulty}">${Helpers.capitalize(simulation.difficulty)}</span>
                    <span class="duration">${Helpers.formatDuration(simulation.duration * 1000)}</span>
                </div>
                
                <div class="card-tags">
                    ${simulation.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                
                ${
                  isCompleted
                    ? `
                    <div class="completion-info">
                        <span class="score">Score: ${score}/100</span>
                        <span class="grade">${Helpers.getEthicsGrade(score).grade}</span>
                    </div>
                `
                    : ''
                }
                  <div class="card-actions">
                    <button class="btn btn-primary enhanced-sim-button" data-simulation="${simulation.id}">
                        Learning Lab Simulation
                    </button>
                    <button class="btn btn-secondary simulation-quick-start-btn" data-simulation="${simulation.id}">
                        ${isCompleted ? 'Retry' : 'Start'} Simulation
                    </button>
                </div>
            </div>
        `;

    // Add hover and focus effects
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-2px)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
    });

    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.startSimulation(simulation.id);
      }
    });

    return card;
  }

  /**
   * Simulation management - Two-stage launch flow
   */
  async startSimulation(simulationId) {
    try {
      // Verify 'this' context is correct
      if (!this || typeof this.showNotification !== 'function') {
        throw new Error(
          'App context not properly bound. startSimulation called with wrong context.'
        );
      }

      // Check if we should show the pre-launch modal first
      const shouldShowPreLaunch =
        !userPreferences.shouldSkipPreLaunch(simulationId);

      if (shouldShowPreLaunch) {
        this.showPreLaunchModal(simulationId);
        return; // Pre-launch modal will call launchSimulationDirect when ready
      }

      // Direct launch (skipping pre-launch modal)
      await this.launchSimulationDirect(simulationId);
    } catch (error) {
      AppDebug.error('Failed to start simulation:', error);
      this.hideLoading();

      // Use fallback notification if this.showNotification is not available
      if (typeof this.showNotification === 'function') {
        this.showNotification(
          'Failed to start simulation. Please try again.',
          'error'
        );
      } else {
        // Fallback to logger and direct notification system
        logger.error('Failed to start simulation:', error.message);
        if (window.NotificationToast) {
          window.NotificationToast.show({
            type: 'error',
            message: 'Failed to start simulation. Please try again.',
            duration: 5000,
            closable: true,
          });
        }
      }
    }
  }

  /**
   * Shows the pre-launch information modal
   */
  showPreLaunchModal(simulationId) {
    logger.debug('Showing pre-launch modal for:', simulationId);

    const prelaunchModal = new PreLaunchModal(simulationId, {
      onLaunch: id => {
        logger.debug('Pre-launch modal onLaunch called with:', id);
        // User clicked "Start Exploration" - proceed with simulation
        this.launchSimulationDirect(id || simulationId);
      },
      onCancel: () => {
        logger.debug('Pre-launch modal cancelled');
        // User clicked "Maybe Later" - just close modal
        this.hideLoading();
      },
      showEducatorResources: true, // Always show educator resources
    });

    prelaunchModal.show();
  }

  /**
   * Direct simulation launch (bypasses pre-launch modal)
   */
  async launchSimulationDirect(simulationId) {
    try {
      this.showLoading();

      // Cleanup previous simulation canvases and engines
      if (this.currentSimulation && this.currentSimulation.cleanup) {
        this.currentSimulation.cleanup();
      }

      // Cleanup any existing simulation canvas
      if (this.currentSimulationCanvasId) {
        canvasManager.removeCanvas(this.currentSimulationCanvasId);
        this.currentSimulationCanvasId = null;
      }

      // Cleanup hero demo canvas if running
      if (this.heroDemoCanvasId) {
        canvasManager.removeCanvas(this.heroDemoCanvasId);
        this.heroDemoCanvasId = null;
      }

      const simConfig = this.simulations.get(simulationId);
      if (!simConfig) {
        throw new Error(`Simulation ${simulationId} not found`);
      }

      // Track simulation start
      simpleAnalytics.trackSimulationStart(simulationId, simConfig.title); // Get simulation container
      const simulationContainer = document.getElementById(
        'simulation-container'
      );
      if (!simulationContainer) {
        throw new Error('Simulation container not found');
      }

      // Add loading state to container
      simulationContainer.classList.add('loading');
      simulationContainer.setAttribute('aria-busy', 'true');
      simulationContainer.setAttribute(
        'aria-label',
        `Loading ${simConfig.title} simulation`
      );

      // Clear previous content and remove any error states
      simulationContainer.innerHTML = '';
      simulationContainer.classList.remove('error');
      // Create managed canvas for the simulation
      const { canvas, id } = await canvasManager.createCanvas({
        width: 600,
        height: 400,
        container: simulationContainer,
        className: 'simulation-canvas',
        id: `simulation-${simulationId}`,
      });

      // Store canvas ID for cleanup
      this.currentSimulationCanvasId = id;

      // Check if simulation needs canvas or is HTML-only
      if (simConfig.useCanvas !== false && simConfig.renderMode !== 'html') {
        // Apply responsive styling to canvas
        canvas.style.cssText = `
                    max-width: 100%;
                    max-height: 100%;
                    width: auto;
                    height: auto;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    background: #fff;
                `;

        // Create visual engine using canvas manager
        this.engine = await canvasManager.createVisualEngine(id, {
          renderMode: 'canvas',
          accessibility: true,
          debug: false,
          width: 600,
          height: 400,
        });

        // Set the container reference on the engine for simulation compatibility
        this.engine.container = simulationContainer;
      } else {
        // For HTML-only simulations, create a simple mock engine with just the container
        this.engine = {
          container: simulationContainer,
          type: 'html',
          renderMode: 'html',
          start: () => {
            // Mock engine started for HTML simulation
          },
          stop: () => {
            // Mock engine stopped for HTML simulation
          },
          destroy: () => {
            // Mock engine destroyed for HTML simulation
          },
        };

        // Remove the canvas element since it's not needed
        if (canvas && canvas.parentNode) {
          canvas.parentNode.removeChild(canvas);
        }
      }

      // Create the specific simulation instance
      this.currentSimulation = await this.createSimulationInstance(
        simulationId,
        simConfig
      );

      if (!this.currentSimulation) {
        throw new Error('Failed to create simulation instance');
      }

      // Initialize the simulation
      this.currentSimulation.init(this.engine);

      // Setup simulation event listeners
      this.setupSimulationEventListeners();

      // Show the enhanced simulation modal instead of the basic modal
      this.showEnhancedSimulationModal(simulationId, simConfig);

      // Start the engine
      this.engine.start();
      // Start the simulation
      this.currentSimulation.start();

      this.hideLoading();
      // Remove loading state from container
      if (simulationContainer) {
        simulationContainer.classList.remove('loading');
        simulationContainer.removeAttribute('aria-busy');
        simulationContainer.setAttribute(
          'aria-label',
          `${simConfig.title} simulation`
        );
      }

      logger.debug('Simulation launched successfully');
    } catch (error) {
      AppDebug.error('Failed to start simulation:', error);
      this.hideLoading();

      // Add error state to container
      const simulationContainer = document.getElementById(
        'simulation-container'
      );
      if (simulationContainer) {
        simulationContainer.classList.remove('loading');
        simulationContainer.classList.add('error');
        simulationContainer.removeAttribute('aria-busy');
        simulationContainer.setAttribute(
          'aria-label',
          'Simulation failed to load'
        );
        simulationContainer.innerHTML = `
                    <div style="text-align: center; padding: 2rem;">
                        <h3>Simulation Failed to Load</h3>
                        <p>There was an error loading the simulation. Please try again.</p>
                        <button class="btn btn-primary" onclick="this.closest('.modal').querySelector('.modal-close').click()">Close</button>
                    </div>
                `;
      }

      this.showError('Failed to start the simulation. Please try again.');
    }
  }

  async createSimulationInstance(simulationId, config) {
    try {
      let simulation;

      // Load the specific simulation class based on ID
      switch (simulationId) {
        default: {
          // Fallback to basic simulation for unimplemented simulations
          const basicScenarios = [
            {
              id: 'intro',
              title: 'Introduction',
              description:
                'Welcome to this open-ended exploration of AI ethics',
              objective:
                'Explore different perspectives and discover consequences of choices',
            },
            {
              id: 'decision1',
              title: 'First Decision',
              description: 'Make your first ethical choice',
              objective: 'Choose the most ethical option',
            },
            {
              id: 'conclusion',
              title: 'Conclusion',
              description: 'Reflect on your decisions',
              objective: 'Review your ethical choices',
            },
          ];

          simulation = new EthicsSimulation(simulationId, {
            title: config.title,
            description: config.description,
            difficulty: config.difficulty,
            duration: config.duration,
            scenarios: basicScenarios,
            ethicsMetrics: [
              {
                name: 'fairness',
                label: 'Fairness',
                value: APP_CONSTANTS.DEFAULTS.ETHICS_METER_VALUE,
              },
              {
                name: 'transparency',
                label: 'Transparency',
                value: APP_CONSTANTS.DEFAULTS.ETHICS_METER_VALUE,
              },
              {
                name: 'privacy',
                label: 'Privacy',
                value: APP_CONSTANTS.DEFAULTS.ETHICS_METER_VALUE,
              },
            ],
          });

          // Set container reference
          simulation.container = document.getElementById(
            'simulation-container'
          );
          break;
        }
      }

      // Connect core educational modules to the simulation
      if (simulation) {
        this.connectModulesToSimulation(simulation, config);
      }

      return simulation;
    } catch (error) {
      AppDebug.error(`Failed to load simulation ${simulationId}:`, error);
      throw error;
    }
  }

  setupSimulationEventListeners() {
    if (!this.currentSimulation) return;

    this.currentSimulation.on('simulation:completed', data => {
      this.onSimulationCompleted(data);
    });

    this.currentSimulation.on('ethics:updated', data => {
      // Handle ethics updates
      AppDebug.log('Ethics updated:', data);
    });

    this.currentSimulation.on('scenario:loaded', data => {
      // Update UI for new scenario
      this.updateModalTitle(data.scenario.title);
    });
  }

  /**
   * Handle simulation completion - show post-simulation modal
   */
  onSimulationCompleted(data) {
    AppDebug.log('Simulation completed:', data);

    try {
      // Close the enhanced simulation modal first
      const enhancedModal = document.querySelector(
        '.enhanced-simulation-modal'
      );
      if (enhancedModal) {
        enhancedModal.style.display = 'none';
        enhancedModal.setAttribute('aria-hidden', 'true');
      }

      // Track simulation completion
      if (this.currentSimulation && this.currentSimulation.id) {
        simpleAnalytics.trackSimulationComplete(
          this.currentSimulation.id,
          data
        );

        // Save simulation completion to Firestore
        if (this.authService) {
          this.authService
            .saveScenarioCompletion({
              scenarioId: this.currentSimulation.id,
              categoryId: this.currentSimulation.category || 'unknown',
              selectedOption: data.selectedOption || null,
              optionText: data.optionText || '',
              impact: data.impact || {},
              simulationData: data,
            })
            .then(result => {
              if (result.success) {
                AppDebug.log(
                  'Simulation completion saved to Firestore:',
                  result
                );
              } else if (
                result.reason !== 'not_authenticated_or_no_firestore'
              ) {
                AppDebug.warn(
                  'Failed to save simulation completion to Firestore:',
                  result.error
                );
              }
            })
            .catch(error => {
              AppDebug.warn(
                'Error saving simulation completion to Firestore:',
                error
              );
            });
        }
      }

      // Show post-simulation modal
      this.showPostSimulationModal(data);
    } catch (error) {
      AppDebug.error('Error handling simulation completion:', error);
      // Fallback to basic completion handling
      this.hideModal();
      this.showNotification(
        'Simulation completed! Thank you for exploring AI Ethics.',
        'success'
      );
    }
  }

  /**
   * Show the post-simulation reflection modal
   */
  showPostSimulationModal(data) {
    const simulationId = this.currentSimulation?.id || 'unknown';

    const postModal = new PostSimulationModal(simulationId, {
      sessionData: data,
      onComplete: () => {
        // User finished reflection - close modal and return to main view
        this.hideModal();
        this.showNotification(
          'Thank you for your thoughtful reflection!',
          'success'
        );
      },
      onSkip: () => {
        // User skipped reflection - just close modal
        this.hideModal();
      },
      onRestart: () => {
        // User wants to restart simulation
        this.hideModal();
        this.startSimulation(simulationId);
      },
    });

    postModal.show();
  }

  /**
   * Show the enhanced simulation modal for the active simulation
   */
  showEnhancedSimulationModal(simulationId, simConfig) {
    AppDebug.log('Showing enhanced simulation modal for:', simulationId);

    try {
      // Configure modal options based on simulation type
      const modalOptions = {
        simulation: this.currentSimulation,
        onClose: () => {
          AppDebug.log('Enhanced modal closed');
          this.enhancedModal = null;
          this.hideModal();
        },
        onMinimize: () => {
          AppDebug.log('Enhanced modal minimized');
          // Keep simulation running but minimize UI
        },
      };

      // No specific simulation optimizations needed - all use default configuration

      this.enhancedModal = new EnhancedSimulationModal(
        simulationId,
        modalOptions
      );

      this.enhancedModal.show();

      // CRITICAL: Connect the simulation to the enhanced modal's container
      setTimeout(() => {
        const enhancedContainer = this.enhancedModal.getSimulationContainer();
        if (enhancedContainer && this.currentSimulation) {
          AppDebug.log('Moving simulation to enhanced modal container');

          // Get the original simulation container content
          const originalContainer = document.getElementById(
            'simulation-container'
          );
          if (originalContainer) {
            // Move all content from original container to enhanced container
            while (originalContainer.firstChild) {
              enhancedContainer.appendChild(originalContainer.firstChild);
            }

            // Update the simulation's container reference
            if (this.engine) {
              this.engine.container = enhancedContainer;
            }

            // If the simulation has a container property, update it
            if (this.currentSimulation.container) {
              this.currentSimulation.container = enhancedContainer;
            }

            // Re-setup the simulation UI in the new container
            if (this.currentSimulation.setupUI) {
              this.currentSimulation.setupUI();
            }
          }
        }
      }, 100); // Small delay to ensure modal is fully created
    } catch (error) {
      AppDebug.error('Failed to show enhanced simulation modal:', error);
      // Fallback to basic modal
      this.showSimulationModal(simConfig);
    }
  }

  showSimulationModal(simConfig) {
    if (!this.modal) return;

    const title = this.modal.querySelector('#modal-title');
    if (title) {
      title.textContent = simConfig.title;
    }

    // Store the currently focused element to restore later
    this.lastFocusedElement = document.activeElement;

    // Remove inert from modal and set aria-hidden to false
    this.modal.removeAttribute('inert');
    this.modal.setAttribute('aria-hidden', 'false');
    this.modal.style.display = 'flex';

    // Add visible class for CSS opacity transition
    requestAnimationFrame(() => {
      this.modal.classList.add('visible');
    });

    // Make background content inert
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.setAttribute('inert', '');
    }

    // Focus management - create focus trap for modal
    this.modalFocusTrap = focusManager.createTrap(this.modal, {
      autoFocus: true,
      restoreFocus: true,
    });
  }

  /**
   * Handle keyboard navigation in modal (delegated to focus manager)
   */
  trapFocusInModal(event) {
    // This is now handled by the focus manager
    // Keep method for backward compatibility but delegate to focus manager
    if (this.modalFocusTrap && event.key === 'Tab') {
      // Focus manager handles this automatically
      return;
    }
  }

  closeSimulation() {
    if (this.currentSimulation) {
      this.currentSimulation.reset();
      this.currentSimulation = null;
    }

    if (this.engine) {
      this.engine.stop();
      this.engine.destroy();
      this.engine = null;
    }

    // Cleanup all managed canvases
    const canvasesToCleanup = [
      this.currentSimulationCanvasId,
      this.ethicsMetersCanvasId,
      this.interactiveButtonsCanvasId,
      this.simulationSlidersCanvasId,
    ];

    canvasesToCleanup.forEach(canvasId => {
      if (canvasId) {
        canvasManager.removeCanvas(canvasId);
      }
    });

    // Reset canvas IDs
    this.currentSimulationCanvasId = null;
    this.ethicsMetersCanvasId = null;
    this.interactiveButtonsCanvasId = null;
    this.simulationSlidersCanvasId = null;

    if (this.modal) {
      // Clean up focus trap
      if (this.modalFocusTrap) {
        this.modalFocusTrap.destroy();
        this.modalFocusTrap = null;
      }

      // Make modal inert and hide it
      this.modal.setAttribute('inert', '');
      this.modal.setAttribute('aria-hidden', 'true');
      this.modal.classList.remove('visible');
      this.modal.style.display = 'none';

      // Remove inert from main content
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.removeAttribute('inert');
      }
    } // Clear simulation container
    if (this.simulationContainer) {
      this.simulationContainer.innerHTML = '';
      this.simulationContainer.classList.remove('loading', 'error');
      this.simulationContainer.removeAttribute('aria-busy');
      this.simulationContainer.removeAttribute('aria-label');
    }
  }

  /**
   * Resets the current simulation
   */
  resetCurrentSimulation() {
    if (this.currentSimulation && this.currentSimulation.reset) {
      this.currentSimulation.reset();
    }
  }

  /**
   * Shows the loading indicator
   */
  showLoading() {
    if (this.loading) {
      this.loading.style.display = 'flex';
      this.loading.setAttribute('aria-hidden', 'false');
    }
  }

  /**
   * Hides the loading indicator
   */
  hideLoading() {
    if (this.loading) {
      this.loading.style.display = 'none';
      this.loading.setAttribute('aria-hidden', 'true');
    }
  }

  /**
   * Toggles simulation pause state
   */
  toggleSimulationPause(isPaused) {
    if (this.currentSimulation) {
      if (isPaused && this.currentSimulation.pause) {
        this.currentSimulation.pause();
      } else if (!isPaused && this.currentSimulation.resume) {
        this.currentSimulation.resume();
      }
    }
  }

  /**
   * Populates the enhanced modal with simulation-specific data
   */
  async populateEnhancedModalData(simulationId) {
    try {
      // Import simulation data
      const { simulationData } = await import('./data/simulation-info.js');
      const simData = simulationData[simulationId];

      if (!simData) {
        AppDebug.warn(`No simulation data found for ${simulationId}`);
        return;
      }

      // Populate resource tab
      this.populateResourcesTab(simData);

      // Populate help tab
      this.populateHelpTab(simData);

      // Populate quick resources panel
      this.populateQuickResourcesPanel(simData);
    } catch (error) {
      AppDebug.error('Failed to populate enhanced modal data:', error);
    }
  }

  /**
   * Populates the resources tab with simulation data
   */
  populateResourcesTab(simData) {
    if (!this.currentEnhancedModal) return;

    const { modal } = this.currentEnhancedModal;
    if (!modal) return;

    // Background reading
    const readingContainer = modal.querySelector('#background-reading');
    if (readingContainer && simData.resources?.backgroundReading) {
      readingContainer.innerHTML = simData.resources.backgroundReading
        .map(
          resource => `
                <div class="resource-item">
                    <a href="${resource.url}" target="_blank" class="resource-title">${resource.title}</a>
                    <p class="resource-description">${resource.description}</p>
                </div>
            `
        )
        .join('');
    }

    // Related videos
    const videosContainer = modal.querySelector('#related-videos');
    if (videosContainer && simData.resources?.videos) {
      videosContainer.innerHTML = simData.resources.videos
        .map(
          video => `
                <div class="resource-item">
                    <a href="${video.url}" target="_blank" class="resource-title">${video.title}</a>
                    <p class="resource-description">${video.description}</p>
                    <span class="resource-duration">${video.duration}</span>
                </div>
            `
        )
        .join('');
    }

    // Discussion questions
    const questionsContainer = modal.querySelector('#discussion-questions');
    if (questionsContainer && simData.educatorResources?.discussionQuestions) {
      questionsContainer.innerHTML =
        simData.educatorResources.discussionQuestions
          .map(
            question => `
                <div class="resource-item">
                    <p class="discussion-question">${question}</p>
                </div>
            `
          )
          .join('');
    }
  }

  /**
   * Populates the help tab with simulation-specific information
   */
  populateHelpTab(simData) {
    if (!this.currentEnhancedModal) return;

    const { modal } = this.currentEnhancedModal;
    if (!modal) return;

    // Ethics explanation
    const ethicsContainer = modal.querySelector('#ethics-explanation');
    if (ethicsContainer && simData.vocabulary) {
      ethicsContainer.innerHTML = Object.entries(simData.vocabulary)
        .map(
          ([term, definition]) => `
                <div class="ethics-term">
                    <h5>${term}</h5>
                    <p>${definition}</p>
                </div>
            `
        )
        .join('');
    }
  }

  /**
   * Populates the quick resources panel
   */
  populateQuickResourcesPanel(simData) {
    if (!this.currentEnhancedModal) return;

    const { modal } = this.currentEnhancedModal;
    if (!modal) return;

    // Quick concepts
    const conceptsContainer = modal.querySelector('#quick-concepts');
    if (conceptsContainer && simData.vocabulary) {
      const MAX_QUICK_TERMS = 5;
      const keyTerms = Object.keys(simData.vocabulary).slice(
        0,
        MAX_QUICK_TERMS
      );
      conceptsContainer.innerHTML = keyTerms
        .map(
          term => `
                <li><a href="#" class="resource-link" data-term="${term}">${term}</a></li>
            `
        )
        .join('');

      // Add click handlers for terms
      conceptsContainer.querySelectorAll('[data-term]').forEach(link => {
        link.addEventListener('click', e => {
          e.preventDefault();
          const {
            dataset: { term },
          } = e.target;
          const definition = simData.vocabulary[term];
          this.showQuickHelp(term, definition);
        });
      });
    }
  }

  /**
   * Shows quick help tooltip or modal
   */
  showQuickHelp(term, definition) {
    // Create a simple tooltip or notification
    const NOTIFICATION_DURATION = 5000;
    this.showNotification(
      `${term}: ${definition}`,
      'info',
      NOTIFICATION_DURATION
    );
  }

  /**
   * Shows a notification toast message
   * @param {string} message - The notification message
   * @param {string} type - The notification type ('success', 'error', 'warning', 'info')
   * @param {number} duration - Auto-dismiss duration in ms (optional)
   * @returns {string|null} - Toast ID or null if failed
   */
  showNotification(message, type = 'info', duration = 5000) {
    if (window.NotificationToast) {
      // Use the global notification toast instance
      return window.NotificationToast.show({
        type,
        message,
        duration,
        closable: true,
      });
    } else {
      // Fallback to logger if notification system not available
      logger.info(`[${type.toUpperCase()}] ${message}`);
      return null;
    }
  }

  /**
   * Sets up Surprise Me functionality
   */
  setupSurpriseMe() {
    const surpriseMeBtn = document.getElementById('surprise-me-nav');
    if (surpriseMeBtn) {
      surpriseMeBtn.addEventListener('click', e => {
        e.preventDefault();
        this.launchRandomScenario();
      });
    }
  }

  /**
   * Launches a random uncompleted scenario
   */
  launchRandomScenario() {
    const randomScenario = this.getRandomUncompletedScenario();

    if (!randomScenario) {
      this.showNotification(
        "🎉 Congratulations! You've completed all scenarios! Try replaying your favorites.",
        'success',
        APP_CONSTANTS.TIMING.NOTIFICATION_DURATION
      );
      return;
    }

    // Close mobile navigation if open
    const mainNav = document.querySelector('.main-nav');
    if (mainNav && mainNav.classList.contains('open')) {
      mainNav.classList.remove('open');
      const navToggle = document.querySelector('.nav-toggle');
      if (navToggle) {
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      }
      document.body.style.overflow = '';
    }

    // Show notification about the selected scenario
    this.showNotification(
      `🎉 Surprise! Opening "${randomScenario.scenario.title}" from ${randomScenario.category.title}`,
      'info',
      APP_CONSTANTS.TIMING.NOTIFICATION_DURATION
    );

    // Launch the scenario directly (skip pre-launch modal for surprise factor)
    if (this.categoryGrid) {
      this.categoryGrid.openScenarioModalDirect(
        randomScenario.category.id,
        randomScenario.scenario.id
      );
    } else {
      // Fallback if categoryGrid is not available
      logger.warn('CategoryGrid not available, redirecting to scenario');
      window.location.href = `#scenario-${randomScenario.scenario.id}`;
    }
  }

  /**
   * Gets a random uncompleted scenario from all categories
   * @returns {Object|null} Object with category and scenario, or null if all completed
   */
  getRandomUncompletedScenario() {
    try {
      // Get all categories and their scenarios
      const allCategories = getAllCategories();

      // Load user progress
      const stored = localStorage.getItem('simulateai_category_progress');
      const userProgress = stored ? JSON.parse(stored) : {};

      // Collect all uncompleted scenarios
      const uncompletedScenarios = [];

      allCategories.forEach(category => {
        const scenarios = getCategoryScenarios(category.id);
        scenarios.forEach(scenario => {
          const isCompleted = userProgress[category.id]?.[scenario.id] || false;
          if (!isCompleted) {
            uncompletedScenarios.push({
              category,
              scenario,
            });
          }
        });
      });

      // Return random uncompleted scenario
      if (uncompletedScenarios.length === 0) {
        return null; // All scenarios completed
      }

      const randomIndex = Math.floor(
        Math.random() * uncompletedScenarios.length
      );
      return uncompletedScenarios[randomIndex];
    } catch (error) {
      logger.error('Failed to get random uncompleted scenario:', error);
      return null;
    }
  }

  /**
   * Sets up mobile navigation hamburger menu functionality
   */
  setupMobileNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const mainNav = document.querySelector('.main-nav');
    const navBackdrop = document.querySelector('.nav-backdrop');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!navToggle || !mainNav) {
      logger.warn('Mobile navigation elements not found');
      return;
    }

    // Toggle mobile navigation
    const toggleNav = isOpen => {
      const isCurrentlyOpen = mainNav.classList.contains('open');
      const shouldOpen = isOpen !== undefined ? isOpen : !isCurrentlyOpen;

      // Update classes
      mainNav.classList.toggle('open', shouldOpen);
      navToggle.classList.toggle('active', shouldOpen);
      if (navBackdrop) {
        navBackdrop.classList.toggle('open', shouldOpen);
      }

      // Update ARIA attributes and focus management
      if (shouldOpen) {
        navToggle.setAttribute('aria-expanded', 'true');
        mainNav.setAttribute('aria-hidden', 'false');

        // Focus first nav link when opening
        const firstNavLink = mainNav.querySelector('.nav-link');
        if (firstNavLink) {
          setTimeout(
            () => firstNavLink.focus(),
            APP_CONSTANTS.TIMING.FOCUS_DELAY
          );
        }
      } else {
        // Move focus away from navigation before hiding it
        navToggle.focus();

        // Set aria attributes after focus has moved
        setTimeout(() => {
          navToggle.setAttribute('aria-expanded', 'false');
          mainNav.setAttribute('aria-hidden', 'true');
        }, 0);
      }

      // Analytics
      simpleAnalytics.trackEvent('mobile_nav_toggled', { isOpen: shouldOpen });
    };

    // Hamburger button click
    navToggle.addEventListener('click', e => {
      e.preventDefault();
      toggleNav();
    });

    // Backdrop click
    if (navBackdrop) {
      navBackdrop.addEventListener('click', () => {
        toggleNav(false);
      });
    }

    // Click outside to close navigation (comprehensive handler)
    document.addEventListener('click', e => {
      // Only handle if navigation is open
      if (!mainNav.classList.contains('open')) {
        return;
      }

      // Don't close if clicking on the nav toggle button (it has its own handler)
      if (navToggle.contains(e.target)) {
        return;
      }

      // Don't close if clicking inside the navigation panel
      if (mainNav.contains(e.target)) {
        return;
      }

      // Don't close if clicking on the backdrop (it has its own handler)
      if (navBackdrop && navBackdrop.contains(e.target)) {
        return;
      }

      // Click was outside navigation - close it
      toggleNav(false);
    });

    // Close nav when clicking on nav links
    navLinks.forEach(link => {
      link.addEventListener('click', e => {
        const href = link.getAttribute('href');
        const text = link.textContent.trim();

        // Skip handling for mega menu trigger on mobile
        const MOBILE_BREAKPOINT = 768;
        if (
          link.closest('.nav-item-dropdown') &&
          window.innerWidth <= MOBILE_BREAKPOINT
        ) {
          return; // Let mega menu handle this
        }

        logger.info(`Navigation link clicked: "${text}" -> ${href}`);

        // Skip surprise me button - it has its own handler
        if (link.id === 'surprise-me-nav') {
          return;
        }

        // Move focus away from the clicked link before closing navigation
        // This prevents accessibility issues with aria-hidden on focused elements
        const moveFocusAndCloseNav = () => {
          // Move focus to a safe element (nav toggle button or document body)
          if (navToggle) {
            navToggle.focus();
          } else {
            document.body.focus();
          }

          // Close navigation after focus has moved
          setTimeout(
            () => toggleNav(false),
            APP_CONSTANTS.TIMING.NAV_CLOSE_DELAY
          );
        };

        // Handle hash-based navigation
        if (href && href.startsWith('#') && href !== '#') {
          // Prevent default browser jump behavior
          e.preventDefault();

          const targetElement = document.querySelector(href);

          if (targetElement) {
            logger.info(`Navigating to section: ${href}`);

            // Move focus and close mobile nav first
            moveFocusAndCloseNav();

            // Then smoothly scroll to target after a brief delay
            const SCROLL_DELAY = 100;
            setTimeout(() => {
              targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
              });
              logger.info(`Scrolled to section: ${href}`);
            }, SCROLL_DELAY);

            // Track successful navigation
            simpleAnalytics.trackEvent('navigation_link_clicked', {
              target: href,
              text,
              success: true,
            });
          } else {
            logger.warn(`Navigation target not found: ${href}`);

            // Move focus and close menu for missing targets
            moveFocusAndCloseNav();

            // Show user feedback for missing sections
            const NOTIFICATION_DURATION = 3000;
            if (this.showNotification) {
              this.showNotification(
                `Section "${text}" is not available on this page.`,
                'warning',
                NOTIFICATION_DURATION
              );
            }

            // Track failed navigation
            simpleAnalytics.trackEvent('navigation_link_clicked', {
              target: href,
              text,
              success: false,
              error: 'target_not_found',
            });
          }
        } else {
          logger.info(`External link or non-hash navigation: ${href}`);

          // For external links, move focus and close nav before navigation
          moveFocusAndCloseNav();

          // Track external navigation
          simpleAnalytics.trackEvent('navigation_link_clicked', {
            target: href,
            text,
            type: 'external',
          });
        }
      });
    });

    // Handle escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && mainNav.classList.contains('open')) {
        toggleNav(false);
      }
    });

    // Handle window resize - close mobile nav on desktop breakpoint
    let resizeTimeout;
    const DESKTOP_BREAKPOINT = 768;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      const RESIZE_DEBOUNCE = 100;
      resizeTimeout = setTimeout(() => {
        if (
          window.innerWidth >= DESKTOP_BREAKPOINT &&
          mainNav.classList.contains('open')
        ) {
          toggleNav(false);
          document.body.style.overflow = ''; // Reset body scroll
        }
      }, RESIZE_DEBOUNCE);
    });

    // Handle focus trap for accessibility
    this.setupNavFocusTrap(mainNav, navToggle);

    /**
     * Initialize mega menu functionality
     */
    function initializeMegaMenu() {
      const megaMenuTrigger = document.querySelector(
        '.nav-item-dropdown .nav-link'
      );
      const megaMenuDropdown = document.querySelector('.nav-item-dropdown');
      const megaMenu = document.querySelector('.mega-menu');

      if (!megaMenuTrigger || !megaMenuDropdown || !megaMenu) return;

      // Mobile detection
      const MOBILE_BREAKPOINT = 768;
      const isMobile = () => window.innerWidth <= MOBILE_BREAKPOINT;

      // Mobile doesn't need close button for simple dropdown

      // Initialize search filter (desktop only)
      const searchInput = document.querySelector('.mega-menu-search');
      if (searchInput && !isMobile()) {
        searchInput.addEventListener('input', e => {
          const searchTerm = e.target.value.toLowerCase();
          const menuItems = document.querySelectorAll('.mega-menu-item');
          let visibleCount = 0;

          menuItems.forEach(item => {
            const title = item.querySelector('h4').textContent.toLowerCase();
            const description = item
              .querySelector('p')
              .textContent.toLowerCase();

            if (
              title.includes(searchTerm) ||
              description.includes(searchTerm)
            ) {
              item.style.display = 'flex';
              visibleCount++;
            } else {
              item.style.display = 'none';
            }
          });

          // Show/hide "no results" message
          let noResultsMsg = document.querySelector('.mega-menu-no-results');
          if (visibleCount === 0 && searchTerm.length > 0) {
            if (!noResultsMsg) {
              noResultsMsg = document.createElement('div');
              noResultsMsg.className = 'mega-menu-no-results';
              noResultsMsg.innerHTML = `
                <div style="text-align: center; padding: var(--spacing-6); color: var(--color-gray-600);">
                  <p>No categories match "${searchTerm}"</p>
                  <small>Try searching for terms like "privacy", "decision", or "robot"</small>
                </div>
              `;
              document
                .querySelector('.mega-menu-grid')
                .appendChild(noResultsMsg);
            }
            noResultsMsg.style.display = 'block';
          } else if (noResultsMsg) {
            noResultsMsg.style.display = 'none';
          }
        });

        // Clear search when menu closes
        const clearSearch = () => {
          searchInput.value = '';
          const menuItems = document.querySelectorAll('.mega-menu-item');
          menuItems.forEach(item => {
            item.style.display = 'flex';
          });
          const noResultsMsg = document.querySelector('.mega-menu-no-results');
          if (noResultsMsg) {
            noResultsMsg.style.display = 'none';
          }
        };

        // Clear search on menu close (desktop only)
        if (!isMobile()) {
          megaMenuTrigger.addEventListener('click', clearSearch);
        }
      }

      // Handle mega menu trigger click
      megaMenuTrigger.addEventListener('click', e => {
        if (isMobile()) {
          e.preventDefault();
          e.stopPropagation();
          const isExpanded =
            megaMenuDropdown.getAttribute('aria-expanded') === 'true';
          megaMenuDropdown.setAttribute('aria-expanded', !isExpanded);

          // Simple dropdown - no body scroll prevention needed
        }
      });

      // Handle mega menu item clicks
      const megaMenuItems = document.querySelectorAll('.mega-menu-item');
      megaMenuItems.forEach(item => {
        item.addEventListener('click', e => {
          e.preventDefault();
          const href = item.getAttribute('href');

          // Close mega menu
          megaMenuDropdown.setAttribute('aria-expanded', 'false');

          // On mobile, also close the main navigation
          const MOBILE_BREAKPOINT = 768;
          if (window.innerWidth <= MOBILE_BREAKPOINT) {
            const mainNav = document.querySelector('.main-nav');
            const navToggle = document.querySelector('.nav-toggle');
            const navBackdrop = document.querySelector('.nav-backdrop');

            if (mainNav && navToggle) {
              // Move focus away from the clicked mega menu item before hiding navigation
              navToggle.focus();

              // Close navigation after focus has moved
              setTimeout(() => {
                mainNav.classList.remove('open');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                mainNav.setAttribute('aria-hidden', 'true');

                if (navBackdrop) {
                  navBackdrop.classList.remove('open');
                }

                // Restore body scroll
                document.body.style.overflow = '';
              }, 0);
            }
          }

          // Scroll to category section
          if (href.startsWith('#category-')) {
            const categoryId = href.replace('#category-', '');
            let categoryElement = document.querySelector(
              `[data-category-id="${categoryId}"]`
            );

            // Fallback to ID selector if data attribute doesn't work
            if (!categoryElement) {
              categoryElement = document.querySelector(
                `#category-${categoryId}`
              );
            }

            if (categoryElement) {
              // Add a small delay to ensure the menu is closed before scrolling
              setTimeout(() => {
                categoryElement.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                });
              }, 100);
            } else {
              // Fallback to simulations section
              const simulationsSection = document.querySelector('#simulations');
              if (simulationsSection) {
                setTimeout(() => {
                  simulationsSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  });
                }, 100);
              }
            }
          }
        });
      });

      // Handle view all link
      const viewAllLink = document.querySelector('.mega-menu-view-all');
      if (viewAllLink) {
        viewAllLink.addEventListener('click', e => {
          e.preventDefault();
          megaMenuDropdown.setAttribute('aria-expanded', 'false');

          // On mobile, also close the main navigation
          const MOBILE_BREAKPOINT = 768;
          if (window.innerWidth <= MOBILE_BREAKPOINT) {
            const mainNav = document.querySelector('.main-nav');
            const navToggle = document.querySelector('.nav-toggle');
            const navBackdrop = document.querySelector('.nav-backdrop');

            if (mainNav && navToggle) {
              // Move focus away from the clicked view all link before hiding navigation
              navToggle.focus();

              // Close navigation after focus has moved
              setTimeout(() => {
                mainNav.classList.remove('open');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                mainNav.setAttribute('aria-hidden', 'true');

                if (navBackdrop) {
                  navBackdrop.classList.remove('open');
                }

                // Restore body scroll
                document.body.style.overflow = '';
              }, 0);
            }
          }

          const simulationsSection = document.querySelector('#simulations');
          if (simulationsSection) {
            setTimeout(() => {
              simulationsSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
              });
            }, 100);
          }
        });
      }

      // Close mega menu when clicking outside
      document.addEventListener('click', e => {
        if (!megaMenuDropdown.contains(e.target)) {
          megaMenuDropdown.setAttribute('aria-expanded', 'false');
          // Simple dropdown - no body scroll management needed
        }
      });

      // Handle keyboard navigation
      megaMenuTrigger.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const isExpanded =
            megaMenuDropdown.getAttribute('aria-expanded') === 'true';
          megaMenuDropdown.setAttribute('aria-expanded', !isExpanded);

          // Simple dropdown - no body scroll management needed
        }
        if (e.key === 'Escape') {
          megaMenuDropdown.setAttribute('aria-expanded', 'false');
          // Simple dropdown - no body scroll management needed
        }
      });

      // Handle escape key for mobile mega menu
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && isMobile()) {
          const isExpanded =
            megaMenuDropdown.getAttribute('aria-expanded') === 'true';
          if (isExpanded) {
            megaMenuDropdown.setAttribute('aria-expanded', 'false');
            // Simple dropdown - no body scroll management needed
          }
        }
      });

      // Handle window resize
      window.addEventListener('resize', () => {
        // Close mega menu on resize to avoid layout issues
        megaMenuDropdown.setAttribute('aria-expanded', 'false');
      });
    }

    // Initialize mega menu when DOM is ready
    document.addEventListener('DOMContentLoaded', initializeMegaMenu);
  }

  /**
   * Sets up focus trap for mobile navigation
   */
  setupNavFocusTrap(navElement, _toggleButton) {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    navElement.addEventListener('keydown', e => {
      if (!navElement.classList.contains('open') || e.key !== 'Tab') {
        return;
      }

      const focusableElements = navElement.querySelectorAll(focusableSelectors);
      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab - going backwards
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        // Tab - going forwards
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    });
  }

  /**
   * Scroll to the simulations section
   */
  /**
   * Scroll to Ethics Categories section using unified scroll manager
   */
  async scrollToSimulations() {
    try {
      // Ensure the target element exists before scrolling
      const categoriesSection = document.getElementById('categories');
      if (!categoriesSection) {
        logger.warn('Categories section not found, cannot scroll');
        return;
      }

      await scrollManager.scrollToElement('#categories', {
        behavior: 'smooth',
        offset: 80,
        respectReducedMotion: true,
      });

      logger.info('Scrolled to Ethics Categories section');

      // Track the navigation
      simpleAnalytics.trackEvent('navigation_to_categories', {
        source: 'start_learning_button',
        target: 'ethics_categories',
        method: 'smooth_scroll',
      });

      // Announce to screen readers for accessibility
      if (this.accessibilityManager) {
        this.accessibilityManager.announceToScreenReader(
          'Navigated to Ethics Categories section',
          'polite'
        );
      }
    } catch (error) {
      logger.error('Failed to scroll to Ethics Categories:', error);

      // Fallback: try basic scroll without smooth animation
      try {
        const categoriesSection = document.getElementById('categories');
        if (categoriesSection) {
          categoriesSection.scrollIntoView({ block: 'start' });
          logger.info('Used fallback scroll to Ethics Categories');
        }
      } catch (fallbackError) {
        logger.error('Fallback scroll also failed:', fallbackError);
      }
    }
  }

  /**
   * Test scenario modal functionality (debug method)
   */
  async testScenarioModal() {
    try {
      logger.info('Testing scenario modal with trolley problem scenario');

      // Import and create scenario modal
      const ScenarioModal = (await import('./components/scenario-modal.js'))
        .default;
      const scenarioModal = new ScenarioModal();

      // Open with the first trolley problem scenario
      await scenarioModal.open('autonomous-vehicle-split', 'trolley-problem');

      logger.info('Scenario modal test launched successfully');
    } catch (error) {
      logger.error('Failed to test scenario modal:', error);
      this.showNotification('Failed to open test scenario modal', 'error');
    }
  }

  /**
   * Open educator tools or guide
   */
  openEducatorTools() {
    // For now, we can scroll to simulations or open a modal with educator resources
    // This can be enhanced later with dedicated educator functionality
    logger.info('Opening educator tools');

    // Track the event
    simpleAnalytics.trackEvent('educator_tools_accessed', {
      source: 'educator_guide_button',
    });

    // For now, scroll to simulations as a placeholder
    this.scrollToSimulations();
  }

  /**
   * Initialize infinite loop detection for development
   */
  initializeLoopDetection() {
    // Only enable in development mode or when explicitly requested
    const isDevelopment =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.protocol === 'file:' ||
      window.location.search.includes('debug=true');

    if (isDevelopment) {
      // Enable the loop detector
      loopDetector.setEnabled(true);

      // Add to window for easy access in development
      window.loopDetector = loopDetector;

      // Track critical onboarding methods that previously had loops
      if (window.onboardingTourInstance) {
        this.instrumentOnboardingTour(window.onboardingTourInstance);
      }

      logger.info(
        'InfiniteLoopDetector',
        '🔧 Loop detection enabled for development'
      );
    } else {
      // Disable in production
      loopDetector.setEnabled(false);
      logger.info(
        'InfiniteLoopDetector',
        '🔒 Loop detection disabled for production'
      );
    }
  }

  /**
   * Instrument onboarding tour methods for loop detection
   */
  instrumentOnboardingTour(tour) {
    const criticalMethods = [
      'positionCoachMark',
      'showStep',
      'nextStep',
      'handleAction',
    ];

    criticalMethods.forEach(methodName => {
      if (tour[methodName]) {
        const original = tour[methodName];
        tour[methodName] = function (...args) {
          loopDetector.trackExecution(`OnboardingTour.${methodName}`);
          return original.apply(this, args);
        };
      }
    });

    logger.info(
      'InfiniteLoopDetector',
      '📊 Instrumented OnboardingTour methods for monitoring'
    );
  }

  /**
   * Initialize MCP (Model Context Protocol) integrations
   */
  async initializeMCPIntegrations() {
    try {
      AppDebug.log('Initializing MCP integrations...');

      this.mcpManager = new MCPIntegrationManager(this);
      const mcpResult = await this.mcpManager.initializeIntegrations();

      if (mcpResult.success) {
        this.mcpCapabilities = new Set(mcpResult.capabilities);
        AppDebug.log('MCP integrations initialized:', mcpResult.capabilities);

        // Enhance existing features with MCP capabilities
        await this.enhanceWithMCPCapabilities();
      } else {
        AppDebug.warn('MCP integrations failed to initialize');
      }
    } catch (error) {
      AppDebug.error('Failed to initialize MCP integrations:', error);
      // Continue without MCP - app should still function
    }
  }

  /**
   * Enhance existing features with MCP capabilities
   */
  async enhanceWithMCPCapabilities() {
    if (!this.mcpManager) return;

    try {
      // Enhance scenario creation
      if (this.mcpCapabilities.has('scenario_generation')) {
        this.enhanceScenarioCreation();
      }

      // Enhance analytics
      if (this.mcpCapabilities.has('enhanced_analytics')) {
        this.enhanceAnalytics();
      }

      // Enhance content with real-world examples
      if (this.mcpCapabilities.has('real_time_content')) {
        this.enhanceContentWithRealWorld();
      }

      AppDebug.log('Existing features enhanced with MCP capabilities');
    } catch (error) {
      AppDebug.error('Failed to enhance features with MCP:', error);
    }
  }

  /**
   * Enhanced scenario creation using MCP capabilities
   */
  enhanceScenarioCreation() {
    // Add MCP-enhanced scenario creation to the platform
    this.createEnhancedScenario = async scenarioConfig => {
      return await this.mcpManager.createEnhancedScenario(scenarioConfig);
    };
  }

  /**
   * Enhanced analytics using MCP capabilities
   */
  enhanceAnalytics() {
    // Extend existing analytics with MCP enhancements
    if (this.analytics) {
      this.getAnalyticsInsights = async () => {
        return await this.mcpManager.generateAnalyticsInsights();
      };
    }
  }

  /**
   * Enhanced content with real-world examples
   */
  enhanceContentWithRealWorld() {
    // Add real-world context to scenarios
    this.addRealWorldContext = async (scenarioId, category) => {
      const webResearch = this.mcpManager.integrations.get('webResearch');
      if (webResearch) {
        return await webResearch.enrichScenarioWithRealExamples(
          scenarioId,
          category
        );
      }
      return null;
    };
  }

  /**
   * Get MCP status and capabilities
   */
  getMCPStatus() {
    if (!this.mcpManager) {
      return { initialized: false, capabilities: [] };
    }
    return this.mcpManager.getMCPStatus();
  }

  /**
   * Initialize Firebase and Authentication Services
   */
  async initializeFirebaseServices() {
    try {
      AppDebug.log('Initializing Firebase services...');

      // Initialize Authentication Service
      this.authService = new AuthService();
      const authInitialized = await this.authService.initialize();

      if (authInitialized) {
        AppDebug.log('Authentication service initialized successfully');

        // Make auth service globally accessible for Firestore logging
        window.authService = this.authService;

        // Get Firebase service reference for other components
        this.firebaseService = this.authService.firebaseService;

        // Set up authentication state listener (Firebase best practice)
        this.setupAuthStateListener();

        // Set up research data logging integration
        this.setupResearchDataIntegration();

        // Update UI for current auth state
        this.updateUIForAuthState();
      } else {
        AppDebug.warn('Authentication service initialization failed');
      }
    } catch (error) {
      AppDebug.error('Failed to initialize Firebase services:', error);
      // Continue without Firebase - app should still function
    }
  }

  /**
   * Set up authentication state listener (Firebase best practice)
   * This ensures reliable user state detection across page loads and sessions
   */
  setupAuthStateListener() {
    if (!this.firebaseService) {
      AppDebug.warn('Firebase service not available for auth state listener');
      return;
    }

    try {
      // Set up Firebase onAuthStateChanged listener early in app lifecycle
      this.firebaseService.onAuthStateChanged(user => {
        AppDebug.log(
          'Authentication state changed:',
          user ? 'User signed in' : 'User signed out'
        );

        // Update current user state
        this.currentUser = user;

        // Update UI to reflect auth state
        this.updateUIForAuthState();

        // Handle user-specific initialization
        if (user) {
          this.handleUserSignedIn(user);
        } else {
          this.handleUserSignedOut();
        }
      });

      AppDebug.log('Authentication state listener set up successfully');
    } catch (error) {
      AppDebug.error('Failed to set up authentication state listener:', error);
    }
  }

  /**
   * Handle user signed in state
   */
  handleUserSignedIn(user) {
    // Update user profile in auth service
    if (this.authService) {
      this.authService.setCurrentUser(user);
    }

    // Load user-specific data, preferences, etc.
    this.loadUserData(user);

    // Show welcome message for new sessions
    if (!this.userWelcomed) {
      this.showWelcomeMessage(user);
      this.userWelcomed = true;
    }
  }

  /**
   * Handle user signed out state
   */
  handleUserSignedOut() {
    // Clear user-specific data
    this.currentUser = null;
    this.userWelcomed = false;

    // Reset auth service state
    if (this.authService) {
      this.authService.clearCurrentUser();
    }

    // Clear any cached user data
    this.clearUserData();
  }

  /**
   * Load user-specific data and preferences
   */
  async loadUserData(user) {
    try {
      if (!this.firebaseService) return;

      // Load user profile and preferences
      const userProfile = await this.firebaseService.getUserProfile(user.uid);
      if (userProfile) {
        AppDebug.log('User profile loaded successfully');
        // Apply user preferences, load progress, etc.
      }
    } catch (error) {
      AppDebug.error('Error loading user data:', error);
    }
  }

  /**
   * Clear user-specific data
   */
  clearUserData() {
    // Clear any cached user data, preferences, progress, etc.
    AppDebug.log('User data cleared');
  }

  /**
   * Show welcome message for authenticated users
   */
  showWelcomeMessage(user) {
    const displayName = user.displayName || user.email || 'User';
    AppDebug.log(`Welcome back, ${displayName}!`);

    // Could show a toast notification or other welcome UI
    // Example: this.showToast(`Welcome back, ${displayName}!`);
  }

  /**
   * Set up research data logging integration
   */
  setupResearchDataIntegration() {
    // Override the existing simulation completion flow to include research logging
    const originalHandleSimulationComplete =
      this.handleSimulationComplete?.bind(this);

    if (originalHandleSimulationComplete) {
      this.handleSimulationComplete = async simulationData => {
        // Call original completion handler
        await originalHandleSimulationComplete(simulationData);

        // Log research data if user is authenticated and opted in
        if (
          this.authService?.isAuthenticated() &&
          this.authService?.canAccessResearch()
        ) {
          await this.logResearchData(simulationData);
        }
      };
    }
  }

  /**
   * Log research data for authenticated research participants
   */
  async logResearchData(simulationData) {
    try {
      const user = this.authService.getCurrentUser();
      if (!user) return;

      const researchData = {
        scenarioId: simulationData.scenarioId,
        responses: simulationData.userChoices || {},
        ethicsScores: simulationData.ethicsScores || {},
        reflectionAnswers: simulationData.reflectionAnswers || [],
        completionTime: simulationData.completionTime || 0,
        timestamp: new Date().toISOString(),
      };

      const result = await this.firebaseService.logResearchResponse(
        user.uid,
        researchData
      );

      if (result.success) {
        AppDebug.log('Research data logged successfully');
      } else {
        AppDebug.warn(
          'Research data logging failed:',
          result.reason || 'Unknown error'
        );
      }
    } catch (error) {
      AppDebug.error('Error logging research data:', error);
    }
  }

  /**
   * Update UI based on current authentication state
   */
  updateUIForAuthState() {
    const user = this.getCurrentUser();
    const isAuthenticated = !!user;

    // Update navigation authentication state
    if (this.authService) {
      this.authService.updateAuthenticationUI(isAuthenticated, user);
    }

    // Update any auth-dependent UI elements
    const authButtons = document.querySelectorAll('[data-auth-required]');
    authButtons.forEach(button => {
      if (isAuthenticated) {
        button.style.display = '';
        button.disabled = false;
      } else {
        button.style.display = 'none';
        button.disabled = true;
      }
    });

    // Update user-specific content
    const userContent = document.querySelectorAll('[data-user-content]');
    userContent.forEach(element => {
      element.style.display = isAuthenticated ? '' : 'none';
    });

    // Update guest content
    const guestContent = document.querySelectorAll('[data-guest-content]');
    guestContent.forEach(element => {
      element.style.display = isAuthenticated ? 'none' : '';
    });

    AppDebug.log(
      'UI updated for authentication state:',
      isAuthenticated ? 'authenticated' : 'guest'
    );
  }

  /**
   * Get current user authentication status
   */
  getCurrentUser() {
    return this.authService?.getCurrentUser() || null;
  }

  /**
   * Get user profile information
   */
  getUserProfile() {
    return this.authService?.getUserProfile() || null;
  }

  // ...existing methods...
}

/**
 * Ethics Radar Demo Class for Hero Section
 * Handles the interactive radar chart demonstration in the hero area
 */
class EthicsRadarDemo {
  constructor() {
    this.demoChart = null;
    this.ANIMATION_DELAY = 200; // Animation delay in milliseconds
    this.RESET_DELAY = 300; // Reset animation delay in milliseconds
    this.initializeDemo();
  }

  async initializeDemo() {
    try {
      // Initialize the demo radar chart with new hero container
      this.demoChart = new RadarChart('hero-ethics-chart', {
        title: 'Ethical Impact Analysis',
        width: 580,
        height: 580,
        realTime: false,
        showLabels: true,
        animated: true,
        isDemo: true, // Use minimal container styling
      });

      logger.info('Ethics radar demo initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize ethics radar demo:', error);
    }
  }

  simulatePattern(pattern) {
    const patterns = {
      utilitarian: {
        fairness: 3,
        sustainability: 4,
        autonomy: 2,
        beneficence: 5,
        transparency: 3,
        accountability: 4,
        privacy: 2,
        proportionality: 4,
      },
      deontological: {
        fairness: 5,
        sustainability: 3,
        autonomy: 5,
        beneficence: 4,
        transparency: 4,
        accountability: 5,
        privacy: 4,
        proportionality: 3,
      },
      virtue: {
        fairness: 4,
        sustainability: 4,
        autonomy: 4,
        beneficence: 4,
        transparency: 3,
        accountability: 4,
        privacy: 3,
        proportionality: 4,
      },
      balanced: {
        fairness: 4,
        sustainability: 4,
        autonomy: 4,
        beneficence: 4,
        transparency: 4,
        accountability: 4,
        privacy: 4,
        proportionality: 4,
      },
    };

    if (this.demoChart && patterns[pattern]) {
      setTimeout(() => {
        this.demoChart.setScores(patterns[pattern]);
        this.showFeedback(pattern);
      }, this.ANIMATION_DELAY);
    }
  }

  reset() {
    if (this.demoChart) {
      setTimeout(() => {
        this.demoChart.resetScores();
        this.hideFeedback();
      }, this.RESET_DELAY);
    }
  }

  showFeedback(pattern) {
    const feedbackContainer = document.getElementById('hero-demo-feedback');
    if (!feedbackContainer) return;

    const popoverContent = feedbackContainer.querySelector('.popover-content');
    if (!popoverContent) return;

    // Clear any existing auto-hide timer
    if (popoverHideTimeout) {
      clearTimeout(popoverHideTimeout);
      popoverHideTimeout = null;
    }

    const feedbackMessages = {
      utilitarian: {
        title: 'Utilitarian Ethics',
        message:
          'This approach prioritizes the greatest good for the greatest number, emphasizing beneficence and outcomes over individual rights.',
      },
      deontological: {
        title: 'Rights-Based Ethics',
        message:
          'This framework focuses on duties and rights, giving priority to fairness, autonomy, and accountability regardless of consequences.',
      },
      virtue: {
        title: 'Virtue Ethics',
        message:
          'This approach emphasizes character and moral virtues, seeking balance across all ethical dimensions through practical wisdom.',
      },
      balanced: {
        title: 'Balanced Approach',
        message:
          'This represents a comprehensive ethical framework that considers all dimensions equally, often used in complex real-world scenarios.',
      },
    };

    const feedback = feedbackMessages[pattern];
    if (feedback) {
      popoverContent.innerHTML = `
                <h5>${feedback.title}</h5>
                <p>${feedback.message}</p>
            `;
      feedbackContainer.classList.add('show');

      // Set auto-hide timer for 5 seconds
      const AUTO_HIDE_DELAY = 5000; // 5 seconds
      popoverHideTimeout = setTimeout(() => {
        this.hideFeedback();
        popoverHideTimeout = null;
      }, AUTO_HIDE_DELAY);
    }
  }

  hideFeedback() {
    // Clear any existing auto-hide timer
    if (popoverHideTimeout) {
      clearTimeout(popoverHideTimeout);
      popoverHideTimeout = null;
    }

    const feedbackContainer = document.getElementById('hero-demo-feedback');
    if (!feedbackContainer) return;

    const popoverContent = feedbackContainer.querySelector('.popover-content');

    feedbackContainer.classList.remove('show');
    const FADE_OUT_DELAY = 300; // ms delay for fade out animation
    setTimeout(() => {
      if (popoverContent) {
        popoverContent.innerHTML = '';
      }
    }, FADE_OUT_DELAY);
  }
}

// Initialize the ethics radar demo when DOM is ready
let ethicsDemo = null;
let currentActivePattern = null; // Track currently active pattern
let popoverHideTimeout = null; // Track auto-hide timer for popover

// Global functions for radar demo controls with toggle functionality
window.simulateEthicsPattern = function (pattern, buttonElement) {
  if (ethicsDemo) {
    // If clicking the same pattern, toggle it off (deselect)
    if (currentActivePattern === pattern) {
      ethicsDemo.reset();
      currentActivePattern = null;
      updateButtonStates(null);
    } else {
      // Otherwise, select the new pattern
      ethicsDemo.simulatePattern(pattern);
      currentActivePattern = pattern;
      updateButtonStates(pattern);

      // Position and show popover above the clicked button
      if (buttonElement) {
        positionPopoverAboveButton(buttonElement);
      }
    }
  }
};

window.resetEthicsDemo = function () {
  if (ethicsDemo) {
    ethicsDemo.reset();
    currentActivePattern = null;
    updateButtonStates(null);
  }
};

// Helper function to position popover above a specific button
function positionPopoverAboveButton(button) {
  const feedbackContainer = document.getElementById('hero-demo-feedback');
  if (!feedbackContainer || !button) return;

  // Get button position and dimensions
  const buttonRect = button.getBoundingClientRect();
  const controlsContainer = button.closest('.demo-controls-grid');
  const controlsRect = controlsContainer.getBoundingClientRect();

  // Calculate position relative to the controls container
  const leftOffset = buttonRect.left - controlsRect.left + buttonRect.width / 2;

  // Apply positioning
  feedbackContainer.style.left = `${leftOffset}px`;
  feedbackContainer.style.transform = 'translateX(-50%)';
}

// Helper function to update button visual states
function updateButtonStates(activePattern) {
  const buttons = document.querySelectorAll('.hero-demo-controls .demo-btn');

  buttons.forEach(button => {
    const buttonText = button.textContent.toLowerCase();
    let patternName = '';

    // Map button text to pattern names
    if (buttonText.includes('utilitarian')) patternName = 'utilitarian';
    else if (buttonText.includes('rights-based')) patternName = 'deontological';
    else if (buttonText.includes('virtue')) patternName = 'virtue';
    else if (buttonText.includes('balanced')) patternName = 'balanced';

    // Update button state
    if (activePattern === patternName) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
}

window.toggleRadarInstructions = function () {
  const accordion = document.querySelector('.radar-instructions-accordion');
  const content = document.querySelector('.accordion-content');

  if (accordion && content) {
    const isOpen = accordion.classList.contains('open');

    if (isOpen) {
      accordion.classList.remove('open');
      content.classList.add('collapsed');
      content.style.maxHeight = '0';
      content.style.opacity = '0';
    } else {
      accordion.classList.add('open');
      content.classList.remove('collapsed');
      content.style.maxHeight = `${content.scrollHeight}px`;
      content.style.opacity = '1';
    }
  }
};

window.toggleEthicsGlossary = function () {
  const accordion = document.querySelector('.ethics-glossary-accordion');
  const content = document.querySelector(
    '.ethics-glossary-accordion .accordion-content'
  );

  if (accordion && content) {
    const isOpen = accordion.classList.contains('open');

    if (isOpen) {
      accordion.classList.remove('open');
      content.classList.add('collapsed');
      content.style.maxHeight = '0';
      content.style.opacity = '0';
    } else {
      accordion.classList.add('open');
      content.classList.remove('collapsed');
      content.style.maxHeight = `${content.scrollHeight}px`;
      content.style.opacity = '1';
    }
  }
};

// Add click-to-close functionality for accordion content areas
document.addEventListener('DOMContentLoaded', () => {
  // Add click listener for radar instructions accordion content
  document.addEventListener('click', event => {
    const radarContent = document.querySelector(
      '.radar-instructions-accordion.open .accordion-content'
    );
    if (radarContent && radarContent.contains(event.target)) {
      // Check if click is within the content area but not on the header
      const header = document.querySelector(
        '.radar-instructions-accordion .accordion-header'
      );
      if (!header || !header.contains(event.target)) {
        window.toggleRadarInstructions();
      }
    }

    // Add click listener for ethics glossary accordion content
    const glossaryContent = document.querySelector(
      '.ethics-glossary-accordion.open .accordion-content'
    );
    if (glossaryContent && glossaryContent.contains(event.target)) {
      // Check if click is within the content area but not on the header
      const header = document.querySelector(
        '.ethics-glossary-accordion .accordion-header'
      );
      if (!header || !header.contains(event.target)) {
        window.toggleEthicsGlossary();
      }
    }
  });
});

/**
 * Fallback for script loading issues
 */
window.addEventListener('error', event => {
  AppDebug.error('Error occurred:', event.message);
  alert(
    'An error occurred while loading the application. Please try again later.'
  );
});

// Initialize the application
const app = new AIEthicsApp();

// Start the app when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}

// Make app globally available for inline event handlers
window.app = app;

// Export the class for ES6 modules
export default AIEthicsApp;
