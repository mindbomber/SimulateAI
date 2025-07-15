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
 * Modular Radar Chart Component for Ethical Decision Visualization
 * Uses Chart.js to display real-time ethical impact scores across 8 axes
 */

import logger from '../utils/logger.js';

// Constants
const DEFAULT_CHART_SIZE = 400;
const ANIMATION_DURATION = 750;
const MAX_SCORE = 5;
const MIN_SCORE = 0;
const NEUTRAL_SCORE = 3;
const POSITIVE_THRESHOLD = 4;
const MODAL_LABEL_MAX_LENGTH = 10; // Shorter labels for modal context
const SCALE_PERCENTAGE = 100;
const MOBILE_BREAKPOINT = 768; // Mobile breakpoint for responsive features

// Ethical axes definitions (0-5 scale, 3 = neutral)
export const ETHICAL_AXES = {
  fairness: {
    label: 'Fairness',
    description: 'Treats all individuals and groups equitably',
    color: '#3498db',
  },
  sustainability: {
    label: 'Sustainability',
    description: 'Supports long-term ecological and social well-being',
    color: '#27ae60',
  },
  autonomy: {
    label: 'Autonomy',
    description: 'Respects individual control and self-determination',
    color: '#9b59b6',
  },
  beneficence: {
    label: 'Beneficence',
    description: 'Promotes well-being and prevents harm',
    color: '#e74c3c',
  },
  transparency: {
    label: 'Transparency',
    description: 'Provides openness in decision-making processes',
    color: '#f39c12',
  },
  accountability: {
    label: 'Accountability',
    description: 'Ensures clear responsibility for decisions',
    color: '#34495e',
  },
  privacy: {
    label: 'Privacy',
    description: 'Protects personal information and data rights',
    color: '#e67e22',
  },
  proportionality: {
    label: 'Proportionality',
    description: 'Balances benefits against severity of impact',
    color: '#1abc9c',
  },
};

// Default neutral scores (NEUTRAL_SCORE = neutral impact)
const DEFAULT_SCORES = {
  fairness: NEUTRAL_SCORE,
  sustainability: NEUTRAL_SCORE,
  autonomy: NEUTRAL_SCORE,
  beneficence: NEUTRAL_SCORE,
  transparency: NEUTRAL_SCORE,
  accountability: NEUTRAL_SCORE,
  privacy: NEUTRAL_SCORE,
  proportionality: NEUTRAL_SCORE,
};

export default class RadarChart {
  constructor(containerId, options = {}) {
    console.log('🎯 RadarChart constructor called with:', {
      containerId,
      options,
      chartAvailable: !!window.Chart,
    });

    this.containerId = containerId;
    this.container = document.getElementById(containerId);

    console.log('📦 Container search result:', {
      containerId,
      found: !!this.container,
      element: this.container,
    });

    if (!this.container) {
      const error = `Container with ID '${containerId}' not found`;
      console.error('❌ RadarChart error:', error);
      throw new Error(error);
    }

    console.log(
      '✅ RadarChart container found, proceeding with initialization'
    );

    this.options = {
      width: options.width || DEFAULT_CHART_SIZE,
      height: options.height || DEFAULT_CHART_SIZE,
      showLabels: options.showLabels !== false,
      showLegend: options.showLegend !== false,
      animated: options.animated !== false,
      realTime: options.realTime || false, // For scenario real-time updates
      title: options.title || 'Ethical Impact Analysis',
      isDemo: options.isDemo || false, // For demo charts that need minimal styling
      ...options,
    };

    this.chart = null;
    this.currentScores = { ...DEFAULT_SCORES };

    // Track initialization status
    this.isInitialized = false;
    this.initializationPromise = this.initializeChart();
  }

  /**
   * Initialize the Chart.js radar chart
   */
  async initializeChart() {
    try {
      logger.info('RadarChart', 'Initializing radar chart');

      // Ensure Chart.js is loaded
      if (typeof window.Chart === 'undefined') {
        logger.info('RadarChart', 'Chart.js not found, loading');
        await this.loadChartJS();
        logger.info('RadarChart', 'Chart.js loaded successfully');
      } else {
        logger.info('RadarChart', 'Chart.js already available');
      }

      // Create canvas element
      const canvas = document.createElement('canvas');
      canvas.width = this.options.width;
      canvas.height = this.options.height;
      canvas.style.maxWidth = '100%';
      canvas.style.height = 'auto';
      canvas.style.display = 'block';
      canvas.style.margin = '0 auto';

      // Clear any existing content including any "null" text
      this.container.innerHTML = '';
      this.container.textContent = '';

      // Ensure container is properly set up
      this.container.style.textAlign = 'center';
      this.container.style.overflow = 'visible';

      this.container.appendChild(canvas);
      logger.info(
        'RadarChart',
        'Canvas element created and appended to container'
      );

      // Apply visual enhancements classes BEFORE creating chart
      if (this.options.isDemo) {
        this.container.classList.add('radar-demo-container');
        logger.info(
          'RadarChart',
          'Applied radar-demo-container class for demo chart'
        );
      } else {
        this.container.classList.add('radar-chart-container');
        logger.info('RadarChart', 'Applied radar-chart-container class');
      }

      // Initialize Chart.js radar chart
      const ctx = canvas.getContext('2d');
      const config = this.getChartConfig();
      logger.info('RadarChart', 'Creating chart with config', config);

      this.chart = new window.Chart(ctx, config);
      logger.info('RadarChart', 'Chart created successfully');

      // Add mobile tooltip dismissal for demo charts and scenario charts
      if (this.options.isDemo || this.options.realTime) {
        this.setupMobileTooltipDismissal();
      }

      // Force redraw to ensure labels are visible
      setTimeout(() => {
        if (this.chart) {
          this.chart.update();
          logger.info('RadarChart', 'Chart updated/redrawn');
        }
      }, 100);

      this.isInitialized = true;
      logger.info('RadarChart', 'Radar chart initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize radar chart:', error);
      this.showFallbackChart();
    }
  }

  /**
   * Get Chart.js configuration
   */
  getChartConfig() {
    const axesLabels = Object.values(ETHICAL_AXES).map(axis => axis.label);
    const axesData = Object.values(this.currentScores);

    // Create gradient for the radar fill
    const gradientColors = this.createGradientColors();

    return {
      type: 'radar',
      data: {
        labels: axesLabels,
        datasets: [
          {
            label: this.options.title,
            data: axesData,
            backgroundColor: gradientColors.background,
            borderColor: gradientColors.border,
            borderWidth: 3,
            pointBackgroundColor: gradientColors.points,
            pointBorderColor: '#ffffff',
            pointBorderWidth: 1,
            pointHoverBackgroundColor: '#ffffff',
            pointHoverBorderColor: gradientColors.border,
            pointRadius: 2, // Make dots tiny
            pointHoverRadius: 4, // Small hover radius
            tension: 0.2, // Smooth curves between points
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 40,
            right: 40,
            bottom: 40,
            left: 40,
          },
        },
        animation: {
          duration: this.options.animated ? ANIMATION_DURATION : 0,
          easing: 'easeInOutQuart',
        },
        interaction: {
          intersect: false,
          mode: 'nearest',
        },
        onClick: (event, activeElements) => {
          // Handle click events for mobile tooltip toggle
          this.handleChartClick(event, activeElements);
        },
        plugins: {
          legend: {
            display: false, // Disable clickable legend to prevent chart toggle
            position: 'top',
            labels: {
              font: {
                size: 14,
                weight: '500',
              },
              color: '#2d3748',
              usePointStyle: true,
              pointStyle: 'circle',
            },
          },
          title: {
            display: true, // Enable title instead of legend
            text: this.options.title || 'Ethical Impact Analysis',
            font: {
              size: 18,
              weight: 'bold',
            },
            color: '#1a202c',
            padding: {
              top: 10,
              bottom: 20,
            },
          },
          tooltip: {
            enabled: window.innerWidth > MOBILE_BREAKPOINT, // Disable tooltips on mobile
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            titleColor: '#1a202c',
            bodyColor: '#2d3748',
            borderColor: '#4a5568',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: false,
            titleFont: {
              size: 14,
              weight: 'bold',
            },
            bodyFont: {
              size: 12,
            },
            padding: 12,
            callbacks: {
              title: context => {
                const axisKey = Object.keys(ETHICAL_AXES)[context[0].dataIndex];
                return ETHICAL_AXES[axisKey].label;
              },
              label: context => {
                const axisKey = Object.keys(ETHICAL_AXES)[context.dataIndex];
                const axisInfo = ETHICAL_AXES[axisKey];
                const score = context.parsed.r;
                const impact = this.getImpactDescription(score);

                return [
                  `Score: ${score}/5 (${impact})`,
                  ``,
                  axisInfo.description,
                ];
              },
            },
          },
        },
        scales: {
          r: {
            beginAtZero: true,
            min: MIN_SCORE,
            max: MAX_SCORE,
            ticks: {
              stepSize: 1,
              display: this.options.showLabels,
              backdropColor: 'rgba(255, 255, 255, 0.8)',
              backdropPadding: 4,
              font: {
                size: 11,
                weight: '500',
              },
              color: '#4a5568',
              callback(value) {
                return value;
              },
            },
            grid: {
              color: context => {
                // Different colors for different score levels
                if (context.index === 0) return 'rgba(239, 68, 68, 0.2)'; // Red for 0
                if (context.index === 1) return 'rgba(245, 101, 101, 0.15)'; // Light red for 1
                if (context.index === 2) return 'rgba(251, 191, 36, 0.15)'; // Yellow for 2
                if (context.index === NEUTRAL_SCORE)
                  return 'rgba(156, 163, 175, 0.2)'; // Gray for neutral
                if (context.index === POSITIVE_THRESHOLD)
                  return 'rgba(34, 197, 94, 0.15)'; // Light green for 4
                if (context.index === MAX_SCORE)
                  return 'rgba(22, 163, 74, 0.2)'; // Green for 5
                return 'rgba(156, 163, 175, 0.1)';
              },
              lineWidth: 2,
            },
            angleLines: {
              color: 'rgba(156, 163, 175, 0.3)',
              lineWidth: 1.5,
            },
            pointLabels: {
              display: true,
              font: {
                size: 13,
                weight: 'bold',
                family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              },
              color: '#1a202c',
              padding: 20,
              backdropColor: 'rgba(255, 255, 255, 0.9)',
              backdropPadding: {
                x: 6,
                y: 3,
              },
              borderRadius: 4,
              callback: label => {
                // Ensure labels are visible - shorter labels for modal
                return label.length > MODAL_LABEL_MAX_LENGTH
                  ? `${label.substring(0, MODAL_LABEL_MAX_LENGTH)}...`
                  : label;
              },
            },
          },
        },
      },
    };
  }

  /**
   * Create dynamic gradient colors based on current scores
   */
  createGradientColors() {
    // Calculate average score to determine overall theme
    const avgScore =
      Object.values(this.currentScores).reduce((a, b) => a + b, 0) /
      Object.keys(this.currentScores).length;

    let backgroundColor, borderColor;

    if (avgScore < 2) {
      // Negative theme - reds
      backgroundColor = 'rgba(239, 68, 68, 0.15)';
      borderColor = 'rgba(239, 68, 68, 0.8)';
    } else if (avgScore < NEUTRAL_SCORE) {
      // Slightly negative - oranges/yellows
      backgroundColor = 'rgba(245, 158, 11, 0.15)';
      borderColor = 'rgba(245, 158, 11, 0.8)';
    } else if (avgScore === NEUTRAL_SCORE) {
      // Neutral theme - blues
      backgroundColor = 'rgba(59, 130, 246, 0.15)';
      borderColor = 'rgba(59, 130, 246, 0.8)';
    } else if (avgScore < POSITIVE_THRESHOLD) {
      // Slightly positive - light greens
      backgroundColor = 'rgba(34, 197, 94, 0.15)';
      borderColor = 'rgba(34, 197, 94, 0.8)';
    } else {
      // Highly positive - deep greens
      backgroundColor = 'rgba(22, 163, 74, 0.15)';
      borderColor = 'rgba(22, 163, 74, 0.8)';
    }

    // Create point colors based on individual scores
    const points = Object.values(this.currentScores).map(score => {
      if (score <= 1) return '#ef4444'; // red-500
      if (score <= 2) return '#f87171'; // red-400
      if (score < NEUTRAL_SCORE) return '#fbbf24'; // amber-400
      if (score === NEUTRAL_SCORE) return '#9ca3af'; // gray-400
      if (score < MAX_SCORE) return '#22c55e'; // green-500
      return '#16a34a'; // green-600
    });

    return {
      background: backgroundColor,
      border: borderColor,
      points,
    };
  }

  /**
   * Update scores for specific axes
   * @param {Object} scoreUpdates - Object with axis keys and new scores
   */
  updateScores(scoreUpdates) {
    for (const [axis, score] of Object.entries(scoreUpdates)) {
      if (axis in this.currentScores) {
        // Clamp score between MIN_SCORE and MAX_SCORE
        this.currentScores[axis] = Math.max(
          MIN_SCORE,
          Math.min(MAX_SCORE, score)
        );
      }
    }

    this.refreshChart();
  }

  /**
   * Apply answer impact to scores
   * @param {Object} answerImpact - Object with axis keys and impact deltas
   */
  applyAnswerImpact(answerImpact) {
    const updates = {};

    for (const [axis, delta] of Object.entries(answerImpact)) {
      if (axis in this.currentScores) {
        // Start from current score and apply delta
        updates[axis] = this.currentScores[axis] + delta;
      }
    }

    this.updateScores(updates);

    // Log the impact for debugging
    logger.info(
      'Applied answer impact:',
      answerImpact,
      'New scores:',
      this.currentScores
    );
  }

  /**
   * Reset all scores to neutral (3)
   */
  resetScores() {
    this.currentScores = { ...DEFAULT_SCORES };
    this.refreshChart();
  }

  /**
   * Get current scores
   */
  getScores() {
    return { ...this.currentScores };
  }

  /**
   * Set scores directly
   */
  setScores(scores) {
    this.currentScores = { ...DEFAULT_SCORES, ...scores };
    this.refreshChart();
  }

  /**
   * Refresh the chart display
   */
  refreshChart() {
    if (this.chart) {
      const axesData = Object.values(this.currentScores);
      this.chart.data.datasets[0].data = axesData;
      this.chart.update(this.options.animated ? 'active' : 'none');
    }
  }

  /**
   * Get impact description for a score
   */
  getImpactDescription(score) {
    if (score <= 1) return 'Highly Negative';
    if (score <= 2) return 'Negative';
    if (score < NEUTRAL_SCORE) return 'Slightly Negative';
    if (score === NEUTRAL_SCORE) return 'Neutral';
    if (score < POSITIVE_THRESHOLD) return 'Slightly Positive';
    if (score < MAX_SCORE) return 'Positive';
    return 'Highly Positive';
  }

  /**
   * Load Chart.js if not already loaded
   */
  async loadChartJS() {
    return new Promise((resolve, reject) => {
      if (typeof window.Chart !== 'undefined') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Show fallback chart if Chart.js fails
   */
  showFallbackChart() {
    this.container.innerHTML = `
            <div class="radar-chart-fallback">
                <h4>${this.options.title}</h4>
                <div class="fallback-scores">
                    ${Object.entries(this.currentScores)
                      .map(
                        ([axis, score]) => `
                        <div class="score-item">
                            <span class="axis-label">${ETHICAL_AXES[axis].label}:</span>
                            <span class="score-value">${score}/5</span>
                            <div class="score-bar">
                                <div class="score-fill" style="width: ${(score / MAX_SCORE) * SCALE_PERCENTAGE}%"></div>
                            </div>
                        </div>
                    `
                      )
                      .join('')}
                </div>
            </div>
        `;
  }

  /**
   * Destroy the chart and clean up
   */
  destroy() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    // Clean up mobile event listeners
    if (this.documentTouchHandler) {
      document.removeEventListener('touchstart', this.documentTouchHandler);
      this.documentTouchHandler = null;
    }

    // Clean up canvas click handler
    if (this.canvasClickHandler) {
      const canvas = this.container.querySelector('canvas');
      if (canvas) {
        canvas.removeEventListener('click', this.canvasClickHandler);
      }
      this.canvasClickHandler = null;
    }
  }

  /**
   * Export chart as image
   */
  exportAsImage() {
    if (this.chart) {
      return this.chart.toBase64Image();
    }
    return null;
  }

  /**
   * Handle chart click events for mobile tooltip toggle
   * Allows users to click nodes to show/hide tooltips on mobile
   */
  handleChartClick(event, activeElements) {
    // Only handle clicks on mobile/touch devices
    if (!('ontouchstart' in window) && !navigator.maxTouchPoints) {
      return;
    }

    if (!this.chart || !this.chart.tooltip) {
      return;
    }

    // If clicking on a node/point
    if (activeElements && activeElements.length > 0) {
      const activeElement = activeElements[0];
      const currentActiveElements = this.chart.tooltip.getActiveElements();

      // Check if the same element is already active
      const isSameElement =
        currentActiveElements.length > 0 &&
        currentActiveElements[0].datasetIndex === activeElement.datasetIndex &&
        currentActiveElements[0].index === activeElement.index;

      if (isSameElement) {
        // If the same node is clicked again, hide the tooltip (deselect)
        this.chart.tooltip.setActiveElements([], { x: 0, y: 0 });
      } else {
        // Show tooltip for the clicked node (select)
        this.chart.tooltip.setActiveElements([activeElement], {
          x: event.native.offsetX,
          y: event.native.offsetY,
        });
      }

      this.chart.update('none');

      // Prevent event from bubbling to avoid triggering document touch handler
      if (event.native) {
        event.native.stopPropagation();
      }
    } else {
      // If clicking on empty area, hide tooltips
      this.chart.tooltip.setActiveElements([], { x: 0, y: 0 });
      this.chart.update('none');
    }
  }

  /**
   * Setup mobile tooltip dismissal for demo and scenario charts
   * Allows users to tap anywhere to dismiss tooltips on mobile
   */
  setupMobileTooltipDismissal() {
    // Only add this functionality on mobile/touch devices
    if (!('ontouchstart' in window) && !navigator.maxTouchPoints) {
      return;
    }

    // Add direct canvas click handler for empty area clicks
    const canvas = this.container.querySelector('canvas');
    if (canvas) {
      this.canvasClickHandler = event => {
        // Get chart elements at the click position
        const points = this.chart.getElementsAtEventForMode(
          event,
          'nearest',
          { intersect: true },
          false
        );

        // If no elements were clicked (empty area), hide tooltips
        if (points.length === 0) {
          if (this.chart && this.chart.tooltip) {
            this.chart.tooltip.setActiveElements([], { x: 0, y: 0 });
            this.chart.update('none');
          }
        }
      };

      canvas.addEventListener('click', this.canvasClickHandler);
    }

    // Add touch event listener to the container for touches outside canvas
    this.container.addEventListener(
      'touchstart',
      event => {
        // Check if the touch is outside the canvas area
        const canvas = this.container.querySelector('canvas');
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const touch = event.touches[0];

        // If touch is outside the canvas, hide tooltips
        if (
          touch.clientX < rect.left ||
          touch.clientX > rect.right ||
          touch.clientY < rect.top ||
          touch.clientY > rect.bottom
        ) {
          // Hide any active tooltips
          if (this.chart && this.chart.tooltip) {
            this.chart.tooltip.setActiveElements([], { x: 0, y: 0 });
            this.chart.update('none');
          }
        }
      },
      { passive: true }
    );

    // Also add a general document touch listener for clicking outside the entire container
    this.documentTouchHandler = event => {
      // Only dismiss if the touch is completely outside the radar chart container
      if (!this.container.contains(event.target)) {
        // Hide tooltips when touching outside the entire container
        if (this.chart && this.chart.tooltip) {
          this.chart.tooltip.setActiveElements([], { x: 0, y: 0 });
          this.chart.update('none');
        }
      }
    };

    document.addEventListener('touchstart', this.documentTouchHandler, {
      passive: true,
    });

    const chartType = this.options.isDemo ? 'demo' : 'scenario';
    logger.info(
      `Mobile tooltip dismissal setup complete for ${chartType} radar chart`
    );
  }
}
