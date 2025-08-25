/**
 * Network Status Monitor
 * Provides user-friendly feedback for network connectivity issues
 */

class NetworkStatusMonitor {
  constructor() {
    this.isOnline = navigator.onLine;
    this.container = null;
    this.isVisible = false;
    this.checkInterval = null;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.lastErrorContext = null;

    this.initializeNetworkListeners();
  }

  /**
   * Initialize network event listeners
   */
  initializeNetworkListeners() {
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.handleNetworkChange("online");
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
      this.handleNetworkChange("offline");
    });
  }

  /**
   * Handle network status changes
   */
  handleNetworkChange(status) {
    if (status === "online") {
      this.showReconnectedMessage();
      this.hide();
      this.retryCount = 0;
    } else {
      this.showOfflineStatus();
    }
  }

  /**
   * Show network error status
   */
  showNetworkError(context = "general", errorDetails = null) {
    this.lastErrorContext = context;
    this.createContainer();
    this.updateContent(context, errorDetails);
    this.startConnectivityCheck();
    this.isVisible = true;
  }

  /**
   * Show offline status
   */
  showOfflineStatus() {
    this.showNetworkError("offline", {
      title: "No Internet Connection",
      message: "Please check your network connection and try again.",
      canRetry: false,
    });
  }

  /**
   * Hide network status
   */
  hide() {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }

    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    this.isVisible = false;
  }

  /**
   * Create the status container
   */
  createContainer() {
    if (this.container) {
      return;
    }

    this.container = document.createElement("div");
    this.container.className = "network-status-monitor";
    this.container.innerHTML = `
      <div class="network-status-content">
        <div class="network-status-icon">🌐</div>
        <div class="network-status-message">
          <h4 class="network-status-title">Connection Issue</h4>
          <p class="network-status-description"></p>
          <div class="network-status-actions">
            <button class="network-retry-btn" type="button">Try Again</button>
            <button class="network-close-btn" type="button">Close</button>
          </div>
        </div>
      </div>
      <div class="network-status-details">
        <div class="network-troubleshooting">
          <h5>Troubleshooting Tips:</h5>
          <ul class="troubleshooting-list">
            <li>Check your internet connection</li>
            <li>Try refreshing the page</li>
            <li>Disable VPN if you're using one</li>
            <li>Check if other websites work</li>
          </ul>
        </div>
      </div>
    `;

    // Add event listeners
    const retryBtn = this.container.querySelector(".network-retry-btn");
    const closeBtn = this.container.querySelector(".network-close-btn");

    retryBtn.addEventListener("click", () => this.retryConnection());
    closeBtn.addEventListener("click", () => this.hide());

    // Insert into DOM
    const targetContainer =
      document.querySelector(".auth-modal") ||
      document.querySelector(".modal-content") ||
      document.body;

    targetContainer.appendChild(this.container);
  }

  /**
   * Update the content with current network info
   */
  updateContent(context, errorDetails) {
    if (!this.container) return;

    const icon = this.container.querySelector(".network-status-icon");
    const title = this.container.querySelector(".network-status-title");
    const description = this.container.querySelector(
      ".network-status-description",
    );
    const retryBtn = this.container.querySelector(".network-retry-btn");

    // Update based on context
    switch (context) {
      case "offline":
        icon.textContent = "📵";
        title.textContent = "No Internet Connection";
        description.textContent =
          "You appear to be offline. Please check your connection.";
        retryBtn.style.display = "none";
        break;

      case "auth_network_error":
        icon.textContent = "🔐";
        title.textContent = "Authentication Network Error";
        description.textContent =
          "Unable to connect to authentication servers. This may be temporary.";
        retryBtn.style.display = "inline-block";
        break;

      case "firebase_network_error":
        icon.textContent = "☁️";
        title.textContent = "Service Connection Issue";
        description.textContent =
          "Having trouble connecting to our servers. Please try again.";
        retryBtn.style.display = "inline-block";
        break;

      case "timeout":
        icon.textContent = "⏱️";
        title.textContent = "Request Timeout";
        description.textContent =
          "The request took too long. Your connection may be slow.";
        retryBtn.style.display = "inline-block";
        break;

      default:
        icon.textContent = "🌐";
        title.textContent = errorDetails?.title || "Network Error";
        description.textContent =
          errorDetails?.message ||
          "A network error occurred. Please try again.";
        retryBtn.style.display =
          errorDetails?.canRetry !== false ? "inline-block" : "none";
    }

    // Update retry button text based on retry count
    if (this.retryCount > 0) {
      retryBtn.textContent = `Try Again (${this.retryCount}/${this.maxRetries})`;
    } else {
      retryBtn.textContent = "Try Again";
    }

    // Disable retry if max attempts reached
    if (this.retryCount >= this.maxRetries) {
      retryBtn.disabled = true;
      retryBtn.textContent = "Max Retries Reached";
    }
  }

  /**
   * Retry connection
   */
  async retryConnection() {
    if (this.retryCount >= this.maxRetries) {
      return;
    }

    this.retryCount++;

    const retryBtn = this.container?.querySelector(".network-retry-btn");
    if (retryBtn) {
      retryBtn.disabled = true;
      retryBtn.textContent = "Testing Connection...";
    }

    // Test network connectivity
    const isConnected = await this.testConnectivity();

    if (isConnected) {
      this.showReconnectedMessage();
      this.hide();
      this.retryCount = 0;

      // Trigger page refresh or retry last action
      this.notifyReconnection();
    } else {
      // Update UI with retry count
      this.updateContent(this.lastErrorContext);

      if (retryBtn) {
        retryBtn.disabled = false;
      }
    }
  }

  /**
   * Test network connectivity
   */
  async testConnectivity() {
    try {
      // Test with a simple fetch to a reliable endpoint
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch("https://www.google.com/favicon.ico", {
        method: "HEAD",
        signal: controller.signal,
        cache: "no-cache",
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Start periodic connectivity checks
   */
  startConnectivityCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(async () => {
      if (navigator.onLine) {
        const isConnected = await this.testConnectivity();
        if (isConnected) {
          this.handleNetworkChange("online");
        }
      }
    }, 10000); // Check every 10 seconds
  }

  /**
   * Show reconnection success message
   */
  showReconnectedMessage() {
    const message = document.createElement("div");
    message.className = "network-reconnected-message";
    message.innerHTML = `
      <div class="network-reconnected-content">
        <span class="network-reconnected-icon">✅</span>
        <span>Connection restored!</span>
      </div>
    `;

    document.body.appendChild(message);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (message.parentNode) {
        message.remove();
      }
    }, 3000);
  }

  /**
   * Notify other components about reconnection
   */
  notifyReconnection() {
    // Dispatch custom event for other components to listen to
    window.dispatchEvent(
      new CustomEvent("networkReconnected", {
        detail: { timestamp: Date.now() },
      }),
    );
  }

  /**
   * Static method to handle network errors in other components
   */
  static handleNetworkError(error, context = "general") {
    if (!window.networkStatusMonitor) {
      window.networkStatusMonitor = new NetworkStatusMonitor();
    }

    // Check if it's a network-related error
    const isNetworkError =
      !navigator.onLine ||
      error?.code === "auth/network-request-failed" ||
      error?.message?.includes("network") ||
      error?.message?.includes("fetch") ||
      error?.message?.includes("NetworkError") ||
      error?.name === "NetworkError";

    if (isNetworkError) {
      window.networkStatusMonitor.showNetworkError(context, {
        title: "Network Connection Problem",
        message:
          "Unable to connect to the server. Please check your internet connection.",
        canRetry: true,
      });
      return true; // Indicates error was handled
    }

    return false; // Not a network error
  }
}

// CSS styles for the network status monitor
const networkStatusCSS = `
.network-status-monitor {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10001;
  max-width: 500px;
  width: 90%;
  background: #fff;
  border: 2px solid #ff6b6b;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  animation: networkSlideIn 0.3s ease-out;
}

@keyframes networkSlideIn {
  from {
    transform: translate(-50%, -50%) scale(0.9);
    opacity: 0;
  }
  to {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}

.network-status-content {
  display: flex;
  align-items: flex-start;
  padding: 20px;
  gap: 16px;
}

.network-status-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.network-status-message {
  flex: 1;
  min-width: 0;
}

.network-status-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #d73027;
}

.network-status-description {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.network-status-actions {
  display: flex;
  gap: 12px;
}

.network-retry-btn,
.network-close-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.network-retry-btn {
  background: #4caf50;
  color: white;
}

.network-retry-btn:hover:not(:disabled) {
  background: #45a049;
}

.network-retry-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.network-close-btn {
  background: #f5f5f5;
  color: #666;
}

.network-close-btn:hover {
  background: #e0e0e0;
}

.network-status-details {
  border-top: 1px solid #eee;
  padding: 16px 20px;
  background: #f9f9f9;
}

.network-troubleshooting h5 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.troubleshooting-list {
  margin: 0;
  padding-left: 16px;
  font-size: 13px;
  color: #666;
}

.troubleshooting-list li {
  margin-bottom: 4px;
}

.network-reconnected-message {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 10002;
  background: #e8f5e8;
  border: 2px solid #4caf50;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: networkSlideUp 0.3s ease-out;
}

@keyframes networkSlideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.network-reconnected-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #2e7d32;
}

.network-reconnected-icon {
  font-size: 16px;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .network-status-monitor {
    width: 95%;
    max-width: none;
  }
  
  .network-status-content {
    padding: 16px;
  }
  
  .network-status-actions {
    flex-direction: column;
  }
  
  .network-retry-btn,
  .network-close-btn {
    width: 100%;
  }
}
`;

// Inject CSS styles
if (!document.querySelector("#network-status-styles")) {
  const style = document.createElement("style");
  style.id = "network-status-styles";
  style.textContent = networkStatusCSS;
  document.head.appendChild(style);
}

// Export for use in other modules
export default NetworkStatusMonitor;
