/**
 * Error Analytics Dashboard
 * Provides insights into error patterns and helps debug high error rates
 */

class ErrorAnalyticsDashboard {
  constructor() {
    this.errorPatterns = new Map();
    this.errorCounts = {
      total: 0,
      critical: 0,
      filtered: 0,
      byType: {},
      byComponent: {},
      byTimeOfDay: {},
    };
    this.init();
  }

  /**
   * Initialize error monitoring
   */
  init() {
    // Listen for error events from various sources
    this.setupErrorListeners();

    // Create monitoring interface
    this.createMonitoringPanel();

    console.log("📊 Error Analytics Dashboard initialized");
  }

  /**
   * Setup error event listeners
   */
  setupErrorListeners() {
    // Only setup if main error handler not already installed
    if (!window._simulateAIErrorHandlerInstalled) {
      // Global error handler
      window.addEventListener("error", (event) => {
        this.trackError({
          type: "JavaScript Error",
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          source: "global",
        });
      });

      // Unhandled promise rejections
      window.addEventListener("unhandledrejection", (event) => {
        this.trackError({
          type: "Unhandled Promise",
          message: event.reason?.toString() || "Promise rejection",
          source: "promise",
        });
      });
    }

    // Listen for storage errors
    if (window.storageManager) {
      window.storageManager.on("storage:errorOccurred", (errorInfo) => {
        this.trackError({
          type: "Storage Error",
          message: errorInfo.error,
          operation: errorInfo.operation,
          source: "storage",
        });
      });
    }
  }

  /**
   * Track and analyze error patterns
   */
  trackError(errorInfo) {
    this.errorCounts.total++;

    // Categorize error type
    const errorType = errorInfo.type || "Unknown";
    this.errorCounts.byType[errorType] =
      (this.errorCounts.byType[errorType] || 0) + 1;

    // Track by component/source
    const source = errorInfo.source || "unknown";
    this.errorCounts.byComponent[source] =
      (this.errorCounts.byComponent[source] || 0) + 1;

    // Track by time of day
    const hour = new Date().getHours();
    this.errorCounts.byTimeOfDay[hour] =
      (this.errorCounts.byTimeOfDay[hour] || 0) + 1;

    // Detect patterns
    this.detectErrorPatterns(errorInfo);

    // Update dashboard
    this.updateDashboard();
  }

  /**
   * Detect error patterns and anomalies
   */
  detectErrorPatterns(errorInfo) {
    const pattern = `${errorInfo.type}:${errorInfo.message?.substring(0, 50)}`;

    if (this.errorPatterns.has(pattern)) {
      const count = this.errorPatterns.get(pattern) + 1;
      this.errorPatterns.set(pattern, count);

      // Alert for repeated errors
      if (count > 5) {
        console.warn(
          `🚨 Repeated error pattern detected (${count}x):`,
          pattern,
        );
      }
    } else {
      this.errorPatterns.set(pattern, 1);
    }
  }

  /**
   * Create monitoring panel UI
   */
  createMonitoringPanel() {
    // Only show in development or when debug flag is set
    if (!this.shouldShowPanel()) return;

    const panel = document.createElement("div");
    panel.id = "error-analytics-panel";
    panel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 300px;
      max-height: 400px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 15px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      z-index: 10000;
      overflow-y: auto;
      display: none;
    `;

    // Add toggle button
    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = "📊 Errors";
    toggleBtn.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: #ff4444;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      z-index: 10001;
      font-size: 12px;
    `;

    toggleBtn.onclick = () => {
      const isVisible = panel.style.display !== "none";
      panel.style.display = isVisible ? "none" : "block";
      toggleBtn.style.top = isVisible ? "10px" : "420px";
    };

    document.body.appendChild(panel);
    document.body.appendChild(toggleBtn);

    this.panel = panel;
    this.toggleBtn = toggleBtn;
  }

  /**
   * Update dashboard display
   */
  updateDashboard() {
    if (!this.panel) return;

    const errorRate = (
      (this.errorCounts.total / (Date.now() - this.startTime || 1)) *
      1000
    ).toFixed(2);

    this.panel.innerHTML = `
      <h3>📊 Error Analytics Dashboard</h3>
      <div><strong>Total Errors:</strong> ${this.errorCounts.total}</div>
      <div><strong>Error Rate:</strong> ${errorRate}/sec</div>
      
      <h4>By Type:</h4>
      ${Object.entries(this.errorCounts.byType)
        .sort((a, b) => b[1] - a[1])
        .map(([type, count]) => `<div>${type}: ${count}</div>`)
        .join("")}
      
      <h4>By Source:</h4>
      ${Object.entries(this.errorCounts.byComponent)
        .sort((a, b) => b[1] - a[1])
        .map(([source, count]) => `<div>${source}: ${count}</div>`)
        .join("")}
      
      <h4>Top Error Patterns:</h4>
      ${Array.from(this.errorPatterns.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([pattern, count]) => `<div>${count}x: ${pattern}</div>`)
        .join("")}
      
      <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #666;">
        <small>Dashboard active since page load</small>
      </div>
    `;

    // Update button color based on error count
    if (this.toggleBtn) {
      const severity =
        this.errorCounts.total > 10
          ? "#ff0000"
          : this.errorCounts.total > 5
            ? "#ff8800"
            : "#ff4444";
      this.toggleBtn.style.background = severity;
      this.toggleBtn.textContent = `📊 Errors (${this.errorCounts.total})`;
    }
  }

  /**
   * Check if panel should be shown
   */
  shouldShowPanel() {
    return (
      window.location.hostname === "localhost" ||
      localStorage.getItem("debug") === "true" ||
      window.location.search.includes("debug=true")
    );
  }

  /**
   * Generate error report
   */
  generateReport() {
    return {
      summary: {
        totalErrors: this.errorCounts.total,
        errorRate:
          (this.errorCounts.total / (Date.now() - this.startTime || 1)) * 1000,
        criticalErrors: this.errorCounts.critical,
        filteredErrors: this.errorCounts.filtered,
      },
      breakdown: {
        byType: this.errorCounts.byType,
        byComponent: this.errorCounts.byComponent,
        byTimeOfDay: this.errorCounts.byTimeOfDay,
      },
      patterns: Object.fromEntries(this.errorPatterns),
      recommendations: this.generateRecommendations(),
    };
  }

  /**
   * Generate recommendations based on error patterns
   */
  generateRecommendations() {
    const recommendations = [];

    if (this.errorCounts.total > 50) {
      recommendations.push(
        "High error count detected - consider implementing error filtering",
      );
    }

    if (this.errorCounts.byType["Storage Error"] > 10) {
      recommendations.push(
        "Multiple storage errors - check localStorage quota and permissions",
      );
    }

    if (this.errorCounts.byType["JavaScript Error"] > 20) {
      recommendations.push(
        "High JavaScript error count - review code for common issues",
      );
    }

    // Check for repeated patterns
    const repeatedPatterns = Array.from(this.errorPatterns.entries()).filter(
      ([, count]) => count > 5,
    ).length;

    if (repeatedPatterns > 3) {
      recommendations.push(
        "Multiple repeated error patterns - implement specific fixes for common issues",
      );
    }

    return recommendations;
  }
}

// Initialize dashboard if in development or debug mode
if (
  window.location.hostname === "localhost" ||
  localStorage.getItem("debug") === "true"
) {
  window.errorAnalyticsDashboard = new ErrorAnalyticsDashboard();
}

export default ErrorAnalyticsDashboard;
