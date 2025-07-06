# SimulateAI Terminology Guide

This guide clarifies the consistent terminology used throughout the SimulateAI platform to avoid confusion during development and maintenance.

## Core Hierarchy

### Categories
- **Definition**: Thematic groups of related ethical scenarios
- **Examples**: "The Trolley Problem", "AI Black Box", "Consent and Surveillance"
- **Purpose**: Organize related ethical dilemmas into coherent learning units
- **Technical**: Found in `categories.js`, displayed in the main categories grid

### Scenarios  
- **Definition**: Individual ethical dilemmas within a category
- **Examples**: "Autonomous Vehicle Split Decision", "Medical AI Triage", "Smart City Sensors"
- **Purpose**: Specific ethical situations that users can explore
- **Technical**: Each category contains 6 scenarios, accessed via category selection

### Simulations
- **Definition**: The interactive experience when users engage with a scenario
- **Examples**: The actual interface where users make choices and see consequences
- **Purpose**: The hands-on learning environment with ethics visualization
- **Technical**: Launched when a user clicks on a scenario

## CSS Class Names

### Current (Correct) Usage
- `.categories-grid` - Main grid displaying category cards
- `.scenarios-grid` - Grid showing scenarios within a category (when viewing category details)
- `.simulation-container` - Container for the active simulation interface

### Legacy Support
- `.simulations-grid` - Still supported for backward compatibility (maps to categories grid)
- JavaScript selectors use both `.categories-grid, .simulations-grid` for seamless transition
- Existing CSS and functionality preserved during terminology migration

## File Structure Terminology

### Correct References
- `src/data/categories.js` - Contains category and scenario data
- `src/js/components/category-grid.js` - Handles category grid display
- `src/js/components/scenario-modal.js` - Manages scenario selection and simulation launch

### Navigation Flow
1. **Home Page**: Categories grid → Select category
2. **Category View**: Scenarios grid → Select scenario  
3. **Simulation**: Interactive experience → Complete scenario

## Development Guidelines

When adding new features or documentation:

- **Use "Categories"** when referring to thematic groups
- **Use "Scenarios"** when referring to individual ethical dilemmas
- **Use "Simulations"** when referring to the interactive experience
- **Be specific** about which level you're working with in comments and variables
- **Use fallback selectors** like `.categories-grid, .simulations-grid` for compatibility

## Backward Compatibility

The platform maintains support for legacy class names and references to ensure existing code continues to work while transitioning to the standardized terminology. JavaScript components use fallback selectors to find grid containers regardless of which class name is used.

---

*Last updated: January 2025*
*Part of SimulateAI Ethics Platform Documentation*
