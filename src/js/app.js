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

// Import enhanced objects
import { EthicsMeter, InteractiveButton, InteractiveSlider } from './objects/enhanced-objects.js';

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
     * Simulation management
     */
    async startSimulation(simulationId) {
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
              // Show the modal
            this.showSimulationModal(simConfig);
            
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
    }    async createSimulationInstance(simulationId, config) {
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
    }    showSimulationModal(simConfig) {
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

    resetCurrentSimulation() {
        if (this.currentSimulation) {
            this.currentSimulation.reset();
            simpleAnalytics.trackInteraction('reset_simulation', this.currentSimulation.id);
        }
    }

    onSimulationCompleted(data) {
        // Save completion data
        const progress = userProgress.getSimulationProgress(this.currentSimulation.id);
        userProgress.setSimulationProgress(this.currentSimulation.id, {
            ...progress,
            completed: true,
            score: data.report.score || 0,
            scenarios: data.report.scenarios || [],
            timeSpent: (progress.timeSpent || 0) + (data.report.timeSpent || 0)
        });
        
        // Track completion
        simpleAnalytics.trackSimulationComplete(this.currentSimulation.id, data.report);
        
        // Show completion feedback
        this.showCompletionFeedback(data);
        
        // Update UI
        this.renderSimulationsGrid();
    }

    showCompletionFeedback(data) {
        const grade = Helpers.getEthicsGrade(data.score);
        
        alert(`Simulation Complete!\n\nScore: ${data.score}/100\nGrade: ${grade.grade} (${grade.description})\n\nCheck the educator tools for detailed analysis.`);
    }

    updateModalTitle(title) {
        const modalTitle = this.modal?.querySelector('#modal-title');
        if (modalTitle) {
            modalTitle.textContent = title;
        }
    }    /**
     * Initialize enhanced objects for simulation UI
     */
    async initializeEnhancedObjects() {
        try {
            await this.setupEthicsMeters();
            // Skip interactive buttons and sliders setup to avoid canvas cleanup issues
            // These will be created by individual simulations if needed
            // await this.setupInteractiveButtons();
            // await this.setupSimulationSliders();
            AppDebug.log('Enhanced objects initialized successfully');
        } catch (error) {
            AppDebug.error('Failed to initialize enhanced objects:', error);
            // Fallback to basic UI
            this.setupFallbackUI();
        }
    }

    /**
     * Setup fallback UI when enhanced objects fail
     */
    setupFallbackUI() {
        AppDebug.log('Setting up fallback UI');
        
        // Make sure the original buttons are visible
        const resetBtn = document.getElementById('reset-simulation');
        const nextBtn = document.getElementById('next-scenario');
        
        if (resetBtn) {
            resetBtn.style.display = 'inline-block';
            resetBtn.addEventListener('click', () => this.resetSimulation());
        }
        
        if (nextBtn) {
            nextBtn.style.display = 'inline-block';
            nextBtn.addEventListener('click', () => this.nextScenario());
        }
        
        // Add basic ethics meters text
        const metersContainer = document.querySelector('.ethics-meters .meters-container');
        if (metersContainer) {
            metersContainer.innerHTML = `
                <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
                    <div class="basic-meter">
                        <strong>Fairness:</strong> <span id="fairness-value">50%</span>
                    </div>
                    <div class="basic-meter">
                        <strong>Transparency:</strong> <span id="transparency-value">50%</span>
                    </div>
                    <div class="basic-meter">
                        <strong>Accountability:</strong> <span id="accountability-value">50%</span>
                    </div>
                    <div class="basic-meter">
                        <strong>Privacy:</strong> <span id="privacy-value">50%</span>
                    </div>
                </div>
            `;
        }
    }    /**
     * Setup ethics meters using enhanced objects
     */
    async setupEthicsMeters() {
        try {
            const ethicsContainer = document.querySelector('.ethics-meters');
            if (!ethicsContainer) {
                AppDebug.warn('Ethics meters container not found');
                return;
            }

            // Skip if this is inside the hero demo
            const isInHeroDemo = ethicsContainer.closest('#hero-demo') !== null;
            if (isInHeroDemo) {
                AppDebug.log('Skipping enhanced ethics meters for hero demo - using CSS-based meters');
                return;
            }

            // Clear existing content in meters container
            const metersContainer = ethicsContainer.querySelector('.meters-container');
            if (metersContainer) {
                metersContainer.innerHTML = '';
            }// Create ethics meter container
            const meterContainer = document.createElement('div');
            meterContainer.className = 'enhanced-ethics-meters';
            meterContainer.style.cssText = `
                display: flex;
                gap: 20px;
                padding: 20px;
                flex-wrap: wrap;
                justify-content: center;
            `;

            // Append meter container to meters container first
            if (metersContainer) {
                metersContainer.appendChild(meterContainer);
            }

            // Create managed canvas for ethics meters
            const { canvas, id } = await canvasManager.createCanvas({
                width: 800,
                height: 200,
                container: meterContainer,
                className: 'ethics-meters-canvas',
                id: `ethics-meters-${Date.now()}` // Make ID unique for each creation
            });

            // Store canvas ID for cleanup
            this.ethicsMetersCanvasId = id;

            // Apply styling to canvas
            canvas.style.cssText = `
                max-width: 100%;
                height: auto;
                border-radius: 8px;
                background: #f8f9fa;
            `;

            // Initialize visual engine with managed canvas
            if (!this.visualEngine) {
                this.visualEngine = await canvasManager.createVisualEngine(id, this.visualEngineConfig);
            } else {
                // If visual engine already exists, just reinitialize with new canvas
                this.visualEngine.container = canvas;
                this.visualEngine.init();
            }
            
            // Ensure the visual engine and scene are properly initialized
            if (!this.visualEngine || !this.visualEngine.scene) {
                throw new Error('Visual engine or scene not properly initialized');
            }

            // Create ethics meters
            const meterConfigs = [
                {
                    id: 'fairness-meter',
                    label: 'Fairness',
                    description: 'How fair and unbiased are the AI decisions?',
                    color: '#28a745',
                    position: { x: 100, y: 100 }
                },
                {
                    id: 'transparency-meter',
                    label: 'Transparency',
                    description: 'How clear and explainable are the AI processes?',
                    color: '#007bff',
                    position: { x: 300, y: 100 }
                },
                {
                    id: 'accountability-meter',
                    label: 'Accountability',
                    description: 'How responsible and accountable is the AI system?',
                    color: '#ffc107',
                    position: { x: 500, y: 100 }
                },
                {
                    id: 'privacy-meter',
                    label: 'Privacy',
                    description: 'How well does the AI protect user privacy?',
                    color: '#6f42c1',
                    position: { x: 700, y: 100 }
                }
            ];

            meterConfigs.forEach(config => {
                const meter = new EthicsMeter({
                    id: config.id,
                    x: config.position.x,
                    y: config.position.y,
                    width: 120,
                    height: 80,
                    label: config.label,
                    value: 0.5, // Starting value
                    color: config.color,
                    ariaLabel: `${config.label}: ${config.description}`,
                    showLabel: true,
                    showValue: true,
                    animated: true
                });                this.ethicsMeters.set(config.id, meter);
                this.visualEngine.scene.add(meter);
            });

            if (metersContainer) {
                metersContainer.appendChild(meterContainer);
            } else {
                ethicsContainer.appendChild(meterContainer);
            }

            AppDebug.log('Ethics meters initialized with enhanced objects');
        } catch (error) {
            AppDebug.error('Failed to setup ethics meters:', error);
            throw error; // Re-throw to trigger fallback
        }
    }    /**
     * Setup interactive buttons using enhanced objects
     */
    async setupInteractiveButtons() {
        try {
            const actionsContainer = document.querySelector('.simulation-actions .actions-container');
            if (!actionsContainer) {
                AppDebug.warn('Actions container not found, trying fallback');
                const fallbackContainer = document.querySelector('.simulation-actions');
                if (!fallbackContainer) {
                    AppDebug.error('No actions container found at all');
                    return;
                }
                // Create actions-container if it doesn't exist
                const newActionsContainer = document.createElement('div');
                newActionsContainer.className = 'actions-container';
                fallbackContainer.appendChild(newActionsContainer);
                await this.setupInteractiveButtons(); // Retry
                return;
            }

        // Clear existing buttons but keep structure
        const existingButtons = actionsContainer.querySelectorAll('.btn');
        existingButtons.forEach(btn => {
            if (!btn.classList.contains('enhanced-button')) {
                btn.style.display = 'none';
            }
        });        // Create managed canvas for buttons
        let buttonCanvas, buttonCanvasId;
        try {
            const canvasResult = await canvasManager.createCanvas({
                width: 600,
                height: 100,
                container: actionsContainer,
                className: 'interactive-buttons-canvas',
                id: `interactive-buttons-${Date.now()}`
            });
            
            if (!canvasResult || !canvasResult.canvas) {
                throw new Error('canvasManager.createCanvas returned invalid result');
            }
            
            buttonCanvas = canvasResult.canvas;
            buttonCanvasId = canvasResult.id;
            
        } catch (canvasError) {
            AppDebug.warn('Failed to create canvas for interactive buttons:', canvasError);
            // Create a simple fallback div instead
            buttonCanvas = document.createElement('div');
            buttonCanvas.className = 'interactive-buttons-fallback';
            buttonCanvas.innerHTML = `
                <button class="btn btn-secondary enhanced-button" id="reset-simulation-fallback">Reset</button>
                <button class="btn btn-primary enhanced-button" id="next-scenario-fallback">Next</button>
            `;
            actionsContainer.appendChild(buttonCanvas);
            AppDebug.log('Using fallback buttons instead of canvas');
            return; // Exit early with fallback
        }

        // Store canvas ID for cleanup
        this.interactiveButtonsCanvasId = buttonCanvasId;

        if (buttonCanvas && buttonCanvas.style) {
            buttonCanvas.style.cssText = `
                max-width: 100%;
                height: auto;
                margin: 10px 0;
            `;
        }

        // Initialize button visual engine using canvas manager
        let buttonEngine;
        try {
            buttonEngine = await canvasManager.createVisualEngine(buttonCanvasId, {
                renderMode: 'canvas',
                accessibility: true,
                debug: false
            });
            
            if (!buttonEngine) {
                throw new Error('canvasManager.createVisualEngine returned null');
            }
        } catch (engineError) {
            AppDebug.warn('Failed to create visual engine for buttons:', engineError);
            // Use a simple fallback without visual engine
            AppDebug.log('Interactive buttons will use standard DOM elements');
            return;
        }// Create interactive buttons
        const resetButton = new InteractiveButton({
            id: 'reset-button',
            x: 100,
            y: 50,
            width: 120,
            height: 40,
            text: 'Reset',
            variant: 'secondary',
            ariaLabel: 'Reset simulation to initial state'
        });

        const nextButton = new InteractiveButton({
            id: 'next-button',
            x: 350,
            y: 50,
            width: 150,
            height: 40,
            text: 'Next Scenario',
            variant: 'primary',
            ariaLabel: 'Proceed to next scenario'
        });

        // Set up click event handlers
        resetButton.on('click', () => this.resetSimulation());
        nextButton.on('click', () => this.nextScenario());        this.interactiveButtons.set('reset', resetButton);
        this.interactiveButtons.set('next', nextButton);

        buttonEngine.scene.add(resetButton);
        buttonEngine.scene.add(nextButton);// Store button engine reference
        this.buttonEngine = buttonEngine;

        AppDebug.log('Interactive buttons initialized with enhanced objects');
        } catch (error) {
            AppDebug.error('Failed to setup interactive buttons:', error);
            throw error; // Re-throw to trigger fallback
        }
    }

    /**
     * Setup simulation sliders for parameter control
     */
    async setupSimulationSliders() {
        // Find or create slider container
        let sliderContainer = document.querySelector('.simulation-sliders');
        if (!sliderContainer) {
            sliderContainer = document.createElement('div');
            sliderContainer.className = 'simulation-sliders';
            sliderContainer.style.cssText = `
                margin: 20px 0;
                padding: 15px;
                border: 1px solid #ddd;
                border-radius: 8px;
                background: #f8f9fa;
            `;
            
            // Add to simulation controls
            const controls = document.querySelector('.simulation-controls');
            if (controls) {
                controls.appendChild(sliderContainer);
            }
        }        // Create managed canvas for sliders
        const { canvas: sliderCanvas, id: sliderCanvasId } = await canvasManager.createCanvas({
            width: 700,
            height: 200,
            container: sliderContainer,
            className: 'simulation-sliders-canvas',
            id: `simulation-sliders-${Date.now()}`
        });

        // Store canvas ID for cleanup
        this.simulationSlidersCanvasId = sliderCanvasId;

        sliderCanvas.style.cssText = `
            max-width: 100%;
            height: auto;
        `;

        // Initialize slider visual engine using canvas manager
        const sliderEngine = await canvasManager.createVisualEngine(sliderCanvasId, {
            renderMode: 'canvas',
            accessibility: true,
            debug: false
        });

        // Create simulation parameter sliders
        const sliderConfigs = [
            {
                id: 'ai-autonomy',
                label: 'AI Autonomy Level',
                description: 'How much autonomy should the AI have?',
                position: { x: 50, y: 50 },
                min: 0,
                max: 100,
                value: 50
            },
            {
                id: 'human-oversight',
                label: 'Human Oversight',
                description: 'Level of human oversight in decisions',
                position: { x: 50, y: 120 },
                min: 0,
                max: 100,
                value: 70
            }
        ];        sliderConfigs.forEach(config => {
            const slider = new InteractiveSlider({
                id: config.id,
                x: config.position.x,
                y: config.position.y,
                width: 300,
                height: 40,
                min: config.min,
                max: config.max,
                value: config.value,
                label: config.label,
                ariaLabel: `${config.label}: ${config.description}`,
                showLabel: true,
                showValue: true
            });

            // Set up value change event handler
            slider.on('valueChange', (event) => this.onSliderChange(config.id, event.value));            this.simulationSliders.set(config.id, slider);
            sliderEngine.scene.add(slider);
        });

        // Store slider engine reference
        this.sliderEngine = sliderEngine;

        AppDebug.log('Simulation sliders initialized with enhanced objects');
    }

    /**
     * Handle slider value changes
     */
    onSliderChange(sliderId, value) {
        AppDebug.log(`Slider ${sliderId} changed to: ${value}`);
        
        // Update simulation parameters based on slider changes
        if (this.currentSimulation) {
            switch (sliderId) {
                case 'ai-autonomy':
                    this.currentSimulation.setParameter('autonomy', value / 100);
                    break;
                case 'human-oversight':
                    this.currentSimulation.setParameter('oversight', value / 100);
                    break;
            }
        }

        // Update ethics meters based on parameter changes
        this.updateEthicsMeters();
    }

    /**
     * Update ethics meters based on current simulation state
     */
    updateEthicsMeters() {
        if (!this.currentSimulation || !this.ethicsMeters.size) return;

        // Get current ethics scores from simulation
        const scores = this.currentSimulation.getEthicsScores?.() || {};

        this.ethicsMeters.forEach((meter, id) => {
            const scoreKey = id.replace('-meter', '');
            const score = scores[scoreKey] || APP_CONSTANTS.DEFAULTS.SCORE_VALUE;
            meter.setValue(score, true); // Animate the change
        });
    }

    /**
     * Reset simulation and enhanced objects
     */
    resetSimulation() {
        if (this.currentSimulation) {
            this.currentSimulation.reset();
        }

        // Reset all sliders to default values
        this.simulationSliders.forEach(slider => {
            slider.setValue(slider.defaultValue || APP_CONSTANTS.DEFAULTS.SLIDER_VALUE, true);
        });

        // Reset ethics meters
        this.ethicsMeters.forEach(meter => {
            meter.setValue(APP_CONSTANTS.DEFAULTS.METER_VALUE, true);
        });

        AppDebug.log('Simulation reset with enhanced objects');
    }

    /**
     * Proceed to next scenario
     */
    nextScenario() {
        if (this.currentSimulation && this.currentSimulation.nextScenario) {
            this.currentSimulation.nextScenario();
            this.updateEthicsMeters();
        }

        AppDebug.log('Advanced to next scenario');
    }

    /**
     * Refresh enhanced objects when simulation changes
     */    async refreshEnhancedObjects() {
        // Clean up existing UI canvases before recreating
        const uiCanvasesToCleanup = [
            this.ethicsMetersCanvasId,
            this.interactiveButtonsCanvasId,
            this.simulationSlidersCanvasId
        ];

        uiCanvasesToCleanup.forEach(canvasId => {
            if (canvasId) {
                canvasManager.removeCanvas(canvasId);
            }
        });

        // Reset UI canvas IDs
        this.ethicsMetersCanvasId = null;
        this.interactiveButtonsCanvasId = null;
        this.simulationSlidersCanvasId = null;

        // Re-setup ethics meters for new simulation
        await this.setupEthicsMeters();
        
        // Buttons remain the same but may need state updates
        this.updateButtonStates();
        
        // Sliders may need value updates
        this.updateSliderStates();
        
        AppDebug.log('Enhanced objects refreshed for new simulation');
    }    /**
     * Update enhanced button states based on simulation
     */
    updateEnhancedButtonStates() {
        const resetButton = this.interactiveButtons.get('reset');
        const nextButton = this.interactiveButtons.get('next');
        
        if (resetButton) {
            resetButton.isDisabled = false;
        }
        
        if (nextButton && this.currentSimulation) {
            // Enable next button if there are more scenarios
            const hasNext = this.currentSimulation.hasNextScenario?.() || true;
            nextButton.isDisabled = !hasNext;
        }
    }

    /**
     * Update slider states based on simulation
     */
    updateSliderStates() {
        if (!this.currentSimulation) return;
        
        // Get current simulation parameters
        const params = this.currentSimulation.getParameters?.() || {};
        
        this.simulationSliders.forEach((slider, id) => {
            const paramKey = id.replace('-', '');
            if (params[paramKey] !== undefined) {
                slider.setValue(params[paramKey] * 100, false); // Don't animate on init
            }
        });
    }    /**
     * Initialize hero demo with interactive scenario
     */
    async initializeHeroDemo() {
        try {
            AppDebug.log('initializeHeroDemo starting...');
            
            // Wait a bit to ensure DOM is ready
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const heroContainer = document.getElementById('hero-demo');
            AppDebug.log('Hero container found:', !!heroContainer);
            
            if (heroContainer) {
                AppDebug.log('Setting up hero demo...');
                this.setupHeroDemo();
                AppDebug.log('Hero demo setup complete');
            } else {
                AppDebug.error('Hero demo container not found in DOM');
            }
        } catch (error) {
            AppDebug.error('Failed to initialize hero demo:', error);
        }
    }    /**
     * Setup hero demo with interactive ethics scenario
     */
    setupHeroDemo() {
        const heroContainer = document.getElementById('hero-demo');
        if (!heroContainer) {
            AppDebug.error('Hero container not found!');
            return;
        }

        AppDebug.log('Setting up hero demo content...');
        heroContainer.innerHTML = `
            <div class="hero-demo-container">
                <div class="demo-header">
                    <h3 class="demo-title">Try It: AI Ethics in Action</h3>
                    <p class="demo-subtitle">Make decisions and see their ethical impact in real-time</p>
                </div>
                
                <div class="demo-content">
                    <div class="scenario-panel">
                        <div class="scenario-header">
                            <h4 class="scenario-title">AI Hiring Assistant</h4>
                        </div>
                        
                        <div class="scenario-question">
                            Your AI system is screening job applications. What data should it use to rank candidates?
                        </div>
                        
                        <div class="scenario-choices">
                            <button class="choice-btn" data-choice="0">
                                <span class="choice-text">Skills, experience, and education only</span>
                                <span class="choice-impact">+Fair, +Transparent</span>
                            </button>
                            <button class="choice-btn" data-choice="1">
                                <span class="choice-text">Include age and photo for 'cultural fit'</span>
                                <span class="choice-impact">-Fair, -Transparent</span>
                            </button>
                            <button class="choice-btn" data-choice="2">
                                <span class="choice-text">Add anonymous demographic data for diversity tracking</span>
                                <span class="choice-impact">+Fair, ++Transparent</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="ethics-panel">
                        <h4 class="ethics-title">Ethics Impact</h4>
                        <div class="ethics-meters">
                            <div class="ethics-meter">
                                <div class="meter-header">
                                    <span class="meter-label">Fairness</span>
                                    <span class="meter-value">75%</span>
                                </div>
                                <div class="meter-bar">
                                    <div class="meter-fill fairness-fill" style="width: 75%;"></div>
                                </div>
                            </div>
                            <div class="ethics-meter">
                                <div class="meter-header">
                                    <span class="meter-label">Transparency</span>
                                    <span class="meter-value">60%</span>
                                </div>
                                <div class="meter-bar">
                                    <div class="meter-fill transparency-fill" style="width: 60%;"></div>
                                </div>
                            </div>
                            <div class="ethics-meter">
                                <div class="meter-header">
                                    <span class="meter-label">Accountability</span>
                                    <span class="meter-value">80%</span>
                                </div>
                                <div class="meter-bar">
                                    <div class="meter-fill accountability-fill" style="width: 80%;"></div>
                                </div>
                            </div>                        </div>
                        
                        <button class="btn btn-primary demo-cta" data-simulation="bias-fairness">
                            Try Full Simulation →
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        AppDebug.log('Hero demo content added, setting up interactivity...');
        
        // Add event listeners for interactive choices
        this.setupHeroDemoInteractivity();
        
        // Animate the initial meters
        this.animateHeroDemo();
        
        AppDebug.log('Hero demo setup complete!');
    }    /**
     * Setup interactivity for hero demo
     */
    setupHeroDemoInteractivity() {
        const heroContainer = document.getElementById('hero-demo');
        if (!heroContainer) return;

        const choiceButtons = heroContainer.querySelectorAll('.choice-btn');

        choiceButtons.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                // Remove active state from all buttons
                choiceButtons.forEach(b => b.classList.remove('active'));
                // Add active state to clicked button
                btn.classList.add('active');

                // Show feedback based on choice
                const feedbacks = [
                    {
                        text: "Great choice! Using only relevant qualifications reduces bias and promotes fairness.",
                        meters: { fairness: 90, transparency: 85, accountability: 90 }
                    },
                    {
                        text: "This could introduce age and appearance bias into hiring decisions, reducing fairness.",
                        meters: { fairness: 30, transparency: 40, accountability: 35 }
                    },
                    {
                        text: "Good balance - helps track diversity without introducing direct bias.",
                        meters: { fairness: 85, transparency: 95, accountability: 85 }
                    }
                ];

                const feedback = feedbacks[index];
                
                // Show feedback in popup
                this.showHeroDemoFeedback(feedback);

                // Animate meter updates
                this.updateHeroDemoMeters(feedback.meters);
            });
        });        // Add event listener for CTA button
        const ctaButton = heroContainer.querySelector('.demo-cta');
        if (ctaButton) {
            ctaButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.startSimulation('bias-fairness');
            });
        }
    }    /**
     * Show hero demo feedback in a popover
     */
    showHeroDemoFeedback(feedback) {
        // Remove any existing popover
        const existingPopover = document.querySelector('.hero-demo-feedback-popover');
        if (existingPopover) {
            existingPopover.remove();
        }        // Create feedback popover
        const popover = document.createElement('div');
        popover.className = 'hero-demo-feedback-popover';
        popover.setAttribute('role', 'tooltip');
        popover.setAttribute('aria-live', 'polite');
        popover.setAttribute('aria-label', 'Choice feedback');
        
        // Check if mobile
        const isMobile = window.innerWidth <= APP_CONSTANTS.VIEWPORT.MOBILE_BREAKPOINT;
        
        if (isMobile) {
            // Mobile: fixed position at bottom
            popover.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                padding: 15px;
                border-radius: 12px;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
                border: 1px solid rgba(59, 130, 246, 0.2);
                z-index: 2000;
                max-width: calc(100vw - 40px);
                width: 90%;
                text-align: center;
                animation: popoverFadeInMobile 0.3s ease-out;
                font-size: 0.85rem;
            `;        } else {
            // Desktop: positioned above choice buttons
            popover.style.cssText = `
                position: absolute;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%);
                margin-bottom: 10px;
                background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                padding: 15px;
                border-radius: 12px;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                border: 1px solid rgba(59, 130, 246, 0.2);
                z-index: 1000;
                max-width: 300px;
                width: 90%;
                text-align: center;
                animation: popoverFadeIn 0.3s ease-out;
                font-size: 0.85rem;
            `;
        }        // Create arrow pointing down (only for desktop)
        let arrow = null;
        if (!isMobile) {
            arrow = document.createElement('div');
            arrow.style.cssText = `
                position: absolute;
                bottom: -8px;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 8px solid transparent;
                border-right: 8px solid transparent;
                border-top: 8px solid white;
                filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.1));
            `;
        }

        // Add CSS animations if not already present
        if (!document.getElementById('hero-popover-animations')) {
            const style = document.createElement('style');
            style.id = 'hero-popover-animations';            style.textContent = `                @keyframes popoverFadeIn {
                    from { 
                        opacity: 0; 
                        transform: translateX(-50%) translateY(10px);
                    }
                    to { 
                        opacity: 1; 
                        transform: translateX(-50%) translateY(0);
                    }
                }
                @keyframes popoverFadeInMobile {
                    from { 
                        opacity: 0; 
                        transform: translateX(-50%) translateY(20px);
                    }
                    to { 
                        opacity: 1; 
                        transform: translateX(-50%) translateY(0);
                    }
                }                @keyframes popoverFadeOut {
                    from { 
                        opacity: 1; 
                        transform: translateX(-50%) translateY(0);
                    }
                    to { 
                        opacity: 0; 
                        transform: translateX(-50%) translateY(10px);
                    }
                }
                @keyframes popoverFadeOutMobile {
                    from { 
                        opacity: 1; 
                        transform: translateX(-50%) translateY(0);
                    }
                    to { 
                        opacity: 0; 
                        transform: translateX(-50%) translateY(20px);
                    }
                }
                @keyframes bounceIn {
                    0% { transform: scale(0.3); opacity: 0; }
                    50% { transform: scale(1.05); }
                    70% { transform: scale(0.9); }
                    100% { transform: scale(1); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }        popover.innerHTML = `
            <div class="feedback-icon" style="font-size: 1.5rem; margin-bottom: 0.5rem; animation: bounceIn 0.6s ease-out 0.2s both;">
                ${feedback.meters.fairness > APP_CONSTANTS.FEEDBACK.EXCELLENT_THRESHOLD ? '✅' : feedback.meters.fairness < APP_CONSTANTS.FEEDBACK.GOOD_THRESHOLD ? '⚠️' : '💡'}
            </div>
            <div style="font-weight: 600; margin-bottom: 0.5rem; color: #333; font-size: 0.9rem;">
                ${feedback.meters.fairness > APP_CONSTANTS.FEEDBACK.EXCELLENT_THRESHOLD ? 'Great Choice!' : feedback.meters.fairness < APP_CONSTANTS.FEEDBACK.GOOD_THRESHOLD ? 'Consider This' : 'Good Balance'}
            </div>
            <p style="margin: 0; line-height: 1.4; color: #666;">${feedback.text}</p>
        `;// Add arrow to popover (only for desktop)
        if (arrow) {
            popover.appendChild(arrow);
        }        // Position popover appropriately
        if (isMobile) {
            // For mobile, add to body for fixed positioning
            document.body.appendChild(popover);
        } else {
            // For desktop, position relative to choice buttons
            const heroContainer = document.getElementById('hero-demo');
            const scenarioChoices = heroContainer?.querySelector('.scenario-choices');
            
            if (scenarioChoices) {
                scenarioChoices.style.position = 'relative';
                scenarioChoices.appendChild(popover);
            } else {
                heroContainer.style.position = 'relative';
                heroContainer.appendChild(popover);
            }
        }// Auto-hide the popover after 4 seconds
        setTimeout(() => {
            if (popover.parentNode) {
                const fadeOutAnimation = isMobile ? 'popoverFadeOutMobile' : 'popoverFadeOut';
                popover.style.animation = `${fadeOutAnimation} 0.3s ease-out`;
                setTimeout(() => {
                    if (popover.parentNode) {
                        popover.remove();
                    }
                }, APP_CONSTANTS.TIMING.ANIMATION_DELAY);
            }
        }, APP_CONSTANTS.TIMING.NOTIFICATION_DURATION);

        // Hide popover on click anywhere
        const hideOnClick = (e) => {
            if (!popover.contains(e.target)) {
                if (popover.parentNode) {
                    const fadeOutAnimation = isMobile ? 'popoverFadeOutMobile' : 'popoverFadeOut';
                    popover.style.animation = `${fadeOutAnimation} 0.3s ease-out`;
                    setTimeout(() => {
                        if (popover.parentNode) {
                            popover.remove();
                        }
                    }, APP_CONSTANTS.TIMING.ANIMATION_DELAY);
                }
                document.removeEventListener('click', hideOnClick);
            }
        };
        
        // Add click listener after a brief delay to avoid immediate triggering
        setTimeout(() => {
            document.addEventListener('click', hideOnClick);
        }, 100);
    }

    /**
     * Update hero demo meters with animation
     */
    updateHeroDemoMeters(values) {
        const heroContainer = document.getElementById('hero-demo');
        if (!heroContainer) return;

        Object.entries(values).forEach(([metric, value]) => {
            const fill = heroContainer.querySelector(`.${metric}-fill`);
            const valueSpan = fill ? fill.closest('.ethics-meter').querySelector('.meter-value') : null;
            
            if (fill && valueSpan) {
                fill.style.transition = 'width 0.8s ease-out';
                fill.style.width = `${value}%`;
                
                // Animate the text value
                const startValue = parseInt(valueSpan.textContent);
                const endValue = value;
                const duration = 800;
                const startTime = performance.now();
                
                const animate = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const currentValue = Math.round(startValue + (endValue - startValue) * progress);
                    valueSpan.textContent = `${currentValue}%`;
                      if (progress < 1) {
                        requestAnimationFrame(animate);
                    }
                };
                
                requestAnimationFrame(animate);
            }
        });
    }

    /**
     * Animate hero demo meters for visual appeal
     */
    animateHeroDemo() {
        const heroContainer = document.getElementById('hero-demo');
        if (!heroContainer) return;

        const meters = heroContainer.querySelectorAll('.meter-fill');
        meters.forEach((meter, index) => {
            setTimeout(() => {
                meter.style.transition = 'width 1s ease-out';
                const currentWidth = meter.style.width || '0%';
                meter.style.width = '0%';
                setTimeout(() => {
                    meter.style.width = currentWidth;
                }, APP_CONSTANTS.TIMING.QUICK_DELAY);            }, index * APP_CONSTANTS.TIMING.STAGGER_DELAY);
        });
    }

    /**
     * Initialize enhanced objects for hero demo (simplified version)
     */
    async initializeHeroDemoObjects() {
        // This method is now simplified - the demo uses CSS-based visualization
        // instead of complex canvas rendering for better performance
        AppDebug.log('Hero demo objects initialized (CSS-based)');
    }

    /**
     * Show error message in loading element
     */
    showErrorInLoading(message) {
        AppDebug.error('App Error:', message);
        
        // Try to show error in UI if possible
        const loading = document.getElementById('loading');
        if (loading) {
            loading.innerHTML = `
                <div class="error-message" style="color: red; text-align: center; padding: 20px;">
                    <h3>Error</h3>
                    <p>${message}</p>
                    <button onclick="window.location.reload()" style="margin-top: 10px; padding: 8px 16px;">
                        Reload Page
                    </button>
                </div>
            `;
            loading.style.display = 'block';
            loading.setAttribute('aria-hidden', 'false');
        } else {
            // Fallback to alert if no loading element
            alert(message);
        }
    }

    /**
     * Show loading indicator
     */
    showLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'block';
            loading.setAttribute('aria-hidden', 'false');
        }
    }

    /**
     * Hide loading indicator
     */
    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
            loading.setAttribute('aria-hidden', 'true');
        }
    }

    /**
     * Alias for startSimulation for compatibility with hero demo
     */
    openSimulation(simulationId) {
        return this.startSimulation(simulationId);
    }

    /**
     * Navigation and utility methods
     */

    /**
     * Scroll to simulations section
     */
    scrollToSimulations() {
        const simulationsSection = document.querySelector('#simulations, .simulations-section');
        if (simulationsSection) {
            simulationsSection.scrollIntoView({ 
                behavior: this.preferences.reducedMotion ? 'auto' : 'smooth',
                block: 'start'
            });
            
            // Announce navigation for accessibility
           
            if (this.accessibilityManager) {
                this.accessibilityManager.announce('Navigated to simulations section');
            }
            
            // Track navigation
            simpleAnalytics.trackInteraction('scroll_to_simulations', 'hero_button');
        }
    }

    /**
     * Open educator tools interface
     */
    openEducatorTools() {
        // For now, show information about educator features
        // In a full implementation, this would open a dedicated educator interface
        const educatorContent = `
            <h3>Educator Tools</h3>
            <p>Educator tools include:</p>
            <ul>
                <li>Student progress tracking</li>
                <li>Curriculum integration guides</li>
                <li>Assessment rubrics</li>
                <li>Discussion prompts</li>
                <li>Real-world case studies</li>
            </ul>
            <p>Contact us at educator@aiethics.example.com for full access.</p>
        `;
        
        // Show in a simple modal for now
        this.showInfoModal('Educator Tools', educatorContent);
        
        // Track educator interest
        simpleAnalytics.trackInteraction('educator_tools_clicked', 'hero_button');
    }

    /**
     * Toggle high contrast mode
     */
    toggleHighContrast() {
        this.preferences.highContrast = !this.preferences.highContrast;
        
        // Apply theme changes
        this.applyTheme();
        
        // Save preference
        const currentSettings = userPreferences.getAccessibilitySettings();
        currentSettings.highContrast = this.preferences.highContrast;
        userPreferences.setAccessibilitySettings(currentSettings);
        
        // Announce change
        const status = this.preferences.highContrast ? 'enabled' : 'disabled';
        if (this.accessibilityManager) {
            this.accessibilityManager.announce(`High contrast mode ${status}`);
        }
        
        // Track usage
        simpleAnalytics.trackInteraction('toggle_high_contrast', status);
        
        AppDebug.log(`High contrast mode ${status}`);
    }

    /**
     * Toggle large text mode
     */
    toggleLargeText() {
        this.preferences.largeText = !this.preferences.largeText;
        
        // Apply theme changes
        this.applyTheme();
        
        // Save preference
        const currentSettings = userPreferences.getAccessibilitySettings();
        currentSettings.largeText = this.preferences.largeText;
        userPreferences.setAccessibilitySettings(currentSettings);
        
        // Announce change
        const status = this.preferences.largeText ? 'enabled' : 'disabled';
        if (this.accessibilityManager) {
            this.accessibilityManager.announce(`Large text mode ${status}`);
        }
        
        // Track usage
        simpleAnalytics.trackInteraction('toggle_large_text', status);
        
        AppDebug.log(`Large text mode ${status}`);
    }

    /**
     * Toggle reduced motion mode
     */
    toggleReducedMotion() {
        this.preferences.reducedMotion = !this.preferences.reducedMotion;
        
        // Apply theme changes
        this.applyTheme();
        
        // Save preference
        const currentSettings = userPreferences.getAccessibilitySettings();
        currentSettings.reducedMotion = this.preferences.reducedMotion;
        userPreferences.setAccessibilitySettings(currentSettings);
        
        // Announce change
        const status = this.preferences.reducedMotion ? 'enabled' : 'disabled';
        if (this.accessibilityManager) {
            this.accessibilityManager.announce(`Reduced motion mode ${status}`);
        }
        
        // Track usage
        simpleAnalytics.trackInteraction('toggle_reduced_motion', status);
        
        AppDebug.log(`Reduced motion mode ${status}`);
    }

    /**
     * Show informational modal
     */
    showInfoModal(title, content) {
        // Create modal if it doesn't exist
        let infoModal = document.getElementById('info-modal');
        if (!infoModal) {
            infoModal = document.createElement('div');
            infoModal.id = 'info-modal';
            infoModal.className = 'modal-backdrop';
            infoModal.setAttribute('role', 'dialog');
            infoModal.setAttribute('aria-modal', 'true');
            infoModal.setAttribute('aria-hidden', 'true');
            infoModal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-header">
                        <h2 id="info-modal-title"></h2>
                        <button class="modal-close" aria-label="Close modal">&times;</button>
                    </div>
                    <div class="modal-body" id="info-modal-body"></div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" onclick="document.getElementById('info-modal').style.display='none'">Close</button>
                    </div>
                </div>
            `;
            document.body.appendChild(infoModal);
            
            // Setup close functionality
            const closeBtn = infoModal.querySelector('.modal-close');
            closeBtn.addEventListener('click', () => {
                infoModal.style.display = 'none';
                               infoModal.setAttribute('aria-hidden', 'true');
            });
        }
        
        // Set content
        document.getElementById('info-modal-title').textContent = title;
        document.getElementById('info-modal-body').innerHTML = content;
        
        // Show modal
        infoModal.style.display = 'flex';
        infoModal.setAttribute('aria-hidden', 'false');
        
        // Focus management
        const closeButton = infoModal.querySelector('.modal-close');
        if (closeButton) {
            closeButton.focus();
        }
    }

    // ...existing code...
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
