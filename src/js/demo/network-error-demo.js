/**
 * Network Error Handling Demo
 * Demonstrates graceful handling of auth/network-request-failed errors
 */

// Demo script to test network error handling
class NetworkErrorDemo {
  constructor() {
    this.authService = null;
    this.firebaseService = null;
  }

  /**
   * Initialize the demo
   */
  async initialize() {
    // Wait for services to be available
    await this.waitForServices();
    this.setupDemoButtons();
    this.setupNetworkListeners();
  }

  /**
   * Wait for auth and firebase services to be available
   */
  async waitForServices() {
    const maxWait = 10000; // 10 seconds
    const startTime = Date.now();

    while (Date.now() - startTime < maxWait) {
      if (window.authService && window.firebaseService) {
        this.authService = window.authService;
        this.firebaseService = window.firebaseService;
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (!this.authService || !this.firebaseService) {
      console.warn('⚠️ Demo: Services not available');
    }
  }

  /**
   * Setup demo buttons
   */
  setupDemoButtons() {
    const demoContainer = document.createElement('div');
    demoContainer.id = 'network-error-demo';
    demoContainer.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      z-index: 9999;
      background: #f0f0f0;
      border: 1px solid #ccc;
      border-radius: 8px;
      padding: 16px;
      max-width: 300px;
      font-size: 12px;
      display: none;
    `;

    demoContainer.innerHTML = `
      <h4 style="margin: 0 0 12px 0;">Network Error Demo</h4>
      <button id="simulate-offline" style="margin: 4px; padding: 8px 12px; font-size: 11px;">
        Simulate Offline
      </button>
      <button id="simulate-network-error" style="margin: 4px; padding: 8px 12px; font-size: 11px;">
        Simulate Network Error
      </button>
      <button id="simulate-timeout" style="margin: 4px; padding: 8px 12px; font-size: 11px;">
        Simulate Timeout
      </button>
      <button id="test-connectivity" style="margin: 4px; padding: 8px 12px; font-size: 11px;">
        Test Connectivity
      </button>
      <button id="hide-demo" style="margin: 4px; padding: 8px 12px; font-size: 11px; background: #ff6b6b; color: white;">
        Hide Demo
      </button>
    `;

    document.body.appendChild(demoContainer);

    // Show demo in development mode only
    if (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'
    ) {
      demoContainer.style.display = 'block';
    }

    // Add event listeners
    document
      .getElementById('simulate-offline')
      .addEventListener('click', () => {
        this.simulateOffline();
      });

    document
      .getElementById('simulate-network-error')
      .addEventListener('click', () => {
        this.simulateNetworkError();
      });

    document
      .getElementById('simulate-timeout')
      .addEventListener('click', () => {
        this.simulateTimeout();
      });

    document
      .getElementById('test-connectivity')
      .addEventListener('click', () => {
        this.testConnectivity();
      });

    document.getElementById('hide-demo').addEventListener('click', () => {
      demoContainer.style.display = 'none';
    });
  }

  /**
   * Setup network event listeners for demonstration
   */
  setupNetworkListeners() {
    // Listen for network reconnection events
    window.addEventListener('networkReconnected', event => {
      console.log(
        '🌐 Demo: Network reconnected at',
        new Date(event.detail.timestamp)
      );
    });

    // Monitor online/offline status
    window.addEventListener('online', () => {
      console.log('🌐 Demo: Browser reports online');
    });

    window.addEventListener('offline', () => {
      console.log('🌐 Demo: Browser reports offline');
    });
  }

  /**
   * Simulate offline condition
   */
  simulateOffline() {
    console.log('🔄 Demo: Simulating offline condition');

    // Create a mock network error
    const mockError = new Error('NetworkError: Network request failed');
    mockError.code = 'auth/network-request-failed';

    // Trigger network status monitor
    if (window.NetworkStatusMonitor) {
      window.NetworkStatusMonitor.handleNetworkError(mockError, 'demo_offline');
    }
  }

  /**
   * Simulate network authentication error
   */
  simulateNetworkError() {
    console.log('🔄 Demo: Simulating auth network error');

    // Create a mock Firebase auth network error
    const mockError = new Error(
      'Firebase: Error (auth/network-request-failed)'
    );
    mockError.code = 'auth/network-request-failed';

    // Show how Firebase service handles it
    if (this.firebaseService) {
      const result =
        this.firebaseService.getHumanReadableErrorMessage(mockError);
      console.log('🔄 Demo: Firebase error message:', result);
    }

    // Trigger network status monitor
    if (window.NetworkStatusMonitor) {
      window.NetworkStatusMonitor.handleNetworkError(
        mockError,
        'auth_network_error'
      );
    }
  }

  /**
   * Simulate timeout error
   */
  simulateTimeout() {
    console.log('🔄 Demo: Simulating timeout error');

    // Create a mock timeout error
    const mockError = new Error('Request timeout');
    mockError.code = 'auth/timeout';

    // Trigger network status monitor
    if (window.NetworkStatusMonitor) {
      window.NetworkStatusMonitor.handleNetworkError(mockError, 'timeout');
    }
  }

  /**
   * Test actual connectivity
   */
  async testConnectivity() {
    console.log('🔄 Demo: Testing actual connectivity');

    if (window.networkStatusMonitor) {
      const isConnected = await window.networkStatusMonitor.testConnectivity();
      console.log(
        '🌐 Demo: Connectivity test result:',
        isConnected ? '✅ Connected' : '❌ Not connected'
      );

      if (!isConnected) {
        window.networkStatusMonitor.showNetworkError('connectivity_test', {
          title: 'Connectivity Test Failed',
          message: 'Unable to reach external servers.',
          canRetry: true,
        });
      }
    } else {
      console.log('⚠️ Demo: Network status monitor not available');
    }
  }

  /**
   * Demonstrate error message mapping
   */
  demonstrateErrorMessages() {
    const testErrors = [
      {
        code: 'auth/network-request-failed',
        message: 'Network request failed',
      },
      { code: 'auth/timeout', message: 'Request timeout' },
      { code: 'auth/too-many-requests', message: 'Too many requests' },
      { code: 'auth/user-not-found', message: 'User not found' },
      { code: 'auth/wrong-password', message: 'Wrong password' },
      { message: 'NetworkError: fetch failed' },
      { message: 'ERR_NETWORK_FAILED' },
    ];

    console.log('🔄 Demo: Error message mapping:');

    testErrors.forEach(errorData => {
      const mockError = new Error(errorData.message || 'Unknown error');
      if (errorData.code) {
        mockError.code = errorData.code;
      }

      if (this.firebaseService) {
        const humanMessage =
          this.firebaseService.getHumanReadableErrorMessage(mockError);
        console.log(`  ${errorData.code || 'generic'}: "${humanMessage}"`);
      }
    });
  }
}

// Initialize demo when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.networkErrorDemo = new NetworkErrorDemo();
    window.networkErrorDemo.initialize();
  });
} else {
  window.networkErrorDemo = new NetworkErrorDemo();
  window.networkErrorDemo.initialize();
}

// Export for manual testing
window.NetworkErrorDemo = NetworkErrorDemo;
