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
 * Donation Tracking Utility
 * Helper functions for managing donor status
 */

// Constants
const NOTIFICATION_DURATION = 5000;

class DonationTracker {
  static setDonorStatus(isDonor) {
    if (window.settingsManager) {
      window.settingsManager.setDonorStatus(isDonor);
    }
  }

  static getDonorStatus() {
    if (window.settingsManager) {
      return window.settingsManager.isDonor;
    }
    return false;
  }

  static simulateDonation() {
    // For testing purposes - simulate a donation
    this.setDonorStatus(true);

    // Show confirmation
    const notification = document.createElement("div");
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        font-family: var(--font-family);
      ">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span>💎</span>
          <span>Thank you for your donation! You now have donor privileges.</span>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, NOTIFICATION_DURATION);
  }

  static resetDonorStatus() {
    // For testing purposes - reset donor status
    this.setDonorStatus(false);

    // Show confirmation
    const notification = document.createElement("div");
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #FF9800;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        font-family: var(--font-family);
      ">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span>🔄</span>
          <span>Donor status has been reset.</span>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, NOTIFICATION_DURATION);
  }
}

// Make it available globally for testing
window.DonationTracker = DonationTracker;

export default DonationTracker;
