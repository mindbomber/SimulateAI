# Canvas Resize Validation Fix

## Issue Description
The canvas renderer was throwing an error when handling resize events with invalid dimensions:
```
CanvasRenderer Error: Invalid resize dimensions Error: Width and height must be positive
```

This error was occurring from two sources:
1. Canvas renderer's own `handleResize` method
2. Visual engine's `handleResize` method calling canvas renderer without proper parameters

## Root Cause
1. **Canvas Renderer**: The `handleResize` method was directly passing dimensions from container resize events to the `resize` method without validation.
2. **Visual Engine**: The `handleResize` method was calling `this.renderer.resize()` without any parameters, but the canvas renderer's resize method requires width and height parameters.

When containers are hidden, not yet rendered, or in certain layout states, the `contentRect` or `getBoundingClientRect()` can return 0 or negative dimensions.

## Solution
Fixed both sources of the issue:

### Canvas Renderer Fix:
```javascript
handleResize(entries) {
  let width, height;
  
  if (entries && entries[0]) {
    ({ width, height } = entries[0].contentRect);
  } else {
    ({ width, height } = this.container.getBoundingClientRect());
  }
  
  // Validate dimensions before resizing
  if (width > 0 && height > 0) {
    this.resize(width, height);
  }
  // Skip resize silently if dimensions are invalid
}
```

### Visual Engine Fix:
```javascript
handleResize(entries = null) {
  if (this.renderer && this.renderer.resize) {
    let width, height;
    
    // Use ResizeObserver data if available, otherwise get container dimensions
    if (entries && entries[0]) {
      ({ width, height } = entries[0].contentRect);
    } else {
      ({ width, height } = this.container.getBoundingClientRect());
    }
    
    // Only resize if dimensions are valid
    if (width > 0 && height > 0) {
      this.renderer.resize(width, height);
    }
  }
  
  this.scene.handleResize();
}
```

## Benefits
1. **Prevents runtime errors** - No more "Invalid resize dimensions" errors from either source
2. **Proper parameter passing** - Visual engine now passes required width/height to canvas renderer
3. **Graceful handling** - Both components silently skip resize when container is hidden/invalid
4. **Improved stability** - Canvas system is more resilient to layout changes
5. **Better performance** - Uses ResizeObserver data when available for more accurate dimensions

## Files Modified
- `src/js/renderers/canvas-renderer.js` - Updated `handleResize` method
- `src/js/core/visual-engine.js` - Updated `handleResize` method and ResizeObserver setup

## Status
✅ **RESOLVED** - Both canvas renderer and visual engine now properly validate resize dimensions and handle invalid cases gracefully.
