/**
 * Main Application - AI Ethics Simulations Platform
 * Initializes the platform and manages the overall application state
 */

// Import core modules
import { SimulationEngine } from './core/engine.js';
import EthicsSimulation from './core/simulation.js';
import { UIComponent, UIPanel, EthicsDisplay, FeedbackSystem, Button, Slider } from './core/ui.js';
import AccessibilityManager from './core/accessibility.js';

// Import utilities
import StorageManager from './utils/storage.js';
import AnalyticsManager from './utils/analytics.js';
import Helpers from './utils/helpers.js';

// Import renderers
import CanvasRenderer from './renderers/canvas-renderer.js';
import SVGRenderer from './renderers/svg-renderer.js';

class AIEthicsApp {
    constructor() {
        this.currentSimulation = null;
        this.engine = null;
        this.simulations = new Map();
        this.isInitialized = false;
        
        // UI elements
        this.modal = null;
        this.simulationContainer = null;
        this.simulationsGrid = null;
        
        // Available simulations
        this.availableSimulations = [
            {
                id: 'bias-fairness',
                title: 'Bias & Fairness',
                description: 'Explore how algorithmic bias affects decision-making and learn to design fairer AI systems.',
                difficulty: 'beginner',
                duration: 600, // 10 minutes
                thumbnail: 'src/assets/images/bias-fairness-thumb.svg',
                tags: ['bias', 'fairness', 'discrimination', 'algorithms']
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
    }

    async init() {
        if (this.isInitialized) return;

        try {
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
            
            this.isInitialized = true;
            console.log('AI Ethics App initialized successfully');
            
            // Track initialization
            AnalyticsManager.trackEvent('app_initialized', {
                simulations_available: this.availableSimulations.length,
                browser: Helpers.getBrowserInfo().browser,
                device: Helpers.getDeviceType()
            });
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to initialize the application. Please refresh the page.');
        }
    }

    async initializeSystems() {
        // Systems are already initialized via their modules
        // StorageManager and AnalyticsManager auto-initialize
        console.log('Core systems initialized');
    }

    setupUI() {
        // Get key UI elements
        this.modal = document.getElementById('simulation-modal');
        this.simulationContainer = document.getElementById('simulation-container');
        this.simulationsGrid = document.querySelector('.simulations-grid');
        this.loading = document.getElementById('loading');
        
        if (!this.simulationsGrid) {
            console.error('Simulations grid not found');
            return;
        }
    }    async loadSimulations() {
        // Load simulation classes
        const simulationModules = {
            'bias-fairness': () => import('./simulations/bias-fairness.js')
            // TODO: Add more simulations
            // 'consent-transparency': () => import('./simulations/consent-transparency.js'),
            // 'autonomy-oversight': () => import('./simulations/autonomy-oversight.js'),
            // 'misinformation-trust': () => import('./simulations/misinformation-trust.js')
        };

        // For now, we'll create placeholder simulations
        // In a real implementation, these would be separate modules
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
    }

    setupAccessibility() {
        // Apply saved accessibility preferences
        const preferences = StorageManager.getUserPreferences();
        
        if (preferences.accessibility?.highContrast) {
            document.body.classList.add('high-contrast');
        }
        
        if (preferences.accessibility?.largeText) {
            document.body.classList.add('large-text');
        }
    }

    render() {
        this.renderSimulationsGrid();
        this.renderHeroDemo();
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

        const progress = StorageManager.getUserProgress(simulation.id);
        const isCompleted = progress?.completed || false;
        const score = progress?.score || 0;

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
                    <button class="btn btn-primary" onclick="app.startSimulation('${simulation.id}')">
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

    renderHeroDemo() {
        const demoContainer = document.getElementById('hero-demo');
        if (!demoContainer) return;

        // Create a simple animated demo
        demoContainer.innerHTML = `
            <div class="demo-ethics-meter">
                <h4>Ethics in Action</h4>
                <div class="demo-meter">
                    <div class="meter-label">Fairness</div>
                    <div class="meter-bar">
                        <div class="meter-fill" style="width: 75%; background: #4caf50;"></div>
                    </div>
                </div>
                <div class="demo-meter">
                    <div class="meter-label">Transparency</div>
                    <div class="meter-bar">
                        <div class="meter-fill" style="width: 60%; background: #ff9800;"></div>
                    </div>
                </div>
                <div class="demo-meter">
                    <div class="meter-label">Privacy</div>
                    <div class="meter-bar">
                        <div class="meter-fill" style="width: 85%; background: #4caf50;"></div>
                    </div>
                </div>
                <p class="demo-text">Interactive simulations help you understand the impact of your decisions</p>
            </div>
        `;

        // Animate the demo
        const fills = demoContainer.querySelectorAll('.meter-fill');
        fills.forEach((fill, index) => {
            setTimeout(() => {
                fill.style.transition = 'width 1s ease';
                fill.style.width = fill.style.width; // Trigger animation
            }, index * 200);
        });
    }

    // Simulation management
    async startSimulation(simulationId) {
        try {
            this.showLoading();
            
            const simConfig = this.simulations.get(simulationId);
            if (!simConfig) {
                throw new Error(`Simulation ${simulationId} not found`);
            }

            // Track simulation start
            AnalyticsManager.trackSimulationStart(simulationId, simConfig.title);

            // Create simulation engine
            this.engine = new SimulationEngine('simulation-container', {
                width: 800,
                height: 600,
                renderMode: 'canvas',
                accessibility: true,
                debug: false
            });

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
            
        } catch (error) {
            console.error('Failed to start simulation:', error);
            this.hideLoading();
            this.showError('Failed to start the simulation. Please try again.');
        }
    }

    async createSimulationInstance(simulationId, config) {
        // For now, create a basic simulation instance
        // In a real implementation, this would load the specific simulation class
        
        const basicScenarios = [
            {
                id: 'intro',
                title: 'Introduction',
                description: 'Welcome to the AI Ethics simulation',
                objective: 'Learn the basics of ethical decision-making in AI'
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

        const simulation = new EthicsSimulation(simulationId, {
            title: config.title,
            description: config.description,
            difficulty: config.difficulty,
            duration: config.duration,
            scenarios: basicScenarios,
            ethicsMetrics: [
                { name: 'fairness', label: 'Fairness', value: 50 },
                { name: 'transparency', label: 'Transparency', value: 50 },
                { name: 'privacy', label: 'Privacy', value: 50 }
            ]
        });

        return simulation;
    }

    setupSimulationEventListeners() {
        if (!this.currentSimulation) return;

        this.currentSimulation.on('simulation:completed', (data) => {
            this.onSimulationCompleted(data);
        });

        this.currentSimulation.on('ethics:updated', (data) => {
            // Handle ethics updates
            console.log('Ethics updated:', data);
        });

        this.currentSimulation.on('scenario:loaded', (data) => {
            // Update UI for new scenario
            this.updateModalTitle(data.scenario.title);
        });
    }

    showSimulationModal(simConfig) {
        if (!this.modal) return;

        const title = this.modal.querySelector('#modal-title');
        if (title) {
            title.textContent = simConfig.title;
        }

        this.modal.setAttribute('aria-hidden', 'false');
        this.modal.style.display = 'flex';
        
        // Focus management
        const firstFocusable = this.modal.querySelector('button, [tabindex="0"]');
        if (firstFocusable) {
            firstFocusable.focus();
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

        if (this.modal) {
            this.modal.setAttribute('aria-hidden', 'true');
            this.modal.style.display = 'none';
        }

        // Clear simulation container
        if (this.simulationContainer) {
            this.simulationContainer.innerHTML = '';
        }
    }

    resetCurrentSimulation() {
        if (this.currentSimulation) {
            this.currentSimulation.reset();
            AnalyticsManager.trackUserInteraction('reset_simulation', this.currentSimulation.id);
        }
    }

    nextScenario() {
        if (this.currentSimulation) {
            this.currentSimulation.nextScenario();
        }
    }

    onSimulationCompleted(data) {
        // Save completion data
        StorageManager.markSimulationComplete(this.currentSimulation.id, data.report);
        
        // Track completion
        AnalyticsManager.trackSimulationComplete(this.currentSimulation.id, data.report);
        
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
    }

    // UI utility methods
    scrollToSimulations() {
        const simulationsSection = document.getElementById('simulations');
        if (simulationsSection) {
            Helpers.scrollToElement(simulationsSection);
        }
    }

    openEducatorTools() {
        const educatorSection = document.getElementById('educator-tools');
        if (educatorSection) {
            Helpers.scrollToElement(educatorSection);
        }
        
        AnalyticsManager.trackEducatorToolUsage('navigation', 'header_button');
    }

    toggleHighContrast() {
        const isEnabled = document.body.classList.toggle('high-contrast');
        
        // Save preference
        const preferences = StorageManager.getUserPreferences();
        preferences.accessibility.highContrast = isEnabled;
        StorageManager.saveUserPreferences(preferences);
        
        AnalyticsManager.trackAccessibilityUsage('high_contrast', isEnabled);
    }

    toggleLargeText() {
        const isEnabled = document.body.classList.toggle('large-text');
        
        // Save preference
        const preferences = StorageManager.getUserPreferences();
        preferences.accessibility.largeText = isEnabled;
        StorageManager.saveUserPreferences(preferences);
        
        AnalyticsManager.trackAccessibilityUsage('large_text', isEnabled);
    }

    showLoading() {
        if (this.loading) {
            this.loading.setAttribute('aria-hidden', 'false');
            this.loading.style.display = 'flex';
        }
    }

    hideLoading() {
        if (this.loading) {
            this.loading.setAttribute('aria-hidden', 'true');
            this.loading.style.display = 'none';
        }
    }

    showError(message) {
        // Simple error display - in a real app, you'd want a proper error modal
        alert(`Error: ${message}`);
        
        AnalyticsManager.trackError(new Error(message), { context: 'app_error' });
    }
}

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
