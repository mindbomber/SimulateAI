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
const LABEL_MAX_LENGTH = 12;
const SCALE_PERCENTAGE = 100;

// Ethical axes definitions (0-5 scale, 3 = neutral)
export const ETHICAL_AXES = {
    fairness: {
        label: 'Fairness',
        description: 'Treats all individuals and groups equitably',
        color: '#3498db'
    },
    sustainability: {
        label: 'Sustainability', 
        description: 'Supports long-term ecological and social well-being',
        color: '#27ae60'
    },
    autonomy: {
        label: 'Autonomy',
        description: 'Respects individual control and self-determination',
        color: '#9b59b6'
    },
    beneficence: {
        label: 'Beneficence',
        description: 'Promotes well-being and prevents harm',
        color: '#e74c3c'
    },
    transparency: {
        label: 'Transparency',
        description: 'Provides openness in decision-making processes',
        color: '#f39c12'
    },
    accountability: {
        label: 'Accountability',
        description: 'Ensures clear responsibility for decisions',
        color: '#34495e'
    },
    privacy: {
        label: 'Privacy',
        description: 'Protects personal information and data rights',
        color: '#e67e22'
    },
    proportionality: {
        label: 'Proportionality',
        description: 'Balances benefits against severity of impact',
        color: '#1abc9c'
    }
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
    proportionality: NEUTRAL_SCORE
};

export default class RadarChart {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        
        if (!this.container) {
            throw new Error(`Container with ID '${containerId}' not found`);
        }
        
        this.options = {
            width: options.width || DEFAULT_CHART_SIZE,
            height: options.height || DEFAULT_CHART_SIZE,
            showLabels: options.showLabels !== false,
            showLegend: options.showLegend !== false,
            animated: options.animated !== false,
            realTime: options.realTime || false, // For scenario real-time updates
            title: options.title || 'Ethical Impact Analysis',
            ...options
        };
        
        this.chart = null;
        this.currentScores = { ...DEFAULT_SCORES };
        
        this.initializeChart();
    }
    
    /**
     * Initialize the Chart.js radar chart
     */
    async initializeChart() {
        try {
            // Ensure Chart.js is loaded
            if (typeof window.Chart === 'undefined') {
                await this.loadChartJS();
            }
            
            // Create canvas element
            const canvas = document.createElement('canvas');
            canvas.width = this.options.width;
            canvas.height = this.options.height;
            canvas.style.maxWidth = '100%';
            canvas.style.height = 'auto';
            
            this.container.innerHTML = '';
            this.container.appendChild(canvas);
            
            // Initialize Chart.js radar chart
            const ctx = canvas.getContext('2d');
            this.chart = new window.Chart(ctx, this.getChartConfig());
            
            logger.info('Radar chart initialized successfully');
            
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
        
        return {
            type: 'radar',
            data: {
                labels: axesLabels,
                datasets: [{
                    label: this.options.title,
                    data: axesData,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: this.options.animated ? ANIMATION_DURATION : 0
                },
                plugins: {
                    legend: {
                        display: this.options.showLegend,
                        position: 'top'
                    },
                    title: {
                        display: !!this.options.title,
                        text: this.options.title,
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const axisKey = Object.keys(ETHICAL_AXES)[context.dataIndex];
                                const axisInfo = ETHICAL_AXES[axisKey];
                                const score = context.parsed.r;
                                const impact = this.getImpactDescription(score);
                                
                                return [
                                    `${axisInfo.label}: ${score}/5`,
                                    `Impact: ${impact}`,
                                    axisInfo.description
                                ];
                            }
                        }
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        min: MIN_SCORE,
                        max: MAX_SCORE,
                        ticks: {
                            stepSize: 1,
                            display: this.options.showLabels,
                            callback(value) {
                                return value;
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        angleLines: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        pointLabels: {
                            font: {
                                size: 12
                            },
                            callback: (label) => {
                                // Wrap long labels
                                return label.length > LABEL_MAX_LENGTH ? 
                                    `${label.substring(0, LABEL_MAX_LENGTH)}...` : label;
                            }
                        }
                    }
                }
            }
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
                this.currentScores[axis] = Math.max(MIN_SCORE, Math.min(MAX_SCORE, score));
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
        logger.info('Applied answer impact:', answerImpact, 'New scores:', this.currentScores);
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
                    ${Object.entries(this.currentScores).map(([axis, score]) => `
                        <div class="score-item">
                            <span class="axis-label">${ETHICAL_AXES[axis].label}:</span>
                            <span class="score-value">${score}/5</span>
                            <div class="score-bar">
                                <div class="score-fill" style="width: ${(score/MAX_SCORE)*SCALE_PERCENTAGE}%"></div>
                            </div>
                        </div>
                    `).join('')}
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
}
