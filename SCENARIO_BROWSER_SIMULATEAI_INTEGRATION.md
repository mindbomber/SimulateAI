# Scenario Browser SimulateAI Integration

## Overview

This implementation integrates the `scenario-browser.js` component with the SimulateAI architecture to provide a unified navigation experience. The integration ensures that scenario navigation maintains consistency with the educational context and gateway pattern established by the `simulateai` system.

## Key Features

### ✅ Unified Navigation Architecture

- **Route Through SimulateAI**: All scenario navigation routes through the `simulateai` gateway first
- **Educational Context Preservation**: Maintains pre-launch modals and educational flow
- **Consistent User Experience**: Same interaction patterns across all navigation paths

### ✅ Smart Integration Options

- **Configurable Integration**: Enable/disable integration features as needed
- **Graceful Fallbacks**: Works even when SimulateAI components are unavailable
- **Context Tracking**: Preserves navigation source and user journey context

### ✅ Enhanced Navigation Methods

- **Scenario Navigation**: `openScenario()` now routes through SimulateAI architecture
- **Direct Modal Access**: `openScenarioModalDirect()` with integrated modal system
- **Learning Lab Integration**: Consistent routing for educational resources
- **Fallback Handling**: Centralized error handling and fallback navigation

## Implementation Details

### Core Changes to `scenario-browser.js`

1. **Constructor Enhancement**:

   ```javascript
   constructor(options = {}) {
     // ... existing code ...

     // SimulateAI integration options
     this.simulateAIIntegration = {
       enabled: options.integrateWithSimulateAI !== false,
       routeThroughSimulateAI: options.routeThroughSimulateAI !== false,
       useSimulateAIModals: options.useSimulateAIModals !== false,
       parentContext: options.parentContext || 'scenario-browser',
       onNavigationRequest: options.onNavigationRequest || null,
     };
   }
   ```

2. **Enhanced Navigation Methods**:
   - `openScenario()` - Routes through SimulateAI or falls back to original behavior
   - `openScenarioViaSimulateAI()` - New method for integrated navigation
   - `handleFallbackNavigation()` - Centralized fallback handling
   - `enableSimulateAIIntegration()` - Runtime configuration method

### New Integration Utility

**File**: `src/js/utils/scenario-browser-integration.js`

The `ScenarioBrowserIntegration` class provides:

- Integration management between scenario browser and main app
- Navigation request handling
- Configuration management
- Status monitoring and diagnostics

### App.js Enhancements

**Enhanced `simulateai` routing**:

```javascript
// Route simulateai to use the main grid category browser
if (simulationId === "simulateai") {
  // Handle enhanced navigation from scenario browser
  const navigationContext = config?.sourceContext || "direct";
  const targetScenario = config?.targetScenario;
  const targetCategory = config?.targetCategory;
  const autoNavigate = config?.autoNavigateToScenario;

  // Auto-navigation support for scenario browser integration
  if (autoNavigate && targetScenario) {
    setTimeout(() => {
      this.navigateToSpecificScenario(
        targetCategory,
        targetScenario,
        navigationContext,
      );
    }, 500);
  }
}
```

**New Navigation Methods**:

- `navigateToSpecificScenario()` - Navigate to specific scenario within MainGrid
- `navigateToScenarioInCategory()` - Helper for scenario navigation within categories

## Usage Examples

### Basic Integration Setup

```javascript
import ScenarioBrowser from "./components/scenario-browser.js";
import { ScenarioBrowserIntegration } from "./utils/scenario-browser-integration.js";

// Create integration with main app
const integration = new ScenarioBrowserIntegration(app);

// Initialize scenario browser with integration
const scenarioBrowser = integration.initializeScenarioBrowser("#container", {
  integrateWithSimulateAI: true,
  routeThroughSimulateAI: true,
  useSimulateAIModals: true,
});

await scenarioBrowser.init();
```

### Configuration Options

```javascript
// Enable integration with custom options
scenarioBrowser.enableSimulateAIIntegration({
  routeThroughSimulateAI: true, // Route through simulateai first
  useSimulateAIModals: true, // Use integrated modal system
  parentContext: "custom-context", // Custom context identifier
  onNavigationRequest: (action, data) => {
    // Custom navigation handler
    console.log("Navigation request:", action, data);
  },
});

// Disable integration (revert to standalone behavior)
scenarioBrowser.disableSimulateAIIntegration();

// Check integration status
const status = scenarioBrowser.getSimulateAIIntegrationStatus();
```

### Custom Navigation Handling

```javascript
const integration = new ScenarioBrowserIntegration(app);

// Override specific navigation actions
integration.configure({
  routeThroughSimulateAI: true,
  preserveEducationalContext: true,
  customNavigationHandler: (action, data) => {
    switch (action) {
      case "scenario":
        return customScenarioNavigation(data);
      case "learning-lab":
        return customLearningLabHandler(data);
      default:
        return integration.handleNavigationRequest(action, data);
    }
  },
});
```

## Navigation Flow

### Integrated Flow (Default)

1. User clicks scenario in scenario browser
2. `openScenario()` called with SimulateAI integration enabled
3. Routes to `app.startSimulation('simulateai', { targetScenario: ... })`
4. SimulateAI launches MainGrid in category view
5. Auto-navigation to specific scenario within MainGrid
6. Maintains educational context and pre-launch modals

### Fallback Flow

1. If SimulateAI components unavailable
2. Falls back to original scenario browser behavior
3. Direct navigation to `simulation.html?scenario=...`
4. Preserves functionality with degraded experience

## Testing

### Demo Page

**File**: `scenario-browser-integration-demo.html`

Comprehensive demonstration including:

- Integration status monitoring
- Configuration testing
- Navigation method testing
- Fallback scenario testing
- Real-time logging and diagnostics

### Running Tests

```bash
# Start development server
npm run dev

# Open demo page
# Navigate to: http://localhost:3000/scenario-browser-integration-demo.html
```

### Test Scenarios

1. **Enable/Disable Integration**: Test configuration changes
2. **Scenario Navigation**: Test routing through SimulateAI
3. **Direct Modal Access**: Test integrated modal system
4. **Fallback Navigation**: Test graceful degradation
5. **Status Monitoring**: Check integration health

## Benefits

### For Users

- **Consistent Experience**: Same navigation patterns across all components
- **Educational Context**: Maintains learning flow and guidance
- **Performance**: Smart routing reduces unnecessary page loads

### For Developers

- **Unified Architecture**: Single navigation system for all scenario access
- **Maintainable Code**: Centralized navigation logic
- **Configurable**: Easy to enable/disable features as needed
- **Extensible**: Easy to add new navigation patterns

### For System Architecture

- **Gateway Pattern**: simulateai properly serves as the main entry point
- **Separation of Concerns**: Browser focuses on filtering, app handles navigation
- **Backward Compatibility**: Original behavior preserved as fallback

## Migration Guide

### For Existing Scenario Browser Usage

1. **Update Imports**:

   ```javascript
   // Before
   import ScenarioBrowser from "./components/scenario-browser.js";

   // After (with integration)
   import { initializeIntegratedScenarioBrowser } from "./utils/scenario-browser-integration.js";
   ```

2. **Update Initialization**:

   ```javascript
   // Before
   const scenarioBrowser = new ScenarioBrowser();
   await scenarioBrowser.init();

   // After
   const scenarioBrowser = initializeIntegratedScenarioBrowser(app, container);
   await scenarioBrowser.init();
   ```

3. **Optional Configuration**:
   ```javascript
   // Customize integration behavior
   scenarioBrowser.enableSimulateAIIntegration({
     routeThroughSimulateAI: true, // Default: true
     useSimulateAIModals: true, // Default: true
     parentContext: "my-context", // Default: 'scenario-browser'
   });
   ```

## Status

- ✅ **Core Integration**: Complete - scenario browser routes through SimulateAI
- ✅ **Enhanced Navigation**: Complete - app.js supports direct scenario navigation
- ✅ **Integration Utility**: Complete - helper classes for easy setup
- ✅ **Demo & Testing**: Complete - comprehensive testing interface
- ✅ **Documentation**: Complete - usage examples and migration guide
- ✅ **Backward Compatibility**: Complete - original behavior preserved

The scenario browser now properly integrates with the SimulateAI architecture while maintaining full backward compatibility and providing enhanced navigation capabilities.
