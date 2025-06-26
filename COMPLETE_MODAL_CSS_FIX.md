# Complete Modal CSS Conflict Resolution - June 26, 2025

## Problem Diagnosis
Multiple CSS files contained conflicting `.modal-body` rules that prevented simulation UI visibility:

### Files with Conflicting Rules:
1. **advanced-ui-components.css**: `max-height: 60vh`, `overflow-y: auto`
2. **bias-fairness.css**: Generic `.modal-body { padding: 30px; }`
3. **ethics-explorer.css**: 
   - Generic `.modal-body { padding: 1.5rem; }`
   - Broad overrides with `!important` affecting ALL modals
4. **layout-fixes.css**: Different height/display rules
5. **pre-launch-modal.css**: `.pre-launch-modal .modal-body` (properly scoped)

### CSS Loading Order (HTML):
```
main.css → layout-fixes.css → ethics-explorer.css (LAST)
```

Since `ethics-explorer.css` loads last, its rules were overriding everything else.

## Root Cause
1. **Generic selectors**: Multiple files used `.modal-body` without specificity
2. **CSS cascade issues**: Last-loaded styles override earlier ones
3. **Overly broad `!important` rules**: ethics-explorer.css affected ALL modals
4. **Conflicting display properties**: flex vs block, different padding/heights

## Complete Solution Applied

### 1. Fixed `ethics-explorer.css`
```css
/* BEFORE - problematic generic rules */
.modal-body {
  padding: 1.5rem;
}

#simulation-modal .modal-body {
  padding: 0 !important;
  display: block !important;
}

/* AFTER - commented out generic rules */
/*
.modal-body {
  padding: 1.5rem;
}
*/
```

### 2. Fixed `bias-fairness.css`
```css
/* BEFORE - generic rule */
.modal-body {
  padding: 30px;
}

/* AFTER - scoped to bias-fairness only */
.simulation-container.bias-fairness .modal-body,
.bias-fairness-modal .modal-body {
  padding: 30px;
}
```

### 3. Enhanced `layout-fixes.css`
Added multiple levels of CSS specificity:

#### Standard Rules:
```css
#simulation-modal .modal-dialog .modal-body {
    display: flex !important;
    flex-direction: column !important;
    padding: 20px !important;
    /* ... other properties */
}
```

#### Final Override (Maximum Specificity):
```css
html body #simulation-modal.modal-backdrop .modal-dialog .modal-body,
html body #simulation-modal .modal-dialog .modal-body {
    /* All properties with !important */
    visibility: visible !important;
    opacity: 1 !important;
}
```

## Files Modified
- ✅ `src/styles/ethics-explorer.css` - Commented out generic rules
- ✅ `src/styles/bias-fairness.css` - Made `.modal-body` rule specific
- ✅ `src/styles/layout-fixes.css` - Added comprehensive overrides

## Testing
1. Load http://localhost:3001
2. Click any simulation card
3. Verify modal opens with visible content:
   - Modal body displays properly
   - Simulation container is visible
   - Controls are accessible
   - No CSS conflicts in dev tools

## Prevention Strategy
1. **No generic `.modal-body` rules** - Always scope to specific components
2. **Use BEM methodology** - `.component-name__modal-body`
3. **CSS custom properties** - For consistent theming
4. **Single source of truth** - Consolidate modal styles in one file
5. **Specificity guidelines** - Document CSS hierarchy

## CSS Architecture Improvement
Consider refactoring to:
```css
/* Component-specific modal styles */
.pre-launch-modal__body { }
.post-simulation-modal__body { }
.ethics-explorer-modal__body { }
.bias-fairness-modal__body { }

/* Base modal in advanced-ui-components.css */
.modal__body { }
```

This would eliminate all conflicts and make the CSS more maintainable.
