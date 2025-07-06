# Confetti Timing Fix Implementation

## Problem
The badge system was displaying confetti immediately after scenario completion, while the scenario modal was still visible and closing. This created a poor user experience where confetti appeared behind or during the modal transition.

## Solution
Implemented a two-stage event system to separate immediate progress tracking from badge/confetti display:

### Changes Made

#### 1. Modified Scenario Modal (`src/js/components/scenario-modal.js`)
- Updated `confirmChoice()` method to use `closeAndWait()` instead of `close()`
- Added new `scenario-modal-closed` event that is dispatched AFTER the modal is fully closed
- Maintained existing `scenario-completed` event for immediate progress tracking

#### 2. Updated Category Page (`src/js/category-page.js`)
- Added listener for `scenario-modal-closed` event in `setupEventListeners()`
- Split `handleScenarioCompleted()` to only handle immediate progress tracking (no badges)
- Created new `handleScenarioModalClosed()` method specifically for badge checking
- Modified `updateProgress()` to accept `checkBadges` parameter (defaults to true for backward compatibility)

#### 3. Updated Category Grid (`src/js/components/category-grid.js`)
- Applied identical changes to category grid component
- Added listener for `scenario-modal-closed` event
- Split scenario completion handling between immediate progress and badge display
- Updated `updateProgress()` method with `checkBadges` parameter

### Event Flow (Before vs After)

#### Before (Immediate confetti):
1. User confirms choice in scenario modal
2. `scenario-completed` event dispatched
3. Badge system immediately checks and displays badges with confetti
4. Scenario modal starts closing (1 second delay)
5. Modal closes while confetti is already showing

#### After (Delayed confetti):
1. User confirms choice in scenario modal
2. `scenario-completed` event dispatched (immediate progress tracking only)
3. Scenario modal starts closing (1 second delay)
4. Modal fully closes using `closeAndWait()`
5. `scenario-modal-closed` event dispatched
6. Badge system checks and displays badges with confetti

### Technical Details

- Used existing `closeAndWait()` method which properly waits for animation completion
- Maintained backward compatibility by keeping existing events and method signatures
- Added optional `checkBadges` parameter to `updateProgress()` methods
- No breaking changes to existing functionality

### Testing
- Linter passes with no errors (only magic number warnings, which are acceptable)
- Development server runs without errors
- Both category page and main page scenarios should now show confetti only after modal is fully closed

## Files Modified
- `src/js/components/scenario-modal.js`
- `src/js/category-page.js` 
- `src/js/components/category-grid.js`

## Benefits
- Improved user experience with properly timed confetti animations
- Cleaner visual transitions
- Maintains all existing functionality while fixing timing issues
- Scalable approach that works for both single-category and multi-category views
