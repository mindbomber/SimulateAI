// Enhanced Main App Tooltip Diagnostic
// Run this in the console on the main app page (app.html)

console.log("🔍 Enhanced Main App Tooltip Diagnostic v2");
console.log("===========================================");

// Function to check tooltip status
function checkTooltipStatus() {
  console.log("\n📊 Current Progress Ring Status:");

  const rings = document.querySelectorAll(".category-progress-ring");
  console.log(`Total progress rings found: ${rings.length}`);

  if (rings.length === 0) {
    console.log("❌ No progress rings found! Possible reasons:");
    console.log("   - View not fully loaded");
    console.log("   - Categories not rendered yet");
    console.log("   - Different view active");
    return;
  }

  rings.forEach((ring, index) => {
    const hasTooltip = ring.hasAttribute("data-tooltip");
    const categoryId = ring.getAttribute("data-category-id");
    const tooltipContent = ring.getAttribute("data-tooltip");

    console.log(`Ring ${index + 1}:`, {
      hasTooltip,
      categoryId,
      tooltipContent: tooltipContent || "NONE",
      visible: ring.offsetWidth > 0 && ring.offsetHeight > 0,
      parentType: ring.parentElement?.className || "unknown",
    });
  });
}

// Function to check MainGrid and CategoryHeader
function checkComponents() {
  console.log("\n🔧 Component Status:");

  // Check MainGrid
  const mainGrid = window.mainGrid;
  console.log("MainGrid available:", !!mainGrid);

  if (mainGrid) {
    console.log("MainGrid current view:", mainGrid.currentView);
    console.log("CategoryHeader available:", !!mainGrid.categoryHeader);

    // Check if our enhanced methods exist
    if (mainGrid.categoryHeader) {
      const methods = [
        "robustTooltipAttachment",
        "ensureTooltipData",
        "setupProgressRingObserver",
        "retryAttachTooltips",
      ];

      methods.forEach((method) => {
        const exists = typeof mainGrid.categoryHeader[method] === "function";
        console.log(`  ${method}:`, exists ? "✅" : "❌");
      });
    }
  }
}

// Function to test manual tooltip fix
function testManualFix() {
  console.log("\n🧪 Testing Manual Tooltip Fix:");

  if (!window.mainGrid?.categoryHeader) {
    console.log("❌ CategoryHeader not available");
    return;
  }

  const categoryHeader = window.mainGrid.categoryHeader;

  // Try to force tooltip attachment
  if (categoryHeader.robustTooltipAttachment) {
    console.log("⚡ Running robustTooltipAttachment...");

    // Try on both containers
    const containers = [
      document.querySelector(".categories-grid"),
      document.querySelector(".scenarios-grid"),
      document.body,
    ].filter(Boolean);

    containers.forEach((container, index) => {
      console.log(
        `Testing container ${index + 1}: ${container.className || "body"}`,
      );
      categoryHeader.robustTooltipAttachment(container);
    });

    // Check results after a delay
    setTimeout(() => {
      console.log("\n📊 Results after manual fix:");
      checkTooltipStatus();
    }, 1000);
  }
}

// Function to check view state
function checkViewState() {
  console.log("\n👁️ View State Check:");

  const categoryView = document.querySelector(".categories-grid");
  const scenarioView = document.querySelector(".scenarios-grid");

  console.log("Category view element:", !!categoryView);
  console.log("Scenario view element:", !!scenarioView);

  if (categoryView) {
    console.log(
      "Category view visible:",
      !categoryView.style.display || categoryView.style.display !== "none",
    );
    console.log(
      "Category view has active class:",
      categoryView.classList.contains("active"),
    );
  }

  if (scenarioView) {
    console.log(
      "Scenario view visible:",
      !scenarioView.style.display || scenarioView.style.display !== "none",
    );
    console.log(
      "Scenario view has active class:",
      scenarioView.classList.contains("active"),
    );
  }
}

// Function to check timing issues
function checkTiming() {
  console.log("\n⏰ Timing Issue Check:");

  // Check if MutationObserver is set up
  if (window.mainGrid?.categoryHeader?.mutationObserver) {
    console.log("✅ MutationObserver is active");
  } else {
    console.log("❌ MutationObserver not found");
  }

  // Test delayed tooltip attachment
  console.log("Testing delayed attachment in 2 seconds...");
  setTimeout(() => {
    console.log("⚡ Running delayed tooltip test...");
    testManualFix();
  }, 2000);
}

// Run all diagnostics
async function runFullDiagnostic() {
  console.log("🚀 Starting Full Diagnostic...\n");

  checkViewState();
  checkComponents();
  checkTooltipStatus();
  checkTiming();

  console.log("\n💡 Diagnostic complete!");
  console.log("💡 To manually test tooltips, run: testManualFix()");
}

// Make functions available globally for manual testing
window.checkTooltipStatus = checkTooltipStatus;
window.testManualFix = testManualFix;
window.checkComponents = checkComponents;

// Auto-run diagnostic
runFullDiagnostic();
