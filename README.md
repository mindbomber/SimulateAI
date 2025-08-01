<!--
Copyright 2025 Armando Sori

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

# SimulateAI - AI Ethics Education Platform

## 🎯 Mission & Vision

**SimulateAI empowers educators and learners of all ages to explore the complex world of AI ethics,
robotics, and emerging technologies through open-ended, consequence-driven simulations that mirror
real-world scenarios.**

### Digital Science Laboratory Approach

Like a digital science lab, SimulateAI provides open-ended exploration with no "correct"
answers—just cause-and-effect learning through realistic scenarios. Inspired by PhET Interactive
Simulations (University of Colorado Boulder), we create research-based educational experiences
designed for universal accessibility and seamless classroom integration.

### Educational Excellence Goals

- **ISTE Standards Alignment**: Designed to meet educational technology certification requirements
- **Evidence-Based Learning**: Measurable outcomes in critical thinking and ethical reasoning
- **Universal Design**: Accessible to diverse learners across elementary through professional levels
- **Real-World Relevance**: Scenarios reflecting actual AI ethics challenges and societal impacts

## ✨ Core Features

### 🤖 AI Ethics Simulations

- **Bias Detection**: Explore how AI systems can impact different groups in society
- **Fairness Exploration**: Navigate complex trade-offs in algorithmic decision-making
- **Safety Scenarios**: Investigate consequences of AI deployment choices
- **Real-World Applications**: Hiring, lending, healthcare, and education use cases

### 🔔 Notification System

- **User-Controlled Settings**: Toggle notifications on/off from the settings menu
- **Achievement Notifications**: Get notified when you unlock new badges or complete milestones
- **Progress Updates**: Stay informed about learning progress and scenario completion
- **Firebase Cloud Messaging**: Robust push notification delivery with fallback support
- **Browser Compatibility**: Works across modern browsers with graceful degradation
- **Privacy-Focused**: All notification preferences stored locally and controlled by the user

### 🎓 Comprehensive Educator Resources

- **Lesson Plans**: Standards-aligned activities for multiple grade levels
- **Assessment Rubrics**: Evaluation frameworks for open-ended learning
- **Discussion Guides**: Structured conversation starters and reflection questions
- **Professional Development**: Training materials for confident technology integration

### 🧩 Advanced Technical Architecture

- **Modal Dialog System**: Feature-rich dialogs with animations, focus management, and accessibility
- **Navigation Menus**: Horizontal and vertical navigation with keyboard support
- **Data Visualization**: Interactive charts (line, bar, pie) with responsive design
- **Form Components**: Comprehensive form inputs with validation and accessibility
- **Tooltip System**: Smart positioning tooltips with customizable delays
- **Notification System**: Comprehensive push notification architecture with Firebase Cloud
  Messaging
  - Browser notification API integration with permission management
  - Toast notification fallbacks for unsupported browsers
  - User-configurable notification preferences in settings
  - Achievement, badge, and progress notification types
  - Robust error handling and system status reporting

### 🎯 Priority Components (NEW)

- **DataTable**: Sortable, filterable data display with pagination and export capabilities
- **NotificationToast**: Multi-type notification system with auto-dismiss and actions
- **LoadingSpinner**: Versatile loading indicators with progress tracking and cancellation

### 🏗️ Layout Components (NEW)

- **TabContainer**: Multi-tab interface with reorderable tabs, badges, and keyboard navigation
- **ProgressStepper**: Visual progress indicator for multi-step processes with validation
- **SplitPane**: Resizable and collapsible panes for flexible layout management
- **TreeView**: Hierarchical data display with expand/collapse and multi-selection
- **FileUpload**: Drag-and-drop file upload with validation and progress tracking

### 🎛️ Input & Utility Components (NEW)

- **ColorPicker**: Advanced color selection with HSL wheel, alpha support, and presets
- **DateTimePicker**: Comprehensive date/time selection with calendar and time controls
- **NumberInput**: Precise numeric input with validation, step controls, and formatting
- **Accordion**: Collapsible content sections with smooth animations
- **Drawer**: Sliding panels from any side with overlay and animation support
- **SearchBox**: Smart search with autocomplete, debouncing, and suggestions

### 🎨 Component Registry

- Centralized component management and instantiation
- Type-safe component creation and destruction
- Instance tracking and memory management
- Extensible architecture for custom components

### ♿ Accessibility First

- ARIA roles, labels, and states for all components
- Comprehensive keyboard navigation support
- Screen reader compatibility
- High contrast and reduced motion support
- Focus management and trapped focus for modals

### ⚡ Performance Optimized

- Efficient rendering with multiple backend support (Canvas, SVG, WebGL)
- Component pooling and memory management
- Optimized event handling and update cycles
- Debug tools and performance monitoring

## 📁 Project Structure

```
SimulateAI/
├── src/
│   ├── js/
│   │   ├── core/
│   │   │   └── visual-engine.js         # Enhanced with component registry
│   │   ├── components/
│   │   │   ├── settings-manager.js      # Settings system with notification controls
│   │   │   └── notification-toast.js    # Toast notification fallback system
│   │   ├── services/
│   │   │   └── notification-service.js  # Centralized notification management
│   │   ├── objects/
│   │   │   ├── interactive-objects.js   # Base interactive components
│   │   │   ├── enhanced-objects.js      # Enhanced object utilities
│   │   │   ├── advanced-ui-components.js # Advanced UI components
│   │   │   ├── priority-components.js   # High-priority components
│   │   │   ├── layout-components.js     # Layout management components
│   │   │   └── input-utility-components.js # Input & utility components
│   │   ├── fcm-main-app.js             # Firebase Cloud Messaging integration
│   │   └── demos/
│   │       └── (demo files removed - see main application)
│   ├── components/
│   │   └── shared-navigation.html      # Navigation with notification settings
│   └── styles/
│       ├── advanced-ui-components.css   # Advanced component styles
│       ├── priority-components.css      # Priority component styles
│       ├── layout-components.css        # Layout component styles
│       ├── settings-menu.css           # Settings menu with notification controls
│       └── notification-toast.css      # Toast notification styles
├── docs/
│   └── enhanced-interactive-object-system.md  # Complete documentation
├── tests/
│   └── ui-components-test.js           # Comprehensive test suite
├── notification-test.html              # Notification system robustness testing
├── firebase-messaging-sw.js           # Service worker for FCM
├── NO_HTML_GENERATION_POLICY.md       # Component development policy
└── README.md                           # This file
```

**Note**: New components no longer generate individual HTML demo or test files. See
`NO_HTML_GENERATION_POLICY.md` for details.

## 🚀 Quick Start

### 1. Basic Setup

```html
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="src/styles/advanced-ui-components.css" />
  </head>
  <body>
    <div id="demo-container" style="width: 800px; height: 600px;"></div>

    <script type="module">
      import VisualEngine from "./src/js/core/visual-engine.js";

      // Initialize the Visual Engine
      const engine = new VisualEngine(
        document.getElementById("demo-container"),
        {
          renderMode: "auto",
          accessibility: true,
          debug: true,
        },
      );

      // Create components using the registry
      const button = engine.createComponent("button", {
        x: 50,
        y: 50,
        text: "Click Me!",
        onClick: () => alert("Hello World!"),
      });

      const chart = engine.createComponent("chart", {
        x: 50,
        y: 150,
        width: 400,
        height: 200,
        type: "line",
        data: [[10, 20, 15, 25, 30]],
        labels: ["A", "B", "C", "D", "E"],
        title: "Sample Data",
      });

      engine.start();
    </script>
  </body>
</html>
```

### 2. Running the Demos

Open the interactive demo pages in a modern web browser to see all components in action:

```bash
# To explore the components, run the main application:
npm run dev

# Then navigate to:
# http://localhost:5173                               # Main SimulateAI application
```

**Component Exploration:** The enhanced UI components can be explored through the main SimulateAI
application interface. Demo functionality has been integrated into the core application rather than
separate demo files.

### 3. Running Tests

```javascript
// In browser console or test environment
import UIComponentTestSuite from "./tests/ui-components-test.js";

const testSuite = new UIComponentTestSuite();
await testSuite.runAllTests();
```

## 📚 Components Reference

### Core Interactive Components

| Component | Description                            | Key Features                                     |
| --------- | -------------------------------------- | ------------------------------------------------ |
| `Button`  | Interactive button with click handling | Visual states, keyboard support, custom styling  |
| `Slider`  | Draggable value input control          | Range validation, step increments, accessibility |
| `Meter`   | Progress/value display component       | Customizable fill, labels, value formatting      |
| `Label`   | Text display with formatting           | Font styling, color options, dynamic updates     |

### Priority Components (NEW)

| Component           | Description                     | Key Features                                     |
| ------------------- | ------------------------------- | ------------------------------------------------ |
| `DataTable`         | Sortable, filterable data table | Pagination, row selection, export, accessibility |
| `NotificationToast` | Multi-type notification system  | Auto-dismiss, actions, smart positioning         |
| `LoadingSpinner`    | Versatile loading indicators    | Progress tracking, cancellation, multiple sizes  |

### Layout Components (NEW)

| Component         | Description                  | Key Features                                                 |
| ----------------- | ---------------------------- | ------------------------------------------------------------ |
| `TabContainer`    | Multi-tab interface          | Reorderable tabs, badges, close buttons, keyboard navigation |
| `ProgressStepper` | Multi-step process indicator | Horizontal/vertical, validation, click navigation            |
| `SplitPane`       | Resizable layout panes       | Drag-to-resize, collapsible, nested layouts                  |
| `TreeView`        | Hierarchical data display    | Expand/collapse, multi-selection, icons, lazy loading        |
| `FileUpload`      | File upload with drag-drop   | Validation, progress tracking, multiple files                |

### Advanced UI Components

| Component        | Description                          | Key Features                                         |
| ---------------- | ------------------------------------ | ---------------------------------------------------- |
| `ModalDialog`    | Feature-rich dialog system           | Animations, focus trapping, backdrop handling        |
| `NavigationMenu` | Menu system with keyboard navigation | Horizontal/vertical layouts, selection states        |
| `Chart`          | Data visualization component         | Line/bar/pie charts, legends, responsive design      |
| `FormField`      | Form input with validation           | Multiple input types, error handling, accessibility  |
| `Tooltip`        | Contextual help system               | Smart positioning, delay configuration, rich content |

### Input & Utility Components (NEW)

| Component        | Description                  | Key Features                                        |
| ---------------- | ---------------------------- | --------------------------------------------------- |
| `ColorPicker`    | Advanced color selection     | HSL wheel, alpha support, presets, multiple formats |
| `DateTimePicker` | Date and time input          | Calendar interface, time controls, date validation  |
| `NumberInput`    | Precise numeric input        | Step controls, validation, precision formatting     |
| `Accordion`      | Collapsible content sections | Smooth animations, multiple expand modes            |
| `Drawer`         | Sliding panel component      | Multiple positions, overlay, animation support      |
| `SearchBox`      | Smart search input           | Autocomplete, debouncing, suggestions               |

## 🎨 Usage Examples

### Creating a Modal Dialog

```javascript
const modal = engine.createComponent("modal-dialog", {
  title: "Confirmation",
  content: `
        <p>Are you sure you want to delete this item?</p>
        <p>This action cannot be undone.</p>
    `,
  buttons: [
    { text: "Cancel", action: "close", variant: "secondary" },
    { text: "Delete", callback: handleDelete, variant: "danger" },
  ],
  closable: true,
  backdrop: true,
  animation: "slide",
});

modal.open();
```

### Building a Navigation Interface

```javascript
const navigation = engine.createComponent("navigation-menu", {
  x: 20,
  y: 20,
  width: 250,
  height: 400,
  orientation: "vertical",
  items: [
    { text: "Dashboard", icon: "📊", action: () => showDashboard() },
    { text: "Analytics", icon: "📈", action: () => showAnalytics() },
    { text: "Settings", icon: "⚙️", action: () => showSettings() },
    { text: "Help", icon: "❓", action: () => showHelp() },
  ],
});
```

### Creating Priority Components

```javascript
// DataTable with AI model results
const dataTable = engine.createComponent("data-table", {
  x: 20,
  y: 60,
  width: 700,
  height: 350,
  columns: [
    { key: "name", title: "Model Name", sortable: true },
    {
      key: "accuracy",
      title: "Accuracy",
      type: "number",
      format: (v) => `${(v * 100).toFixed(1)}%`,
    },
    { key: "bias_score", title: "Bias Score", sortable: true },
    { key: "ethics_rating", title: "Ethics Rating" },
  ],
  data: aiModelResults,
  pagination: true,
  pageSize: 15,
});

// Success notification
const successToast = engine.createComponent("notification-toast", {
  message: "Model training completed successfully!",
  type: "success",
  duration: 5000,
  actions: [
    { text: "View Results", callback: showResults },
    { text: "Export Data", callback: exportData },
  ],
});

// Loading spinner with progress
const loadingSpinner = engine.createComponent("loading-spinner", {
  x: 400,
  y: 300,
  size: "large",
  message: "Training neural network...",
  progress: 0.65,
  cancellable: true,
  onCancel: stopTraining,
});
```

### Creating Data Visualizations

```javascript
// Line chart
const lineChart = engine.createComponent("chart", {
  x: 50,
  y: 100,
  width: 500,
  height: 250,
  type: "line",
  data: [
    [10, 25, 18, 35, 42, 28, 55], // Series 1
    [15, 20, 30, 25, 38, 45, 40], // Series 2
  ],
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
  title: "Performance Trends",
  colors: ["#3498db", "#e74c3c"],
  showLegend: true,
});
```

### Building Layout Components

```javascript
// Tab container for multi-view interface
const tabContainer = engine.createComponent("tab-container", {
  x: 50,
  y: 50,
  width: 700,
  height: 400,
  tabs: [
    {
      id: "overview",
      title: "Overview",
      icon: "📊",
      content: "System overview",
    },
    {
      id: "data",
      title: "Data View",
      icon: "📁",
      content: "Data visualization",
    },
    {
      id: "analysis",
      title: "Analysis",
      icon: "🔍",
      content: "Analysis results",
    },
  ],
  closeable: true,
  reorderable: true,
});

// Progress stepper for workflows
const workflowStepper = engine.createComponent("progress-stepper", {
  x: 50,
  y: 500,
  width: 700,
  height: 80,
  steps: [
    { id: "data", title: "Data Collection", completed: true },
    { id: "processing", title: "Processing", completed: true },
    { id: "analysis", title: "Analysis", completed: false },
    { id: "results", title: "Results", completed: false },
  ],
  currentStep: 2,
  allowStepClick: true,
});

// Split pane layout
const splitPane = engine.createComponent("split-pane", {
  x: 50,
  y: 50,
  width: 800,
  height: 500,
  orientation: "horizontal",
  split: 0.3,
  resizable: true,
  collapsible: true,
  leftPane: "Navigation content",
  rightPane: "Main content area",
});

// Tree view for hierarchical data
const treeView = engine.createComponent("tree-view", {
  x: 50,
  y: 50,
  width: 300,
  height: 400,
  data: [
    {
      id: "models",
      label: "AI Models",
      icon: "🤖",
      children: [
        { id: "nn", label: "Neural Networks", icon: "🧠" },
        { id: "ml", label: "Machine Learning", icon: "📊" },
      ],
    },
  ],
  multiSelect: true,
  showCheckboxes: true,
});

// File upload component
const fileUpload = engine.createComponent("file-upload", {
  x: 50,
  y: 50,
  width: 400,
  height: 200,
  multiple: true,
  accept: ".csv,.json,.txt",
  maxFileSize: 10 * 1024 * 1024, // 10MB
  uploadText: "Drop training data files here",
});
```

### Creating Input & Utility Components

```javascript
// Advanced color picker
const colorPicker = engine.createComponent("color-picker", {
  x: 50,
  y: 50,
  value: "#3498db",
  showAlpha: true,
  presets: ["#3498db", "#e74c3c", "#2ecc71", "#f39c12"],
});

colorPicker.on("colorChanged", (event) => {
  updateThemeColor(event.value);
});

// Date range picker for analytics
const dateRange = engine.createComponent("datetime-picker", {
  x: 300,
  y: 50,
  showTime: false,
  format: "YYYY-MM-DD",
  minDate: new Date("2024-01-01"),
  maxDate: new Date(),
});

// Smart search with suggestions
const searchBox = engine.createComponent("search-box", {
  x: 50,
  y: 150,
  placeholder: "Search AI models...",
  suggestions: [
    "Neural Network",
    "Deep Learning Model",
    "Computer Vision",
    "Natural Language Processing",
    "Reinforcement Learning",
  ],
  debounceDelay: 300,
});

searchBox.on("search", async (event) => {
  const results = await searchModels(event.query);
  displaySearchResults(results);
});

// Settings accordion
const settingsAccordion = engine.createComponent("accordion", {
  x: 400,
  y: 150,
  width: 350,
  items: [
    {
      id: "model-settings",
      title: "Model Configuration",
      icon: "🤖",
      content: "Learning rate, batch size, epochs configuration...",
    },
    {
      id: "data-settings",
      title: "Data Processing",
      icon: "📊",
      content: "Data preprocessing, augmentation, validation split...",
    },
    {
      id: "export-settings",
      title: "Export Options",
      icon: "💾",
      content: "Model export formats, optimization settings...",
    },
  ],
});

// Navigation drawer
const navigationDrawer = engine.createComponent("drawer", {
  position: "left",
  width: 280,
  title: "AI Toolkit",
  content: `
        🏠 Dashboard
        🧠 Neural Networks
        👁️ Computer Vision
        💬 NLP Models
        📈 Analytics
        ⚙️ Settings
    `,
});
```

## ♿ Accessibility Features

### Keyboard Navigation

- **Tab/Shift+Tab**: Navigate between interactive elements
- **Enter/Space**: Activate buttons and controls
- **Arrow Keys**: Navigate menus and adjust sliders
- **Escape**: Close modals and dropdowns
- **Home/End**: Jump to first/last items

### Screen Reader Support

- Proper semantic markup and ARIA roles
- Descriptive labels and help text
- Live regions for dynamic content updates
- State change announcements

## 🧪 Testing

### Running the Test Suite

```javascript
// Automated testing
import UIComponentTestSuite from "./tests/ui-components-test.js";

const testSuite = new UIComponentTestSuite();
const results = await testSuite.runAllTests();

console.log(`Tests: ${results.passed}/${results.total} passed`);
```

### Component Development Policy

**⚠️ Important**: As of the latest update, **we no longer generate HTML demo files or test files**
for new components. This policy helps maintain consistency and reduces maintenance overhead.

For new components, create:

- ✅ JavaScript demo classes (integrated with existing demos)
- ✅ CSS stylesheets
- ✅ JavaScript test suites
- ✅ Markdown documentation
- ❌ ~~HTML demo pages~~
- ❌ ~~HTML test files~~

See `NO_HTML_GENERATION_POLICY.md` for complete details.

## 📞 Support

- **Documentation**:
  [Enhanced Interactive Object System Guide](docs/enhanced-interactive-object-system.md)
- **Developer Guide**: [Component Development Workflow](docs/DEVELOPER_GUIDE.md)
- **Policy Document**: [HTML Generation Policy](NO_HTML_GENERATION_POLICY.md)
- **Examples**: Check existing HTML demo files for usage examples
- **Tests**: Run the JavaScript test suites for verification
- **Component Verification**: Run `npm run verify` to check all components

### Development Quick Start

```bash
# Verify project structure and policy compliance
npm run verify

# Check that no HTML generation policy is followed
npm run check-policy

# Format code according to standards
npm run format

# Lint JavaScript files
npm run lint
```

---

## 🎉 Conclusion

The Enhanced Interactive Object System represents a significant advancement in SimulateAI's UI
capabilities. With its comprehensive component library, accessibility-first design, and extensible
architecture, it provides a solid foundation for building sophisticated AI simulation interfaces.

**Ready to build amazing AI simulation interfaces? Start with the demo and explore the
possibilities!** 🚀

```bash
git clone https://github.com/mindbomber/SimulateAI.git
```

2. Navigate to the project directory:
   ```bash
   cd SimulateAI
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser to `http://localhost:3000`

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Contributing

This project follows accessibility-first development practices. All interactive elements must be
keyboard navigable and screen reader compatible.

## Educational Philosophy

SimulateAI is built on the principle that complex ethical concepts become more accessible through
interactive exploration. Each simulation:

- Presents real-world scenarios without prescriptive solutions
- Encourages critical thinking through guided discovery
- Provides immediate feedback on decisions and their consequences
- Supports multiple learning styles through varied interaction modes

## License

MIT License - This project is open source and available for educational use.

## Repository

- **GitHub**: https://github.com/mindbomber/SimulateAI
- **Issues**: https://github.com/mindbomber/SimulateAI/issues
- **Contributions**: Welcome! Please see our contributing guidelines in the development guide.

## Contact

For questions about this educational platform, please open an issue on GitHub.
