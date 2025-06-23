# SimulateAI Development Guide

## Getting Started

### Prerequisites
- Node.js (16.0 or higher)
- npm (7.0 or higher)
- Modern web browser with ES6+ support
- Git for version control

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

## Project Architecture

### Core Components

#### Engine (`src/js/core/engine.js`)
The `SimulationEngine` is the heart of the application, providing:
- Multi-renderer support (SVG, Canvas, WebGL)
- Scene management and render loops
- Event handling and input management
- Performance monitoring and optimization

#### Simulation Base (`src/js/core/simulation.js`)
The `EthicsSimulation` class provides:
- Common simulation lifecycle methods
- Metrics tracking and scenario management
- Event system for user interactions
- Progress saving and restoration

#### UI System (`src/js/core/ui.js`)
Modular UI components including:
- Panels, buttons, sliders, and form controls
- Ethics-specific displays and feedback systems
- Responsive and accessible design patterns

#### Accessibility (`src/js/core/accessibility.js`)
Comprehensive accessibility support:
- Keyboard navigation management
- Screen reader compatibility
- Focus management and ARIA attributes
- High contrast and reduced motion support

### Simulation Development

#### Creating a New Simulation

1. **Extend EthicsSimulation**:
```javascript
class MySimulation extends EthicsSimulation {
  constructor(containerId) {
    super(containerId, {
      title: 'Simulation Title',
      description: 'Brief description',
      learningObjectives: ['Objective 1', 'Objective 2'],
      difficulty: 'beginner|intermediate|advanced',
      estimatedTime: 15 // minutes
    });
  }

  async initialize() {
    await super.initialize();
    // Custom initialization
  }

  // Override lifecycle methods as needed
}
```

2. **Implement Required Methods**:
- `initialize()`: Setup simulation state and UI
- `reset()`: Return to initial state
- `getReflectionQuestions()`: Return discussion prompts

3. **Register Your Simulation**:
```javascript
// At the end of your simulation file
if (typeof window !== 'undefined') {
  window.MySimulation = MySimulation;
}
```

#### Simulation Structure Best Practices

- **Modular Design**: Break complex simulations into smaller, reusable components
- **Accessibility First**: All interactive elements must be keyboard accessible
- **Progressive Disclosure**: Introduce complexity gradually
- **Meaningful Feedback**: Provide immediate, constructive responses to user actions
- **Reflection Integration**: Include thoughtful discussion questions

### Rendering Options

#### SVG Renderer (`src/js/renderers/svg-renderer.js`)
Best for:
- Vector graphics and illustrations
- Interactive diagrams
- Text-heavy content
- Accessible graphics with semantic markup

#### Canvas Renderer (`src/js/renderers/canvas-renderer.js`)
Best for:
- Data visualizations and charts
- Animated graphics
- Performance-critical rendering
- Pixel-based effects

#### WebGL Renderer (planned)
Best for:
- 3D visualizations
- Complex animations
- Large datasets
- Advanced visual effects

### UI Component Guidelines

#### Component Creation
```javascript
// Create reusable components
const panel = this.ui.createPanel({
  title: 'Panel Title',
  className: 'custom-panel',
  style: 'width: 300px;'
});

const button = this.ui.createButton({
  text: 'Click Me',
  onClick: () => this.handleClick(),
  className: 'primary-button'
});
```

#### Accessibility Requirements
- All interactive elements must have appropriate ARIA labels
- Keyboard navigation must be logical and complete
- Color cannot be the only way to convey information
- Focus indicators must be clearly visible

### State Management

#### Metrics Tracking
```javascript
// Update simulation metrics
this.updateMetrics({
  decisionsMade: this.decisions.length,
  ethicalScore: this.calculateEthicalScore(),
  timeSpent: Date.now() - this.startTime
});

// Get current metrics
const metrics = this.getMetrics();
```

#### Event System
```javascript
// Trigger events for important actions
this.triggerEvent('decisionMade', {
  decision: userChoice,
  scenario: currentScenario,
  timestamp: Date.now()
});

// Listen for events
this.on('decisionMade', (data) => {
  // Handle decision
});
```

## Development Workflow

### Code Style
- Use ESLint configuration for consistent code style
- Format code with Prettier before committing
- Follow semantic naming conventions
- Write descriptive comments for complex logic

### Testing Strategy
- Test all interactive elements with keyboard navigation
- Verify screen reader compatibility
- Test on multiple browsers and devices
- Validate accessibility with automated tools

### Performance Considerations
- Optimize render loops for smooth animations
- Use requestAnimationFrame for timing-critical code
- Implement lazy loading for large assets
- Monitor memory usage in long-running simulations

## Deployment

### Build Process
1. Run linting: `npm run lint`
2. Build for production: `npm run build`
3. Test production build: `npm run preview`

### Browser Support
- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Contributing

### Pull Request Process
1. Create feature branch from main
2. Implement changes with tests
3. Ensure accessibility compliance
4. Update documentation if needed
5. Submit pull request with clear description

### Code Review Checklist
- [ ] Accessibility standards met
- [ ] Code follows style guidelines
- [ ] No console errors or warnings
- [ ] Performance impact considered
- [ ] Documentation updated

## Resources

### Accessibility Guidelines
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

### Educational Design
- [Universal Design for Learning](https://www.cast.org/impact/universal-design-for-learning-udl)
- [Constructivist Learning Theory](https://www.simplypsychology.org/constructivism.html)

### Ethics Resources
- [AI Ethics Guidelines](https://ai.google/principles/)
- [Algorithmic Justice League](https://www.ajl.org/)
- [Partnership on AI](https://www.partnershiponai.org/)
