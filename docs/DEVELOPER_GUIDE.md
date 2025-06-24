# Developer Guide - Component Development Workflow

## 🚀 New Component Development Process

This guide outlines the updated workflow for creating new UI components in the SimulateAI project, following our **No HTML Generation Policy**.

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
            ...options
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
            x: 0, y: 0, width: 100, height: 50
        });
        
        assert(component instanceof YourNewComponent, 'Should create component instance');
        assert(component.type === 'your-component', 'Should set correct type');
    }
    
    // Additional test methods...
}
```

### 6. Integrate with Demo System

**Add to existing demo class** (don't create new HTML files):

```javascript
// In appropriate demo file (e.g., src/js/demos/input-utility-demo.js)
export class InputUtilityComponentsDemo {
    initializeComponents() {
        // Existing components...
        this.createYourNewComponentDemo();
    }
    
    createYourNewComponentDemo() {
        const yourComponent = this.engine.createComponent('your-component', {
            x: 50, y: 300,
            width: 200, height: 100,
            // Component-specific options
        });
        
        // Demo interactions and event handlers
        yourComponent.on('someEvent', (event) => {
            this.updateDescription(`Component event: ${event.type}`);
        });
        
        this.components.yourComponent = yourComponent;
    }
}
```

### 7. Write Documentation

```markdown
<!-- docs/your-category-components.md -->
# Your Category Components

## YourNewComponent

### Purpose
Brief description of what the component does and when to use it.

### Usage
```javascript
const component = engine.createComponent('your-component', {
    x: 50, y: 50,
    width: 200, height: 100,
    // Component options
});
```

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
```

### 8. Update Existing Demo HTML (If Needed)

Only update existing HTML files to showcase new components:

```html
<!-- In existing demo file like input-utility-demo.html -->
<div class="demo-section">
    <h2>🎯 Your New Component</h2>
    <p>Description of your new component functionality.</p>
    
    <div class="component-showcase">
        <div class="showcase-item">
            <h4>Basic Usage</h4>
            <div id="yourComponentDemo1"></div>
        </div>
    </div>
</div>
```

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
    accessibility: true
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

For questions about this workflow, refer to the `NO_HTML_GENERATION_POLICY.md` or existing component implementations as examples.
