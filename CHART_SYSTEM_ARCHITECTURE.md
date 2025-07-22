# Chart System Architecture - Conflict Resolution

## Overview

This document outlines the resolved chart system architecture that eliminates conflicts between multiple charting implementations in the SimulateAI platform.

## Problem Resolved

**Previous Issues:**

- Multiple chart systems competing for DOM elements
- Conflicting event handlers on same elements
- Duplicate constant definitions
- Chart.js radar charts vs custom canvas rendering conflicts
- Tooltip system conflicts

## New Architecture

### 1. System Segregation

Each chart system now has a specific, non-overlapping role:

#### **radar-chart.js** - Chart.js Radar Charts

- **Purpose**: Handles ALL radar chart visualizations using Chart.js
- **Scope**: Ethical decision scenarios, demo charts, radar visualizations
- **Technology**: Chart.js library with built-in tooltips
- **Registration**: Uses event coordinator for conflict prevention

#### **canvas-renderer.js** - Custom Canvas Operations

- **Purpose**: Custom drawing operations, non-radar visualizations
- **Scope**: Custom shapes, complex animations, specialized graphics
- **Technology**: Native HTML5 Canvas API
- **Registration**: Uses event coordinator for conflict prevention

#### **advanced-ui-components.js** - UI Components Only

- **Purpose**: Modal dialogs, navigation menus, form components, tooltips
- **Scope**: UI elements without chart functionality
- **Technology**: Canvas-based UI rendering
- **Chart Functionality**: **REMOVED** - no longer handles charts

### 2. Centralized Constants

All chart-related constants are now centralized in:

**`src/js/constants/chart-constants.js`**

```javascript
// Radar Chart Constants (Chart.js)
export const RADAR_CHART_CONSTANTS = {
  DEFAULT_SIZE: 400,
  ANIMATION_DURATION: 750,
  // ... radar-specific constants
};

// Canvas Renderer Constants
export const CANVAS_RENDERER_CONSTANTS = {
  DEFAULT_WIDTH: 800,
  DEFAULT_HEIGHT: 600,
  // ... canvas-specific constants
};

// UI Component Constants
export const UI_COMPONENT_CONSTANTS = {
  MODAL_Z_INDEX: 2000,
  TOOLTIP_Z_INDEX: 3000,
  // ... UI-specific constants
};

// Shared Constants
export const SHARED_CHART_CONSTANTS = {
  COLORS: {
    /* shared color palette */
  },
  THEMES: {
    /* shared themes */
  },
  // ... shared constants
};
```

### 3. Event Coordination System

**`src/js/constants/chart-event-coordinator.js`**

Prevents conflicts by:

- Registering DOM elements with specific chart systems
- Ensuring only one system handles events per element
- Providing conflict-free event handler management
- Automatic cleanup of orphaned elements

```javascript
// Register element with system
chartEventCoordinator.registerElement(container, "radar-chart.js", instance);

// Add conflict-free event handlers
chartEventCoordinator.addEventHandler(element, "click", handler);

// Automatic cleanup on destroy
chartEventCoordinator.unregisterElement(container);
```

## Implementation Details

### Radar Chart System Integration

```javascript
// radar-chart.js
import chartEventCoordinator from "../constants/chart-event-coordinator.js";

// Registration on creation
chartEventCoordinator.registerElement(this.container, "radar-chart.js", this);

// Event handling via coordinator
chartEventCoordinator.addEventHandler(
  this.container,
  "touchstart",
  this.setupMobileTooltipDismissal.bind(this),
  { passive: true },
);

// Cleanup on destroy
chartEventCoordinator.unregisterElement(this.container);
```

### Canvas Renderer Integration

```javascript
// canvas-renderer.js
import {
  CANVAS_RENDERER_CONSTANTS,
  SHARED_CHART_CONSTANTS,
} from "../constants/chart-constants.js";

// Use centralized constants
const CANVAS_CONSTANTS = {
  ...CANVAS_RENDERER_CONSTANTS,
  ...SHARED_CHART_CONSTANTS,
};
```

### UI Components Integration

```javascript
// advanced-ui-components.js
import { UI_COMPONENT_CONSTANTS } from "../constants/chart-constants.js";

// Use centralized constants, removed chart functionality
const COMPONENT_CONSTANTS = {
  ...UI_COMPONENT_CONSTANTS,
  // Additional UI-specific constants
};
```

## API Boundaries

### Clear Ownership

| Chart Type      | System                      | Technology | Use Cases                |
| --------------- | --------------------------- | ---------- | ------------------------ |
| Radar Charts    | `radar-chart.js`            | Chart.js   | Ethical scenarios, demos |
| Custom Graphics | `canvas-renderer.js`        | Canvas API | Custom visualizations    |
| UI Components   | `advanced-ui-components.js` | Canvas UI  | Modals, menus, forms     |

### Conflict Prevention Rules

1. **One System Per Element**: Each DOM element is registered with only one chart system
2. **Event Handler Isolation**: Event coordinator prevents multiple handlers on same element
3. **Constant Namespacing**: All constants are namespaced by system
4. **Cleanup Protocols**: All systems must unregister elements on destroy

## Usage Guidelines

### For Radar Charts

```javascript
// Use radar-chart.js for ALL radar visualizations
import RadarChart from "./components/radar-chart.js";

const chart = new RadarChart("container-id", {
  context: "scenario", // or 'hero-demo', 'test'
  animated: true,
  // ... other options
});
```

### For Custom Canvas Drawing

```javascript
// Use canvas-renderer.js for custom graphics
import CanvasRenderer from "./renderers/canvas-renderer.js";

const renderer = new CanvasRenderer(container, options);
renderer.drawRect(x, y, width, height);
// Custom drawing operations
```

### For UI Components

```javascript
// Use advanced-ui-components.js for UI elements
import {
  ModalDialog,
  NavigationMenu,
} from "./objects/advanced-ui-components.js";

const modal = new ModalDialog(options);
// NO chart functionality available here
```

## Debugging and Monitoring

### Event Coordinator Status

```javascript
// Check coordination status
window.debugChartEventCoordinator.getStatus();

// Clean up orphaned elements
window.debugChartEventCoordinator.cleanupOrphanedElements();
```

### Radar Chart Health

```javascript
// Check all radar chart instances
window.debugRadarChartInstances();

// Get health report
window.debugRadarChartHealth();
```

## Benefits Achieved

1. **No More Conflicts**: Event coordination prevents system interference
2. **Clear Responsibilities**: Each system has specific, non-overlapping roles
3. **Maintainable Code**: Centralized constants and clear API boundaries
4. **Better Performance**: No duplicate event handlers or conflicting operations
5. **Enterprise Ready**: Proper monitoring and cleanup protocols

## Migration Notes

- **Existing radar charts**: Continue to work with enhanced conflict prevention
- **Custom canvas operations**: Now clearly separated from Chart.js operations
- **UI components**: Chart functionality removed, focus on UI rendering
- **Constants**: Now centralized and namespaced to prevent conflicts

This architecture ensures robust, conflict-free chart operations across the entire SimulateAI platform.
