// Quick Debug: Check Main App Progress Rings
// Run this in the console on the main app page

console.log("🔍 Debugging Main App Progress Rings...");

// Check if progress rings exist and have required attributes
const rings = document.querySelectorAll(".category-progress-ring");
console.log(`Found ${rings.length} progress rings in main app`);

if (rings.length === 0) {
  console.log("❌ No progress rings found! They might not be rendered yet.");
  console.log("💡 Try running this script after the page fully loads");
}

rings.forEach((ring, index) => {
  const rect = ring.getBoundingClientRect();
  console.log(`Ring ${index + 1}:`, {
    hasTooltip: ring.hasAttribute("data-tooltip"),
    tooltipContent: ring.getAttribute("data-tooltip"),
    categoryId: ring.getAttribute("data-category-id"),
    visible: rect.width > 0 && rect.height > 0,
    position: { top: rect.top, left: rect.left },
    classList: Array.from(ring.classList),
    parentElement: ring.parentElement?.tagName,
    hasRole: ring.hasAttribute("role"),
    hasTabindex: ring.hasAttribute("tabindex"),
  });
});

// Check if MainGrid instance exists
if (window.mainGrid) {
  console.log("✅ MainGrid instance found");
  console.log("Current view:", window.mainGrid.currentView);
} else {
  console.log("❌ No MainGrid instance found on window");
}

// Check if CategoryHeader instances exist
if (window.mainGrid?.categoryHeader) {
  console.log("✅ CategoryHeader instance found in MainGrid");
} else {
  console.log("❌ No CategoryHeader instance found");
}

// Test event listener attachment manually
function testEventAttachment() {
  console.log("🧪 Testing manual event attachment...");

  rings.forEach((ring, index) => {
    if (!ring.hasAttribute("data-tooltip")) {
      console.log(`Ring ${index + 1}: Adding test tooltip attribute`);
      ring.setAttribute("data-tooltip", `Test tooltip for ring ${index + 1}`);
    }

    // Add test event listener
    ring.addEventListener("mouseenter", function testListener(e) {
      console.log(`🎯 Mouse entered ring ${index + 1}`);

      // Create simple tooltip
      const tooltip = document.createElement("div");
      tooltip.className = "progress-ring-tooltip visible test-tooltip";
      tooltip.textContent = `Test tooltip for ring ${index + 1}`;
      tooltip.style.cssText = `
        position: fixed !important;
        top: ${e.clientY - 50}px !important;
        left: ${e.clientX}px !important;
        transform: translateX(-50%) !important;
        z-index: 1300 !important;
        background: #1f2937 !important;
        color: white !important;
        padding: 12px 16px !important;
        border-radius: 6px !important;
        font-size: 14px !important;
        border: 2px solid green !important;
        opacity: 1 !important;
      `;

      document.body.appendChild(tooltip);
      ring._testTooltip = tooltip;
    });

    ring.addEventListener("mouseleave", function () {
      if (ring._testTooltip) {
        ring._testTooltip.remove();
        ring._testTooltip = null;
      }
    });
  });

  console.log("✅ Test event listeners attached to all rings");
}

// Run test attachment
if (rings.length > 0) {
  testEventAttachment();
}

console.log("✅ Debug complete. Try hovering over progress rings.");
console.log(
  "💡 Run testEventAttachment() if you need to reattach test listeners",
);
