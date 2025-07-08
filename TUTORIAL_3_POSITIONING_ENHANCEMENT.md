# Tutorial 3 Coach Mark Positioning Enhancement

## Summary

Enhanced the onboarding tour to ensure that Tutorial 3 steps 3-8 always position their coach marks below the highlighted area for better user experience and accessibility.

## Changes Made

### 1. Added Constants
Added new constants to define the step range for forced bottom positioning:
- `TUTORIAL_3_BOTTOM_POSITION_START = 2` (0-indexed: step 3)
- `TUTORIAL_3_BOTTOM_POSITION_END = 7` (0-indexed: step 8)

### 2. Enhanced Positioning Logic
Modified the `positionCoachMark()` method to include special handling for Tutorial 3:

```javascript
// Special handling for Tutorial 3 steps 3-8: force bottom positioning
if (this.currentTutorial === this.LEARNING_LAB_TUTORIAL && 
    this.currentStep >= this.TUTORIAL_3_BOTTOM_POSITION_START && 
    this.currentStep <= this.TUTORIAL_3_BOTTOM_POSITION_END) {
  logger.info('OnboardingTour', `Forcing bottom position for Tutorial 3 step ${this.currentStep + 1}`);
  position = 'bottom';
}
```

This ensures that regardless of the original position parameter passed to the method, these specific steps will always use bottom positioning.

## Affected Steps

The following Tutorial 3 steps now force bottom positioning:
- Step 3 (currentStep = 2)
- Step 4 (currentStep = 3)
- Step 5 (currentStep = 4)
- Step 6 (currentStep = 5)
- Step 7 (currentStep = 6)
- Step 8 (currentStep = 7)

## Benefits

1. **Consistent UX**: All specified steps now have predictable coach mark placement
2. **Better Accessibility**: Coach marks appear below highlighted elements, making them easier to read
3. **Reduced Overlap**: Eliminates potential coach mark overlap with interactive elements
4. **Debug-Friendly**: Added logging to track when forced positioning is applied

## Technical Details

- The logic is inserted before the main positioning switch statement
- Uses existing constants to avoid magic numbers and maintain code quality
- Preserves all existing positioning logic for other tutorials and steps
- No breaking changes to the existing API

## Testing

The changes can be tested by:
1. Starting Tutorial 3 (Learning Lab)
2. Advancing to steps 3-8
3. Verifying that coach marks consistently appear below highlighted areas
4. Checking browser console for positioning log messages

## Files Modified

- `src/js/components/onboarding-tour.js`: Enhanced positioning logic and added constants
