---
applyTo: "**"
---

# SimulateAI Development Guidelines

Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.

## CSS Architecture Standards

### CSS Layers Implementation

**CRITICAL**: All CSS development MUST follow the CSS layers architecture defined in `src/styles/css-layers.css`.

#### Layer Order (lowest to highest specificity):

1. `@layer reset` - CSS reset and normalization
2. `@layer tokens` - Design tokens and CSS custom properties
3. `@layer base` - Base element styles (html, body, headings)
4. `@layer layout` - Layout components (containers, grids, flex utilities)
5. `@layer components` - UI components (buttons, cards, modals)
6. `@layer utilities` - Utility classes and helper styles
7. `@layer overrides` - Theme overrides and state-specific styles

#### CSS Development Rules:

**Component Styles:**

- Place component-specific styles in `@layer components`
- Focus on base/light theme styles only in component files
- Use semantic CSS custom properties: `var(--color-primary)`, `var(--spacing-4)`, etc.
- Avoid `!important` declarations (layers handle specificity)

**Dark Mode & Theming:**

- **NEVER** add dark mode styles to individual component files
- **ALL** dark mode styles belong in `@layer overrides` in `css-layers.css`
- Use standardized selectors: `body.dark-mode` and `body.theme-dark`
- Use theme variables: `var(--theme-bg-primary)`, `var(--theme-text-primary)`, etc.

**Layout & Utilities:**

- Use existing utility classes from `@layer utilities` when possible
- Add new utilities to css-layers.css, not component files
- Layout helpers belong in `@layer layout`

#### Example Structure:

```css
/* ❌ WRONG - Don't add dark mode to component files */
.my-component {
  background: white;
}
.dark-mode .my-component {
  background: black;
}

/* ✅ CORRECT - Component file has base styles only */
@layer components {
  .my-component {
    background: var(--color-background);
    color: var(--color-text);
  }
}

/* ✅ CORRECT - Dark mode goes in css-layers.css @layer overrides */
@layer overrides {
  body.dark-mode .my-component,
  body.theme-dark .my-component {
    background: var(--theme-bg-secondary);
    color: var(--theme-text-primary);
  }
}
```

### File Organization:

- `css-layers.css` - Master architecture file (load FIRST)
- `design-tokens.css` - CSS custom properties and theme variables
- Component files - Base styles only, no theme overrides
- Individual component files should include `@layer components` wrapper

### Theme System:

- Light theme: Use base design tokens (`--color-primary`, `--color-background`)
- Dark theme: Use theme variables (`--theme-bg-primary`, `--theme-text-primary`)
- System preference: Support both `body.dark-mode` (manual) and `body.theme-dark` (system)

## JavaScript Guidelines

### Theme Management:

- Use `settings-manager.js` for theme control
- Apply themes via body classes: `body.theme-dark`, `body.dark-mode`
- Clean up any inline styles that conflict with CSS cascade
- Support system preference detection and manual override

### DataHandler Usage

**CRITICAL**: Use the centralized `DataHandler` class for ALL data operations. Located at `src/js/core/data-handler.js`.

#### Core Principles:

- **Single Source of Truth**: All data operations go through DataHandler
- **Firebase + localStorage Hybrid**: Automatic sync with graceful fallback
- **Offline-First**: Operations queue automatically when offline
- **Caching**: Built-in intelligent caching reduces redundant operations
- **GDPR Compliance**: Built-in data export and deletion methods

#### Initialization:

```javascript
// ✅ CORRECT - Initialize with options
const dataHandler = new DataHandler({
  appName: "SimulateAI",
  version: "1.70",
  firebaseService: firebaseServiceInstance, // optional
  enableCaching: true,
  enableOfflineQueue: true,
});

// ❌ WRONG - Direct localStorage access
localStorage.setItem("userdata", JSON.stringify(data));
```

#### Data Operations:

**Basic CRUD Operations:**

```javascript
// ✅ Save data (auto-syncs to Firebase when available)
await dataHandler.saveData("user_preferences", preferences);

// ✅ Get data (checks cache, then Firebase, then localStorage)
const data = await dataHandler.getData("user_preferences");

// ✅ Remove data (removes from all storage locations)
await dataHandler.removeData("user_preferences");
```

**Specialized Methods:**

```javascript
// User profile management
await dataHandler.saveUserProfile(profileData);
const profile = await dataHandler.getUserProfile();

// Scenario progress tracking
await dataHandler.saveScenarioCompletion(completionData);
const completions = await dataHandler.getScenarioCompletions();

// Blog system integration
await dataHandler.saveBlogComments(postId, comments);
const comments = await dataHandler.getBlogComments(postId);

// Research consent management
await dataHandler.saveConsentData(consentData);
const consent = await dataHandler.getConsentData();

// Onboarding tour tracking
await dataHandler.saveOnboardingProgress(progressData);
const progress = await dataHandler.getOnboardingProgress();
```

#### Error Handling:

```javascript
// ✅ CORRECT - DataHandler handles errors gracefully
try {
  const data = await dataHandler.getData("key");
  if (!data) {
    // Handle no data case
    console.log("No data found, using defaults");
  }
} catch (error) {
  // DataHandler already logged the error
  console.log("Using fallback data");
}

// ❌ WRONG - Manual error handling for storage
try {
  const data = JSON.parse(localStorage.getItem("key"));
} catch (e) {
  // Manual error handling complexity
}
```

#### GDPR Compliance:

```javascript
// Export all user data
const exportData = await dataHandler.exportUserData();

// Delete user profile (GDPR right to be forgotten)
await dataHandler.deleteUserProfile();

// Delete specific data types
await dataHandler.deleteOnboardingData();
```

#### Performance Best Practices:

- Use batch operations for multiple data updates
- Leverage caching by avoiding `bypassCache: true` unless necessary
- Monitor performance with `dataHandler.getPerformanceMetrics()`
- Check health status with `dataHandler.healthCheck()`

#### Integration Patterns:

**Component Integration:**

```javascript
class MyComponent {
  constructor() {
    this.dataHandler = window.dataHandler || new DataHandler();
  }

  async loadUserData() {
    const userData = await this.dataHandler.getUserProfile();
    this.renderUserInterface(userData);
  }
}
```

**Settings Manager Integration:**

```javascript
// Settings manager should use DataHandler for persistence
class SettingsManager {
  async saveSettings(settings) {
    return await this.dataHandler.saveSettings(settings);
  }
}
```

#### File Patterns:

- Import DataHandler: `import DataHandler from './core/data-handler.js'`
- Global access: `window.dataHandler` (set in app initialization)
- Never bypass DataHandler for direct localStorage/Firebase access
- Use DataHandler's specialized methods rather than generic get/set when available

### Global Event Manager

**CRITICAL**: Use the centralized `GlobalEventManager` for ALL event handling to prevent conflicts and improve performance. Located at `src/js/core/global-event-manager.js`.

#### Core Principles:

- **Event Delegation**: Single source of truth for all DOM event handling
- **Performance Optimization**: Unified event listeners reduce memory usage
- **Component Coordination**: Centralized notification system prevents conflicts
- **Analytics Integration**: Built-in event tracking and performance monitoring
- **Memory Management**: Proper cleanup prevents memory leaks

#### Initialization:

```javascript
// ✅ CORRECT - Use the global instance
import globalEventManager from "./core/global-event-manager.js";

// Initialize early in app startup
globalEventManager.initialize();

// Register your component
globalEventManager.registerComponent("myComponent", this, {
  navigation: this.handleNavigation.bind(this),
  "modal.close": this.handleModalClose.bind(this),
});

// ❌ WRONG - Direct event listeners on multiple elements
document.querySelectorAll(".button").forEach((btn) => {
  btn.addEventListener("click", handler);
});
```

#### Event Handling Patterns:

**Component Registration:**

```javascript
class MyComponent {
  constructor() {
    // Register with GlobalEventManager
    globalEventManager.registerComponent("myComponent", this, {
      "simulation.start": this.handleSimulationStart.bind(this),
      navigation: this.handleNavigation.bind(this),
      "modal.close": this.closeModal.bind(this),
    });
  }

  // Handle specific events
  handleSimulationStart(data) {
    console.log("Simulation starting:", data.simulationId);
  }

  // Generic event handler (fallback)
  handleEvent(eventType, data) {
    console.log(`Received event: ${eventType}`, data);
  }
}
```

**Automatic Event Delegation:**

The GlobalEventManager automatically handles these patterns:

```javascript
// ✅ AUTOMATIC - These work without additional setup
<button id="start-learning">Start Learning</button>
<button class="enhanced-sim-button" data-simulation="ethics-101">Start</button>
<button class="modal-close">Close</button>
<div data-nav-item="categories">Categories</div>
<div data-simulation-action="reset">Reset</div>
```

#### Built-in Event Categories:

- **Navigation Events**: Page navigation, menu interactions
- **Simulation Events**: Start, reset, next scenario actions
- **Modal Events**: Open, close, backdrop clicks, focus trapping
- **UI Interactions**: Button clicks, view toggles, grid selections
- **Accessibility**: Keyboard navigation, screen reader support
- **System Events**: Error handling, theme changes, app lifecycle

#### Performance Benefits:

```javascript
// ✅ EFFICIENT - Global delegation
// Single click listener handles ALL buttons
globalEventManager.handleDelegatedClick(event);

// ❌ INEFFICIENT - Individual listeners
document.querySelectorAll("button").forEach((btn) => {
  btn.addEventListener("click", individualHandler);
});
```

#### Analytics Integration:

```javascript
// ✅ AUTOMATIC - Events are tracked automatically
// No additional code needed in components

// Analytics data is sent to:
// - window.simpleAnalytics.trackEvent()
// - app.analyticsManager.trackEvent()

// Example tracked events:
// - button_click, navigation_click, simulation_action
// - modal_interaction, view_toggle, demo_pattern
```

#### Component Patterns:

**Modal Components:**

```javascript
class ModalComponent {
  constructor() {
    globalEventManager.registerComponent("modal", this, {
      "modal.close": this.close.bind(this),
      "modal.backdrop-click": this.handleBackdropClick.bind(this),
      "modal.tab-trap": this.handleTabTrap.bind(this),
      "system.escape": this.handleEscape.bind(this),
    });
  }
}
```

**Navigation Components:**

```javascript
class NavigationComponent {
  constructor() {
    globalEventManager.registerComponent("navigation", this, {
      navigation: this.handleNavClick.bind(this),
      "navigation.start_learning": this.startLearning.bind(this),
    });
  }
}
```

#### Data Attributes for Event Delegation:

Use these data attributes for automatic event handling:

```html
<!-- Navigation -->
<div data-nav-item="categories">Categories</div>

<!-- Simulation Controls -->
<button data-simulation-action="start">Start</button>
<button data-simulation-action="reset">Reset</button>

<!-- Modal Controls -->
<button data-modal-action="close">Close</button>
<div data-modal-action="backdrop-click">Backdrop</div>

<!-- Grid Items -->
<div class="category-card" data-category-id="ethics">Ethics</div>
<div class="scenario-card" data-scenario-id="trolley">Trolley Problem</div>
```

#### Memory Management:

```javascript
// ✅ AUTOMATIC - Cleanup handled by GlobalEventManager
// Components are automatically cleaned up when:
// - Page unloads (beforeunload event)
// - Manual cleanup: window.globalEventManagerCleanup()

// ❌ WRONG - Manual cleanup required
element.addEventListener("click", handler);
// Must remember to: element.removeEventListener('click', handler);
```

#### Debugging and Monitoring:

```javascript
// Enable debug mode
localStorage.setItem("debug", "true");

// Get performance statistics
const stats = globalEventManager.getStats();
console.log("Event stats:", stats);

// Disable/enable specific components
globalEventManager.disableComponent("problematicComponent");
globalEventManager.enableComponent("fixedComponent");
```

#### Integration Rules:

- **NEVER** add direct event listeners when GlobalEventManager can handle it
- Use data attributes for automatic delegation when possible
- Register components early in their lifecycle
- Use specialized event handlers rather than generic ones
- Let GlobalEventManager handle analytics tracking automatically
- Clean up is automatic - no manual removeEventListener needed

### UIBinder Usage

**CRITICAL**: Use the centralized `UIBinder` class for ALL UI operations including themes, modals, components, and animations. Located at `src/js/core/ui-binder.js`.

#### Core Principles:

- **Unified UI Management**: Single source of truth for all UI operations
- **Performance Optimization**: Batched DOM operations and efficient event delegation
- **Theme Management**: Centralized theme application with caching
- **Component Registry**: Factory-based component creation and lifecycle management
- **Accessibility First**: Built-in accessibility features and ARIA support
- **Animation Coordination**: Queued animations to prevent performance issues

#### Initialization:

```javascript
// ✅ CORRECT - Initialize with options
const uiBinder = new UIBinder({
  dataHandler: dataHandlerInstance,
  enableThemeManager: true,
  enableAccessibility: true,
  enablePerformanceMonitoring: true,
});

await uiBinder.initialize();

// ❌ WRONG - Manual theme and modal management
document.body.className = "theme-dark";
const modal = document.createElement("div");
```

#### Theme Management:

```javascript
// ✅ Apply themes through UIBinder
await uiBinder.applyTheme("dark");
await uiBinder.applyTheme("light", { temporary: true });

// ✅ Custom theme data
const customTheme = {
  cssVariables: {
    "--primary-bg": "#2a2a2a",
    "--text-primary": "#ffffff",
  },
  bodyClasses: ["theme-custom"],
  componentStyles: {},
};
await uiBinder.loadThemeData("custom");
```

#### Modal Management:

```javascript
// ✅ Create modals through UIBinder
const modal = await uiBinder.showModal({
  title: "Confirmation",
  content: "Are you sure you want to proceed?",
  actions: [
    {
      id: "confirm",
      label: "Confirm",
      type: "primary",
      handler: () => {
        console.log("Confirmed");
        return true; // Close modal
      },
    },
    {
      id: "cancel",
      label: "Cancel",
      type: "secondary",
      handler: () => false, // Keep modal open
    },
  ],
  onShow: (modalElement) => console.log("Modal shown"),
  onClose: () => console.log("Modal closed"),
});

// ❌ WRONG - Manual modal creation
const modal = document.createElement("div");
modal.innerHTML = '<div class="modal-content">...</div>';
```

#### Component Registration:

```javascript
// ✅ Register components with UIBinder
uiBinder.registerComponent("scenarioCard", {
  factory: (container, props, uiBinder) => {
    const card = uiBinder.createElement("div", {
      className: "scenario-card",
      dataset: { scenarioId: props.id },
    });

    // Component logic here
    return {
      element: card,
      update: (newProps) => {
        /* update logic */
      },
      destroy: () => {
        /* cleanup logic */
      },
    };
  },
});

// ✅ Create component instances
const scenarioCard = await uiBinder.createComponent(
  "scenarioCard",
  containerElement,
  { id: "ethics-101", title: "Ethics Basics" },
);
```

#### Animation Management:

```javascript
// ✅ Queue animations through UIBinder
uiBinder.queueAnimation({
  element: cardElement,
  type: "fadeIn",
  duration: 300,
  easing: "ease-in-out",
});

uiBinder.queueAnimation({
  element: modalElement,
  type: "slideIn",
  duration: 250,
});

// ✅ Custom animations
uiBinder.queueAnimation({
  element: customElement,
  executor: (element, resolve) => {
    // Custom animation logic
    element.animate(
      [
        { transform: "scale(0.9)", opacity: 0 },
        { transform: "scale(1)", opacity: 1 },
      ],
      { duration: 200 },
    ).onfinish = resolve;
  },
});
```

#### Event Integration:

```javascript
// ✅ Listen to UIBinder events
uiBinder.on("themeChanged", (event) => {
  console.log("Theme changed to:", event.detail.theme);
});

uiBinder.on("action", (event) => {
  const { action, element } = event.detail;
  console.log("Action triggered:", action);
});

uiBinder.on("componentClick", (event) => {
  const { component, element } = event.detail;
  console.log("Component clicked:", component);
});

// ✅ Emit custom events
uiBinder.emit("userAction", { action: "scenario_completed", data: {} });
```

#### Accessibility Features:

```javascript
// ✅ AUTOMATIC - UIBinder handles accessibility automatically
// - High contrast mode detection
// - Reduced motion preferences
// - Focus management in modals
// - Keyboard navigation support
// - ARIA attributes

// ✅ Check accessibility status
const health = uiBinder.healthCheck();
console.log("Accessibility status:", health.accessibility);
```

#### Performance Optimization:

```javascript
// ✅ UIBinder optimizes performance automatically
// - Batched DOM operations
// - CSS variable batching
// - Animation queuing
// - Throttled mutation observation
// - Event delegation

// ✅ Monitor performance
const metrics = uiBinder.getPerformanceMetrics();
console.log("UI Performance:", metrics);
```

#### Component Patterns:

**Data-Driven Components:**

```javascript
class ScenarioComponent {
  constructor(container, uiBinder) {
    this.uiBinder = uiBinder;
    this.container = container;

    // Register for UI events
    this.uiBinder.on("themeChanged", this.handleThemeChange.bind(this));
  }

  async render(data) {
    // Use UIBinder for DOM operations
    const card = this.uiBinder.createElement("div", {
      className: "scenario-card",
      dataset: { scenarioId: data.id },
    });

    // Use UIBinder for animations
    this.uiBinder.queueAnimation({
      element: card,
      type: "fadeIn",
    });

    this.container.appendChild(card);
  }
}
```

#### Integration Rules:

- **NEVER** manipulate DOM directly when UIBinder can handle it
- Use UIBinder for all theme changes and modal creation
- Register components with UIBinder for lifecycle management
- Leverage UIBinder's animation system for smooth transitions
- Use UIBinder's event system for component communication
- Let UIBinder handle accessibility features automatically

## VS Code Toolsets

**CRITICAL**: Use the appropriate VS Code toolsets for different development tasks. These provide optimized tool collections for specific workflows.

### Development Toolsets:

#### Core Development: `simulateai-development`

**When to use**: General development, file editing, basic commands

- **Tools**: codebase, editFiles, runCommands, runTasks, problems, changes
- **Use for**: Daily development tasks, exploring code, editing files
- **Example**: Adding new features, fixing bugs, general code exploration

#### Build & Test: `simulateai-build-and-test`

**When to use**: Running builds, tests, and validation

- **Tools**: runTasks, runCommands, runTests, problems
- **Use for**: Development server, production builds, testing workflows
- **Example**: `npm run dev`, `npm run build`, `npm run test`

#### Code Analysis: `simulateai-code-analysis`

**When to use**: Understanding code patterns, dependencies, quality issues

- **Tools**: codebase, search, usages, problems, findTestFiles
- **Use for**: Code reviews, refactoring planning, finding patterns
- **Example**: Analyzing component dependencies, finding usage patterns

#### Debugging: `simulateai-debugging`

**When to use**: Troubleshooting errors, investigating issues

- **Tools**: problems, runCommands, terminalLastCommand, terminalSelection, testFailure
- **Use for**: Error investigation, console debugging, test failures
- **Example**: Investigating build errors, debugging component issues

#### Code Cleanup: `simulateai-code-cleanup-linting`

**When to use**: Code quality, formatting, linting tasks

- **Tools**: runCommands, runTasks, problems, editFiles, codebase
- **Use for**: ESLint fixes, Prettier formatting, code style enforcement
- **Example**: Running cleanup scripts, fixing linting errors

### Specialized Toolsets:

#### MCP Development: `simulateai-mcp-development`

**When to use**: Working with Model Context Protocol features

- **Tools**: codebase, editFiles, runCommands, githubRepo, fetch
- **Use for**: AI integrations, external API work, research features
- **Example**: GitHub repo analysis, web content fetching

#### Firebase Deployment: `simulateai-firebase-deployment`

**When to use**: Deployment and cloud services

- **Tools**: runCommands, runTasks, problems, terminalLastCommand, changes
- **Use for**: Firebase hosting, functions, deployment pipelines
- **Example**: `firebase deploy`, cloud function updates

#### Security Analysis: `simulateai-security-analysis`

**When to use**: Security checks and vulnerability scanning

- **Tools**: runCommands, problems, codebase, search, editFiles
- **Use for**: Security audits, dependency checks, pre-commit validation
- **Example**: npm audit, security scanning scripts

#### Performance Optimization: `simulateai-performance-optimization`

**When to use**: Performance tuning and optimization

- **Tools**: runCommands, codebase, search, problems, editFiles
- **Use for**: Bundle analysis, CSS optimization, performance monitoring
- **Example**: PurgeCSS cleanup, bundle size analysis

#### Advanced Cleanup: `simulateai-advanced-code-cleanup`

**When to use**: Deep code refactoring and cleanup

- **Tools**: runCommands, codebase, search, editFiles, usages, problems
- **Use for**: Duplicate removal, dead code elimination, major refactoring
- **Example**: CSS selector cleanup, unused variable removal

#### CI/CD: `simulateai-ci-cd`

**When to use**: Continuous integration and deployment

- **Tools**: runCommands, changes, githubRepo, problems, terminalLastCommand
- **Use for**: GitHub Actions, automated workflows, deployment scripts
- **Example**: Workflow configuration, automated testing setup

#### Extensions Management: `simulateai-vscode-extensions`

**When to use**: VS Code environment setup and configuration

- **Tools**: extensions, vscodeAPI, runCommands, problems, editFiles
- **Use for**: Extension configuration, VS Code setup, development environment
- **Example**: Prettier config, ESLint setup, PowerShell integration

#### Project Management: `simulateai-project-management`

**When to use**: Project structure and workspace management

- **Tools**: new, extensions, changes, searchResults, vscodeAPI
- **Use for**: Workspace setup, project organization, configuration management
- **Example**: New workspace creation, project structure changes

### Toolset Usage Guidelines:

#### Choosing the Right Toolset:

```javascript
// ✅ For general development work
// Use: simulateai-development
// When: Adding features, editing files, basic commands

// ✅ For build and test operations
// Use: simulateai-build-and-test
// When: Running dev server, building, testing

// ✅ For code analysis and exploration
// Use: simulateai-code-analysis
// When: Understanding codebase, finding patterns, code reviews

// ✅ For debugging issues
// Use: simulateai-debugging
// When: Investigating errors, troubleshooting, test failures

// ✅ For code quality and cleanup
// Use: simulateai-code-cleanup-linting
// When: Formatting, linting, style enforcement
```

#### Workflow Examples:

**New Feature Development:**

1. Start with `simulateai-development` for exploration and coding
2. Switch to `simulateai-build-and-test` for testing
3. Use `simulateai-code-cleanup-linting` for final cleanup
4. Apply `simulateai-code-analysis` for review

**Bug Investigation:**

1. Use `simulateai-debugging` for error investigation
2. Switch to `simulateai-code-analysis` for pattern analysis
3. Apply `simulateai-development` for fixes
4. Validate with `simulateai-build-and-test`

**Performance Optimization:**

1. Start with `simulateai-performance-optimization` for analysis
2. Use `simulateai-advanced-code-cleanup` for deep cleanup
3. Apply `simulateai-code-analysis` for impact assessment
4. Test with `simulateai-build-and-test`

**Deployment Pipeline:**

1. Use `simulateai-ci-cd` for workflow setup
2. Apply `simulateai-security-analysis` for security checks
3. Switch to `simulateai-firebase-deployment` for deployment
4. Monitor with `simulateai-performance-optimization`

#### Integration Rules:

- **ALWAYS** choose the most specific toolset for your task
- Use `simulateai-development` as the default for general work
- Switch toolsets based on the current development phase
- Combine toolsets for complex workflows (e.g., development → testing → deployment)
- Let toolsets guide tool selection for optimal workflows

### Firebase Service Integration

**CRITICAL**: Use the centralized Firebase services for ALL backend operations. Located at `src/js/services/firebase-service.js` and `src/js/services/firestore-service-clean.js`.

#### Core Principles:

- **Centralized Backend**: All authentication, database, and analytics operations through Firebase services
- **UID-based Structure**: Standardized Firestore document organization using user UIDs
- **Security First**: App Check integration, rate limiting, and secure API calls
- **Offline Capability**: Smart caching and queue management for offline scenarios
- **GDPR Compliance**: User data export, deletion, and privacy controls

#### Service Architecture:

```javascript
// ✅ CORRECT - Use Firebase services through DataHandler
const dataHandler = new DataHandler({
  firebaseService: firebaseServiceInstance,
  enableFirebase: true,
});

// Firebase services are accessed through established patterns
const firebaseService = new FirebaseService();
const firestoreService = new FirestoreService(firebaseService, authService);

// ❌ WRONG - Direct Firebase operations
import { getFirestore, doc, setDoc } from "firebase/firestore";
const db = getFirestore();
```

#### Authentication Patterns:

```javascript
// ✅ Sign in with providers (smart mobile/desktop detection)
await firebaseService.signInWithGoogle();
await firebaseService.signInWithFacebook();
await firebaseService.signInWithEmail(email, password);

// ✅ Authentication state monitoring
firebaseService.onAuthStateChanged((user) => {
  if (user) {
    console.log("User signed in:", user.uid);
  } else {
    console.log("User signed out");
  }
});

// ✅ Account linking for multiple providers
await firebaseService.linkProviderToCurrentUser("google");
const linkedProviders = firebaseService.getUserLinkedProviders();

// ✅ Rate limiting and security
const authResult = await firebaseService.authenticateWithRateLimit(
  () => firebaseService.signInWithGoogle(),
  "google_signin",
);
```

#### Firestore Data Operations:

```javascript
// ✅ User document management
await firestoreService.createUserDocument({
  displayName: 'John Doe',
  role: 'learner',
  preferences: { notifications: true }
});

const userDoc = await firestoreService.getUserDocument();
await firestoreService.updateUserDocument({ lastActive: new Date() });

// ✅ Simulation progress tracking
await firestoreService.saveSimulationProgress('ethics-101', {
  score: 85,
  completed: true,
  responses: [...]
});

const progress = await firestoreService.getSimulationProgress('ethics-101');
const allSimulations = await firestoreService.getUserSimulations();

// ✅ Badge management
await firestoreService.awardBadge('first-simulation', {
  title: 'First Steps',
  description: 'Completed first simulation',
  category: 'achievement'
});

const badges = await firestoreService.getUserBadges();
```

#### Security and Privacy:

```javascript
// ✅ Secure API calls with authentication
const result = await firebaseService.makeSecureAPICall("processScenario", {
  scenarioId: "ethics-101",
  responses: userResponses,
});

// ✅ GDPR compliance
const userData = await firebaseService.exportUserData();
await firebaseService.deleteCurrentUser(); // Complete account deletion

// ✅ Rate limiting status
const rateLimitStatus = firebaseService.getRateLimitStatus("auth");
if (rateLimitStatus.limited) {
  console.log(`Rate limited. Try again in ${rateLimitStatus.timeRemaining}ms`);
}
```

#### Analytics and Performance:

```javascript
// ✅ Event tracking
firebaseService.trackEvent("simulation_completed", {
  simulation_id: "ethics-101",
  completion_time: 1200,
  score: 85,
});

// ✅ Performance tracing
const traceId = firebaseService.startPerformanceTrace("simulation_load");
// ... simulation loading logic
firebaseService.stopPerformanceTrace("simulation_load", {
  scenario_count: 5,
  user_type: "returning",
});

// ✅ System analytics
await firebaseService.addSystemMetric({
  type: "user_engagement",
  value: sessionDuration,
  metadata: { page: "simulation" },
});
```

#### UID Normalization:

```javascript
// ✅ AUTOMATIC - All Firebase operations use UID normalizer
// User documents follow standardized structure:
// users/{uid}/ (main user documents)
// users/{uid}/simulations/ (simulation progress)
// users/{uid}/badges/ (earned badges)
// users/{uid}/progress/ (learning progress)
// users/{uid}/sessions/ (user sessions)

// ✅ Path creation is handled automatically
const userPath = firestoreService.createUserDocPath("users");
// Returns: "users/{normalizedUID}"
```

#### Offline and PWA Integration:

```javascript
// ✅ Offline queue management
firebaseService.addToOfflineQueue("simulation_save", {
  simulationId: "ethics-101",
  data: progressData,
});

// ✅ Connectivity handling
firebaseService.handleConnectivityChange(navigator.onLine);

// ✅ PWA installation
if (firebaseService.getPWAStatus().installable) {
  await firebaseService.installPWA();
}
```

#### Error Handling:

```javascript
// ✅ CORRECT - Firebase services handle errors gracefully
try {
  const result = await firebaseService.signInWithGoogle();
  if (!result.success) {
    // Handle authentication failure
    console.log("Sign in failed:", result.error);
  }
} catch (error) {
  // Network or unexpected errors
  console.log("Authentication error:", error.message);
}

// ✅ Network-aware error handling
const errorMessage = firebaseService.getNetworkErrorMessage();
if (errorMessage) {
  // Show user-friendly offline message
  showUserMessage(errorMessage);
}
```

#### Real-time Features:

```javascript
// ✅ Real-time user profile updates
const unsubscribe = await firebaseService.getUserProfileRealtime(
  userId,
  (profile) => {
    updateUIWithProfile(profile);
  },
);

// ✅ Real-time analytics dashboard
const analyticsUnsubscribe = firebaseService.setupAnalyticsListeners(
  (analyticsData) => {
    updateDashboard(analyticsData);
  },
);

// ✅ Cleanup listeners
unsubscribe();
analyticsUnsubscribe.forEach((unsub) => unsub());
```

#### Integration Rules:

- **NEVER** use Firebase SDKs directly when services are available
- Always use FirestoreService for database operations
- Use FirebaseService for authentication and analytics
- Let services handle UID normalization and security
- Use DataHandler as the primary interface to Firebase services
- Follow the established user document structure in Firestore
- Always handle offline scenarios and rate limiting

### Google Analytics Integration

**CRITICAL**: Use the centralized Google Analytics services for ALL analytics tracking. Located at `src/js/services/google-analytics.js` and `src/js/utils/simple-analytics.js`.

#### Core Principles:

- **Dual Analytics System**: Google Analytics 4 for comprehensive tracking + SimpleAnalytics for educational focus
- **Privacy First**: GDPR compliant with anonymized IP and user consent
- **Event-Driven**: Track user interactions, educational progress, and system performance
- **Centralized Tracking**: All analytics go through established service layers
- **Educational Focus**: Specialized tracking for learning outcomes and engagement

#### Service Architecture:

```javascript
// ✅ CORRECT - Use analytics services through established patterns
import { googleAnalytics } from "../user-tracking-init.js";
import { simpleAnalytics } from "../utils/simple-analytics.js";

// Initialize analytics
await googleAnalytics.initialize();

// ❌ WRONG - Direct gtag calls
gtag("event", "action", { event_category: "category" });
```

#### Event Tracking Patterns:

```javascript
// ✅ Educational events through SimpleAnalytics
simpleAnalytics.trackEvent("ethics_decision", {
  scenarioId: "trolley-problem",
  choice: "utilitarian",
  responseTime: 1200,
  confidence: 8,
});

// ✅ System events through Google Analytics
googleAnalytics.trackEvent("simulation_completed", {
  simulation_id: "ethics-101",
  completion_time: 1200,
  score: 85,
  category: "ethics",
});

// ✅ User journey tracking
googleAnalytics.trackEvent("user_progression", {
  from_page: "categories",
  to_page: "simulation",
  user_type: "returning",
  session_duration: 300,
});
```

#### Automatic Event Tracking:

```javascript
// ✅ AUTOMATIC - GlobalEventManager sends events to analytics
// No additional code needed - events are tracked automatically:
// - Button clicks, navigation, simulation actions
// - Modal interactions, view toggles, demo patterns
// - User authentication, session management
// - Performance metrics, error tracking

// ✅ Analytics data is automatically sent to:
// - window.simpleAnalytics.trackEvent()
// - app.analyticsManager.trackEvent()
// - googleAnalytics.trackEvent()
```

#### Privacy and Consent:

```javascript
// ✅ Check user preferences before tracking
if (simpleAnalytics.isEnabled()) {
  simpleAnalytics.trackEvent("user_action", eventData);
}

// ✅ GDPR compliant settings
googleAnalytics.initialize({
  anonymize_ip: true,
  enhanced_measurement: true,
  respect_consent: true,
});

// ✅ User consent management
const userPrefs = await dataHandler.getUserPreferences();
if (userPrefs.analytics !== false) {
  // Proceed with analytics tracking
}
```

#### Educational Analytics:

```javascript
// ✅ Learning outcome tracking
simpleAnalytics.trackEvent("learning_milestone", {
  milestone: "first_simulation_complete",
  category: "ethics",
  competency_gained: "ethical_reasoning",
  time_to_completion: 1800,
});

// ✅ Engagement metrics
simpleAnalytics.trackEvent("engagement_metric", {
  interaction_type: "deep_reflection",
  content_type: "scenario_analysis",
  engagement_duration: 240,
  reflection_quality: "high",
});

// ✅ Research data collection
simpleAnalytics.trackEvent("research_data", {
  research_consent: true,
  demographic_category: "educator",
  response_pattern: "deliberative",
  anonymized_id: hashedUserId,
});
```

#### Performance Tracking:

```javascript
// ✅ System performance
googleAnalytics.trackEvent("performance_metric", {
  metric_type: "page_load_time",
  value: loadTime,
  page_type: "simulation",
  optimization_level: "high",
});

// ✅ Error tracking
googleAnalytics.trackEvent("app_error", {
  error_type: "simulation_load_failure",
  error_message: errorMessage,
  user_agent: navigator.userAgent,
  session_id: sessionId,
});

// ✅ User experience metrics
simpleAnalytics.trackEvent("ux_metric", {
  interaction_success: true,
  task_completion_rate: 0.95,
  user_satisfaction: 8,
  feature_usage: "advanced",
});
```

#### Session and User Analytics:

```javascript
// ✅ Session tracking
googleAnalytics.trackEvent("session_start", {
  session_id: sessionId,
  user_type: "returning",
  device_type: "desktop",
  referrer: document.referrer,
});

// ✅ User journey mapping
simpleAnalytics.trackEvent("user_journey", {
  journey_stage: "exploration",
  content_interaction: "category_browse",
  time_spent: 180,
  next_action: "simulation_start",
});

// ✅ Retention metrics
googleAnalytics.trackEvent("user_retention", {
  days_since_first_visit: daysSinceFirst,
  total_sessions: sessionCount,
  avg_session_duration: avgDuration,
  feature_adoption: adoptedFeatures,
});
```

#### Advanced Analytics Features:

```javascript
// ✅ Custom dimensions and metrics
googleAnalytics.trackEvent("custom_metric", {
  custom_parameter_1: "ethics_module",
  custom_parameter_2: "advanced_user",
  value: 95,
  unit: "completion_percentage",
});

// ✅ Cohort analysis data
simpleAnalytics.trackEvent("cohort_data", {
  user_cohort: "2025_Q1",
  progression_level: "intermediate",
  engagement_pattern: "consistent",
  learning_velocity: "fast",
});

// ✅ A/B testing support
googleAnalytics.trackEvent("experiment_data", {
  experiment_id: "ui_variant_test",
  variant: "version_b",
  conversion: true,
  metric_improvement: 0.15,
});
```

#### Data Export and Analysis:

```javascript
// ✅ Export analytics data for research
const analyticsExport = await simpleAnalytics.exportData({
  anonymize: true,
  date_range: "30_days",
  include_research_consent: true,
});

// ✅ Real-time analytics dashboard
const realTimeMetrics = simpleAnalytics.getRealTimeMetrics();
updateDashboard(realTimeMetrics);

// ✅ Aggregated insights
const insights = simpleAnalytics.generateInsights({
  focus: "learning_outcomes",
  time_period: "weekly",
  segment: "educators",
});
```

#### Integration Rules:

- **NEVER** use gtag() directly when analytics services are available
- Always check user consent before tracking personal data
- Use SimpleAnalytics for educational and research data
- Use Google Analytics for system metrics and user journey
- Let GlobalEventManager handle automatic event tracking
- Follow GDPR compliance patterns for data collection
- Anonymize sensitive data before sending to analytics
- Use established event naming conventions

### HTML Metadata and SEO Standards

**CRITICAL**: Follow established metadata patterns for SEO, social sharing, and PWA functionality. All HTML pages must include proper meta tags and structured data.

#### Essential Meta Tags:

```html
<!-- ✅ REQUIRED - Basic meta tags for all pages -->
<meta charset="UTF-8" />
<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0, viewport-fit=cover"
/>
<meta name="theme-color" content="#667eea" />
<meta name="color-scheme" content="light" />

<!-- ✅ SEO Meta tags -->
<title>SimulateAI - AI Ethics Education Through Interactive Simulations</title>
<meta
  name="description"
  content="Experience the future of ethical AI education through immersive, consequence-driven simulations."
/>
<meta
  name="keywords"
  content="AI ethics education, interactive simulations, ethical AI, research study, ISTE standards"
/>
<meta name="author" content="SimulateAI Educational Platform" />

<!-- ✅ PWA Meta tags -->
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="SimulateAI" />
<meta name="msapplication-TileColor" content="#667eea" />
<meta name="msapplication-config" content="./browserconfig.xml" />
```

#### Social Media Meta Tags:

```html
<!-- ✅ Open Graph for Facebook, LinkedIn -->
<meta property="og:type" content="website" />
<meta property="og:title" content="SimulateAI - AI Ethics Education Platform" />
<meta
  property="og:description"
  content="Interactive simulations for ethical AI education and research."
/>
<meta property="og:image" content="https://domain.com/images/og-image.png" />
<meta property="og:url" content="https://domain.com" />
<meta property="og:site_name" content="SimulateAI" />

<!-- ✅ Twitter Cards -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="SimulateAI - AI Ethics Education" />
<meta
  name="twitter:description"
  content="Interactive simulations for ethical AI education."
/>
<meta
  name="twitter:image"
  content="https://domain.com/images/twitter-image.png"
/>

<!-- ✅ Educational Context -->
<meta name="education:type" content="higher education" />
<meta
  name="education:subject"
  content="AI Ethics, Computer Science, Philosophy"
/>
<meta name="education:audience" content="educators, students, researchers" />
```

#### Structured Data Implementation:

```html
<!-- ✅ JSON-LD Structured Data for Educational Content -->
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "SimulateAI",
    "description": "AI Ethics Education Through Interactive Simulations",
    "url": "https://domain.com",
    "logo": "https://domain.com/images/logo.png",
    "educationalCredentialAwarded": "Digital Badge",
    "hasCredential": {
      "@type": "EducationalOccupationalCredential",
      "name": "AI Ethics Competency Badge"
    }
  }
</script>

<!-- ✅ Course/Simulation Structured Data -->
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": "AI Ethics Simulation",
    "description": "Interactive ethical decision-making scenarios",
    "provider": {
      "@type": "Organization",
      "name": "SimulateAI"
    },
    "educationalLevel": "Higher Education",
    "teaches": [
      "Ethical Reasoning",
      "AI Decision Making",
      "Consequence Analysis"
    ]
  }
</script>
```

#### Data Attribute Standards:

```html
<!-- ✅ REQUIRED - Use semantic data attributes for analytics and interaction tracking -->
<button
  data-simulation-action="start"
  data-category="ethics"
  data-level="intermediate"
>
  Start Simulation
</button>

<div data-nav-item="categories" data-analytics-label="main-navigation">
  Categories
</div>

<div
  class="scenario-card"
  data-scenario-id="trolley-problem"
  data-category="ethics"
  data-difficulty="beginner"
  data-analytics-track="scenario-interaction"
>
  <!-- Scenario content -->
</div>

<!-- ✅ Modal and UI component data attributes -->
<button data-modal-action="close" data-modal-id="consent-modal">Close</button>
<div data-modal-action="backdrop-click" data-prevent-close="false">
  Backdrop
</div>

<!-- ✅ Research and consent tracking -->
<div
  data-consent-required="true"
  data-research-component="true"
  data-gdpr-category="analytics"
>
  <!-- Research content -->
</div>
```

### Consent Management and GDPR Compliance

**CRITICAL**: All data collection, analytics, and user tracking must follow GDPR compliance patterns with proper consent management.

#### Consent Implementation Patterns:

```javascript
// ✅ Check consent before any data collection
const userConsent = await dataHandler.getConsentData();
if (userConsent.analytics) {
  // Proceed with analytics tracking
  simpleAnalytics.trackEvent("user_action", eventData);
}

// ✅ Consent management through DataHandler
await dataHandler.saveConsentData({
  analytics: true,
  research: false,
  marketing: false,
  timestamp: new Date(),
  version: "1.0",
});

// ✅ Research consent with specific permissions
await dataHandler.saveConsentData({
  research_participation: true,
  demographic_data: false,
  response_analysis: true,
  data_retention_period: "2_years",
  withdrawal_method: "email_request",
});
```

#### Privacy-First Data Collection:

```javascript
// ✅ Anonymized user tracking
const anonymizedId = await dataHandler.generateAnonymizedId();
simpleAnalytics.trackEvent("research_data", {
  anonymized_id: anonymizedId,
  research_consent: true,
  demographic_category: "educator", // if consented
});

// ✅ Data minimization principle
const minimalData = {
  simulation_completed: true,
  category: "ethics",
  // Only collect what's necessary for functionality
  timestamp: Date.now(),
};

// ✅ GDPR data export capability
const userDataExport = await dataHandler.exportUserData();
// Returns all user data in portable format
```

### Performance and Technical SEO

**CRITICAL**: Follow technical SEO best practices for educational content discovery and performance optimization.

#### Technical Implementation:

```html
<!-- ✅ Canonical URLs for duplicate content prevention -->
<link rel="canonical" href="https://domain.com/simulations/ethics/" />

<!-- ✅ Preconnect for performance -->
<link rel="preconnect" href="https://www.googletagmanager.com" />
<link rel="preconnect" href="https://fonts.googleapis.com" />

<!-- ✅ Resource hints -->
<link rel="prefetch" href="/js/simulation-engine.js" />
<link rel="preload" href="/styles/critical.css" as="style" />

<!-- ✅ Manifest for PWA -->
<link rel="manifest" href="/manifest.json" />

<!-- ✅ Robots and sitemap -->
<meta name="robots" content="index, follow, max-image-preview:large" />
<link rel="sitemap" type="application/xml" href="/sitemap.xml" />
```

#### Educational Metadata:

```html
<!-- ✅ Educational resource metadata -->
<meta name="DC.Type" content="InteractiveResource" />
<meta name="DC.Format" content="text/html" />
<meta name="DC.Audience" content="Educator, Student, Researcher" />
<meta name="DC.Subject" content="Artificial Intelligence Ethics" />
<meta name="DC.Education.Level" content="Higher Education" />

<!-- ✅ Learning resource metadata -->
<meta name="learning-resource-type" content="simulation" />
<meta name="interactivity-type" content="active" />
<meta name="intended-end-user-role" content="learner" />
<meta name="educational-use" content="instruction, assessment" />
```

### Analytics Tag Configuration

**CRITICAL**: Standardize analytics tagging across all components for consistent tracking and educational research data collection.

#### Event Naming Conventions:

```javascript
// ✅ Educational Events (use snake_case)
"simulation_started";
"scenario_completed";
"ethical_decision_made";
"reflection_submitted";
"badge_earned";
"learning_milestone_reached";

// ✅ System Events (use snake_case)
"page_loaded";
"navigation_clicked";
"modal_opened";
"error_encountered";
"performance_metric_recorded";

// ✅ Research Events (use snake_case with research_ prefix)
"research_consent_given";
"research_data_collected";
"research_survey_completed";
"research_participant_registered";
```

#### Event Data Structure:

```javascript
// ✅ Standardized event data structure
const eventData = {
  // Required fields
  event_category: "simulation",
  event_action: "scenario_completed",
  timestamp: Date.now(),

  // Educational context
  simulation_id: "ethics-101",
  scenario_id: "trolley-problem",
  user_role: "educator",
  difficulty_level: "intermediate",

  // Performance metrics
  completion_time: 180, // seconds
  attempts: 1,
  score: 85,

  // Research data (if consented)
  response_pattern: "utilitarian",
  confidence_level: 8,
  reflection_depth: "detailed",
};
```

#### Integration Rules:

- **NEVER** collect personal data without explicit consent
- Always use semantic data attributes for automatic event tracking
- Follow structured data schema.org standards for educational content
- Implement proper meta tags for social sharing and SEO
- Use DataHandler for all consent management and GDPR compliance
- Test metadata with social media debugging tools
- Validate structured data with Google Rich Results Test
- Ensure PWA manifest is properly configured

### Naming Conventions and Code Organization

**CRITICAL**: Follow established naming conventions and code organization patterns for consistency across the SimulateAI platform.

#### File Naming Standards:

```javascript
// ✅ CORRECT - Use kebab-case for files
"user-tracking-init.js";
"category-header-config-loader.js";
"badge-modal-config-loader.js";
"simple-donation-button.js";

// ✅ CORRECT - Use descriptive, purpose-driven names
"firebase-service.js"; // Service layer
"data-handler.js"; // Core functionality
"global-event-manager.js"; // Core system
"configuration-manager.js"; // Utility manager
"component-registry.js"; // Utility registry

// ❌ WRONG - Avoid abbreviations and unclear names
("data.js", "utils.js", "helper.js", "mgr.js");
```

#### Directory Structure Standards:

```
src/
├── js/
│   ├── core/           # Core system components (DataHandler, UIBinder, etc.)
│   ├── services/       # External service integrations (Firebase, Analytics)
│   ├── components/     # Reusable UI components
│   ├── utils/          # Utility functions and helpers
│   ├── constants/      # Application constants and configurations
│   ├── data/           # Data schemas and models
│   ├── config/         # Configuration files
│   └── debug/          # Development and debugging tools
├── styles/             # CSS files following layers architecture
├── components/         # HTML component templates
├── config/             # JSON configuration files
└── assets/             # Static assets (images, fonts, etc.)
```

#### Class Naming Patterns:

```javascript
// ✅ CORRECT - Use PascalCase for classes
class DataHandler { }
class GlobalEventManager { }
class UIBinder { }
class CategoryHeader { }
class BadgeManager { }

// ✅ CORRECT - Use descriptive, purpose-driven class names
class SimpleAnalyticsManager { }
class ConfigurationManager { }
class ComponentRegistry { }
class ValidationUtils { }

// ❌ WRONG - Avoid generic or abbreviated names
class Manager { }, class Utils { }, class Helper { }
```

#### Function and Variable Naming:

```javascript
// ✅ CORRECT - Use camelCase for functions and variables
const userProfile = await dataHandler.getUserProfile();
const categoryConfig = await loadCategoryHeaderConfig();
const badgeModalConfig = await loadBadgeModalConfig();

// ✅ CORRECT - Use descriptive function names
async function initializeFirebaseServices() { }
async function loadCategoryHeaderConfig() { }
async function validateBadgeModalConfig() { }
async function generateAnonymizedId() { }

// ✅ CORRECT - Use clear boolean variable names
const isInitialized = true;
const hasValidConfig = await validateConfig();
const shouldTrackAnalytics = userConsent.analytics;

// ❌ WRONG - Avoid unclear or abbreviated names
const cfg, const usr, const init, const loaded
```

### Error Handling and Logging Standards

**CRITICAL**: Use consistent error handling and logging patterns throughout the application.

#### Logging Patterns:

```javascript
// ✅ CORRECT - Use the centralized logger utility
import logger from "./utils/logger.js";

// ✅ Log levels with context and structured data
logger.info("ComponentName", "Action completed successfully", { data: result });
logger.warn("ComponentName", "Non-critical issue detected", { issue: details });
logger.error("ComponentName", "Critical error occurred", error);
logger.debug("ComponentName", "Development information", { debugData });

// ✅ CORRECT - Use consistent context naming
logger.info("DataHandler", "User profile saved", { userId: user.id });
logger.info("CategoryHeader", "Configuration loaded", {
  configVersion: version,
});
logger.info("BadgeManager", "Badge awarded", { badgeId, userId });

// ❌ WRONG - Direct console.log usage (except for debugging)
console.log("something happened");
console.error("error occurred");
```

#### Error Handling Patterns:

```javascript
// ✅ CORRECT - Consistent try-catch with logging
try {
  const result = await dataHandler.saveUserProfile(profileData);
  logger.info("ProfileManager", "Profile saved successfully", {
    profileId: result.id,
  });
  return result;
} catch (error) {
  logger.error("ProfileManager", "Failed to save profile", error);
  throw new Error(`Profile save failed: ${error.message}`);
}

// ✅ CORRECT - Graceful error handling with fallbacks
try {
  const config = await loadComponentConfig();
  return config;
} catch (error) {
  logger.warn("ComponentLoader", "Config load failed, using defaults", error);
  return getDefaultConfig();
}

// ✅ CORRECT - Validation with descriptive errors
if (!userId || typeof userId !== "string") {
  throw new Error("Invalid userId: must be a non-empty string");
}

if (!config || !config.requiredField) {
  throw new Error("Invalid configuration: missing required fields");
}
```

### Component Lifecycle and Initialization

**CRITICAL**: Follow established patterns for component initialization, configuration loading, and cleanup.

#### Component Initialization Pattern:

```javascript
// ✅ CORRECT - Standard component initialization
class ComponentName {
  static config = null;

  static async loadConfiguration() {
    if (!ComponentName.config) {
      try {
        ComponentName.config = await loadComponentConfig();
        validateComponentConfig(ComponentName.config);
        logger.info("ComponentName", "Configuration loaded and validated");
      } catch (error) {
        logger.error("ComponentName", "Failed to load configuration", error);
        ComponentName.config = getDefaultConfig();
      }
    }
    return ComponentName.config;
  }

  constructor(container, options = {}) {
    this.container = container;
    this.options = { ...getDefaultOptions(), ...options };
    this.initialized = false;

    // Initialize configuration promise
    this.configPromise = ComponentName.loadConfiguration();
  }

  async initialize() {
    if (this.initialized) {
      logger.warn("ComponentName", "Already initialized");
      return;
    }

    try {
      await this.configPromise;
      await this.setupComponent();
      this.initialized = true;
      logger.info("ComponentName", "Initialized successfully");
    } catch (error) {
      logger.error("ComponentName", "Initialization failed", error);
      throw error;
    }
  }

  async destroy() {
    if (!this.initialized) return;

    try {
      await this.cleanup();
      this.initialized = false;
      logger.info("ComponentName", "Destroyed successfully");
    } catch (error) {
      logger.error("ComponentName", "Cleanup failed", error);
    }
  }
}
```

#### Configuration Loading Pattern:

```javascript
// ✅ CORRECT - Standardized config loading with caching
const configCache = new Map();

export async function loadComponentConfig(componentName) {
  if (configCache.has(componentName)) {
    return configCache.get(componentName);
  }

  try {
    const config = await fetch(`/config/${componentName}-config.json`);
    if (!config.ok) {
      throw new Error(`Config load failed: ${config.status}`);
    }

    const configData = await config.json();
    const validatedConfig = validateConfig(configData);

    configCache.set(componentName, validatedConfig);
    logger.info("ConfigLoader", `Configuration loaded for ${componentName}`);

    return validatedConfig;
  } catch (error) {
    logger.error(
      "ConfigLoader",
      `Failed to load config for ${componentName}`,
      error,
    );
    const defaultConfig = getDefaultConfig(componentName);
    configCache.set(componentName, defaultConfig);
    return defaultConfig;
  }
}

// ✅ CORRECT - Config validation with detailed checks
function validateConfig(config) {
  if (!config || typeof config !== "object") {
    throw new Error("Config must be a valid object");
  }

  if (!config.version) {
    throw new Error("Config missing required version field");
  }

  // Additional validation based on component needs
  return config;
}
```

### Constants and Configuration Management

**CRITICAL**: Use centralized constants and configuration management for maintainability.

#### Constants Usage:

```javascript
// ✅ CORRECT - Import and use centralized constants
import {
  TIMING,
  STORAGE_KEYS,
  ERROR_CODES,
  UI_CONSTANTS,
} from "../utils/constants.js";

// ✅ Use constants instead of magic numbers
setTimeout(callback, TIMING.NORMAL); // Instead of setTimeout(callback, 500);
localStorage.setItem(STORAGE_KEYS.USER_PREFS, data); // Instead of localStorage.setItem('userPrefs', data);

// ✅ CORRECT - Component-specific constants
const COMPONENT_CONSTANTS = {
  MAX_RETRIES: 3,
  DEFAULT_TIMEOUT: TIMING.SLOW,
  REQUIRED_FIELDS: ["id", "name", "type"],
  VALIDATION_RULES: {
    minLength: 3,
    maxLength: 50,
  },
};
```

#### Configuration Integration:

```javascript
// ✅ CORRECT - Use ConfigurationManager for app-wide settings
import { configManager } from "../utils/configuration-manager.js";

// ✅ Access configuration through manager
const appConfig = await configManager.getConfig("app");
const featureEnabled = configManager.isFeatureEnabled("newSimulations");
const apiEndpoint = configManager.getApiEndpoint("userProfile");

// ✅ CORRECT - Environment-aware configuration
const isDevelopment = configManager.getEnvironment() === "development";
const debugMode = configManager.isDebugMode();
```

### Import and Export Standards

**CRITICAL**: Follow consistent import/export patterns for better module management.

#### Export Patterns:

```javascript
// ✅ CORRECT - Default export for main class/function
export default class ComponentName { }
export default function utilityFunction() { }

// ✅ CORRECT - Named exports for utilities and helpers
export { validateConfig, loadConfig, clearConfigCache };
export const COMPONENT_CONSTANTS = { };
export async function initializeComponent() { }

// ✅ CORRECT - Mixed exports when appropriate
export default ComponentManager;
export { createComponent, destroyComponent, listComponents };
```

#### Import Patterns:

```javascript
// ✅ CORRECT - Clear, descriptive imports
import DataHandler from "./core/data-handler.js";
import { globalEventManager } from "./core/global-event-manager.js";
import logger from "./utils/logger.js";
import { TIMING, STORAGE_KEYS } from "./utils/constants.js";

// ✅ CORRECT - Destructured imports for specific utilities
import {
  loadCategoryHeaderConfig,
  validateCategoryHeaderConfig,
  getDefaultConfig,
} from "./utils/category-header-config-loader.js";

// ✅ CORRECT - Relative path clarity
import ComponentBase from "../core/component-base.js"; // Parent directory
import { helperFunction } from "./component-helpers.js"; // Same directory
import constants from "../../utils/constants.js"; // Multiple levels up
```

#### Integration Rules:

- **NEVER** use var declarations - use const/let only
- Always validate configurations before use
- Use descriptive variable and function names
- Follow established error handling patterns with logger
- Import from centralized constants instead of hardcoding values
- Use async/await consistently instead of Promises.then()
- Always handle edge cases and provide fallbacks
- Use TypeScript-style JSDoc comments for better documentation

### Documentation Standards

**CRITICAL**: Follow consistent documentation patterns for maintainability and developer onboarding.

#### JSDoc Documentation:

```javascript
// ✅ CORRECT - Comprehensive JSDoc for functions
/**
 * Loads and validates component configuration with caching
 * @param {string} componentName - The name of the component to load config for
 * @param {Object} [options={}] - Optional configuration options
 * @param {boolean} [options.bypassCache=false] - Whether to bypass the config cache
 * @param {Object} [options.fallbackConfig] - Fallback configuration if load fails
 * @returns {Promise<Object>} The validated configuration object
 * @throws {Error} Throws error if configuration is invalid or load fails
 * @example
 * const config = await loadComponentConfig('CategoryHeader', { bypassCache: true });
 * @since 1.70.0
 */
async function loadComponentConfig(componentName, options = {}) {
  // Implementation
}

// ✅ CORRECT - Class documentation
/**
 * Manages user data operations with Firebase and localStorage integration
 * @class DataHandler
 * @description Provides centralized data management with offline capabilities
 * @author SimulateAI Development Team
 * @since 1.70.0
 */
class DataHandler {
  /**
   * Creates a new DataHandler instance
   * @param {Object} options - Configuration options
   * @param {string} options.appName - Application name for storage keys
   * @param {FirebaseService} [options.firebaseService] - Firebase service instance
   * @param {boolean} [options.enableCaching=true] - Enable caching functionality
   */
  constructor(options) {
    // Implementation
  }
}
```

#### Code Comments:

```javascript
// ✅ CORRECT - Explain WHY, not WHAT
// Use debounce to prevent excessive API calls during rapid user input
const debouncedSearch = debounce(searchFunction, 300);

// Firebase requires this specific format for authentication providers
const providers = formatProvidersForFirebase(userProviders);

// ✅ CORRECT - Document complex business logic
// Calculate progress percentage: completed scenarios / total scenarios * 100
// Special handling for categories with no scenarios (show as 0% instead of NaN)
const progressPercentage = totalScenarios === 0 ? 0 :
  Math.round((completedScenarios / totalScenarios) * 100);

// ❌ WRONG - Obvious comments
const userName = user.name; // Get user name
if (isValid) { // If valid
```

### Performance Standards

**CRITICAL**: Follow performance best practices to ensure optimal user experience.

#### Performance Patterns:

```javascript
// ✅ CORRECT - Use constants for timing to avoid magic numbers
import { TIMING } from "../utils/constants.js";

// Debounce user input to prevent excessive processing
const debouncedHandler = debounce(handler, TIMING.DEBOUNCE_DELAY);

// Throttle scroll events for performance
const throttledScroll = throttle(onScroll, TIMING.THROTTLE_DELAY);

// ✅ CORRECT - Lazy loading for large components
const LazyComponent = lazy(() => import("./HeavyComponent.js"));

// ✅ CORRECT - Efficient DOM queries with caching
class ComponentManager {
  constructor() {
    // Cache DOM elements to avoid repeated queries
    this.elements = {
      container: document.getElementById("container"),
      buttons: document.querySelectorAll(".action-button"),
      progressRings: document.querySelectorAll(".progress-ring"),
    };
  }
}
```

#### Memory Management:

```javascript
// ✅ CORRECT - Cleanup event listeners to prevent memory leaks
class ComponentLifecycle {
  initialize() {
    this.handleClick = this.handleClick.bind(this);
    this.elements.button.addEventListener("click", this.handleClick);
  }

  destroy() {
    // Always clean up event listeners
    this.elements.button.removeEventListener("click", this.handleClick);

    // Clear references to DOM elements
    this.elements = null;

    // Cancel any pending timers
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}

// ✅ CORRECT - Use WeakMap for private data to prevent memory leaks
const privateData = new WeakMap();

class SecureComponent {
  constructor() {
    privateData.set(this, {
      sensitiveData: null,
      eventHandlers: [],
    });
  }
}
```

### Security Standards

**CRITICAL**: Follow security best practices to protect user data and prevent vulnerabilities.

#### Input Validation and Sanitization:

```javascript
// ✅ CORRECT - Validate all user inputs
function validateUserInput(input) {
  // Check for required fields
  if (!input || typeof input !== "string") {
    throw new Error("Invalid input: must be a non-empty string");
  }

  // Sanitize input to prevent XSS
  const sanitized = input
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .trim()
    .substring(0, 255); // Limit length

  return sanitized;
}

// ✅ CORRECT - Use prepared statements pattern for dynamic content
function createSecureQuery(userId, filters) {
  // Validate inputs first
  if (!userId || !Array.isArray(filters)) {
    throw new Error("Invalid query parameters");
  }

  // Use structured approach instead of string concatenation
  return {
    userId: validateUserId(userId),
    filters: filters.map((filter) => validateFilter(filter)),
  };
}
```

#### Authentication and Authorization:

```javascript
// ✅ CORRECT - Check authentication before sensitive operations
async function performSensitiveOperation(data) {
  const user = await firebaseService.getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }

  // Check user permissions
  const hasPermission = await checkUserPermission(
    user.uid,
    "sensitive_operation",
  );
  if (!hasPermission) {
    throw new Error("Insufficient permissions");
  }

  // Proceed with operation
  return await performOperation(data);
}

// ✅ CORRECT - Rate limiting for API calls
const rateLimiter = new Map();

function checkRateLimit(userId, operation) {
  const key = `${userId}:${operation}`;
  const now = Date.now();
  const windowMs = 60000; // 1 minute window
  const maxRequests = 10;

  if (!rateLimiter.has(key)) {
    rateLimiter.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  const limit = rateLimiter.get(key);
  if (now > limit.resetTime) {
    // Reset window
    limit.count = 1;
    limit.resetTime = now + windowMs;
    return true;
  }

  if (limit.count >= maxRequests) {
    return false; // Rate limited
  }

  limit.count++;
  return true;
}
```

### Accessibility Standards

**CRITICAL**: Ensure all components are accessible to users with disabilities.

#### ARIA and Semantic HTML:

```javascript
// ✅ CORRECT - Use semantic HTML and ARIA attributes
function createAccessibleModal(title, content) {
  const modal = document.createElement("div");
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-labelledby", "modal-title");
  modal.setAttribute("aria-describedby", "modal-content");

  // Focus management
  modal.setAttribute("tabindex", "-1");

  const titleElement = document.createElement("h2");
  titleElement.id = "modal-title";
  titleElement.textContent = title;

  const contentElement = document.createElement("div");
  contentElement.id = "modal-content";
  contentElement.innerHTML = content;

  modal.appendChild(titleElement);
  modal.appendChild(contentElement);

  return modal;
}

// ✅ CORRECT - Keyboard navigation support
function setupKeyboardNavigation(container) {
  container.addEventListener("keydown", (event) => {
    switch (event.key) {
      case "Escape":
        closeModal();
        break;
      case "Tab":
        // Manage focus trap in modal
        trapFocus(event);
        break;
      case "Enter":
      case " ": // Space key
        if (event.target.matches(".action-button")) {
          event.preventDefault();
          event.target.click();
        }
        break;
    }
  });
}
```

#### Focus Management:

```javascript
// ✅ CORRECT - Proper focus management
class FocusManager {
  static focusFirstElement(container) {
    const focusable = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length > 0) {
      focusable[0].focus();
    }
  }

  static trapFocus(event, container) {
    const focusable = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const firstFocusable = focusable[0];
    const lastFocusable = focusable[focusable.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    }
  }
}
```

### Testing Standards

**CRITICAL**: Implement comprehensive testing for reliability and maintainability.

#### Testing Patterns:

```javascript
// ✅ CORRECT - Component testing structure
describe("CategoryHeader Component", () => {
  let container;
  let categoryHeader;

  beforeEach(async () => {
    container = document.createElement("div");
    document.body.appendChild(container);

    // Mock dependencies
    jest.spyOn(logger, "info").mockImplementation();
    jest
      .spyOn(dataHandler, "getUserProfile")
      .mockResolvedValue(mockUserProfile);

    categoryHeader = new CategoryHeader(container, mockOptions);
    await categoryHeader.initialize();
  });

  afterEach(() => {
    categoryHeader.destroy();
    document.body.removeChild(container);
    jest.clearAllMocks();
  });

  test("should initialize with valid configuration", async () => {
    expect(categoryHeader.initialized).toBe(true);
    expect(container.children.length).toBeGreaterThan(0);
  });

  test("should handle user interaction correctly", async () => {
    const button = container.querySelector(".category-button");
    button.click();

    await waitFor(() => {
      expect(dataHandler.saveUserProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          categoryId: mockOptions.categoryId,
          action: "category_selected",
        }),
      );
    });
  });
});

// ✅ CORRECT - Integration testing
describe("DataHandler Integration", () => {
  test("should sync data between Firebase and localStorage", async () => {
    const testData = { userId: "test123", preferences: { theme: "dark" } };

    // Save data
    await dataHandler.saveUserProfile(testData);

    // Verify Firebase call
    expect(firestoreService.updateUserDocument).toHaveBeenCalledWith(testData);

    // Verify localStorage backup
    const localData = JSON.parse(localStorage.getItem("userProfile"));
    expect(localData).toEqual(testData);
  });
});
```

#### Integration Rules:

- **NEVER** skip JSDoc documentation for public methods
- Always validate and sanitize user inputs
- Implement proper error boundaries and fallbacks
- Use semantic HTML and ARIA attributes for accessibility
- Follow focus management patterns for keyboard navigation
- Write tests for critical user flows and edge cases
- Monitor performance metrics and optimize bottlenecks
- Use established security patterns for authentication and data handling

## File Structure:

- Follow established patterns in `src/styles/` directory
- Use meaningful, descriptive filenames
- Keep component styles focused and avoid cross-component dependencies
- Use `src/js/core/data-handler.js` for ALL data operations
- Use `src/js/core/global-event-manager.js` for ALL event handling
- Use `src/js/core/ui-binder.js` for ALL UI operations
- Use `src/js/services/firebase-service.js` and `src/js/services/firestore-service-clean.js` for ALL backend operations

---

**REMEMBER**:

- The CSS layers architecture ensures proper cascade order and eliminates specificity conflicts. Always work WITH the layers, not against them.
- DataHandler provides robust, offline-capable data management. Never bypass it for direct storage access.
- GlobalEventManager provides centralized, efficient event handling. Avoid direct event listeners when possible.
- UIBinder provides unified UI management with performance optimization. Use it for themes, modals, components, and animations.
- Use appropriate VS Code toolsets for different development tasks to optimize workflow and tool selection.
- Firebase services provide secure, scalable backend operations. Always use the centralized services rather than direct SDK calls.
