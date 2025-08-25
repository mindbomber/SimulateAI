/**
 * Refined CSS Selector Pattern Analysis for ui.js
 * Focuses specifically on CSS class usage patterns and stylesheet comparison
 */

console.log("🔍 CSS SELECTOR USAGE PATTERN ANALYSIS");
console.log("=====================================\n");

// EXTRACTED PATTERNS FROM ANALYSIS

const GLOBAL_STYLESHEET_CLASSES = [
  // From UIStyleManager.addGlobalStyles()
  "ui-component",
  "ui-animated",
  "ui-animated-cubic",
  "ui-show-animation",
  "hover",
  "active",
  "focused",
  "mobile",
];

const ACTUAL_CSS_CLASSES_USED = [
  // Base UI Component classes
  "ui-component",
  "ui-animated",
  "ui-show-animation",
  "theme-aware",
  "responsive",
  "animated",
  "high-contrast",

  // State classes
  "hover",
  "active",
  "focused",
  "mobile",
  "tablet",
  "desktop",

  // Panel component classes
  "ui-panel",
  "modal-dialog",
  "resizable",
  "closable",
  "panel-close",
  "panel-header",
  "panel-title",
  "panel-content",
  "panel-controls",
  "panel-button",
  "panel-slider",

  // Modal classes
  "modal-backdrop",

  // Resize handle classes
  "resize-handle",
  "resize-n",
  "resize-e",
  "resize-s",
  "resize-w",
  "resize-ne",
  "resize-se",
  "resize-sw",
  "resize-nw",

  // Slider classes
  "slider-container",
  "slider-value-display",

  // Ethics display classes
  "ethics-display",
  "ethics-header",
  "ethics-title",
  "ethics-summary",
  "ethics-meters",
  "ethics-meter",
  "meter-label",
  "meter-description",
  "meter-container",
  "meter-track",
  "meter-fill",
  "meter-value",

  // Feedback system classes
  "feedback-system",
  "feedback-header",
  "feedback-title",
  "feedback-clear",
  "feedback-list",
  "feedback-icon",
  "feedback-content",
  "feedback-message",
  "feedback-actions",
  "feedback-action",
  "feedback-close",

  // Button classes
  "ui-button",
  "button-spinner",
  "button-icon",
  "button-text",

  // Slider component classes
  "ui-slider",
  "slider-label",
  "slider-track",
  "slider-filled",
  "slider-thumb",
  "slider-labels",
  "slider-min-label",
  "slider-max-label",
  "slider-value",
];

const QUERYSELECTOR_SELECTORS = [
  // Panel selectors
  ".panel-close",
  ".panel-header",
  ".panel-title",
  ".panel-content",
  ".panel-controls",

  // Ethics display selectors
  ".ethics-header",
  ".ethics-title",
  ".ethics-summary",
  ".ethics-meters",
  ".meter-label",
  ".meter-description",
  ".meter-container",
  ".meter-track",
  ".meter-fill",
  ".meter-value",

  // Feedback selectors
  ".feedback-clear",
  ".feedback-list",
  ".feedback-icon",
  ".feedback-content",
  ".feedback-message",
  ".feedback-actions",
  ".feedback-action",
  ".feedback-close",
  ".feedback-header",
  ".feedback-item",

  // Button selectors
  ".button-spinner",

  // Slider selectors
  ".slider-container",
  ".slider-track",
  ".slider-filled",
  ".slider-thumb",
  ".slider-label",
  ".slider-value",
  ".slider-labels",
];

const CLASSLIST_OPERATIONS = [
  // Dynamic state changes
  { operation: "add", class: "ui-animated" },
  { operation: "add", class: "hover" },
  { operation: "add", class: "active" },
  { operation: "add", class: "focused" },
  { operation: "add", class: "ui-show-animation" },
  { operation: "remove", class: "hover" },
  { operation: "remove", class: "active" },
  { operation: "remove", class: "focused" },
  { operation: "toggle", class: "mobile" },
  { operation: "toggle", class: "tablet" },
  { operation: "toggle", class: "desktop" },
];

const DYNAMIC_CLASS_PATTERNS = [
  // ID-based patterns
  "ui-styles-${id}",
  "ui-component-init-${this.constructor.name}",
  "ui-${Date.now()}",
  "ui-${this.constructor.name.toLowerCase()}",

  // Component-specific patterns
  "resize-${direction}",
  "slider-${this.id}",
  "label-${this.id}",
  "value-${this.id}",
  "feedback-${Date.now()}",
  "feedback-${feedback.type}",

  // Variant patterns
  "color-${this.colorMode}",
  "position-${this.position}",
  "variant-${this.variant}",
  "size-${this.size}",
  "orientation-${this.orientation}",
];

console.log("1️⃣ GLOBAL STYLESHEET vs ACTUAL USAGE COMPARISON");
console.log("─".repeat(50));

console.log("\n✅ CSS CLASSES IN STYLESHEET THAT ARE USED:");
const usedStylesheetClasses = GLOBAL_STYLESHEET_CLASSES.filter(
  (cls) =>
    ACTUAL_CSS_CLASSES_USED.includes(cls) ||
    CLASSLIST_OPERATIONS.some((op) => op.class === cls),
);
usedStylesheetClasses.forEach((cls) => console.log(`   • ${cls}`));

console.log("\n❌ CSS CLASSES IN STYLESHEET THAT ARE UNUSED:");
const unusedStylesheetClasses = GLOBAL_STYLESHEET_CLASSES.filter(
  (cls) =>
    !ACTUAL_CSS_CLASSES_USED.includes(cls) &&
    !CLASSLIST_OPERATIONS.some((op) => op.class === cls),
);
unusedStylesheetClasses.forEach((cls) => console.log(`   • ${cls}`));

console.log("\n⚠️ CSS CLASSES USED BUT NOT IN STYLESHEET:");
const missingClasses = ACTUAL_CSS_CLASSES_USED.filter(
  (cls) => !GLOBAL_STYLESHEET_CLASSES.includes(cls),
);
missingClasses.forEach((cls) => console.log(`   • ${cls}`));

console.log("\n\n2️⃣ SELECTOR USAGE PATTERNS");
console.log("─".repeat(50));

console.log("\n🎯 QUERYSELECTOR PATTERNS BY COMPONENT:");
const selectorsByComponent = {
  Panel: QUERYSELECTOR_SELECTORS.filter((s) => s.includes("panel")),
  Ethics: QUERYSELECTOR_SELECTORS.filter(
    (s) => s.includes("ethics") || s.includes("meter"),
  ),
  Feedback: QUERYSELECTOR_SELECTORS.filter((s) => s.includes("feedback")),
  Button: QUERYSELECTOR_SELECTORS.filter((s) => s.includes("button")),
  Slider: QUERYSELECTOR_SELECTORS.filter((s) => s.includes("slider")),
};

Object.entries(selectorsByComponent).forEach(([component, selectors]) => {
  console.log(`\n   ${component} Component (${selectors.length} selectors):`);
  selectors.forEach((selector) =>
    console.log(`     • querySelector("${selector}")`),
  );
});

console.log("\n\n3️⃣ DYNAMIC CLASS GENERATION PATTERNS");
console.log("─".repeat(50));

console.log("\n⚡ TEMPLATE LITERAL PATTERNS:");
DYNAMIC_CLASS_PATTERNS.forEach((pattern) => {
  console.log(`   • ${pattern}`);
});

console.log("\n\n4️⃣ STATE MANAGEMENT PATTERNS");
console.log("─".repeat(50));

const stateOperations = CLASSLIST_OPERATIONS.reduce((acc, op) => {
  if (!acc[op.class]) acc[op.class] = [];
  acc[op.class].push(op.operation);
  return acc;
}, {});

console.log("\n🔄 CLASSLIST OPERATIONS BY CLASS:");
Object.entries(stateOperations).forEach(([className, operations]) => {
  console.log(`   • ${className}: ${operations.join(", ")}`);
});

console.log("\n\n5️⃣ PERFORMANCE ANALYSIS");
console.log("─".repeat(50));

console.log("\n📊 SELECTOR PERFORMANCE METRICS:");
console.log(
  `   • Total querySelector calls: ${QUERYSELECTOR_SELECTORS.length}`,
);
console.log(`   • Total classList operations: ${CLASSLIST_OPERATIONS.length}`);
console.log(`   • Dynamic class patterns: ${DYNAMIC_CLASS_PATTERNS.length}`);
console.log(`   • Classes in stylesheet: ${GLOBAL_STYLESHEET_CLASSES.length}`);
console.log(
  `   • Classes used in JavaScript: ${ACTUAL_CSS_CLASSES_USED.length}`,
);

const efficiency = (
  (usedStylesheetClasses.length / GLOBAL_STYLESHEET_CLASSES.length) *
  100
).toFixed(1);
console.log(`   • Stylesheet efficiency: ${efficiency}%`);

console.log("\n⚠️ PERFORMANCE CONCERNS:");
if (QUERYSELECTOR_SELECTORS.length > 20) {
  console.log(
    "   • High number of querySelector calls - consider element caching",
  );
}
if (unusedStylesheetClasses.length > 0) {
  console.log("   • Unused CSS classes increase bundle size");
}
if (missingClasses.length > 10) {
  console.log("   • Many classes lack stylesheet definitions");
}

console.log("\n\n6️⃣ OPTIMIZATION RECOMMENDATIONS");
console.log("─".repeat(50));

console.log("\n💡 IMMEDIATE OPTIMIZATIONS:");
if (unusedStylesheetClasses.length > 0) {
  console.log("   1. Remove unused CSS classes from global stylesheet:");
  unusedStylesheetClasses.forEach((cls) => console.log(`      - ${cls}`));
}

console.log("\n   2. Add missing CSS classes to global stylesheet:");
const criticalMissingClasses = missingClasses.filter((cls) =>
  QUERYSELECTOR_SELECTORS.some((selector) =>
    selector.includes(cls.replace(".", "")),
  ),
);
criticalMissingClasses
  .slice(0, 10)
  .forEach((cls) => console.log(`      - ${cls}`));

console.log("\n   3. Implement element caching for frequently used selectors:");
const frequentSelectors = [".panel-content", ".meter-fill", ".feedback-list"];
frequentSelectors.forEach((selector) =>
  console.log(`      - Cache ${selector}`),
);

console.log("\n   4. Consider CSS-in-JS for dynamic styling patterns");
console.log("   5. Use semantic BEM naming convention consistently");

console.log("\n\n✅ ANALYSIS COMPLETE!");
console.log("=====================================\n");
