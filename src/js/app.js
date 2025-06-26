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

// Import enhanced objects (loaded dynamically as needed)
// import { EthicsMeter, InteractiveButton, InteractiveSlider } from './objects/enhanced-objects.js';

// Import new modal components
import { PreLaunchModal } from './components/pre-launch-modal.js';
import { EnhancedSimulationModal } from './components/enhanced-simulation-modal.js';
import { PostSimulationModal } from './components/post-simulation-modal.js';
import HeroDemo from './components/hero-demo.js';

// Constants for app configuration
const APP_CONSTANTS = {
    VIEWPORT: {
        MOBILE_BREAKPOINT: 767
    },
    DEFAULTS: {
        SCORE_VALUE: 0.5,
        SLIDER_VALUE: 50,
        METER_VALUE: 0.5,
        ETHICS_METER_VALUE: 50
    },
    FEEDBACK: {
        EXCELLENT_THRESHOLD: 70,
        GOOD_THRESHOLD: 50
    },
    TIMING: {
        ANIMATION_DELAY: 300,
        NOTIFICATION_DURATION: 4000,
        STAGGER_DELAY: 300,
        QUICK_DELAY: 50
    }
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
    }
};

class AIEthicsApp {
    constructor() {
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
        this.simulationContainer = null;
        this.simulationsGrid = null;
        this.lastFocusedElement = null; // For focus restoration
        
        // Theme and preferences
        this.currentTheme = 'light';
        this.preferences = {
            reducedMotion: false,
            highContrast: false,
            largeText: false
        };
        
        // Error handling
        this.errorBoundary = null;
        this.lastError = null;
        
        // Available simulations
        this.availableSimulations = [
            {
                id: 'bias-fairness',
                title: 'AI Ethics Explorer',
                description: 'Explore real-world AI scenarios and see how different choices affect various groups in society. No right answers - just learning through cause and effect.',
                difficulty: 'beginner',
                duration: 1200, // 20 minutes
                thumbnail: 'src/assets/images/bias-fairness-thumb.svg',
                tags: ['ethics', 'fairness', 'education', 'scenarios', 'open-ended'],
                useCanvas: false, // HTML-only simulation, no canvas needed
                renderMode: 'html'
            },
            {
                id: 'consent-transparency',
                title: 'Consent & Transparency',
                description: 'Learn about informed consent and the importance of transparency in AI systems.',
                difficulty: 'beginner',
                duration: 480, // 8 minutes
                thumbnail: 'src/assets/images/consent-transparency-thumb.svg',
                tags: ['consent', 'transparency', 'privacy', 'communication']
            },
            {
                id: 'autonomy-oversight',
                title: 'Autonomy & Oversight',
                description: 'Balance AI autonomy with human oversight in critical decision-making scenarios.',
                difficulty: 'intermediate',
                duration: 720, // 12 minutes
                thumbnail: 'src/assets/images/autonomy-oversight-thumb.svg',
                tags: ['autonomy', 'oversight', 'control', 'responsibility']
            },
            {
                id: 'misinformation-trust',
                title: 'Misinformation & Trust',
                description: 'Combat misinformation and build trustworthy AI communication systems.',
                difficulty: 'advanced',
                duration: 900, // 15 minutes
                thumbnail: 'src/assets/images/misinformation-trust-thumb.svg',
                tags: ['misinformation', 'trust', 'communication', 'verification']
            }
        ];
    }    async init() {
        if (this.isInitialized) return;

        try {
            // Initialize theme detection first
            this.initializeTheme();
            
            // Initialize error handling
            this.initializeErrorHandling();
            
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
            
            this.isInitialized = true;
            AppDebug.log('AI Ethics App initialized successfully with modernized infrastructure');
            
            // Track initialization
            simpleAnalytics.trackEvent('app_initialized', {
                simulations_available: this.availableSimulations.length,
                browser: Helpers.getBrowserInfo().browser,
                device: Helpers.getDeviceType(),
                theme: this.currentTheme,
                accessibility_enabled: this.preferences.highContrast || this.preferences.largeText
            });
            
        } catch (error) {
            AppDebug.error('Failed to initialize app:', error);
            this.handleError(error, 'Failed to initialize the application. Please refresh the page.');
        }
    }

    /**
     * Initialize theme detection and monitoring
     */
    initializeTheme() {
        // Detect system preferences
        const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        const prefersHighContrast = window.matchMedia?.('(prefers-contrast: high)').matches;
        
        // Get saved user preferences (they override system preferences)
        const savedPreferences = userPreferences.getAccessibilitySettings();
        
        // Use saved preferences if they exist, otherwise use system preferences
        this.preferences = {
            reducedMotion: savedPreferences.reducedMotion !== undefined ? savedPreferences.reducedMotion : prefersReducedMotion,
            highContrast: savedPreferences.highContrast !== undefined ? savedPreferences.highContrast : prefersHighContrast,
            largeText: savedPreferences.largeText || false // Default to false
        };
        
        this.currentTheme = this.preferences.highContrast ? 'high-contrast' : 'light';
        
        // Apply initial theme
        this.applyTheme();
        
        // Monitor theme changes
        this.setupThemeMonitoring();
        
        AppDebug.log('Theme initialized:', this.currentTheme, this.preferences);
    }
    
    /**
     * Setup theme change monitoring
     */
    setupThemeMonitoring() {
        const reducedMotionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
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
                this.currentTheme = newPreferences.highContrast ? 'high-contrast' : 'light';
                this.applyTheme();
                this.announceThemeChange();
                
                AppDebug.log('System theme changed, updated non-user-set preferences:', newPreferences);
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
            highContrastBtn.setAttribute('aria-pressed', this.preferences.highContrast.toString());
        }
        if (largeTextBtn) {
            largeTextBtn.setAttribute('aria-pressed', this.preferences.largeText.toString());
        }
        if (reducedMotionBtn) {
            reducedMotionBtn.setAttribute('aria-pressed', this.preferences.reducedMotion.toString());
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
        window.addEventListener('error', (event) => {
            this.handleError(event.error, 'A JavaScript error occurred');
        });
        
        window.addEventListener('unhandledrejection', (event) => {
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
            timestamp: new Date().toISOString()
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
                    theme: this.currentTheme
                }
            };
            
            // Send to analytics
            simpleAnalytics.trackEvent('error_reported', errorReport);
            
            // Show confirmation
            alert('Error report sent. Thank you for helping us improve the application.');
        }
    }

    async initializeSystems() {
        try {
            // Initialize animation manager with theme preferences
            this.animationManager = new AnimationManager({
                enableAnimations: !this.preferences.reducedMotion,
                reducedMotion: this.preferences.reducedMotion,
                performanceMode: this.preferences.reducedMotion ? 'compatibility' : 'balanced'
            });
            
            // Initialize accessibility manager with current preferences
            this.accessibilityManager = new AccessibilityManager(document.body, {
                theme: this.currentTheme,
                preferences: this.preferences
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
                reducedMotion: this.preferences.reducedMotion
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
                const curriculumAlignment = this.educatorToolkit.getCurriculumAlignment(config.tags || []);
                if (curriculumAlignment) {
                    simulation.curriculumAlignment = curriculumAlignment;
                }
                
                // Get assessment tools for this simulation
                const assessmentTools = this.educatorToolkit.getAssessmentTools(config.difficulty);
                if (assessmentTools) {
                    simulation.assessmentTools = assessmentTools;
                }
            }
            
            // Connect Digital Science Lab
            if (this.digitalScienceLab && simulation) {
                simulation.digitalScienceLab = this.digitalScienceLab;
                
                // Get relevant lab stations for this simulation
                const relevantStations = this.digitalScienceLab.getRelevantStations(config.tags || []);
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
            
            AppDebug.log(`Educational modules connected to simulation: ${simulation.id || 'unknown'}`);
            
        } catch (error) {
            AppDebug.error('Failed to connect educational modules to simulation:', error);
            // Non-critical error - simulation can still function without full integration
        }
    }

    setupUI() {
        // Get key UI elements
        this.modal = document.getElementById('simulation-modal');
        this.simulationContainer = document.getElementById('simulation-container');
        this.simulationsGrid = document.querySelector('.simulations-grid');
        this.loading = document.getElementById('loading');
        
        if (!this.simulationsGrid) {
            AppDebug.error('Simulations grid not found');
            return;        }
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
     */
    async initializeHeroDemo() {
        try {
            const heroContainer = document.getElementById('hero-demo');
            if (heroContainer) {
                this.heroDemo = new HeroDemo();
                logger.info('Hero demo initialized successfully');
            } else {
                logger.warn('Hero demo container not found, skipping initialization');
            }
        } catch (error) {
            logger.error('Failed to initialize hero demo:', error);
            // Non-critical error - app can continue without hero demo
        }
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

    setupEventListeners() {
        // Hero section buttons
        const startLearningBtn = document.getElementById('start-learning');
        const educatorGuideBtn = document.getElementById('educator-guide');
        
        if (startLearningBtn) {
            startLearningBtn.addEventListener('click', () => {
                this.scrollToSimulations();
            });
        }
        
        if (educatorGuideBtn) {
            educatorGuideBtn.addEventListener('click', () => {
                this.openEducatorTools();
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
                this.modal.addEventListener('keydown', (e) => {
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
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeSimulation();
                }
            });
            
            // Close modal on Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && !this.modal.hasAttribute('aria-hidden')) {
                    this.closeSimulation();
                }
            });
        }

        // Accessibility controls
        const highContrastBtn = document.getElementById('toggle-high-contrast');
        const largeTextBtn = document.getElementById('toggle-large-text');
        const reducedMotionBtn = document.getElementById('toggle-reduced-motion');
        
        if (highContrastBtn) {
            highContrastBtn.addEventListener('click', () => {
                this.toggleHighContrast();
            });
        }
          if (largeTextBtn) {
            largeTextBtn.addEventListener('click', () => {
                this.toggleLargeText();
            });
        }

        if (reducedMotionBtn) {
            reducedMotionBtn.addEventListener('click', () => {
                this.toggleReducedMotion();
            });
        }

        // Enhanced simulation card buttons (delegated event handling)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('enhanced-sim-button')) {
                e.preventDefault();
                const simulationId = e.target.getAttribute('data-simulation');
                if (simulationId) {
                    this.startSimulation(simulationId);
                }
            }
        });
    }

    setupAccessibility() {
        // Preferences are now loaded in initializeTheme(), so we just need to ensure
        // the theme is applied (which was already done in initializeTheme)
        // This method is kept for future accessibility setup if needed
    }

    render() {
        this.renderSimulationsGrid();
        // Hero demo is now handled by the HeroDemo class
    }

    renderSimulationsGrid() {
        if (!this.simulationsGrid) return;

        this.simulationsGrid.innerHTML = '';
        
        this.availableSimulations.forEach(sim => {
            const card = this.createSimulationCard(sim);
            this.simulationsGrid.appendChild(card);
        });
    }

    createSimulationCard(simulation) {
        const card = Helpers.createElement('div', 'simulation-card', {
            'role': 'gridcell',
            'tabindex': '0',
            'aria-label': `${simulation.title} simulation`
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
                
                ${isCompleted ? `
                    <div class="completion-info">
                        <span class="score">Score: ${score}/100</span>
                        <span class="grade">${Helpers.getEthicsGrade(score).grade}</span>
                    </div>
                ` : ''}
                  <div class="card-actions">
                    <button class="btn btn-primary enhanced-sim-button" data-simulation="${simulation.id}">
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
        
        card.addEventListener('keydown', (e) => {
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
            // Check if we should show the pre-launch modal first
            const shouldShowPreLaunch = !userPreferences.shouldSkipPreLaunch(simulationId);
            
            if (shouldShowPreLaunch) {
                this.showPreLaunchModal(simulationId);
                return; // Pre-launch modal will call launchSimulationDirect when ready
            }
            
            // Direct launch (skipping pre-launch modal)
            await this.launchSimulationDirect(simulationId);
            
        } catch (error) {
            AppDebug.error('Failed to start simulation:', error);
            this.hideLoading();
            this.showNotification('Failed to start simulation. Please try again.', 'error');
        }
    }
    
    /**
     * Shows the pre-launch information modal
     */
    showPreLaunchModal(simulationId) {
        const prelaunchModal = new PreLaunchModal(simulationId, {
            onLaunch: () => {
                // User clicked "Start Exploration" - proceed with simulation
                this.launchSimulationDirect(simulationId);
            },
            onCancel: () => {
                // User clicked "Maybe Later" - just close modal
                this.hideLoading();
            },
            showEducatorResources: true // Always show educator resources
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
            simpleAnalytics.trackSimulationStart(simulationId, simConfig.title);            // Get simulation container
            const simulationContainer = document.getElementById('simulation-container');
            if (!simulationContainer) {
                throw new Error('Simulation container not found');
            }
            
            // Add loading state to container
            simulationContainer.classList.add('loading');
            simulationContainer.setAttribute('aria-busy', 'true');
            simulationContainer.setAttribute('aria-label', `Loading ${simConfig.title} simulation`);
            
            // Clear previous content and remove any error states
            simulationContainer.innerHTML = '';
            simulationContainer.classList.remove('error');
              // Create managed canvas for the simulation
            const { canvas, id } = await canvasManager.createCanvas({
                width: 600,
                height: 400,
                container: simulationContainer,
                className: 'simulation-canvas',
                id: `simulation-${simulationId}`
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
                    height: 400
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
                    }
                };
                
                // Remove the canvas element since it's not needed
                if (canvas && canvas.parentNode) {
                    canvas.parentNode.removeChild(canvas);
                }
            }

            // Create the specific simulation instance
            this.currentSimulation = await this.createSimulationInstance(simulationId, simConfig);
            
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
                simulationContainer.setAttribute('aria-label', `${simConfig.title} simulation`);
            }
            
            // Re-initialize enhanced UI objects for this simulation
            await this.refreshEnhancedObjects();
            
            // Update ethics meters with initial values
            this.updateEthicsMeters();
              } catch (error) {
            AppDebug.error('Failed to start simulation:', error);
            this.hideLoading();
            
            // Add error state to container
            const simulationContainer = document.getElementById('simulation-container');
            if (simulationContainer) {
                simulationContainer.classList.remove('loading');
                simulationContainer.classList.add('error');
                simulationContainer.removeAttribute('aria-busy');
                simulationContainer.setAttribute('aria-label', 'Simulation failed to load');
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
                case 'bias-fairness': {
                    const { default: BiasExplorerSimulation } = await import('./simulations/bias-fairness-v2.js');
                    simulation = new BiasExplorerSimulation(simulationId);
                    // Set container reference
                    simulation.container = document.getElementById('simulation-container');
                    break;
                }
                
                default: {
                    // Fallback to basic simulation for unimplemented simulations
                    const basicScenarios = [
                        {
                            id: 'intro',
                            title: 'Introduction',
                            description: 'Welcome to this open-ended exploration of AI ethics',
                            objective: 'Explore different perspectives and discover consequences of choices'
                        },
                        {
                            id: 'decision1',
                            title: 'First Decision',
                            description: 'Make your first ethical choice',
                            objective: 'Choose the most ethical option'
                        },
                        {
                            id: 'conclusion',
                            title: 'Conclusion',
                            description: 'Reflect on your decisions',
                            objective: 'Review your ethical choices'
                        }
                    ];

                    simulation = new EthicsSimulation(simulationId, {
                        title: config.title,
                        description: config.description,
                        difficulty: config.difficulty,
                        duration: config.duration,
                        scenarios: basicScenarios,
                        ethicsMetrics: [
                            { name: 'fairness', label: 'Fairness', value: APP_CONSTANTS.DEFAULTS.ETHICS_METER_VALUE },
                            { name: 'transparency', label: 'Transparency', value: APP_CONSTANTS.DEFAULTS.ETHICS_METER_VALUE },
                            { name: 'privacy', label: 'Privacy', value: APP_CONSTANTS.DEFAULTS.ETHICS_METER_VALUE }
                        ]
                    });
                    
                    // Set container reference
                    simulation.container = document.getElementById('simulation-container');
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

        this.currentSimulation.on('simulation:completed', (data) => {
            this.onSimulationCompleted(data);
        });

        this.currentSimulation.on('ethics:updated', (data) => {
            // Handle ethics updates
            AppDebug.log('Ethics updated:', data);
        });

        this.currentSimulation.on('scenario:loaded', (data) => {
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
            const enhancedModal = document.querySelector('.enhanced-simulation-modal');
            if (enhancedModal) {
                enhancedModal.style.display = 'none';
                enhancedModal.setAttribute('aria-hidden', 'true');
            }
            
            // Track simulation completion
            if (this.currentSimulation && this.currentSimulation.id) {
                simpleAnalytics.trackSimulationComplete(this.currentSimulation.id, data);
            }
            
            // Show post-simulation modal
            this.showPostSimulationModal(data);
            
        } catch (error) {
            AppDebug.error('Error handling simulation completion:', error);
            // Fallback to basic completion handling
            this.hideModal();
            this.showNotification('Simulation completed! Thank you for exploring AI Ethics.', 'success');
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
                this.showNotification('Thank you for your thoughtful reflection!', 'success');
            },
            onSkip: () => {
                // User skipped reflection - just close modal
                this.hideModal();
            },
            onRestart: () => {
                // User wants to restart simulation
                this.hideModal();
                this.startSimulation(simulationId);
            }
        });
        
        postModal.show();
    }
    
    /**
     * Show the enhanced simulation modal for the active simulation
     */
    showEnhancedSimulationModal(simulationId, simConfig) {
        AppDebug.log('Showing enhanced simulation modal for:', simulationId);
        
        try {
            const enhancedModal = new EnhancedSimulationModal(simulationId, {
                simulation: this.currentSimulation,
                onClose: () => {
                    AppDebug.log('Enhanced modal closed');
                    this.hideModal();
                },
                onMinimize: () => {
                    AppDebug.log('Enhanced modal minimized');
                    // Keep simulation running but minimize UI
                }
            });
            
            enhancedModal.show();
            
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
        
        // Make background content inert
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.setAttribute('inert', '');
        }
        
        // Focus management - focus the close button initially
        const closeButton = this.modal.querySelector('.modal-close');
        if (closeButton) {
            closeButton.focus();
        }
    }

    /**
     * Trap focus within modal for accessibility
     */
    trapFocusInModal(event) {
        if (!this.modal || this.modal.hasAttribute('aria-hidden')) return;

        const focusableElements = this.modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstFocusable) {
                lastFocusable.focus();
                event.preventDefault();
            }
        } else {
            // Tab
            if (document.activeElement === lastFocusable) {
                firstFocusable.focus();
                event.preventDefault();
            }
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
            this.simulationSlidersCanvasId
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
        this.simulationSlidersCanvasId = null;        if (this.modal) {
            // Remove focus from any focused elements inside the modal first
            const focusedElement = this.modal.querySelector(':focus');
            if (focusedElement) {
                focusedElement.blur();
            }
            
            // Restore focus to the element that was focused before the modal opened
            if (this.lastFocusedElement && document.contains(this.lastFocusedElement)) {
                this.lastFocusedElement.focus();
            }
            
            // Make modal inert and hide it
            this.modal.setAttribute('inert', '');
            this.modal.setAttribute('aria-hidden', 'true');
            this.modal.style.display = 'none';
            
            // Remove inert from main content
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.removeAttribute('inert');
            }
        }        // Clear simulation container
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
            readingContainer.innerHTML = simData.resources.backgroundReading.map(resource => `
                <div class="resource-item">
                    <a href="${resource.url}" target="_blank" class="resource-title">${resource.title}</a>
                    <p class="resource-description">${resource.description}</p>
                </div>
            `).join('');
        }
        
        // Related videos
        const videosContainer = modal.querySelector('#related-videos');
        if (videosContainer && simData.resources?.videos) {
            videosContainer.innerHTML = simData.resources.videos.map(video => `
                <div class="resource-item">
                    <a href="${video.url}" target="_blank" class="resource-title">${video.title}</a>
                    <p class="resource-description">${video.description}</p>
                    <span class="resource-duration">${video.duration}</span>
                </div>
            `).join('');
        }
        
        // Discussion questions
        const questionsContainer = modal.querySelector('#discussion-questions');
        if (questionsContainer && simData.educatorResources?.discussionQuestions) {
            questionsContainer.innerHTML = simData.educatorResources.discussionQuestions.map(question => `
                <div class="resource-item">
                    <p class="discussion-question">${question}</p>
                </div>
            `).join('');
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
            ethicsContainer.innerHTML = Object.entries(simData.vocabulary).map(([term, definition]) => `
                <div class="ethics-term">
                    <h5>${term}</h5>
                    <p>${definition}</p>
                </div>
            `).join('');
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
            const keyTerms = Object.keys(simData.vocabulary).slice(0, MAX_QUICK_TERMS);
            conceptsContainer.innerHTML = keyTerms.map(term => `
                <li><a href="#" class="resource-link" data-term="${term}">${term}</a></li>
            `).join('');
            
            // Add click handlers for terms
            conceptsContainer.querySelectorAll('[data-term]').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const { dataset: { term } } = e.target;
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
        this.showNotification(`${term}: ${definition}`, 'info', NOTIFICATION_DURATION);
    }
}

/**
 * Fallback for script loading issues
 */
window.addEventListener('error', (event) => {
    AppDebug.error('Error occurred:', event.message);
    alert('An error occurred while loading the application. Please try again later.');
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
