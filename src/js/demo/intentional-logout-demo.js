/**
 * Intentional Logout Demo
 * Demonstrates the intentional logout system with various scenarios
 */

class IntentionalLogoutDemo {
  constructor() {
    this.authService = null;
    this.demoContainer = null;
    this.setupDemo();
  }

  /**
   * Setup the demo interface
   */
  setupDemo() {
    // Wait for auth service to be available
    this.waitForAuthService().then(() => {
      this.createDemoInterface();
    });
  }

  /**
   * Wait for auth service to be available
   */
  async waitForAuthService() {
    const maxWait = 10000; // 10 seconds
    const startTime = Date.now();

    while (Date.now() - startTime < maxWait) {
      if (window.authService) {
        this.authService = window.authService;
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * Create demo interface
   */
  createDemoInterface() {
    // Only show in development mode
    if (
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      return;
    }

    this.demoContainer = document.createElement('div');
    this.demoContainer.id = 'intentional-logout-demo';
    this.demoContainer.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      z-index: 9998;
      background: #f8f9fa;
      border: 2px solid #007bff;
      border-radius: 8px;
      padding: 16px;
      max-width: 320px;
      font-size: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;

    this.demoContainer.innerHTML = `
      <div style="margin-bottom: 12px;">
        <h4 style="margin: 0 0 8px 0; color: #007bff;">🚪 Intentional Logout Demo</h4>
        <p style="margin: 0; color: #666; font-size: 11px;">Test different logout scenarios</p>
      </div>
      
      <div style="display: grid; gap: 6px;">
        <button id="demo-inactivity" style="padding: 6px 8px; font-size: 11px; border: 1px solid #28a745; background: #28a745; color: white; border-radius: 4px; cursor: pointer;">
          😴 Inactivity Logout
        </button>
        
        <button id="demo-role-change" style="padding: 6px 8px; font-size: 11px; border: 1px solid #17a2b8; background: #17a2b8; color: white; border-radius: 4px; cursor: pointer;">
          🔄 Role Change Logout
        </button>
        
        <button id="demo-security" style="padding: 6px 8px; font-size: 11px; border: 1px solid #dc3545; background: #dc3545; color: white; border-radius: 4px; cursor: pointer;">
          🔒 Security Logout
        </button>
        
        <button id="demo-admin" style="padding: 6px 8px; font-size: 11px; border: 1px solid #6f42c1; background: #6f42c1; color: white; border-radius: 4px; cursor: pointer;">
          👨‍💼 Admin Logout
        </button>
        
        <button id="demo-maintenance" style="padding: 6px 8px; font-size: 11px; border: 1px solid #fd7e14; background: #fd7e14; color: white; border-radius: 4px; cursor: pointer;">
          🔧 Maintenance Logout
        </button>
        
        <button id="demo-token-expired" style="padding: 6px 8px; font-size: 11px; border: 1px solid #e83e8c; background: #e83e8c; color: white; border-radius: 4px; cursor: pointer;">
          🕒 Token Expired
        </button>
        
        <button id="demo-too-many-devices" style="padding: 6px 8px; font-size: 11px; border: 1px solid #20c997; background: #20c997; color: white; border-radius: 4px; cursor: pointer;">
          📱 Too Many Devices
        </button>
        
        <button id="demo-inactivity-warning" style="padding: 6px 8px; font-size: 11px; border: 1px solid #ffc107; background: #ffc107; color: #212529; border-radius: 4px; cursor: pointer;">
          ⚠️ Inactivity Warning
        </button>
        
        <hr style="margin: 8px 0; border: none; border-top: 1px solid #dee2e6;">
        
        <button id="demo-hide" style="padding: 6px 8px; font-size: 11px; border: 1px solid #6c757d; background: #6c757d; color: white; border-radius: 4px; cursor: pointer;">
          ✖️ Hide Demo
        </button>
      </div>
    `;

    document.body.appendChild(this.demoContainer);
    this.attachEventListeners();
  }

  /**
   * Attach event listeners to demo buttons
   */
  attachEventListeners() {
    // Inactivity logout
    document.getElementById('demo-inactivity').addEventListener('click', () => {
      this.demoInactivityLogout();
    });

    // Role change logout
    document
      .getElementById('demo-role-change')
      .addEventListener('click', () => {
        this.demoRoleChangeLogout();
      });

    // Security logout
    document.getElementById('demo-security').addEventListener('click', () => {
      this.demoSecurityLogout();
    });

    // Admin logout
    document.getElementById('demo-admin').addEventListener('click', () => {
      this.demoAdminLogout();
    });

    // Maintenance logout
    document
      .getElementById('demo-maintenance')
      .addEventListener('click', () => {
        this.demoMaintenanceLogout();
      });

    // Token expired logout
    document
      .getElementById('demo-token-expired')
      .addEventListener('click', () => {
        this.demoTokenExpiredLogout();
      });

    // Too many devices logout
    document
      .getElementById('demo-too-many-devices')
      .addEventListener('click', () => {
        this.demoTooManyDevicesLogout();
      });

    // Inactivity warning
    document
      .getElementById('demo-inactivity-warning')
      .addEventListener('click', () => {
        this.demoInactivityWarning();
      });

    // Hide demo
    document.getElementById('demo-hide').addEventListener('click', () => {
      this.hideDemo();
    });
  }

  /**
   * Demo inactivity logout
   */
  async demoInactivityLogout() {
    if (!this.authService || !this.authService.currentUser) {
      alert('Please sign in first to test logout scenarios');
      return;
    }

    await this.authService.logoutForInactivity(30);
  }

  /**
   * Demo role change logout
   */
  async demoRoleChangeLogout() {
    if (!this.authService || !this.authService.currentUser) {
      alert('Please sign in first to test logout scenarios');
      return;
    }

    await this.authService.logoutForRoleChange('administrator', 'student');
  }

  /**
   * Demo security logout
   */
  async demoSecurityLogout() {
    if (!this.authService || !this.authService.currentUser) {
      alert('Please sign in first to test logout scenarios');
      return;
    }

    await this.authService.logoutForSecurity('Unusual login location detected');
  }

  /**
   * Demo admin logout
   */
  async demoAdminLogout() {
    if (!this.authService || !this.authService.currentUser) {
      alert('Please sign in first to test logout scenarios');
      return;
    }

    await this.authService.logoutByAdmin(
      'System Administrator',
      'Account review required'
    );
  }

  /**
   * Demo maintenance logout
   */
  async demoMaintenanceLogout() {
    if (!this.authService || !this.authService.currentUser) {
      alert('Please sign in first to test logout scenarios');
      return;
    }

    await this.authService.logoutForMaintenance('2:00 AM - 4:00 AM EST');
  }

  /**
   * Demo token expired logout
   */
  async demoTokenExpiredLogout() {
    if (!this.authService || !this.authService.currentUser) {
      alert('Please sign in first to test logout scenarios');
      return;
    }

    await this.authService.logoutForTokenExpiration();
  }

  /**
   * Demo too many devices logout
   */
  async demoTooManyDevicesLogout() {
    if (!this.authService || !this.authService.currentUser) {
      alert('Please sign in first to test logout scenarios');
      return;
    }

    await this.authService.logoutForTooManyDevices(3, 4);
  }

  /**
   * Demo inactivity warning
   */
  demoInactivityWarning() {
    if (window.intentionalLogoutManager) {
      window.intentionalLogoutManager.showInactivityWarning();
    } else {
      alert('Intentional logout manager not available');
    }
  }

  /**
   * Hide demo interface
   */
  hideDemo() {
    if (this.demoContainer) {
      this.demoContainer.style.display = 'none';
    }
  }

  /**
   * Show demo interface
   */
  showDemo() {
    if (this.demoContainer) {
      this.demoContainer.style.display = 'block';
    }
  }

  /**
   * Test logout condition checking
   */
  async testLogoutConditions() {
    if (this.authService) {
      const shouldLogout = await this.authService.checkLogoutConditions();
      console.log('Logout condition check result:', shouldLogout);
    }
  }
}

// Auto-initialize demo when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.intentionalLogoutDemo = new IntentionalLogoutDemo();
  });
} else {
  window.intentionalLogoutDemo = new IntentionalLogoutDemo();
}

// Keyboard shortcut to toggle demo (Ctrl+Shift+L)
document.addEventListener('keydown', event => {
  if (event.ctrlKey && event.shiftKey && event.key === 'L') {
    if (window.intentionalLogoutDemo) {
      const demo = window.intentionalLogoutDemo.demoContainer;
      if (demo) {
        demo.style.display = demo.style.display === 'none' ? 'block' : 'none';
      }
    }
  }
});

// Export for manual testing
window.IntentionalLogoutDemo = IntentionalLogoutDemo;
