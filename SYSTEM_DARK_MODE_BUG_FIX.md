# System Dark Mode Preference Bug Fix

## Issue Description
A critical bug could occur when users have dark mode enabled as their default system setting on their laptop. The app was inconsistently handling the relationship between system preferences and saved user preferences.

## Root Cause
The application had two separate initialization paths that could conflict:

1. **`initializeTheme()`**: Set preferences based on system settings (like laptop dark mode)
2. **`setupAccessibility()`**: Applied saved user preferences from storage to DOM

### The Problem Scenario:
1. User has **system dark mode enabled** on laptop
2. User **previously disabled dark mode** in the app (saved to storage)
3. On page load:
   - `initializeTheme()` sets `this.preferences.darkMode = true` (from system)
   - `setupAccessibility()` applies saved preference (dark mode off) to DOM
   - **Result**: Inconsistent state - JS thinks dark mode is on, but DOM has it off

### Symptoms:
- Dark mode toggle button shows wrong state
- Theme switching behaves unpredictably  
- User preferences not respected
- System and user preferences conflict

## Solution
**Unified preference loading** that respects the proper priority:

1. **User preferences override system preferences** (if user made a choice)
2. **System preferences as fallback** (if user hasn't made a choice)
3. **Single source of truth** during initialization

### New Logic:
```javascript
// Get saved user preferences (they override system preferences)
const savedPreferences = userPreferences.getAccessibilitySettings();

// Use saved preferences if they exist, otherwise use system preferences
this.preferences = {
    darkMode: savedPreferences.darkMode !== undefined 
        ? savedPreferences.darkMode     // User choice wins
        : prefersDark,                  // System fallback
    // ... other preferences
};
```

## Benefits
1. **Respects User Choice**: If user disabled dark mode, it stays disabled regardless of system setting
2. **Smart Defaults**: New users get system preferences as starting point
3. **Consistent State**: JavaScript preferences match DOM state
4. **Predictable Behavior**: Toggle buttons work correctly
5. **Cross-Session Persistence**: User choices are remembered

## User Experience
- **First-time users**: Get their system preferences (dark mode laptop = dark mode app)
- **Returning users**: Get their saved preferences (overrides system)
- **Toggle behavior**: Always works correctly and saves properly
- **System changes**: Don't override user choices

## Technical Changes
1. **Modified `initializeTheme()`**: Now loads and merges saved preferences with system preferences
2. **Simplified `setupAccessibility()`**: No longer handles preference loading (avoids duplication)
3. **Priority system**: User preferences > System preferences > Defaults

## Testing Scenarios
✅ **Scenario 1**: Dark mode laptop + no saved preferences → App starts in dark mode
✅ **Scenario 2**: Dark mode laptop + user disabled dark mode → App respects user choice (light mode)
✅ **Scenario 3**: Light mode laptop + user enabled dark mode → App respects user choice (dark mode)
✅ **Scenario 4**: Toggle buttons → Always show correct state and work properly

## Files Modified
- `src/js/app.js` - Updated `initializeTheme()` and `setupAccessibility()` methods

## Status
✅ **RESOLVED** - System dark mode preferences now work correctly with saved user preferences using proper priority handling.
