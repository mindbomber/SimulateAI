// Comprehensive Tooltip Diagnostic Script
// Run this in browser console to diagnose tooltip issues

(function diagnosticTooltipIssues() {
  console.log("🔍 Starting Comprehensive Tooltip Diagnostic...");

  // 1. Check current view
  const scenarioGrid = document.querySelector(
    '.scenarios-grid[data-view="scenario"]',
  );
  const categoryGrid = document.querySelector(
    '.scenarios-grid[data-view="category"]',
  );
  const currentView = scenarioGrid
    ? "scenario"
    : categoryGrid
      ? "category"
      : "unknown";

  console.log(`📍 Current View: ${currentView}`);

  // 2. Check for progress rings
  const allRings = document.querySelectorAll(".category-progress-ring");
  const visibleRings = Array.from(allRings).filter((ring) => {
    const rect = ring.getBoundingClientRect();
    const style = window.getComputedStyle(ring);
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      style.display !== "none" &&
      style.visibility !== "hidden"
    );
  });

  console.log(`📊 Progress Rings Analysis:`);
  console.log(`   Total rings found: ${allRings.length}`);
  console.log(`   Visible rings: ${visibleRings.length}`);

  // 3. Check ring details
  allRings.forEach((ring, index) => {
    const rect = ring.getBoundingClientRect();
    const style = window.getComputedStyle(ring);
    const hasTooltipData = ring.hasAttribute("data-tooltip");
    const hasEventListeners = ring.hasAttribute("data-tooltip-fixed");
    const tooltipContent = ring.getAttribute("data-tooltip");

    console.log(`🔍 Ring ${index + 1}:`);
    console.log(`   Visible: ${rect.width > 0 && rect.height > 0}`);
    console.log(`   Display: ${style.display}`);
    console.log(`   Visibility: ${style.visibility}`);
    console.log(`   Has tooltip data: ${hasTooltipData}`);
    console.log(`   Tooltip content: "${tooltipContent}"`);
    console.log(`   Has event listeners: ${hasEventListeners}`);
    console.log(
      `   Container: ${ring.closest(".category-header, .scenario-card, .scenarios-grid")?.className || "unknown"}`,
    );
  });

  // 4. Check for CSS issues
  console.log(`🎨 CSS Analysis:`);
  const scenarioViewCSS = document.querySelector(
    '.scenarios-grid[data-view="scenario"]',
  );
  if (scenarioViewCSS) {
    const rings = scenarioViewCSS.querySelectorAll(".category-progress-ring");
    console.log(`   Rings in scenario view: ${rings.length}`);
    rings.forEach((ring, index) => {
      const style = window.getComputedStyle(ring);
      console.log(
        `   Ring ${index + 1} in scenario view - Display: ${style.display}, Visibility: ${style.visibility}, Pointer Events: ${style.pointerEvents}`,
      );
    });
  }

  // 5. Check for event listeners (DevTools-only API)
  console.log(`🎧 Event Listener Analysis:`);
  visibleRings.forEach((ring, index) => {
    const events =
      typeof window.getEventListeners === "function"
        ? window.getEventListeners(ring)
        : "DevTools required";
    console.log(`   Ring ${index + 1} events:`, events);
  });

  // 6. Test tooltip creation manually
  console.log(`🧪 Manual Tooltip Test:`);
  if (visibleRings.length > 0) {
    const testRing = visibleRings[0];
    const rect = testRing.getBoundingClientRect();

    // Create test tooltip
    const testTooltip = document.createElement("div");
    testTooltip.className = "diagnostic-tooltip";
    testTooltip.textContent = "Diagnostic Test Tooltip";
    testTooltip.style.cssText = `
      position: fixed !important;
      top: ${rect.top - 50}px !important;
      left: ${rect.left + rect.width / 2}px !important;
      transform: translateX(-50%) !important;
      z-index: 9999 !important;
      background: red !important;
      color: white !important;
      padding: 8px 12px !important;
      border-radius: 4px !important;
      font-size: 14px !important;
      opacity: 1 !important;
      display: block !important;
      visibility: visible !important;
      pointer-events: none !important;
    `;

    document.body.appendChild(testTooltip);

    setTimeout(() => {
      testTooltip.remove();
      console.log(
        `✅ Manual tooltip test completed - tooltip should have appeared briefly`,
      );
    }, 2000);

    console.log(`🎯 Created test tooltip for 2 seconds`);
  }

  // 7. Check CategoryHeader instance
  console.log(`🏗️ Component Analysis:`);
  const mainGrid = window.mainGridInstance || window.MainGrid;
  console.log(`   MainGrid instance: ${!!mainGrid}`);

  if (mainGrid && mainGrid.categoryHeader) {
    console.log(`   CategoryHeader instance: ${!!mainGrid.categoryHeader}`);
    console.log(
      `   attachTooltipsToProgressRings method: ${typeof mainGrid.categoryHeader.attachTooltipsToProgressRings}`,
    );
  }

  // 8. Return diagnostic summary
  const summary = {
    currentView,
    totalRings: allRings.length,
    visibleRings: visibleRings.length,
    ringsWithTooltipData: Array.from(allRings).filter((r) =>
      r.hasAttribute("data-tooltip"),
    ).length,
    ringsWithEventListeners: Array.from(allRings).filter((r) =>
      r.hasAttribute("data-tooltip-fixed"),
    ).length,
    hasMainGrid: !!mainGrid,
    hasCategoryHeader: !!(mainGrid && mainGrid.categoryHeader),
  };

  console.log(`📋 Diagnostic Summary:`, summary);

  return summary;
})();
