# Developer Guide - SimulateAI Educational Platform

## 🎯 Development Philosophy

### Mission-Driven Development

Every technical decision in SimulateAI serves our educational mission: **empowering learners of all
ages to explore AI ethics through open-ended, consequence-driven simulations**. Our development
follows the digital science laboratory approach—no "correct" answers, just cause-and-effect
exploration.

### Educational Excellence Standards

- **Accessibility First**: All components must meet WCAG guidelines
- **Research-Based Design**: Following PhET Interactive Simulations principles
- **ISTE Standards Alignment**: Building toward educational technology certification
- **Universal Design**: Scalable for elementary through professional development

### Technical Principles

- **Modular Architecture**: Reusable components enable diverse simulation creation
- **Open-Ended Systems**: Support multiple perspectives and solutions
- **Real-World Scenarios**: Mirror actual AI ethics challenges and consequences
- **Educator Integration**: Seamless classroom adoption with comprehensive resources

## 🚀 Component Development Workflow

This guide outlines the development process for creating new educational components, following our
**No HTML Generation Policy** and mission-driven approach.

## 📋 Step-by-Step Workflow

### 1. Plan Your Component

Before coding, define:

- Component purpose and functionality
- Target component category (UI, Layout, Input/Utility, etc.)
- Required properties and methods
- Accessibility requirements
- Integration points with existing systems

### 2. Create Component Implementation

```javascript
// Example: src/js/objects/your-category-components.js
export class YourNewComponent extends InteractiveObject {
  constructor(options = {}) {
    super({
      type: 'your-component',
      ...options,
    });

    // Component-specific initialization
    this.initialize();
  }

  initialize() {
    // Setup component state and properties
  }

  render(renderer) {
    // Implement rendering logic
  }

  handleEvent(event) {
    // Handle user interactions
  }
}
```

### 3. Register Component

Add to Visual Engine registration:

```javascript
// In src/js/core/visual-engine.js
import { YourNewComponent } from '../objects/your-category-components.js';

// Add to component registry
this.registerComponent('your-component', YourNewComponent);
```

### 4. Create CSS Styles

```css
/* src/styles/your-category-components.css */
.your-component {
  /* Component styles */
}

.your-component:hover {
  /* Hover states */
}

.your-component:focus {
  /* Focus states for accessibility */
}

.your-component[disabled] {
  /* Disabled states */
}
```

### 5. Write JavaScript Tests

```javascript
// tests/your-category-test.js
import { YourNewComponent } from '../src/js/objects/your-category-components.js';

class YourComponentTestSuite {
  async runTests() {
    console.log('Testing YourNewComponent...');

    this.testComponentCreation();
    this.testComponentMethods();
    this.testAccessibility();
    this.testPerformance();

    console.log('All tests passed!');
  }

  testComponentCreation() {
    const component = new YourNewComponent({
      x: 0,
      y: 0,
      width: 100,
      height: 50,
    });

    assert(component instanceof YourNewComponent, 'Should create component instance');
    assert(component.type === 'your-component', 'Should set correct type');
  }

  // Additional test methods...
}
```

### 6. Integrate with Demo System

**Add to the main application** (demo files have been removed):

```javascript
// In the main application (e.g., src/js/app.js or appropriate component file)
export class MainApplication {
  initializeComponents() {
    // Existing components...
    this.createYourNewComponent();
  }

  createYourNewComponent() {
    const yourComponent = this.engine.createComponent('your-component', {
      x: 50,
      y: 300,
      width: 200,
      height: 100,
      // Component-specific options
    });

    // Demo interactions and event handlers
    yourComponent.on('someEvent', event => {
      this.updateDescription(`Component event: ${event.type}`);
    });

    this.components.yourComponent = yourComponent;
  }
}
```

### 7. Write Documentation

````markdown
<!-- docs/your-category-components.md -->

# Your Category Components

## YourNewComponent

### Purpose

Brief description of what the component does and when to use it.

### Usage

```javascript
const component = engine.createComponent('your-component', {
  x: 50,
  y: 50,
  width: 200,
  height: 100,
  // Component options
});
```
````

### Properties

- `property1`: Description of property
- `property2`: Description of property

### Events

- `event1`: When this event fires
- `event2`: When this event fires

### Accessibility

- Keyboard navigation support
- Screen reader compatibility
- ARIA attributes

````

### 8. Integrate with Main Application

Components should be integrated into the main SimulateAI application interface:

```javascript
// In the main application files (e.g., src/js/app.js)
import { YourNewComponent } from './components/your-new-component.js';

class SimulateAI {
    initializeUI() {
        // Existing UI initialization...
        this.setupYourNewComponent();
    }

    setupYourNewComponent() {
    </div>
</div>
````

### 9. Update Project Documentation

- Update README.md with new component information
- Add component to appropriate sections
- Update component registry documentation

## ❌ What NOT to Do

Don't create these files anymore:

- `your-component-demo.html`
- `your-component-test.html`
- Individual HTML files for each component
- Standalone test HTML pages

## ✅ Quality Checklist

Before considering a component complete:

- [ ] Component implementation complete and tested
- [ ] Registered in Visual Engine
- [ ] CSS styles created and responsive
- [ ] JavaScript tests written and passing
- [ ] Integrated into appropriate demo class
- [ ] Documentation written
- [ ] Accessibility features implemented
- [ ] Performance optimized
- [ ] Existing demo HTML updated (if applicable)
- [ ] README.md updated with new component

## 🔄 Integration Testing

Test your component works with the entire system:

```javascript
// Integration test example
const engine = new VisualEngine(container, {
  renderMode: 'auto',
  accessibility: true,
});

const yourComponent = engine.createComponent('your-component', {
  // Test options
});

// Verify component is created and functional
assert(yourComponent.isVisible === true);
assert(engine.getComponentsByType('your-component').length === 1);
```

## 📊 Performance Considerations

- Test with multiple instances of your component
- Verify rendering performance
- Check memory usage
- Test event handling efficiency
- Ensure proper cleanup on component destruction

## 🎯 Example Component Categories

### UI Components

Place in `src/js/objects/advanced-ui-components.js`

- Dialogs, menus, tooltips, notifications

### Layout Components

Place in `src/js/objects/layout-components.js`

- Containers, grids, panels, dividers

### Input Components

Place in `src/js/objects/input-utility-components.js`

- Form inputs, pickers, selectors, validators

### Specialized Components

Create new category file if needed

- Domain-specific components, integrations

## 🚀 Getting Started

1. **Choose** your component category
2. **Follow** this workflow step-by-step
3. **Test** thoroughly before integrating
4. **Document** everything clearly
5. **Update** existing systems as needed

**Remember**: No new HTML files! Integrate with existing demo and test frameworks.

---

For questions about this workflow, refer to the `NO_HTML_GENERATION_POLICY.md` or existing component
implementations as examples.
