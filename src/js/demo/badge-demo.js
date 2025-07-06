/**
 * Badge Modal Demo/Test
 * 
 * Example usage of the badge modal system
 * This file can be used for testing and demonstration
 */

import badgeModal from '../components/badge-modal.js';
import { getBadgeConfig } from '../data/badge-config.js';

// Example: Show a Tier 1 Trolley Problem badge
function testBadgeModal() {
  const badgeConfig = getBadgeConfig('trolley-problem', 1);
  
  if (badgeConfig) {
    // Add timestamp (normally from badge manager)
    badgeConfig.timestamp = Date.now();
    
    // Show the badge modal
    badgeModal.showBadgeModal(badgeConfig, 'main');
  }
}

// Example: Show different tier badges
function testAllTiers() {
  const categories = ['trolley-problem', 'ai-black-box', 'bias-fairness'];
  const tiers = [1, 2, 3];
  
  let delay = 0;
  
  categories.forEach(categoryId => {
    tiers.forEach(tier => {
      setTimeout(() => {
        const badgeConfig = getBadgeConfig(categoryId, tier);
        if (badgeConfig) {
          badgeConfig.timestamp = Date.now();
          badgeModal.showBadgeModal(badgeConfig, 'category');
        }
      }, delay);
      delay += 4000; // 4 second intervals
    });
  });
}

// Add to window for console testing
if (typeof window !== 'undefined') {
  window.testBadgeModal = testBadgeModal;
  window.testAllTiers = testAllTiers;
}

export { testBadgeModal, testAllTiers };
