// Debug script for CategoryHeader progress ring functionality
// Run this in the browser console to test progress ring functionality

(async function debugProgressRings() {
  console.log("🔍 CategoryHeader Progress Ring Debug");
  console.log("=====================================");

  // Check if CategoryHeader is available
  const progressRings = document.querySelectorAll(".category-progress-ring");
  console.log(`📊 Found ${progressRings.length} progress rings`);

  if (progressRings.length === 0) {
    console.warn("⚠️ No progress rings found. This might indicate:");
    console.warn("   - CSS not loaded properly");
    console.warn("   - CategoryHeader not rendered");
    console.warn("   - Different view active");
    return;
  }

  // Check each progress ring
  progressRings.forEach((ring, index) => {
    console.log(`\n🎯 Progress Ring ${index + 1}:`);
    console.log("   Classes:", Array.from(ring.classList));
    console.log("   Has tooltip:", ring.hasAttribute("data-tooltip"));
    console.log("   Category ID:", ring.getAttribute("data-category-id"));
    console.log("   Tooltip content:", ring.getAttribute("data-tooltip"));

    // Check for event listeners
    const hasClickListener =
      ring.onclick !== null ||
      (getEventListeners && getEventListeners(ring).click?.length > 0);
    console.log("   Has click listener:", hasClickListener);

    // Test hover functionality
    console.log("   Testing hover...");
    ring.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));

    setTimeout(() => {
      const tooltip = document.querySelector(".progress-ring-tooltip.visible");
      console.log("   Tooltip visible after hover:", !!tooltip);

      ring.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    }, 100);
  });

  // Check CSS loading
  console.log("\n📋 CSS Check:");
  const categoryHeaderCSS = Array.from(document.styleSheets).find(
    (sheet) => sheet.href && sheet.href.includes("category-header.css"),
  );
  console.log("   CategoryHeader CSS loaded:", !!categoryHeaderCSS);

  const mainCSS = Array.from(document.styleSheets).find(
    (sheet) => sheet.href && sheet.href.includes("main.css"),
  );
  console.log("   Main CSS loaded:", !!mainCSS);

  // Check for style rules
  try {
    const testElement = document.createElement("div");
    testElement.className = "category-progress-ring";
    document.body.appendChild(testElement);
    const styles = getComputedStyle(testElement);
    console.log(
      "   Progress ring styles loaded:",
      styles.position !== "static" || styles.display !== "block",
    );
    document.body.removeChild(testElement);
  } catch (e) {
    console.log("   Could not test styles:", e.message);
  }

  console.log("\n✅ Debug complete!");
})();
