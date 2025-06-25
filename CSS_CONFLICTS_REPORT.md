# CSS Conflicts Analysis Report

## Overview
Analysis of CSS conflicts across the SimulateAI stylesheet architecture.

## Critical Conflicts Found

### 1. Modal System Conflicts
**Severity:** HIGH
**Files Affected:**
- `main.css` (lines 570, 584, 596, 604, 610, 631)
- `advanced-ui-components.css` (modal-related classes)
- `bias-fairness.css` (lines 951, 961, 969, 982)
- `layout-fixes.css` (line 4, with !important overrides)

**Problem:** Multiple conflicting definitions for modal components
**Impact:** Unpredictable modal styling, layout issues

### 2. Button System Inconsistency
**Severity:** MEDIUM
**Files Affected:**
- `main.css` (.btn-* classes)
- `simulations.css` (.button class)

**Problem:** Two different button naming conventions
**Impact:** Inconsistent button styling across components

### 3. Layout Override Abuse
**Severity:** HIGH
**File:** `layout-fixes.css`
**Problem:** Excessive use of !important declarations
**Impact:** Makes CSS hard to maintain and debug

## Recommendations

### Immediate Actions (Priority 1)
1. **Consolidate Modal System**
   - Choose one modal implementation (recommend advanced-ui-components.css)
   - Remove conflicting modal styles from other files
   - Update HTML to use consistent modal classes

2. **Remove !important Overrides**
   - Refactor layout-fixes.css to use proper CSS specificity
   - Replace !important with more specific selectors

3. **Standardize Button System**
   - Choose one button naming convention (.btn-* preferred)
   - Update all button references to use consistent classes

### Medium-term Actions (Priority 2)
1. **CSS Architecture Restructure**
   - Create a clear hierarchy: base → components → utilities → overrides
   - Ensure each component has a single source of truth

2. **Custom Properties Cleanup**
   - Consolidate all CSS custom properties in main.css
   - Remove duplicate definitions from other files

3. **Dark Mode Unification**
   - Enable dark mode support in accessibility.css
   - Ensure consistent dark mode implementation

## Suggested File Load Order
To minimize conflicts, load CSS files in this order:
1. `main.css` (base styles and custom properties)
2. `accessibility.css` (accessibility enhancements)
3. `advanced-ui-components.css` (component library)
4. `enhanced-objects.css` (enhanced UI objects)
5. `simulations.css` (simulation-specific styles)
6. `layout-components.css` (layout components)
7. `input-utility-components.css` (form components)
8. Component-specific CSS files
9. `layout-fixes.css` (REMOVE or refactor)

## Next Steps
1. Review and approve this analysis
2. Create refactoring plan with timeline
3. Implement changes incrementally to avoid breaking existing functionality
4. Test thoroughly across all components after each change

Generated: $(date)
