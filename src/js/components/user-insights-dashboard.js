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
 * User Insights Dashboard Component
 * Displays comprehensive user engagement and behavior analytics
 * For internal use by app developers to understand user patterns
 */

import { userEngagementTracker } from '../services/user-engagement-tracker.js';
import logger from '../utils/logger.js';

export class UserInsightsDashboard {
  constructor() {
    this.isVisible = false;
    this.refreshInterval = null;
    this.insights = null;
    this.constants = {
      REFRESH_INTERVAL: 30000, // 30 seconds
      LOW_ENGAGEMENT_THRESHOLD: 5,
      LOW_FEATURE_ADOPTION_THRESHOLD: 3,
      TOP_SETTINGS_COUNT: 3,
    };
    this.init();
  }

  init() {
    this.createDashboard();
    this.setupEventListeners();
    this.loadInsights();
  }

  /**
   * Create the dashboard HTML structure
   */
  createDashboard() {
    const dashboard = document.createElement('div');
    dashboard.id = 'user-insights-dashboard';
    dashboard.className = 'user-insights-dashboard';
    dashboard.innerHTML = `
      <div class="dashboard-header">
        <h2>User Insights Dashboard</h2>
        <div class="dashboard-controls">
          <button id="refresh-insights" class="dashboard-btn">
            <span class="icon">🔄</span>
            Refresh
          </button>
          <button id="export-insights" class="dashboard-btn">
            <span class="icon">📊</span>
            Export
          </button>
          <button id="close-dashboard" class="dashboard-btn close-btn">
            <span class="icon">✕</span>
            Close
          </button>
        </div>
      </div>
      
      <div class="dashboard-content">
        <div class="insights-grid">
          <!-- User Profile Section -->
          <div class="insight-card">
            <h3>User Profile</h3>
            <div id="user-profile-data" class="data-section">
              <div class="loading">Loading user profile...</div>
            </div>
          </div>
          
          <!-- Settings Usage Section -->
          <div class="insight-card">
            <h3>Settings Panel Usage</h3>
            <div id="settings-usage-data" class="data-section">
              <div class="loading">Loading settings data...</div>
            </div>
          </div>
          
          <!-- Engagement Metrics Section -->
          <div class="insight-card">
            <h3>Engagement Metrics</h3>
            <div id="engagement-metrics-data" class="data-section">
              <div class="loading">Loading engagement data...</div>
            </div>
          </div>
          
          <!-- Behavior Patterns Section -->
          <div class="insight-card">
            <h3>Behavior Patterns</h3>
            <div id="behavior-patterns-data" class="data-section">
              <div class="loading">Loading behavior data...</div>
            </div>
          </div>
          
          <!-- Feature Adoption Section -->
          <div class="insight-card">
            <h3>Feature Adoption</h3>
            <div id="feature-adoption-data" class="data-section">
              <div class="loading">Loading feature data...</div>
            </div>
          </div>
          
          <!-- User Journey Section -->
          <div class="insight-card">
            <h3>User Journey</h3>
            <div id="user-journey-data" class="data-section">
              <div class="loading">Loading journey data...</div>
            </div>
          </div>
          
          <!-- Pain Points Section -->
          <div class="insight-card">
            <h3>Pain Points</h3>
            <div id="pain-points-data" class="data-section">
              <div class="loading">Loading pain point data...</div>
            </div>
          </div>
          
          <!-- Recommendations Section -->
          <div class="insight-card">
            <h3>Improvement Recommendations</h3>
            <div id="recommendations-data" class="data-section">
              <div class="loading">Loading recommendations...</div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add CSS styles
    const style = document.createElement('style');
    style.textContent = `
      .user-insights-dashboard {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10000;
        display: none;
        overflow-y: auto;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .user-insights-dashboard.visible {
        display: block;
      }

      .dashboard-header {
        background: #2c3e50;
        color: white;
        padding: 1rem 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: sticky;
        top: 0;
        z-index: 10001;
      }

      .dashboard-header h2 {
        margin: 0;
        font-size: 1.5rem;
      }

      .dashboard-controls {
        display: flex;
        gap: 0.5rem;
      }

      .dashboard-btn {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.2s ease;
      }

      .dashboard-btn:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .dashboard-btn.close-btn {
        background: rgba(231, 76, 60, 0.8);
      }

      .dashboard-btn.close-btn:hover {
        background: rgba(231, 76, 60, 1);
      }

      .dashboard-content {
        background: #ecf0f1;
        min-height: calc(100vh - 80px);
        padding: 2rem;
      }

      .insights-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 1.5rem;
        max-width: 1400px;
        margin: 0 auto;
      }

      .insight-card {
        background: white;
        border-radius: 8px;
        padding: 1.5rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        border: 1px solid #ddd;
      }

      .insight-card h3 {
        margin: 0 0 1rem 0;
        color: #2c3e50;
        font-size: 1.2rem;
        border-bottom: 2px solid #3498db;
        padding-bottom: 0.5rem;
      }

      .data-section {
        font-size: 0.9rem;
        line-height: 1.4;
      }

      .loading {
        color: #7f8c8d;
        font-style: italic;
      }

      .metric-row {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;
        border-bottom: 1px solid #ecf0f1;
      }

      .metric-label {
        font-weight: 500;
        color: #2c3e50;
      }

      .metric-value {
        color: #3498db;
        font-weight: 600;
      }

      .metric-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .metric-list li {
        padding: 0.25rem 0;
        border-bottom: 1px solid #f8f9fa;
      }

      .metric-list li:last-child {
        border-bottom: none;
      }

      .tag {
        display: inline-block;
        background: #3498db;
        color: white;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
        margin: 0.2rem;
      }

      .tag.high-priority {
        background: #e74c3c;
      }

      .tag.medium-priority {
        background: #f39c12;
      }

      .tag.low-priority {
        background: #27ae60;
      }

      .progress-bar {
        width: 100%;
        height: 20px;
        background: #ecf0f1;
        border-radius: 10px;
        overflow: hidden;
        margin: 0.5rem 0;
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #3498db, #2ecc71);
        transition: width 0.3s ease;
      }

      .chart-placeholder {
        width: 100%;
        height: 200px;
        background: #f8f9fa;
        border: 2px dashed #ddd;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #7f8c8d;
        font-style: italic;
        margin: 1rem 0;
      }

      @media (max-width: 768px) {
        .insights-grid {
          grid-template-columns: 1fr;
        }
        
        .dashboard-header {
          padding: 1rem;
          flex-direction: column;
          gap: 1rem;
          text-align: center;
        }
        
        .dashboard-controls {
          justify-content: center;
        }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(dashboard);
  }

  /**
   * Setup event listeners for dashboard controls
   */
  setupEventListeners() {
    const refreshBtn = document.getElementById('refresh-insights');
    const exportBtn = document.getElementById('export-insights');
    const closeBtn = document.getElementById('close-dashboard');

    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.loadInsights();
      });
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportInsights();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.hideDashboard();
      });
    }

    // Close dashboard on escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hideDashboard();
      }
    });

    // Close dashboard on backdrop click
    document
      .getElementById('user-insights-dashboard')
      .addEventListener('click', e => {
        if (e.target.id === 'user-insights-dashboard') {
          this.hideDashboard();
        }
      });
  }

  /**
   * Load and display insights
   */
  async loadInsights() {
    try {
      this.insights = userEngagementTracker.generateInsights();

      this.displayUserProfile();
      this.displaySettingsUsage();
      this.displayEngagementMetrics();
      this.displayBehaviorPatterns();
      this.displayFeatureAdoption();
      this.displayUserJourney();
      this.displayPainPoints();
      this.displayRecommendations();

      logger.info('User insights loaded successfully');
    } catch (error) {
      logger.error('Failed to load user insights:', error);
      this.showError('Failed to load insights. Please try again.');
    }
  }

  /**
   * Display user profile data
   */
  displayUserProfile() {
    const container = document.getElementById('user-profile-data');
    const { userProfile, behaviorPatterns } = userEngagementTracker;

    container.innerHTML = `
      <div class="metric-row">
        <span class="metric-label">User ID:</span>
        <span class="metric-value">${userProfile.userId || 'Not set'}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">User Type:</span>
        <span class="metric-value">${behaviorPatterns.userType || 'Unknown'}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">First Visit:</span>
        <span class="metric-value">${userProfile.firstVisit ? new Date(userProfile.firstVisit).toLocaleDateString() : 'Unknown'}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Onboarding Status:</span>
        <span class="metric-value">${userProfile.onboardingCompleted ? 'Complete' : 'Incomplete'}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Engagement Level:</span>
        <span class="metric-value">${behaviorPatterns.engagementLevel || 'Unknown'}</span>
      </div>
    `;
  }

  /**
   * Display settings usage data
   */
  displaySettingsUsage() {
    const container = document.getElementById('settings-usage-data');
    const { settingsUsage } = userEngagementTracker;

    const panelSessions = settingsUsage.panel_sessions || [];
    const settingChanges = settingsUsage.setting_changes || [];
    const tabSwitches = settingsUsage.tab_switches || [];

    const avgTimeSpent =
      panelSessions.length > 0
        ? panelSessions.reduce(
            (sum, session) => sum + (session.timeSpent || 0),
            0
          ) / panelSessions.length
        : 0;

    container.innerHTML = `
      <div class="metric-row">
        <span class="metric-label">Panel Opens:</span>
        <span class="metric-value">${panelSessions.length}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Settings Changed:</span>
        <span class="metric-value">${settingChanges.length}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Tab Switches:</span>
        <span class="metric-value">${tabSwitches.length}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Avg Time in Panel:</span>
        <span class="metric-value">${Math.round(avgTimeSpent / 1000)}s</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Most Changed Settings:</span>
        <span class="metric-value">${this.getMostChangedSettings(settingChanges).join(', ') || 'None'}</span>
      </div>
    `;
  }

  /**
   * Display engagement metrics
   */
  displayEngagementMetrics() {
    const container = document.getElementById('engagement-metrics-data');
    const metrics = userEngagementTracker.engagementMetrics;

    container.innerHTML = `
      <div class="metric-row">
        <span class="metric-label">Total Sessions:</span>
        <span class="metric-value">${metrics.session_count || 0}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Features Used:</span>
        <span class="metric-value">${metrics.features_used?.length || 0}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Page Views:</span>
        <span class="metric-value">${metrics.page_views || 0}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Settings Panel Opens:</span>
        <span class="metric-value">${metrics.settings_panel_opens || 0}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Last Activity:</span>
        <span class="metric-value">${metrics.lastUpdate ? new Date(metrics.lastUpdate).toLocaleString() : 'Unknown'}</span>
      </div>
    `;
  }

  /**
   * Display behavior patterns
   */
  displayBehaviorPatterns() {
    const container = document.getElementById('behavior-patterns-data');
    const patterns = userEngagementTracker.behaviorPatterns;

    container.innerHTML = `
      <div class="metric-row">
        <span class="metric-label">User Classification:</span>
        <span class="metric-value">${patterns.userType || 'Unknown'}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Engagement Level:</span>
        <span class="metric-value">${patterns.engagementLevel || 'Unknown'}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Customization Tendency:</span>
        <span class="metric-value">${patterns.customizationTendency || 'Unknown'}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Help Seeking:</span>
        <span class="metric-value">${patterns.helpSeekingBehavior || 'Unknown'}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Preferred Features:</span>
        <span class="metric-value">${patterns.preferredFeatures?.join(', ') || 'None identified'}</span>
      </div>
    `;
  }

  /**
   * Display feature adoption data
   */
  displayFeatureAdoption() {
    const container = document.getElementById('feature-adoption-data');
    const insights = this.insights?.featureAdoption || {};

    container.innerHTML = `
      <div class="metric-row">
        <span class="metric-label">Features Discovered:</span>
        <span class="metric-value">${Object.keys(insights).length}</span>
      </div>
      <div class="chart-placeholder">
        Feature adoption chart would go here
      </div>
    `;
  }

  /**
   * Display user journey data
   */
  displayUserJourney() {
    const container = document.getElementById('user-journey-data');
    const insights = this.insights?.userJourney || {};

    container.innerHTML = `
      <div class="metric-row">
        <span class="metric-label">Journey Stage:</span>
        <span class="metric-value">${insights.stage || 'Unknown'}</span>
      </div>
      <div class="chart-placeholder">
        User journey visualization would go here
      </div>
    `;
  }

  /**
   * Display pain points
   */
  displayPainPoints() {
    const container = document.getElementById('pain-points-data');
    const painPoints = this.insights?.painPoints || [];

    if (painPoints.length === 0) {
      container.innerHTML =
        '<div class="metric-row"><span class="metric-label">No pain points identified</span></div>';
      return;
    }

    const painPointsHtml = painPoints
      .map(
        point =>
          `<li><span class="tag ${point.priority}-priority">${point.priority}</span> ${point.description}</li>`
      )
      .join('');

    container.innerHTML = `
      <ul class="metric-list">
        ${painPointsHtml}
      </ul>
    `;
  }

  /**
   * Display recommendations
   */
  displayRecommendations() {
    const container = document.getElementById('recommendations-data');

    // Generate recommendations based on user data
    const recommendations = this.generateRecommendations();

    if (recommendations.length === 0) {
      container.innerHTML =
        '<div class="metric-row"><span class="metric-label">No specific recommendations at this time</span></div>';
      return;
    }

    const recommendationsHtml = recommendations
      .map(
        rec =>
          `<li><span class="tag ${rec.priority}-priority">${rec.priority}</span> ${rec.text}</li>`
      )
      .join('');

    container.innerHTML = `
      <ul class="metric-list">
        ${recommendationsHtml}
      </ul>
    `;
  }

  /**
   * Generate recommendations based on user data
   */
  generateRecommendations() {
    const recommendations = [];
    const { settingsUsage, engagementMetrics, behaviorPatterns } =
      userEngagementTracker;

    // Low engagement recommendations
    if (
      (engagementMetrics.session_count || 0) <
      this.constants.LOW_ENGAGEMENT_THRESHOLD
    ) {
      recommendations.push({
        priority: 'high',
        text: 'Consider improving onboarding experience - user has low session count',
      });
    }

    // Settings usage recommendations
    if ((settingsUsage.panel_sessions?.length || 0) === 0) {
      recommendations.push({
        priority: 'medium',
        text: 'User has not accessed settings - consider making settings more discoverable',
      });
    }

    // Feature adoption recommendations
    if (
      (engagementMetrics.features_used?.length || 0) <
      this.constants.LOW_FEATURE_ADOPTION_THRESHOLD
    ) {
      recommendations.push({
        priority: 'medium',
        text: 'Low feature adoption - consider feature discovery prompts',
      });
    }

    // User type specific recommendations
    if (behaviorPatterns.userType === 'power_user') {
      recommendations.push({
        priority: 'low',
        text: 'Power user detected - consider advanced features and shortcuts',
      });
    }

    return recommendations;
  }

  /**
   * Get most frequently changed settings
   */
  getMostChangedSettings(settingChanges) {
    const frequency = {};
    settingChanges.forEach(change => {
      frequency[change.settingName] = (frequency[change.settingName] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, this.constants.TOP_SETTINGS_COUNT)
      .map(([setting]) => setting);
  }

  /**
   * Export insights to JSON
   */
  exportInsights() {
    const exportData = {
      userProfile: userEngagementTracker.userProfile,
      engagementMetrics: userEngagementTracker.engagementMetrics,
      behaviorPatterns: userEngagementTracker.behaviorPatterns,
      settingsUsage: userEngagementTracker.settingsUsage,
      insights: this.insights,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-insights-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Show error message
   */
  showError(message) {
    const containers = document.querySelectorAll('.data-section');
    containers.forEach(container => {
      container.innerHTML = `<div style="color: #e74c3c; font-weight: bold;">${message}</div>`;
    });
  }

  /**
   * Show the dashboard
   */
  showDashboard() {
    const dashboard = document.getElementById('user-insights-dashboard');
    if (dashboard) {
      dashboard.classList.add('visible');
      this.isVisible = true;
      this.loadInsights();

      // Auto-refresh every 30 seconds
      this.refreshInterval = setInterval(() => {
        this.loadInsights();
      }, this.constants.REFRESH_INTERVAL);
    }
  }

  /**
   * Hide the dashboard
   */
  hideDashboard() {
    const dashboard = document.getElementById('user-insights-dashboard');
    if (dashboard) {
      dashboard.classList.remove('visible');
      this.isVisible = false;

      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
        this.refreshInterval = null;
      }
    }
  }

  /**
   * Toggle dashboard visibility
   */
  toggle() {
    if (this.isVisible) {
      this.hideDashboard();
    } else {
      this.showDashboard();
    }
  }
}

// Create singleton instance
export const userInsightsDashboard = new UserInsightsDashboard();

// Global function to access dashboard (for development/debugging)
if (typeof window !== 'undefined') {
  window.showUserInsights = () => userInsightsDashboard.showDashboard();
}

export default userInsightsDashboard;
