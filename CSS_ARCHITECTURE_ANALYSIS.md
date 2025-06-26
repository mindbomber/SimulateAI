# CSS Architecture Problem Analysis - June 26, 2025

## Root Cause: CSS Fragmentation

The simulation modal UI is being styled by **5 different CSS files**, creating conflicts:

### Current Fragmented Architecture:
1. **pre-launch-modal.css** - Pre-launch modal styles
2. **ethics-explorer.css** - Ethics simulation overrides
3. **bias-fairness.css** - Bias simulation styles  
4. **advanced-ui-components.css** - Base modal system
5. **layout-fixes.css** - Attempted fixes and overrides

### Specific Conflicts Found:

#### .modal-body Rules:
- `advanced-ui-components.css`: `max-height: 60vh`, `padding: 20px`
- `bias-fairness.css`: `padding: 30px` (generic rule)
- `ethics-explorer.css`: `padding: 1.5rem` (generic rule) + `padding: 0 !important` (override)
- `layout-fixes.css`: `max-height: 80vh !important`, `padding: 20px !important`
- `pre-launch-modal.css`: `.pre-launch-modal .modal-body { padding: 0 }` (scoped)

#### Loading Order in HTML:
```
main.css (imports pre-launch, ethics, bias CSS)
→ layout-fixes.css 
→ ethics-explorer.css (LAST - overrides everything)
```

## Problems This Creates:
1. **Unpredictable styling** - Last loaded file wins
2. **!important overuse** - Fighting specificity wars
3. **Generic selectors** - `.modal-body` affects all modals
4. **Maintenance nightmare** - Changes in one file break others
5. **CSS bloat** - Redundant and conflicting rules

## Recommended Solution: CSS Consolidation

### Option 1: Single Modal CSS File
Create `src/styles/simulation-modal.css` with all modal-related styles:

```css
/* Simulation Modal - Consolidated Styles */

/* Base modal system */
.simulation-modal { }
.simulation-modal__backdrop { }
.simulation-modal__dialog { }
.simulation-modal__header { }
.simulation-modal__body { }
.simulation-modal__footer { }

/* Simulation-specific modifiers */
.simulation-modal--pre-launch { }
.simulation-modal--ethics-explorer { }
.simulation-modal--bias-fairness { }
.simulation-modal--post-simulation { }
```

### Option 2: Component-Scoped Architecture
Update each file to use BEM methodology:

```css
/* pre-launch-modal.css */
.pre-launch-modal__body { }

/* ethics-explorer.css */  
.ethics-explorer-modal__body { }

/* bias-fairness.css */
.bias-fairness-modal__body { }
```

### Option 3: CSS Custom Properties Strategy
Use CSS variables for consistency:

```css
:root {
  --modal-body-padding: 20px;
  --modal-body-max-height: 80vh;
  --modal-body-background: #ffffff;
}
```

## Immediate Fix Recommendation

Remove generic `.modal-body` rules from:
- ✅ `ethics-explorer.css` (already commented out)
- ✅ `bias-fairness.css` (made specific) 
- 🔄 Keep consolidated rules in `layout-fixes.css` as single source of truth

This will eliminate the cascade conflicts while maintaining functionality.
