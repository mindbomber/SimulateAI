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
 * Enhanced Simulation Modal Component
 * Phase 2: Larger, tabbed interface with resources, progress, and help
 */

import { TIMING, BREAKPOINTS } from '../utils/constants.js';
import focusManager from '../utils/focus-manager.js';

export class EnhancedSimulationModal {
  constructor(simulationId, options = {}) {
    this.simulationId = simulationId;
    this.options = {
      onClose: options.onClose || (() => {}),
      showTabs: options.showTabs !== false,
      showResourcePanel: options.showResourcePanel !== false,
      collapseEthicsMeters: options.collapseEthicsMeters || false,
      size: options.size || 'large', // small, medium, large, fullscreen
      ...options,
    };

    this.currentTab = 'simulation';
    this.isEthicsMetersCollapsed = this.options.collapseEthicsMeters;
    this.modal = null;
    this.resizeObserver = null;
  }

  /**
   * Shows the enhanced simulation modal
   */
  show() {
    this.createModal();
    this.setupEventListeners();
    this.setupResizeObserver();
    document.body.appendChild(this.modal);

    // Force reflow and then show
    this.modal.offsetHeight;
    this.modal.classList.add('visible');

    // Focus management - create focus trap
    this.focusTrap = focusManager.createTrap(this.modal, {
      autoFocus: true,
      restoreFocus: true
    });

    // Track analytics
    this.trackAnalytics('enhanced_modal_opened', {
      simulationId: this.simulationId,
      size: this.options.size,
      tabsEnabled: this.options.showTabs,
    });
  }

  /**
   * Closes the modal
   */
  close() {
    if (this.modal) {
      // Clean up focus trap
      if (this.focusTrap) {
        this.focusTrap.destroy();
        this.focusTrap = null;
      }

      this.modal.classList.remove('visible');
      setTimeout(() => {
        if (this.modal && this.modal.parentNode) {
          this.modal.parentNode.removeChild(this.modal);
        }
        this.cleanup();
      }, TIMING.FAST);
    }

    this.options.onClose();
    this.trackAnalytics('enhanced_modal_closed');
  }

  /**
   * Creates the modal structure
   */
  createModal() {
    this.modal = document.createElement('div');
    this.modal.className = `enhanced-simulation-modal modal-size-${this.options.size}`;
    this.modal.setAttribute('role', 'dialog');
    this.modal.setAttribute('aria-modal', 'true');
    this.modal.setAttribute('aria-labelledby', 'enhanced-modal-title');

    this.modal.innerHTML = `
            <div class="enhanced-modal-backdrop" aria-hidden="true"></div>
            <div class="enhanced-modal-container">
                <div class="enhanced-modal-header">
                    <h2 id="enhanced-modal-title" class="enhanced-modal-title">Simulation</h2>
                    <div class="enhanced-modal-controls">
                        <button class="btn-icon btn-expand" title="Toggle fullscreen" aria-label="Toggle fullscreen">
                            <span class="icon">⛶</span>
                        </button>
                        <button class="btn-icon btn-close" title="Close simulation" aria-label="Close simulation">
                            <span class="icon">×</span>
                        </button>
                    </div>
                </div>
                
                ${this.options.showTabs ? this.generateTabNavigation() : ''}
                
                <div class="enhanced-modal-body">
                    <div class="simulation-main-area">
                        <div class="simulation-content-wrapper">
                            <div id="enhanced-simulation-container" class="enhanced-simulation-container">
                                <!-- Simulation content will be injected here -->
                            </div>
                            
                            ${this.generateEthicsMetersPanel()}
                        </div>
                        
                        ${this.options.showResourcePanel ? this.generateResourcePanel() : ''}
                    </div>
                    
                    ${this.generateTabContent()}
                </div>
                
                <div class="enhanced-modal-footer">
                    <div class="simulation-status">
                        <span class="status-indicator" id="simulation-status">Ready</span>
                    </div>
                    <div class="simulation-actions">
                        <button class="btn btn-secondary" id="reset-enhanced-simulation">Reset</button>
                        <button class="btn btn-secondary" id="pause-enhanced-simulation">Pause</button>
                    </div>
                </div>
            </div>
        `;
  }

  /**
   * Generates tab navigation
   */
  generateTabNavigation() {
    return `
            <div class="enhanced-modal-tabs" role="tablist">
                <button class="enhanced-tab active" role="tab" data-tab="simulation" aria-selected="true" aria-controls="tab-simulation">
                    <span class="tab-icon">🎮</span>
                    <span class="tab-label">Simulation</span>
                </button>
                <button class="enhanced-tab" role="tab" data-tab="resources" aria-selected="false" aria-controls="tab-resources">
                    <span class="tab-icon">📚</span>
                    <span class="tab-label">Resources</span>
                </button>
                <button class="enhanced-tab" role="tab" data-tab="progress" aria-selected="false" aria-controls="tab-progress">
                    <span class="tab-icon">📊</span>
                    <span class="tab-label">Progress</span>
                </button>
                <button class="enhanced-tab" role="tab" data-tab="help" aria-selected="false" aria-controls="tab-help">
                    <span class="tab-icon">❓</span>
                    <span class="tab-label">Help</span>
                </button>
            </div>
        `;
  }

  /**
   * Generates ethics meters panel
   */
  generateEthicsMetersPanel() {
    return `
            <div class="ethics-meters-panel ${this.isEthicsMetersCollapsed ? 'collapsed' : ''}" id="ethics-meters-panel">
                <div class="ethics-meters-header">
                    <h3>Ethics Monitoring</h3>
                    <button class="btn-icon btn-collapse" title="Toggle ethics meters" aria-label="Toggle ethics meters">
                        <span class="icon">${this.isEthicsMetersCollapsed ? '▶' : '▼'}</span>
                    </button>
                </div>
                <div class="ethics-meters-content">
                    <p class="ethics-description">Track how your decisions affect different ethical dimensions</p>
                    <div class="meters-container" role="group" aria-label="Ethics meters">
                        <!-- Enhanced meters will be dynamically created here -->
                    </div>
                </div>
            </div>
        `;
  }

  /**
   * Generates resource panel
   */
  generateResourcePanel() {
    return `
            <div class="resource-panel" id="resource-panel">
                <div class="resource-panel-header">
                    <h3>Quick Resources</h3>
                    <button class="btn-icon btn-collapse" title="Toggle resources" aria-label="Toggle resources">
                        <span class="icon">◀</span>
                    </button>
                </div>
                <div class="resource-panel-content">
                    <div class="resource-section">
                        <h4>Key Concepts</h4>
                        <ul class="resource-list" id="quick-concepts">
                            <!-- Quick concepts will be populated here -->
                        </ul>
                    </div>
                    <div class="resource-section">
                        <h4>Need Help?</h4>
                        <ul class="resource-list" id="quick-help">
                            <li><a href="#" class="resource-link" data-action="show-hints">Show Hints</a></li>
                            <li><a href="#" class="resource-link" data-action="explain-scenario">Explain Scenario</a></li>
                            <li><a href="#" class="resource-link" data-action="ethics-guide">Ethics Guide</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
  }

  /**
   * Generates tab content panels
   */
  generateTabContent() {
    if (!this.options.showTabs) return '';

    return `
            <div class="enhanced-tab-content">
                <div class="tab-panel" id="tab-simulation" role="tabpanel" aria-labelledby="tab-simulation" style="display: none;">
                    <!-- Simulation tab content is handled by main area -->
                </div>
                
                <div class="tab-panel" id="tab-resources" role="tabpanel" aria-labelledby="tab-resources" style="display: none;">
                    <div class="tab-content-header">
                        <h3>Educational Resources</h3>
                        <p>Supporting materials and deeper learning opportunities</p>
                    </div>
                    <div class="resources-grid">
                        <div class="resource-category">
                            <h4>Background Reading</h4>
                            <div class="resource-items" id="background-reading">
                                <!-- Resources will be populated here -->
                            </div>
                        </div>
                        <div class="resource-category">
                            <h4>Related Videos</h4>
                            <div class="resource-items" id="related-videos">
                                <!-- Videos will be populated here -->
                            </div>
                        </div>
                        <div class="resource-category">
                            <h4>Discussion Questions</h4>
                            <div class="resource-items" id="discussion-questions">
                                <!-- Questions will be populated here -->
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="tab-panel" id="tab-progress" role="tabpanel" aria-labelledby="tab-progress" style="display: none;">
                    <div class="tab-content-header">
                        <h3>Your Progress</h3>
                        <p>Track your learning journey and decisions</p>
                    </div>
                    <div class="progress-content">
                        <div class="progress-summary">
                            <div class="progress-stat">
                                <span class="stat-value" id="decisions-made">0</span>
                                <span class="stat-label">Decisions Made</span>
                            </div>
                            <div class="progress-stat">
                                <span class="stat-value" id="time-spent">0:00</span>
                                <span class="stat-label">Time Spent</span>
                            </div>
                            <div class="progress-stat">
                                <span class="stat-value" id="concepts-explored">0</span>
                                <span class="stat-label">Concepts Explored</span>
                            </div>
                        </div>
                        <div class="decision-history">
                            <h4>Decision History</h4>
                            <div class="decisions-timeline" id="decisions-timeline">
                                <!-- Decision history will be populated here -->
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="tab-panel" id="tab-help" role="tabpanel" aria-labelledby="tab-help" style="display: none;">
                    <div class="tab-content-header">
                        <h3>Help & Support</h3>
                        <p>Get assistance and learn how to use the simulation</p>
                    </div>
                    <div class="help-content">
                        <div class="help-section">
                            <h4>How to Use</h4>
                            <div class="help-steps">
                                <ol>
                                    <li>Read the scenario and understand the context</li>
                                    <li>Make decisions by clicking on available options</li>
                                    <li>Observe how ethics meters change with your choices</li>
                                    <li>Reflect on the consequences of your decisions</li>
                                </ol>
                            </div>
                        </div>
                        <div class="help-section">
                            <h4>Understanding Ethics Meters</h4>
                            <div class="ethics-explanation" id="ethics-explanation">
                                <!-- Ethics meter explanations will be populated here -->
                            </div>
                        </div>
                        <div class="help-section">
                            <h4>Need More Help?</h4>
                            <div class="help-actions">
                                <button class="btn btn-secondary" id="show-tutorial">Show Tutorial</button>
                                <button class="btn btn-secondary" id="contact-support">Contact Support</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
  }

  /**
   * Sets up event listeners
   */
  setupEventListeners() {
    // Close button
    const closeBtn = this.modal.querySelector('.btn-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Backdrop click
    const backdrop = this.modal.querySelector('.enhanced-modal-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => this.close());
    }

    // Escape key
    document.addEventListener('keydown', this.handleKeyDown.bind(this));

    // Tab switching
    if (this.options.showTabs) {
      const tabButtons = this.modal.querySelectorAll('.enhanced-tab');
      tabButtons.forEach(button => {
        button.addEventListener('click', e => {
          this.switchTab(e.target.closest('.enhanced-tab').dataset.tab);
        });
      });
    }

    // Collapsible panels
    this.setupCollapsiblePanels();

    // Fullscreen toggle
    const expandBtn = this.modal.querySelector('.btn-expand');
    if (expandBtn) {
      expandBtn.addEventListener('click', () => this.toggleFullscreen());
    }

    // Simulation controls
    this.setupSimulationControls();
  }

  /**
   * Sets up collapsible panels
   */
  setupCollapsiblePanels() {
    const collapseButtons = this.modal.querySelectorAll('.btn-collapse');
    collapseButtons.forEach(button => {
      button.addEventListener('click', e => {
        const panel = e.target.closest('.ethics-meters-panel, .resource-panel');
        if (panel) {
          panel.classList.toggle('collapsed');
          const icon = button.querySelector('.icon');
          if (panel.classList.contains('ethics-meters-panel')) {
            icon.textContent = panel.classList.contains('collapsed')
              ? '▶'
              : '▼';
          } else {
            icon.textContent = panel.classList.contains('collapsed')
              ? '▶'
              : '◀';
          }
        }
      });
    });
  }

  /**
   * Sets up simulation controls
   */
  setupSimulationControls() {
    const resetBtn = this.modal.querySelector('#reset-enhanced-simulation');
    const pauseBtn = this.modal.querySelector('#pause-enhanced-simulation');

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.resetSimulation();
      });
    }

    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        this.togglePause();
      });
    }
  }

  /**
   * Switches to a different tab
   */
  switchTab(tabName) {
    // Update tab buttons
    const tabButtons = this.modal.querySelectorAll('.enhanced-tab');
    tabButtons.forEach(button => {
      const isActive = button.dataset.tab === tabName;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-selected', isActive);
    });

    // Show/hide tab content
    const tabPanels = this.modal.querySelectorAll('.tab-panel');
    tabPanels.forEach(panel => {
      panel.style.display = panel.id === `tab-${tabName}` ? 'block' : 'none';
    });

    // Update main area visibility
    const simulationArea = this.modal.querySelector('.simulation-main-area');
    if (simulationArea) {
      simulationArea.style.display = tabName === 'simulation' ? 'flex' : 'none';
    }

    this.currentTab = tabName;
    this.trackAnalytics('tab_switched', { tab: tabName });
  }

  /**
   * Toggles fullscreen mode
   */
  toggleFullscreen() {
    this.modal.classList.toggle('fullscreen-mode');
    const expandBtn = this.modal.querySelector('.btn-expand .icon');
    if (expandBtn) {
      expandBtn.textContent = this.modal.classList.contains('fullscreen-mode')
        ? '⛶'
        : '⛶';
    }

    this.trackAnalytics('fullscreen_toggled', {
      isFullscreen: this.modal.classList.contains('fullscreen-mode'),
    });
  }

  /**
   * Resets the simulation
   */
  resetSimulation() {
    // This will be called by the parent application
    if (this.options.onReset) {
      this.options.onReset();
    }
    this.trackAnalytics('simulation_reset');
  }

  /**
   * Toggles simulation pause
   */
  togglePause() {
    const pauseBtn = this.modal.querySelector('#pause-enhanced-simulation');
    const isPaused = pauseBtn.textContent === 'Resume';

    pauseBtn.textContent = isPaused ? 'Pause' : 'Resume';

    if (this.options.onPause) {
      this.options.onPause(!isPaused);
    }

    this.trackAnalytics('simulation_pause_toggled', { isPaused: !isPaused });
  }

  /**
   * Updates simulation status
   */
  updateStatus(status) {
    const statusIndicator = this.modal.querySelector('#simulation-status');
    if (statusIndicator) {
      statusIndicator.textContent = status;
    }
  }

  /**
   * Updates progress tracking
   */
  updateProgress(progress) {
    const decisionsElement = this.modal.querySelector('#decisions-made');
    const timeElement = this.modal.querySelector('#time-spent');
    const conceptsElement = this.modal.querySelector('#concepts-explored');

    if (decisionsElement && progress.decisions !== undefined) {
      decisionsElement.textContent = progress.decisions;
    }

    if (timeElement && progress.timeSpent !== undefined) {
      timeElement.textContent = this.formatTime(progress.timeSpent);
    }

    if (conceptsElement && progress.concepts !== undefined) {
      conceptsElement.textContent = progress.concepts;
    }
  }

  /**
   * Adds a decision to the timeline
   */
  addDecisionToTimeline(decision) {
    const timeline = this.modal.querySelector('#decisions-timeline');
    if (timeline) {
      const decisionElement = document.createElement('div');
      decisionElement.className = 'decision-item';
      decisionElement.innerHTML = `
                <div class="decision-time">${new Date().toLocaleTimeString()}</div>
                <div class="decision-description">${decision.description}</div>
                <div class="decision-impact">${decision.impact}</div>
            `;
      timeline.appendChild(decisionElement);

      // Scroll to bottom
      timeline.scrollTop = timeline.scrollHeight;
    }
  }

  /**
   * Gets the simulation container for injecting content
   */
  getSimulationContainer() {
    return this.modal.querySelector('#enhanced-simulation-container');
  }

  /**
   * Gets the ethics meters container
   */
  getEthicsMetersContainer() {
    return this.modal.querySelector('.meters-container');
  }

  /**
   * Sets up resize observer for responsive behavior
   */
  setupResizeObserver() {
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          this.handleResize(entry.contentRect);
        }
      });

      this.resizeObserver.observe(this.modal);
    }
  }

  /**
   * Handles resize events
   */
  handleResize(rect) {
    // Adjust layout based on size
    if (rect.width < BREAKPOINTS.MOBILE) {
      this.modal.classList.add('mobile-layout');
    } else {
      this.modal.classList.remove('mobile-layout');
    }

    // Auto-collapse panels on small screens
    if (rect.width < BREAKPOINTS.TABLET) {
      const resourcePanel = this.modal.querySelector('.resource-panel');
      if (resourcePanel && !resourcePanel.classList.contains('collapsed')) {
        resourcePanel.classList.add('collapsed');
      }
    }
  }

  /**
   * Handles keyboard navigation
   */
  handleKeyDown(event) {
    if (event.key === 'Escape') {
      this.close();
    } else if (event.key === 'Tab') {
      this.handleTabNavigation(event);
    }
  }

  /**
   * Handles tab navigation for accessibility
   */
  handleTabNavigation(event) {
    const focusableElements = this.modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        event.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        event.preventDefault();
      }
    }
  }

  /**
   * Sets up focus trapping (now handled by focus manager)
   * @deprecated Use focusManager.createTrap() instead
   */
  trapFocus() {
    // This method is deprecated and focus is now managed by the centralized focus manager
    // Kept for backward compatibility but focus trap is set up in open() method
  }

  /**
   * Formats time in MM:SS format
   */
  formatTime(seconds) {
    const mins = Math.floor(seconds / TIMING.SECONDS_PER_MINUTE);
    const secs = seconds % TIMING.SECONDS_PER_MINUTE;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Tracks analytics events
   */
  trackAnalytics(eventName, data = {}) {
    if (window.simpleAnalytics) {
      window.simpleAnalytics.trackEvent(eventName, {
        simulationId: this.simulationId,
        modalType: 'enhanced',
        ...data,
      });
    }
  }

  /**
   * Cleanup when modal is closed
   */
  cleanup() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    this.modal = null;
  }
}
