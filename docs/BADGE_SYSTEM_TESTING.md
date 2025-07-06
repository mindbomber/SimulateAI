# 🏆 Badge System Testing Guide

## How to Test the Badge System

### Prerequisites
- Development server running (`npm run dev`)
- Browser with DevTools open (for debugging)

### Testing Scenario Completion and Badge Awards

#### Method 1: Complete Scenarios Normally
1. Navigate to any category (e.g., "The Trolley Problem")
2. Launch a scenario by clicking "Launch Simulation"
3. Complete the scenario by making choices
4. **Expected Result**: 
   - Progress saves
   - If this is your 1st, 3rd, or 6th completion in the category: Badge confetti + modal appears

#### Method 2: Test from Main Page
1. Stay on the main page (index.html)
2. Click any scenario card
3. Complete the scenario
4. **Expected Result**: Badge modal says "Back to Scenarios" (returns to main page)

#### Method 3: Test from Category Page  
1. Go to a category page (category.html)
2. Click any scenario card
3. Complete the scenario
4. **Expected Result**: Badge modal says "Back to Category" (returns to category page)

#### Method 4: Developer Testing (Browser Console)
```javascript
// Import badge system for testing
import badgeManager from './src/js/core/badge-manager.js';
import badgeModal from './src/js/components/badge-modal.js';
import { getBadgeConfig } from './src/js/data/badge-config.js';

// Test badge modal directly
const testBadge = getBadgeConfig('trolley-problem', 1);
testBadge.timestamp = Date.now();
badgeModal.showBadgeModal(testBadge, 'main');

// Check badge progress
console.log(badgeManager.getAllBadgeStates());

// Reset progress for testing
badgeManager.resetBadgeProgress();
```

### Expected Badge Tiers

#### All Categories (10 total)
Each category has 3 badge tiers:

**Tier 1**: 1 scenario completed
- Glow: Blue (low intensity)
- Examples: "Ethics Explorer", "Mystery Seeker", "Balance Finder"

**Tier 2**: 3 scenarios completed  
- Glow: Red (medium intensity with pulse)
- Examples: "Junction Strategist", "Algorithm Investigator", "Oversight Guardian"

**Tier 3**: 6 scenarios completed
- Glow: Gold (high intensity with shimmer)
- Examples: "Consequence Architect", "Transparency Champion", "Harmony Architect"

### Badge Visual Elements

#### Confetti System
- **Burst 1**: 25 category emoji particles
- **Burst 2**: 15 smaller particles (500ms delay)
- **Burst 3**: 20 particles for Tier 3 badges (1000ms delay)

#### Badge Composition
- **🛡️ Shield**: Base frame
- **Category Emoji**: Primary identifier (🚃, ⚖️, 📦, etc.)
- **Sidekick Emoji**: Achievement symbol (⚖️, 🚂, 🧠, etc.)
- **Glow Effect**: Tier-based intensity

#### Animation Sequence
1. Confetti celebration (3 seconds)
2. Modal scale entrance (600ms)
3. Shield scale bounce (800ms)
4. Sidekick emoji spin entrance (1200ms)
5. Text reveals with stagger (150ms intervals)

### Troubleshooting

#### Badge Not Appearing
- Check browser console for errors
- Verify localStorage has scenario completion data
- Ensure badge CSS is loaded (check Network tab)

#### Multiple Badges
- System displays badges with 2-second delays between each
- All earned badges from a single completion will show

#### Progress Issues
- Badge system syncs with existing `simulateai_category_progress` localStorage
- Clear localStorage to reset progress: `localStorage.clear()`

### Testing Checklist

- [ ] Badge appears after 1st scenario completion
- [ ] Badge appears after 3rd scenario completion  
- [ ] Badge appears after 6th scenario completion
- [ ] Confetti animation plays correctly
- [ ] Modal animations are smooth
- [ ] "Back to Scenarios" button works
- [ ] Context awareness (main vs category page)
- [ ] Multiple badges display with delays
- [ ] Mobile responsiveness
- [ ] Accessibility (keyboard navigation, reduced motion)

### Analytics Events

Badge system tracks these events:
- `badge_earned`: When a badge is unlocked
- `badge_modal_viewed`: When modal is displayed
- `scenario_completed`: Enhanced with badge context

Check browser DevTools → Network tab for analytics calls.
