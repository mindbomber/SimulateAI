// Tooltip Debug Test - Run in browser console
(function debugTooltips() {
  console.log("🔍 CategoryHeader Tooltip Debug");
  console.log("==============================");

  // Check if progress rings exist
  const progressRings = document.querySelectorAll(
    ".category-progress-ring[data-tooltip]",
  );
  console.log(
    `📊 Found ${progressRings.length} progress rings with data-tooltip attribute`,
  );

  // Check all progress rings (even without tooltip)
  const allProgressRings = document.querySelectorAll(".category-progress-ring");
  console.log(`📊 Found ${allProgressRings.length} total progress rings`);

  if (allProgressRings.length === 0) {
    console.warn("⚠️ No progress rings found at all");
    return;
  }

  // Check each progress ring
  allProgressRings.forEach((ring, index) => {
    console.log(`\n🎯 Progress Ring ${index + 1}:`);
    console.log("   Element:", ring);
    console.log("   Classes:", Array.from(ring.classList));
    console.log("   Has data-tooltip:", ring.hasAttribute("data-tooltip"));
    console.log("   Tooltip content:", ring.getAttribute("data-tooltip"));
    console.log(
      "   Has data-category-id:",
      ring.hasAttribute("data-category-id"),
    );
    console.log("   Category ID:", ring.getAttribute("data-category-id"));

    // Check computed styles
    const styles = getComputedStyle(ring);
    console.log("   Cursor:", styles.cursor);
    console.log("   Position:", styles.position);
    console.log("   Display:", styles.display);

    // Check for event listeners manually
    console.log("   Testing mouseenter...");

    // Test tooltip creation manually
    if (ring.hasAttribute("data-tooltip")) {
      const tooltipText = ring.getAttribute("data-tooltip");
      console.log("   Creating test tooltip...");

      // Create tooltip
      const tooltipEl = document.createElement("div");
      tooltipEl.className = "progress-ring-tooltip visible";
      tooltipEl.textContent = tooltipText;
      tooltipEl.style.position = "fixed";
      tooltipEl.style.background = "black";
      tooltipEl.style.color = "white";
      tooltipEl.style.padding = "8px 12px";
      tooltipEl.style.borderRadius = "4px";
      tooltipEl.style.zIndex = "9999";
      tooltipEl.style.pointerEvents = "none";

      const rect = ring.getBoundingClientRect();
      tooltipEl.style.left = `${rect.left + rect.width / 2}px`;
      tooltipEl.style.top = `${rect.top - 40}px`;
      tooltipEl.style.transform = "translateX(-50%)";

      document.body.appendChild(tooltipEl);

      console.log("   Test tooltip created:", tooltipEl);

      // Remove after 3 seconds
      setTimeout(() => {
        if (tooltipEl.parentNode) {
          tooltipEl.parentNode.removeChild(tooltipEl);
          console.log("   Test tooltip removed");
        }
      }, 3000);
    }
  });

  // Check CategoryHeader instance
  console.log("\n🏗️ CategoryHeader Instance Check:");

  // Try to find CategoryHeader in global scope or create test
  if (window.categoryHeaderInstance) {
    console.log("   CategoryHeader instance found in window");
  } else {
    console.log("   No CategoryHeader instance found in window");
  }

  // Check if event listeners are working by adding a test listener
  if (allProgressRings.length > 0) {
    const firstRing = allProgressRings[0];
    console.log("\n🧪 Testing Event Listeners:");

    const testMouseEnter = (e) => {
      console.log("✅ MouseEnter event fired on:", e.currentTarget);
      firstRing.removeEventListener("mouseenter", testMouseEnter);
    };

    firstRing.addEventListener("mouseenter", testMouseEnter);
    console.log("   Added test mouseenter listener to first ring");
    console.log("   Hover over the first progress ring to test...");
  }
})();
