# Z-Index Conflict Resolution: Hero Chart vs Popover Content

## Issue Analysis

**Problem**: CSS z-index layering conflict between hero demo radar chart and popover content.

### Components Involved:

- `#hero-ethics-chart` container with classes: `radar-chart-wrapper`, `radar-demo-container`, `hero-radar-chart`
- `.popover-content` from demo feedback popovers

### Conflict Details:

1. **Popover content**: `z-index: 1000` (hero-demo.css:191)
2. **Hero chart container**: `z-index: 10` (applied via JavaScript)
3. **Canvas element**: `z-index: 1` (applied via JavaScript)

## Root Cause

The radar chart container was creating a new stacking context with `position: relative` and `z-index: 10`, which could interfere with popover positioning even though the popover had a higher z-index value.

## Solution Implemented

### 1. Removed Z-Index from Hero Demo Container

**File**: `src/js/components/radar-chart.js`
**Lines**: ~625

```javascript
// BEFORE
Object.assign(this.container.style, {
  textAlign: "center",
  overflow: "visible",
  position: "relative",
  zIndex: "10", // ❌ Creates stacking context conflict
});

// AFTER
Object.assign(this.container.style, {
  textAlign: "center",
  overflow: "visible",
  position: "relative",
  // ✅ No z-index = no stacking context interference
});
```

### 2. Lowered Canvas Z-Index for Hero Demo

**File**: `src/js/components/radar-chart.js`
**Lines**: ~574

```javascript
// BEFORE
const canvasStyles = {
  // ...
  zIndex: "1", // ❌ Same z-index for all contexts
};

// AFTER
const canvasStyles = {
  // ...
  zIndex: this.options.context === "hero-demo" ? "0" : "1", // ✅ Context-aware z-index
};
```

## Benefits

1. **Eliminates Stacking Context Conflicts**: Hero demo container no longer creates a stacking context that interferes with popover positioning
2. **Maintains Functionality**: Other chart contexts (scenario, test) retain their z-index values for proper layering
3. **Preserves Popover Behavior**: Demo feedback popovers can now properly appear above the chart with their `z-index: 1000`
4. **Context-Aware Solution**: Different z-index handling based on chart context ensures optimal behavior for each use case

## Testing Verification

- ✅ Hero demo chart renders correctly
- ✅ Popover content appears above chart when triggered
- ✅ No visual regressions in other chart contexts
- ✅ No JavaScript errors introduced

## Files Modified

1. `src/js/components/radar-chart.js` - Removed z-index conflicts for hero demo context

## Related Components

- Hero demo popovers (hero-demo.css)
- Radar chart styling (radar-chart.css)
- Chart initialization logic (radar-chart.js)
