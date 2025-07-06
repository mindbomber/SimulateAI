/**
 * Badge System Test
 * 
 * Quick test to verify badge configuration and manager functionality
 * This file can be removed after testing
 */

import badgeManager from '../core/badge-manager.js';
import { getBadgeConfig, getCategoryBadges } from '../data/badge-config.js';

// Test badge configuration
console.log('🧪 Testing Badge Configuration...');

// Test getting badge config for trolley problem tier 1
const trolleyBadge = getBadgeConfig('trolley-problem', 1);
console.log('Trolley Problem Tier 1:', trolleyBadge);

// Test getting all badges for a category
const allTrolleyBadges = getCategoryBadges('trolley-problem');
console.log('All Trolley Problem Badges:', allTrolleyBadges);

// Test badge manager initialization
console.log('🔧 Testing Badge Manager...');

// Simulate scenario completion
const newBadges = badgeManager.updateScenarioCompletion('trolley-problem', 'test-scenario');
console.log('New badges earned:', newBadges);

// Check badge progress
const progress = badgeManager.getBadgeProgress('trolley-problem');
console.log('Badge progress:', progress);

console.log('✅ Badge system test complete!');
