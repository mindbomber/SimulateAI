# Input and Utility Components Documentation

This document provides comprehensive documentation for SimulateAI's input and utility components, including ColorPicker, DateTimePicker, NumberInput, Accordion, Drawer, and SearchBox.

## Table of Contents

1. [Overview](#overview)
2. [ColorPicker](#colorpicker)
3. [DateTimePicker](#datetimepicker)
4. [NumberInput](#numberinput)
5. [Accordion](#accordion)
6. [Drawer](#drawer)
7. [SearchBox](#searchbox)
8. [Usage Examples](#usage-examples)
9. [Accessibility](#accessibility)
10. [Performance Considerations](#performance-considerations)
11. [Troubleshooting](#troubleshooting)

## Overview

The input and utility components provide a comprehensive set of interactive UI elements for data entry, content organization, and user interface enhancement. These components are built on top of the BaseObject class and integrate seamlessly with the VisualEngine.

### Key Features

- **Consistent API**: All components follow the same event-driven architecture
- **Accessibility**: Full ARIA support and keyboard navigation
- **Customizable**: Extensive styling and behavior options
- **Performance**: Optimized for smooth animations and interactions
- **Responsive**: Adapts to different screen sizes and input methods

## ColorPicker

A sophisticated color selection component supporting HSL color space, alpha transparency, and preset colors.

### Basic Usage

```javascript
const colorPicker = engine.createComponent('color-picker', {
    x: 100,
    y: 100,
    value: '#ff6b6b',
    showAlpha: true,
    showPresets: true
});

colorPicker.on('colorChanged', (event) => {
    console.log('New color:', event.value);
});
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `value` | string | '#ff0000' | Initial color value |
| `format` | string | 'hex' | Color format: 'hex', 'rgb', 'hsl' |
| `showAlpha` | boolean | true | Show alpha/opacity slider |
| `showPresets` | boolean | true | Show preset color palette |
| `disabled` | boolean | false | Disable color picker |
| `presets` | array | Default palette | Custom preset colors |

### Events

- **colorChanged**: Fired when color value changes
- **colorPickerOpened**: Fired when picker opens
- **colorPickerClosed**: Fired when picker closes

### Methods

- `parseColor()`: Parse current color value
- `rgbToHsl(r, g, b)`: Convert RGB to HSL
- `hslToRgb(h, s, l)`: Convert HSL to RGB

### Example: Custom Presets

```javascript
const colorPicker = engine.createComponent('color-picker', {
    presets: [
        '#ff6b6b', '#4ecdc4', '#45b7d1', 
        '#96ceb4', '#ffeaa7', '#dda0dd'
    ],
    format: 'rgb'
});
```

## DateTimePicker

A comprehensive date and time selection component with calendar interface and time controls.

### Basic Usage

```javascript
const datePicker = engine.createComponent('datetime-picker', {
    x: 200,
    y: 150,
    showTime: true,
    format: 'MM/DD/YYYY'
});

datePicker.on('dateChanged', (event) => {
    console.log('Selected date:', event.value);
});
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `value` | Date | new Date() | Initial date value |
| `format` | string | 'MM/DD/YYYY' | Date format string |
| `showTime` | boolean | true | Show time selection |
| `show24Hour` | boolean | false | Use 24-hour time format |
| `minDate` | Date | null | Minimum selectable date |
| `maxDate` | Date | null | Maximum selectable date |
| `disabled` | boolean | false | Disable date picker |

### Date Formats

- `MM/DD/YYYY`: 01/15/2024
- `DD/MM/YYYY`: 15/01/2024
- `YYYY-MM-DD`: 2024-01-15

### Events

- **dateChanged**: Fired when date/time changes
- **monthChanged**: Fired when calendar month changes
- **pickerOpened**: Fired when picker opens
- **pickerClosed**: Fired when picker closes

### Methods

- `formatDate(date)`: Format date according to format option
- `formatTime(hour, minute)`: Format time display
- `isDateDisabled(date)`: Check if date is disabled
- `navigateMonth(direction)`: Navigate calendar month

### Example: Date Range Picker

```javascript
const dateRangePicker = engine.createComponent('datetime-picker', {
    minDate: new Date(), // Today
    maxDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    showTime: false,
    format: 'YYYY-MM-DD'
});
```

## NumberInput

A precise numeric input component with validation, step controls, and formatting options.

### Basic Usage

```javascript
const numberInput = engine.createComponent('number-input', {
    x: 300,
    y: 200,
    value: 10,
    min: 0,
    max: 100,
    step: 1
});

numberInput.on('valueChanged', (event) => {
    console.log('New value:', event.value);
});
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `value` | number | 0 | Initial numeric value |
| `min` | number | -Infinity | Minimum allowed value |
| `max` | number | Infinity | Maximum allowed value |
| `step` | number | 1 | Increment/decrement step |
| `precision` | number | 0 | Decimal places to show |
| `placeholder` | string | '' | Placeholder text |
| `disabled` | boolean | false | Disable input |
| `showControls` | boolean | true | Show spinner controls |

### Events

- **valueChanged**: Fired when value changes
- **increment**: Fired when value is incremented
- **decrement**: Fired when value is decremented

### Methods

- `setValue(value)`: Set the numeric value
- `increment()`: Increase value by step
- `decrement()`: Decrease value by step
- `clampValue(value)`: Constrain value to min/max
- `formatValue(value)`: Format value for display

### Example: Currency Input

```javascript
const currencyInput = engine.createComponent('number-input', {
    value: 1299.99,
    min: 0,
    step: 0.01,
    precision: 2,
    placeholder: '0.00'
});
```

## Accordion

A collapsible content container with smooth animations and flexible configuration.

### Basic Usage

```javascript
const accordion = engine.createComponent('accordion', {
    x: 50,
    y: 300,
    width: 400,
    allowMultiple: false,
    items: [
        {
            id: 'section1',
            title: 'Getting Started',
            icon: '🚀',
            content: 'Welcome to SimulateAI...'
        },
        {
            id: 'section2',
            title: 'Advanced Features',
            content: 'Explore advanced features...'
        }
    ]
});

accordion.on('itemExpanded', (event) => {
    console.log('Expanded:', event.itemId);
});
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `items` | array | [] | Accordion items |
| `allowMultiple` | boolean | false | Allow multiple expanded items |
| `expandedItems` | array | [] | Initially expanded item IDs |
| `animationDuration` | number | 300 | Animation duration in ms |
| `headerHeight` | number | 40 | Height of item headers |

### Item Structure

```javascript
{
    id: 'unique-id',
    title: 'Item Title',
    content: 'Item content text',
    icon: '🎯', // Optional emoji or icon
    disabled: false // Optional disabled state
}
```

### Events

- **itemExpanded**: Fired when item expands
- **itemCollapsed**: Fired when item collapses
- **itemAdded**: Fired when item is added
- **itemRemoved**: Fired when item is removed
- **allExpanded**: Fired when all items expand
- **allCollapsed**: Fired when all items collapse

### Methods

- `expandItem(itemId)`: Expand specific item
- `collapseItem(itemId)`: Collapse specific item
- `toggleItem(itemId)`: Toggle item state
- `addItem(item, index)`: Add new item
- `removeItem(itemId)`: Remove item
- `updateItem(itemId, updates)`: Update item
- `expandAll()`: Expand all items
- `collapseAll()`: Collapse all items

### Example: FAQ Accordion

```javascript
const faqAccordion = engine.createComponent('accordion', {
    allowMultiple: true,
    items: [
        {
            id: 'q1',
            title: 'How do I start a simulation?',
            content: 'To start a simulation, navigate to the dashboard and click "New Simulation"...'
        },
        {
            id: 'q2',
            title: 'What file formats are supported?',
            content: 'We support CSV, JSON, XML, and custom data formats...'
        }
    ]
});
```

## Drawer

A sliding panel component that can be opened from any side of the screen with overlay support.

### Basic Usage

```javascript
const drawer = engine.createComponent('drawer', {
    position: 'left',
    width: 300,
    title: 'Navigation',
    content: 'Dashboard\nSettings\nHelp'
});

drawer.on('drawerOpened', () => {
    console.log('Drawer opened');
});

// Open the drawer
drawer.open();
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `position` | string | 'left' | Position: 'left', 'right', 'top', 'bottom' |
| `isOpen` | boolean | false | Initial open state |
| `modal` | boolean | true | Show overlay |
| `persistent` | boolean | false | Prevent auto-close |
| `title` | string | '' | Drawer title |
| `content` | string | '' | Drawer content |
| `animationDuration` | number | 300 | Animation duration in ms |

### Events

- **drawerOpened**: Fired when drawer opens
- **drawerClosed**: Fired when drawer closes

### Methods

- `open()`: Open the drawer
- `close()`: Close the drawer
- `toggle()`: Toggle drawer state

### Example: Settings Panel

```javascript
const settingsDrawer = engine.createComponent('drawer', {
    position: 'right',
    width: 350,
    title: 'Settings',
    content: `
        Display Settings:
        • Theme: Dark/Light
        • Font Size: 14px
        • Language: English
        
        Simulation Settings:
        • Auto-save: Enabled
        • Max Iterations: 1000
    `,
    persistent: true
});
```

## SearchBox

An intelligent search component with autocomplete suggestions and debouncing.

### Basic Usage

```javascript
const searchBox = engine.createComponent('search-box', {
    x: 500,
    y: 50,
    placeholder: 'Search...',
    suggestions: [
        'Neural Networks',
        'Machine Learning',
        'Deep Learning',
        'AI Models'
    ]
});

searchBox.on('search', (event) => {
    console.log('Searching for:', event.query);
});
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `value` | string | '' | Initial search value |
| `placeholder` | string | 'Search...' | Placeholder text |
| `disabled` | boolean | false | Disable search box |
| `showClearButton` | boolean | true | Show clear button |
| `showSearchButton` | boolean | true | Show search button |
| `debounceDelay` | number | 300 | Debounce delay in ms |
| `searchOnType` | boolean | true | Search while typing |
| `minSearchLength` | number | 1 | Minimum search length |
| `suggestions` | array | [] | Suggestion list |
| `maxSuggestions` | number | 5 | Maximum suggestions shown |

### Events

- **search**: Fired when search is performed
- **valueChanged**: Fired when search value changes
- **suggestionSelected**: Fired when suggestion is selected

### Methods

- `setValue(value)`: Set search value
- `updateSuggestions()`: Update suggestion list
- `performSearch()`: Trigger search
- `clear()`: Clear search value

### Example: Dynamic Suggestions

```javascript
const smartSearch = engine.createComponent('search-box', {
    placeholder: 'Search documentation...',
    debounceDelay: 500,
    suggestions: []
});

smartSearch.on('valueChanged', async (event) => {
    if (event.value.length >= 2) {
        const suggestions = await fetchSuggestions(event.value);
        smartSearch.suggestions = suggestions;
        smartSearch.updateSuggestions();
    }
});
```

## Usage Examples

### Complete Form Example

```javascript
// Create a form with multiple input components
const form = {
    colorPicker: engine.createComponent('color-picker', {
        x: 50, y: 50,
        value: '#007bff'
    }),
    
    datePicker: engine.createComponent('datetime-picker', {
        x: 350, y: 50,
        showTime: true
    }),
    
    numberInput: engine.createComponent('number-input', {
        x: 50, y: 120,
        value: 100,
        min: 0,
        max: 1000,
        step: 10
    }),
    
    searchBox: engine.createComponent('search-box', {
        x: 350, y: 120,
        placeholder: 'Search items...'
    })
};

// Handle form submission
function submitForm() {
    const formData = {
        color: form.colorPicker.value,
        date: form.datePicker.value,
        quantity: form.numberInput.value,
        search: form.searchBox.value
    };
    
    console.log('Form Data:', formData);
}
```

### Dashboard Layout

```javascript
// Create a dashboard with drawer navigation and accordion content
const navigation = engine.createComponent('drawer', {
    position: 'left',
    title: 'Navigation',
    content: 'Dashboard\nAnalytics\nSettings\nHelp'
});

const contentAccordion = engine.createComponent('accordion', {
    x: 350, y: 50,
    width: 600,
    items: [
        {
            id: 'overview',
            title: 'Project Overview',
            content: 'Current projects and status overview...'
        },
        {
            id: 'analytics',
            title: 'Analytics Dashboard',
            content: 'Performance metrics and insights...'
        },
        {
            id: 'settings',
            title: 'Configuration',
            content: 'System and user preferences...'
        }
    ]
});

// Menu button to open navigation
const menuButton = engine.createComponent('button', {
    x: 20, y: 20,
    text: '☰ Menu',
    onClick: () => navigation.open()
});
```

## Accessibility

All input and utility components include comprehensive accessibility features:

### Keyboard Navigation

- **Tab**: Move between components
- **Enter/Space**: Activate buttons and controls
- **Arrow Keys**: Navigate within components
- **Escape**: Close modals and dropdowns

### ARIA Support

```javascript
// Components automatically include ARIA attributes
const searchBox = engine.createComponent('search-box', {
    ariaRole: 'searchbox',
    ariaLabel: 'Search products',
    ariaDescribedBy: 'search-help'
});
```

### Screen Reader Support

- Descriptive labels and roles
- State announcements
- Progress indicators
- Error messages

### High Contrast Mode

Components automatically adapt to high contrast settings and include focus indicators for keyboard navigation.

## Performance Considerations

### Optimization Tips

1. **Debouncing**: Use appropriate debounce delays for search boxes
2. **Virtual Scrolling**: For large suggestion lists
3. **Animation**: Disable animations for better performance on low-end devices
4. **Memory**: Properly dispose of components when no longer needed

### Memory Management

```javascript
// Properly dispose of components
function cleanup() {
    accordion.removeAllItems();
    drawer.close();
    searchBox.clear();
    
    // Remove event listeners
    components.forEach(component => {
        component.removeAllListeners();
    });
}
```

### Performance Monitoring

```javascript
// Monitor component performance
const monitor = {
    renderTime: 0,
    eventCount: 0,
    
    startRender() {
        this.renderStart = performance.now();
    },
    
    endRender() {
        this.renderTime += performance.now() - this.renderStart;
    }
};
```

## Troubleshooting

### Common Issues

#### Components Not Rendering

```javascript
// Ensure proper initialization
const engine = new VisualEngine(container, {
    renderMode: 'canvas',
    width: 800,
    height: 600
});

// Start the engine
engine.start();
```

#### Events Not Firing

```javascript
// Check event listener syntax
component.on('eventName', (event) => {
    console.log('Event data:', event);
});

// Verify component is added to scene
engine.addObject(component);
```

#### Styling Issues

```javascript
// Ensure CSS is loaded
import '../styles/input-utility-components.css';

// Check component dimensions
const component = engine.createComponent('accordion', {
    width: 400,  // Explicit width
    height: 300  // Explicit height
});
```

#### Performance Problems

```javascript
// Reduce animation complexity
const accordion = engine.createComponent('accordion', {
    animationDuration: 150, // Shorter animations
    items: items.slice(0, 10) // Limit item count
});

// Use requestAnimationFrame for smooth updates
function updateComponents() {
    // Update logic here
    requestAnimationFrame(updateComponents);
}
```

### Debug Mode

Enable debug mode for detailed logging:

```javascript
const engine = new VisualEngine(container, {
    debug: true,
    renderMode: 'canvas'
});

// Components will log detailed information
```

### Browser Compatibility

- **Modern Browsers**: Full support for all features
- **IE11**: Limited animation support, requires polyfills
- **Mobile**: Touch event handling, responsive layouts
- **Screen Readers**: Full ARIA support

For additional support or to report issues, please refer to the main SimulateAI documentation or contact the development team.
