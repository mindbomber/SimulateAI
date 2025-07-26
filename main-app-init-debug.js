// Main App Initialization Debug
// Add this to check CategoryHeader initialization issues

console.log("🔍 Debugging CategoryHeader initialization in main app...");

// Check when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", runDebug);
} else {
  runDebug();
}

function runDebug() {
  console.log("📍 DOM is ready, running debug...");

  // Wait a bit for the main-grid to initialize
  setTimeout(() => {
    console.log("🔄 Checking MainGrid and CategoryHeader...");

    // Check if MainGrid is available
    if (window.mainGrid) {
      console.log("✅ MainGrid found");
      console.log("Current view:", window.mainGrid.currentView);

      if (window.mainGrid.categoryHeader) {
        console.log("✅ CategoryHeader instance found");

        // Check if config is loaded
        window.mainGrid.categoryHeader
          .getConfig()
          .then((config) => {
            console.log("✅ CategoryHeader config loaded:", {
              tooltipZIndex: config.tooltip?.zIndex,
              hasSelectors: !!config.selectors,
            });

            // Force reattach event listeners
            console.log("🔧 Force reattaching event listeners...");
            const container =
              window.mainGrid.currentView === "category"
                ? window.mainGrid.categoryContainer
                : window.mainGrid.scenarioContainer;

            if (container) {
              window.mainGrid.categoryHeader.attachEventListeners(container);
              console.log("✅ Event listeners reattached");

              // Check progress rings after reattachment
              setTimeout(checkProgressRings, 500);
            }
          })
          .catch((error) => {
            console.log("❌ Failed to get CategoryHeader config:", error);
          });
      } else {
        console.log("❌ No CategoryHeader instance found");
      }
    } else {
      console.log("❌ MainGrid not found on window");

      // Try to find it in a different way
      console.log("🔍 Checking for MainGrid in modules...");
    }
  }, 2000); // Wait 2 seconds for initialization
}

function checkProgressRings() {
  console.log("🔍 Checking progress rings after reattachment...");

  const rings = document.querySelectorAll(".category-progress-ring");
  console.log(`Found ${rings.length} progress rings`);

  rings.forEach((ring, index) => {
    console.log(`Ring ${index + 1}:`, {
      hasTooltip: ring.hasAttribute("data-tooltip"),
      tooltipContent: ring.getAttribute("data-tooltip"),
      categoryId: ring.getAttribute("data-category-id"),
      classList: Array.from(ring.classList),
      visible: ring.offsetWidth > 0 && ring.offsetHeight > 0,
    });

    // Test if hover works now
    ring.addEventListener("mouseenter", function (e) {
      console.log(`🎯 HOVER TEST: Ring ${index + 1} mouseenter`);
    });
  });

  if (rings.length > 0) {
    console.log("💡 Try hovering over the progress rings now!");
  }
}

console.log(
  "🚀 Debug script loaded. Will check initialization in 2 seconds...",
);
