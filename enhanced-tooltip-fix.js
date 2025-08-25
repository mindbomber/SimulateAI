// Enhanced Main App Debug with Manual Fix
// Run this in the console on the main app page after it loads

console.log("🔧 Enhanced tooltip debug with manual fix...");

// Global helper function to manually fix tooltips
window.fixTooltips = function () {
  console.log("🛠️ Manually fixing tooltips...");

  const rings = document.querySelectorAll(".category-progress-ring");
  console.log(`Found ${rings.length} progress rings`);

  if (rings.length === 0) {
    console.log("❌ No progress rings found!");
    return;
  }

  rings.forEach((ring, index) => {
    // Remove existing listeners
    const events = [
      "mouseenter",
      "mouseleave",
      "touchstart",
      "click",
      "keydown",
    ];
    events.forEach((eventType) => {
      ring.removeEventListener(eventType, ring[`_${eventType}Handler`]);
    });

    // Add tooltip data if missing
    if (!ring.hasAttribute("data-tooltip")) {
      const percentage =
        ring.querySelector(".progress-percentage")?.textContent || "0%";
      const categoryId =
        ring.getAttribute("data-category-id") || `category-${index + 1}`;
      ring.setAttribute(
        "data-tooltip",
        `Progress: ${percentage} for ${categoryId}`,
      );
      console.log(`Ring ${index + 1}: Added missing tooltip data`);
    }

    // Add robust event listeners
    const mouseenterHandler = function (e) {
      console.log(`🎯 Tooltip trigger for ring ${index + 1}`);

      // Remove existing tooltips
      document
        .querySelectorAll(".progress-ring-tooltip, .manual-fix-tooltip")
        .forEach((el) => el.remove());

      const tooltip = document.createElement("div");
      tooltip.className = "progress-ring-tooltip visible manual-fix-tooltip";
      tooltip.textContent = ring.getAttribute("data-tooltip");
      tooltip.style.cssText = `
        position: fixed !important;
        top: ${e.clientY - 60}px !important;
        left: ${e.clientX}px !important;
        transform: translateX(-50%) !important;
        z-index: 1300 !important;
        background: #1f2937 !important;
        color: white !important;
        padding: 12px 16px !important;
        border-radius: 6px !important;
        font-size: 14px !important;
        opacity: 1 !important;
        border: 2px solid lime !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
      `;

      document.body.appendChild(tooltip);
      ring._manualTooltip = tooltip;
    };

    const mouseleaveHandler = function () {
      if (ring._manualTooltip) {
        ring._manualTooltip.remove();
        ring._manualTooltip = null;
      }
    };

    ring.addEventListener("mouseenter", mouseenterHandler);
    ring.addEventListener("mouseleave", mouseleaveHandler);

    // Store handlers for cleanup
    ring._mouseenterHandler = mouseenterHandler;
    ring._mouseleaveHandler = mouseleaveHandler;
  });

  console.log("✅ Manual tooltip fix applied to all rings");
  console.log("💡 Try hovering over the progress rings now!");
};

// Auto-run the fix
setTimeout(() => {
  console.log("🔄 Auto-running tooltip fix...");
  window.fixTooltips();
}, 3000);

console.log("✅ Enhanced debug loaded");
console.log("💡 Run fixTooltips() in console to manually fix tooltips");
console.log("💡 Auto-fix will run in 3 seconds...");
