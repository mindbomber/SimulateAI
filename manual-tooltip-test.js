// Manual Tooltip Test - Run in browser console
(function manualTooltipTest() {
  console.log("🧪 Manual Tooltip Test");
  console.log("======================");

  // Find all progress rings
  const rings = document.querySelectorAll(".category-progress-ring");
  console.log(`Found ${rings.length} progress rings`);

  if (rings.length === 0) {
    console.error("No progress rings found!");
    return;
  }

  // Test the first ring
  const firstRing = rings[0];
  console.log("Testing first ring:", firstRing);
  console.log("Has data-tooltip:", firstRing.hasAttribute("data-tooltip"));
  console.log("Tooltip content:", firstRing.getAttribute("data-tooltip"));

  // Manually add a simple event listener
  const testTooltipHandler = (event) => {
    console.log("✅ Manual mouseenter event fired!");

    // Create a simple tooltip
    const existingTooltip = document.getElementById("manual-test-tooltip");
    if (existingTooltip) {
      existingTooltip.remove();
    }

    const tooltip = document.createElement("div");
    tooltip.id = "manual-test-tooltip";
    tooltip.style.cssText = `
            position: fixed;
            background: #000;
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            z-index: 9999;
            pointer-events: none;
            font-size: 14px;
            max-width: 200px;
        `;

    const rect = firstRing.getBoundingClientRect();
    tooltip.style.left = `${rect.left + rect.width / 2}px`;
    tooltip.style.top = `${rect.top - 40}px`;
    tooltip.style.transform = "translateX(-50%)";

    const tooltipText =
      firstRing.getAttribute("data-tooltip") || "Test tooltip content";
    tooltip.textContent = tooltipText;

    document.body.appendChild(tooltip);
    console.log("Test tooltip created");

    // Remove tooltip on mouse leave
    const removeTooltip = () => {
      tooltip.remove();
      firstRing.removeEventListener("mouseleave", removeTooltip);
      console.log("Test tooltip removed");
    };

    firstRing.addEventListener("mouseleave", removeTooltip);
  };

  // Add the test listener
  firstRing.addEventListener("mouseenter", testTooltipHandler);
  console.log("✅ Manual event listener added to first ring");
  console.log("Hover over the first progress ring to test...");

  // Also test if CategoryHeader methods work
  console.log("\n🔍 Testing CategoryHeader methods:");

  // Try to import and test CategoryHeader
  try {
    // Attempt to find existing CategoryHeader instance
    if (window.mainGrid && window.mainGrid.categoryHeader) {
      console.log("Found CategoryHeader instance via mainGrid");
      const categoryHeader = window.mainGrid.categoryHeader;

      // Test attachEventListeners manually
      console.log("Testing categoryHeader.attachEventListeners...");
      categoryHeader.attachEventListeners(document.body);
    } else {
      console.log("No CategoryHeader instance found in window.mainGrid");
    }
  } catch (error) {
    console.error("Error testing CategoryHeader:", error);
  }
})();
