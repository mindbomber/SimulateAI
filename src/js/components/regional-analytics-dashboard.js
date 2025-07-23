/**
 * Regional Analytics Dashboard Component
 * Displays regional decision patterns and global insights
 *
 * Features:
 * - Regional decision pattern visualization
 * - Cross-cultural ethics comparison
 * - Global trends analysis
 * - Interactive geographic data
 * - Export functionality for research
 */

import logger from "../utils/logger.js";
import regionalAnalytics from "../services/regional-analytics.js";

/**
 * Dashboard constants
 */
const DASHBOARD_CONSTANTS = {
  REFRESH_INTERVAL: 60000, // 1 minute
  MILLISECONDS_PER_SECOND: 1000,
  SECONDS_PER_MINUTE: 60,
  MINUTES_PER_HOUR: 60,
  HOURS_PER_DAY: 24,
  ETHICS_BAR_SCALE: 20,
  ETHICS_BAR_OFFSET: 2,

  get MILLISECONDS_PER_DAY() {
    return (
      this.MILLISECONDS_PER_SECOND *
      this.SECONDS_PER_MINUTE *
      this.MINUTES_PER_HOUR *
      this.HOURS_PER_DAY
    );
  },
};

/**
 * Regional Analytics Dashboard Class
 */
class RegionalAnalyticsDashboard {
  constructor() {
    this.isVisible = false;
    this.dashboardElement = null;
    this.insights = null;
    this.refreshInterval = null;

    this.init();
  }

  /**
   * Initialize the dashboard
   */
  init() {
    this.createDashboard();
    this.setupEventListeners();
    this.loadInitialData();

    logger.info("Regional Analytics Dashboard initialized");
  }

  /**
   * Create the dashboard HTML structure
   */
  createDashboard() {
    this.dashboardElement = document.createElement("div");
    this.dashboardElement.className = "regional-analytics-dashboard";
    this.dashboardElement.innerHTML = `
      <div class="dashboard-overlay"></div>
      <div class="dashboard-content">
        <header class="dashboard-header">
          <h2>
            <span class="icon">🌍</span>
            Regional Analytics Dashboard
          </h2>
          <div class="dashboard-controls">
            <button class="btn btn-sm refresh-btn" title="Refresh Data">
              <span class="icon">🔄</span>
            </button>
            <button class="btn btn-sm export-btn" title="Export Data">
              <span class="icon">📊</span>
            </button>
            <button class="btn btn-sm close-btn" title="Close">
              <span class="icon">✕</span>
            </button>
          </div>
        </header>
        
        <div class="dashboard-body">
          <div class="loading-indicator">
            <span class="spinner"></span>
            Loading regional analytics...
          </div>
          
          <div class="dashboard-tabs">
            <button class="tab-btn active" data-tab="overview">Overview</button>
            <button class="tab-btn" data-tab="regions">Regions</button>
            <button class="tab-btn" data-tab="ethics">Ethics</button>
            <button class="tab-btn" data-tab="trends">Trends</button>
            <button class="tab-btn" data-tab="insights">Insights</button>
          </div>
          
          <div class="dashboard-panels">
            <div class="panel overview-panel active" data-panel="overview">
              <div class="global-stats">
                <div class="stat-card">
                  <div class="stat-value" id="total-decisions">-</div>
                  <div class="stat-label">Total Decisions</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value" id="active-regions">-</div>
                  <div class="stat-label">Active Regions</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value" id="data-period">-</div>
                  <div class="stat-label">Data Period</div>
                </div>
              </div>
              
              <div class="top-regions">
                <h3>Top Regions by Activity</h3>
                <div class="regions-list" id="top-regions-list">
                  <!-- Populated dynamically -->
                </div>
              </div>
            </div>
            
            <div class="panel regions-panel" data-panel="regions">
              <div class="regional-comparison">
                <h3>Regional Decision Patterns</h3>
                <div class="comparison-grid" id="regional-comparison">
                  <!-- Populated dynamically -->
                </div>
              </div>
            </div>
            
            <div class="panel ethics-panel" data-panel="ethics">
              <div class="ethics-analysis">
                <h3>Ethics Preferences by Region</h3>
                <div class="ethics-charts" id="ethics-charts">
                  <!-- Populated dynamically -->
                </div>
              </div>
            </div>
            
            <div class="panel trends-panel" data-panel="trends">
              <div class="cultural-trends">
                <h3>Cultural Trends Analysis</h3>
                <div class="trends-grid" id="cultural-trends">
                  <!-- Populated dynamically -->
                </div>
              </div>
            </div>
            
            <div class="panel insights-panel" data-panel="insights">
              <div class="recommendations">
                <h3>Recommendations</h3>
                <div class="recommendations-list" id="recommendations-list">
                  <!-- Populated dynamically -->
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.addDashboardStyles();
    document.body.appendChild(this.dashboardElement);
  }

  /**
   * Add dashboard styles
   */
  addDashboardStyles() {
    const styleId = "regional-analytics-dashboard-styles";
    if (document.getElementById(styleId)) return;

    const styles = document.createElement("style");
    styles.id = styleId;
    styles.textContent = `
      .regional-analytics-dashboard {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        display: none;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }
      
      .dashboard-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(5px);
      }
      
      .dashboard-content {
        position: relative;
        width: 95%;
        max-width: 1200px;
        height: 90%;
        margin: 2.5% auto;
        background: white;
        border-radius: 12px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      
      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #e0e0e0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }
      
      .dashboard-header h2 {
        margin: 0;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .dashboard-controls {
        display: flex;
        gap: 10px;
      }
      
      .dashboard-controls .btn {
        padding: 8px 12px;
        border: none;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.2);
        color: white;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .dashboard-controls .btn:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: translateY(-1px);
      }
      
      .dashboard-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      
      .loading-indicator {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 1;
        font-size: 16px;
        color: #666;
        gap: 10px;
      }
      
      .spinner {
        width: 20px;
        height: 20px;
        border: 2px solid #f3f3f3;
        border-top: 2px solid #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .dashboard-tabs {
        display: flex;
        border-bottom: 1px solid #e0e0e0;
        background: #f8f9fa;
      }
      
      .tab-btn {
        padding: 15px 25px;
        border: none;
        background: transparent;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        color: #666;
        transition: all 0.2s ease;
        position: relative;
      }
      
      .tab-btn:hover {
        color: #667eea;
        background: rgba(102, 126, 234, 0.1);
      }
      
      .tab-btn.active {
        color: #667eea;
        background: white;
      }
      
      .tab-btn.active::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        right: 0;
        height: 2px;
        background: #667eea;
      }
      
      .dashboard-panels {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
      }
      
      .panel {
        display: none;
      }
      
      .panel.active {
        display: block;
      }
      
      .global-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
      }
      
      .stat-card {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        padding: 20px;
        border-radius: 8px;
        text-align: center;
        border: 1px solid #e0e0e0;
      }
      
      .stat-value {
        font-size: 2.5em;
        font-weight: bold;
        color: #667eea;
        margin-bottom: 5px;
      }
      
      .stat-label {
        font-size: 0.9em;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .top-regions h3,
      .regional-comparison h3,
      .ethics-analysis h3,
      .cultural-trends h3,
      .recommendations h3 {
        margin: 0 0 20px 0;
        color: #333;
        font-size: 1.2em;
      }
      
      .regions-list {
        display: grid;
        gap: 15px;
      }
      
      .region-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
        border-left: 4px solid #667eea;
      }
      
      .region-name {
        font-weight: 500;
        color: #333;
      }
      
      .region-stats {
        display: flex;
        gap: 20px;
        font-size: 0.9em;
        color: #666;
      }
      
      .comparison-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
      }
      
      .region-card {
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 20px;
        transition: transform 0.2s ease;
      }
      
      .region-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      
      .region-card h4 {
        margin: 0 0 15px 0;
        color: #667eea;
        font-size: 1.1em;
      }
      
      .ethics-charts {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 20px;
      }
      
      .ethics-chart {
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 20px;
      }
      
      .ethics-chart h4 {
        margin: 0 0 15px 0;
        color: #333;
        font-size: 1em;
        text-transform: capitalize;
      }
      
      .ethics-bars {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .ethics-bar {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .ethics-bar-label {
        min-width: 80px;
        font-size: 0.9em;
        color: #666;
      }
      
      .ethics-bar-fill {
        flex: 1;
        height: 20px;
        background: #e9ecef;
        border-radius: 10px;
        overflow: hidden;
        position: relative;
      }
      
      .ethics-bar-value {
        height: 100%;
        background: linear-gradient(90deg, #667eea, #764ba2);
        border-radius: 10px;
        transition: width 0.5s ease;
      }
      
      .ethics-bar-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 0.8em;
        color: white;
        font-weight: 500;
      }
      
      .trends-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
      }
      
      .trend-card {
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 20px;
      }
      
      .trend-card h4 {
        margin: 0 0 15px 0;
        color: #667eea;
        font-size: 1.1em;
      }
      
      .trend-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .trend-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        background: #f8f9fa;
        border-radius: 6px;
      }
      
      .recommendations-list {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }
      
      .recommendation-item {
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 20px;
        border-left: 4px solid #28a745;
      }
      
      .recommendation-item.priority-high {
        border-left-color: #dc3545;
      }
      
      .recommendation-item.priority-medium {
        border-left-color: #ffc107;
      }
      
      .recommendation-header {
        display: flex;
        justify-content: space-between;
        align-items: start;
        margin-bottom: 10px;
      }
      
      .recommendation-region {
        font-weight: 500;
        color: #333;
      }
      
      .recommendation-priority {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.8em;
        text-transform: uppercase;
        font-weight: 500;
      }
      
      .recommendation-priority.high {
        background: #dc3545;
        color: white;
      }
      
      .recommendation-priority.medium {
        background: #ffc107;
        color: #333;
      }
      
      .recommendation-priority.low {
        background: #28a745;
        color: white;
      }
      
      .recommendation-text {
        margin-bottom: 10px;
        color: #666;
        line-height: 1.4;
      }
      
      .recommendation-impact {
        font-style: italic;
        color: #28a745;
        font-size: 0.9em;
      }
      
      @media (max-width: 768px) {
        .dashboard-content {
          width: 100%;
          height: 100%;
          margin: 0;
          border-radius: 0;
        }
        
        .global-stats {
          grid-template-columns: 1fr;
        }
        
        .comparison-grid,
        .ethics-charts,
        .trends-grid {
          grid-template-columns: 1fr;
        }
        
        .dashboard-tabs {
          overflow-x: auto;
        }
        
        .tab-btn {
          flex-shrink: 0;
        }
      }
    `;

    document.head.appendChild(styles);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Close button
    this.dashboardElement
      .querySelector(".close-btn")
      .addEventListener("click", () => {
        this.hide();
      });

    // Overlay click to close
    this.dashboardElement
      .querySelector(".dashboard-overlay")
      .addEventListener("click", () => {
        this.hide();
      });

    // Refresh button
    this.dashboardElement
      .querySelector(".refresh-btn")
      .addEventListener("click", () => {
        this.refresh();
      });

    // Export button
    this.dashboardElement
      .querySelector(".export-btn")
      .addEventListener("click", () => {
        this.exportData();
      });

    // Tab switching
    this.dashboardElement.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.switchTab(btn.dataset.tab);
      });
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (event) => {
      if (this.isVisible && event.key === "Escape") {
        this.hide();
      }
    });
  }

  /**
   * Load initial data
   */
  async loadInitialData() {
    try {
      this.showLoading();
      await this.loadInsights();
      this.hideLoading();
    } catch (error) {
      logger.error("Failed to load initial regional analytics data:", error);
      this.showError("Failed to load data");
    }
  }

  /**
   * Load insights from regional analytics
   */
  async loadInsights() {
    try {
      this.insights = regionalAnalytics.generateRegionalInsights();
      this.updateDashboard();
    } catch (error) {
      logger.error("Failed to load regional insights:", error);
      throw error;
    }
  }

  /**
   * Update dashboard with insights
   */
  updateDashboard() {
    if (!this.insights) return;

    this.updateOverview();
    this.updateRegions();
    this.updateEthics();
    this.updateTrends();
    this.updateInsights();
  }

  /**
   * Update overview panel
   */
  updateOverview() {
    const { globalSummary } = this.insights;

    // Update global stats
    document.getElementById("total-decisions").textContent =
      globalSummary.totalDecisions.toLocaleString();
    document.getElementById("active-regions").textContent =
      globalSummary.activeRegions;

    const period = globalSummary.dataCollectionPeriod;
    if (period) {
      const days = Math.ceil(
        period.duration / DASHBOARD_CONSTANTS.MILLISECONDS_PER_DAY,
      );
      document.getElementById("data-period").textContent = `${days} days`;
    } else {
      document.getElementById("data-period").textContent = "N/A";
    }

    // Update top regions
    const topRegionsList = document.getElementById("top-regions-list");
    topRegionsList.innerHTML = globalSummary.topRegions
      .map(
        (region) => `
        <div class="region-item">
          <div class="region-name">${region.region}</div>
          <div class="region-stats">
            <span>${region.decisions} decisions</span>
            <span>${region.percentage}%</span>
          </div>
        </div>
      `,
      )
      .join("");
  }

  /**
   * Update regions panel
   */
  updateRegions() {
    const { regionalComparisons } = this.insights;

    const comparisonGrid = document.getElementById("regional-comparison");
    comparisonGrid.innerHTML = regionalComparisons
      .map(
        (region) => `
        <div class="region-card">
          <h4>${region.region}</h4>
          <div class="region-info">
            <p><strong>Total Decisions:</strong> ${region.totalDecisions}</p>
            <p><strong>Top Scenarios:</strong></p>
            <ul>
              ${region.topScenarios
                .map(
                  (scenario) =>
                    `<li>${scenario.scenario} (${scenario.totalChoices} choices)</li>`,
                )
                .join("")}
            </ul>
            <p><strong>Cultural Indicators:</strong></p>
            <ul>
              <li>Individualism: ${region.culturalIndicators.individualism}</li>
              <li>Power Distance: ${region.culturalIndicators.powerDistance}</li>
              <li>Uncertainty Avoidance: ${region.culturalIndicators.uncertaintyAvoidance}</li>
            </ul>
          </div>
        </div>
      `,
      )
      .join("");
  }

  /**
   * Update ethics panel
   */
  updateEthics() {
    const { ethicsPreferences } = this.insights;

    const ethicsCharts = document.getElementById("ethics-charts");
    ethicsCharts.innerHTML = Object.entries(ethicsPreferences)
      .map(
        ([category, data]) => `
        <div class="ethics-chart">
          <h4>${category}</h4>
          <div class="ethics-bars">
            ${data.regionalVariation
              .map(
                (region) => `
              <div class="ethics-bar">
                <div class="ethics-bar-label">${region.region}</div>
                <div class="ethics-bar-fill">
                  <div class="ethics-bar-value" style="width: ${Math.max(0, (region.average + DASHBOARD_CONSTANTS.ETHICS_BAR_OFFSET) * DASHBOARD_CONSTANTS.ETHICS_BAR_SCALE)}%"></div>
                  <div class="ethics-bar-text">${region.average.toFixed(2)}</div>
                </div>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      `,
      )
      .join("");
  }

  /**
   * Update trends panel
   */
  updateTrends() {
    const { culturalTrends } = this.insights;

    const trendsGrid = document.getElementById("cultural-trends");
    trendsGrid.innerHTML = Object.entries(culturalTrends)
      .map(
        ([trendType, data]) => `
        <div class="trend-card">
          <h4>${trendType.replace(/([A-Z])/g, " $1").trim()}</h4>
          <div class="trend-list">
            ${Object.entries(data)
              .map(
                ([region, trend]) => `
              <div class="trend-item">
                <span>${region}</span>
                <span>${typeof trend === "object" ? JSON.stringify(trend) : trend}</span>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      `,
      )
      .join("");
  }

  /**
   * Update insights panel
   */
  updateInsights() {
    const { recommendations } = this.insights;

    const recommendationsList = document.getElementById("recommendations-list");
    recommendationsList.innerHTML = recommendations
      .map(
        (rec) => `
        <div class="recommendation-item priority-${rec.priority}">
          <div class="recommendation-header">
            <div class="recommendation-region">${rec.region}</div>
            <div class="recommendation-priority ${rec.priority}">${rec.priority}</div>
          </div>
          <div class="recommendation-text">${rec.suggestion}</div>
          <div class="recommendation-impact">${rec.impact}</div>
        </div>
      `,
      )
      .join("");
  }

  /**
   * Switch dashboard tab
   */
  switchTab(tabName) {
    // Update tab buttons
    this.dashboardElement.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === tabName);
    });

    // Update panels
    this.dashboardElement.querySelectorAll(".panel").forEach((panel) => {
      panel.classList.toggle("active", panel.dataset.panel === tabName);
    });
  }

  /**
   * Show loading indicator
   */
  showLoading() {
    this.dashboardElement.querySelector(".loading-indicator").style.display =
      "flex";
    this.dashboardElement.querySelector(".dashboard-tabs").style.display =
      "none";
    this.dashboardElement.querySelector(".dashboard-panels").style.display =
      "none";
  }

  /**
   * Hide loading indicator
   */
  hideLoading() {
    this.dashboardElement.querySelector(".loading-indicator").style.display =
      "none";
    this.dashboardElement.querySelector(".dashboard-tabs").style.display =
      "flex";
    this.dashboardElement.querySelector(".dashboard-panels").style.display =
      "block";
  }

  /**
   * Show error message
   */
  showError(message) {
    this.dashboardElement.querySelector(".loading-indicator").innerHTML = `
      <span class="error-icon">⚠️</span>
      ${message}
    `;
  }

  /**
   * Show dashboard
   */
  show() {
    this.dashboardElement.style.display = "block";
    this.isVisible = true;

    // Start auto-refresh
    this.startAutoRefresh();

    // Load fresh data
    this.loadInitialData();
  }

  /**
   * Hide dashboard
   */
  hide() {
    this.dashboardElement.style.display = "none";
    this.isVisible = false;

    // Stop auto-refresh
    this.stopAutoRefresh();
  }

  /**
   * Toggle dashboard visibility
   */
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Refresh dashboard data
   */
  async refresh() {
    try {
      this.showLoading();
      await this.loadInsights();
      this.hideLoading();
    } catch (error) {
      logger.error("Failed to refresh regional analytics:", error);
      this.showError("Failed to refresh data");
    }
  }

  /**
   * Export dashboard data
   */
  exportData() {
    try {
      const exportData = regionalAnalytics.exportRegionalData();
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `regional_analytics_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      logger.info("Regional analytics data exported");
    } catch (error) {
      logger.error("Failed to export regional analytics data:", error);
    }
  }

  /**
   * Start auto-refresh
   */
  startAutoRefresh() {
    if (this.refreshInterval) return;

    this.refreshInterval = setInterval(() => {
      this.refresh();
    }, DASHBOARD_CONSTANTS.REFRESH_INTERVAL);
  }

  /**
   * Stop auto-refresh
   */
  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /**
   * Get dashboard status
   */
  getStatus() {
    return {
      visible: this.isVisible,
      hasData: !!this.insights,
      autoRefresh: !!this.refreshInterval,
      regionalAnalyticsStatus: regionalAnalytics.getStatus(),
    };
  }
}

// Create singleton instance
const regionalAnalyticsDashboard = new RegionalAnalyticsDashboard();

// Export for use in other modules
export default regionalAnalyticsDashboard;
export { RegionalAnalyticsDashboard };
