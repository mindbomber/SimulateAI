# Modal CSS Conflict Resolution - June 26, 2025

## Issue Identified
Simulation UI was not visible due to conflicting CSS rules for `.modal-body` across multiple stylesheets:

### Conflicting Files & Rules:
1. **advanced-ui-components.css**: `max-height: 60vh`, `overflow-y: auto`
2. **bias-fairness.css**: `padding: 30px` 
3. **ethics-explorer.css**: `height: 80vh !important`, `padding: 0 !important`
4. **layout-fixes.css**: `max-height: 70vh`, `display: flex`

## Root Cause
- Multiple CSS files were overriding modal body styles with conflicting values
- The simulation container was being constrained by conflicting height/overflow rules
- Some rules used `!important` which created specificity conflicts
- The modal structure in HTML uses `.modal-dialog .modal-body` but some CSS targeted different selectors

## Solution Applied
Updated `src/styles/layout-fixes.css` with consolidated, high-specificity rules:

### Modal Body Fixes:
```css
#simulation-modal .modal-dialog .modal-body {
    display: flex !important;
    flex-direction: column !important;
    padding: 20px !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    height: auto !important;
    min-height: 400px !important;
    max-height: 80vh !important;
    flex: 1 !important;
    background: var(--modal-background, #ffffff) !important;
}
```

### Simulation Container Fixes:
```css
#simulation-modal .simulation-container {
    background: var(--color-gray-50, #f8f9fa) !important;
    border-radius: 8px !important;
    padding: 16px !important;
    min-height: 300px !important;
    width: 100% !important;
    display: block !important;
    margin-bottom: 20px !important;
    overflow: visible !important;
    border: 1px solid var(--color-gray-200, #e5e7eb) !important;
}
```

### Controls Visibility Fixes:
```css
#simulation-modal .modal-body .simulation-controls,
#simulation-modal .modal-body .ethics-meters,
#simulation-modal .modal-body .simulation-actions {
    display: block !important;
    width: 100% !important;
}
```

## Changes Made
- **File Modified**: `src/styles/layout-fixes.css`
- **Strategy**: Used high-specificity selectors with `!important` to override all conflicting rules
- **Approach**: Consolidated all modal-related rules into one authoritative location

## Testing
- Refresh browser at http://localhost:3001
- Click on any simulation to test modal visibility
- Verify simulation container and controls are now visible

## Next Steps
1. Test simulation modal functionality
2. Verify all simulation UI elements are visible
3. Continue with magic number replacement once modal is working
4. Consider refactoring CSS architecture to prevent future conflicts

## Prevention
- Consolidate modal styles into single CSS file
- Use CSS custom properties for consistent theming
- Establish clear CSS specificity guidelines
- Document modal component usage patterns
