// CategoryHeader Tooltip Fix - Enhanced for Both Views
// This will diagnose and fix tooltip issues automatically in both category and scenario views

(function fixCategoryHeaderTooltips() {
  console.log("🔧 CategoryHeader Tooltip Fix Starting (Enhanced)...");

  let fixedRings = 0;
  let totalRings = 0;

  // Step 1: Find all progress rings in both views
  const rings = document.querySelectorAll(".category-progress-ring");
  totalRings = rings.length;

  console.log(`📊 Found ${totalRings} progress rings`);

  // Detect current view
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

  console.log(`🔍 Current view detected: ${currentView}`);

  if (totalRings === 0) {
    console.log(
      "❌ No progress rings found. Make sure you're in category view or progress rings are rendered.",
    );

    // Try to detect if we're in the wrong view
    if (currentView === "scenario") {
      console.log(
        "💡 Tip: Switch to category view to see progress rings with tooltips",
      );
    }

    return;
  }

  // Step 2: Fix each progress ring
  rings.forEach((ring, index) => {
    console.log(`🔧 Fixing ring ${index + 1}...`);

    // Skip if ring is no longer in DOM
    if (!ring || !ring.parentNode) {
      console.log(`   ⚠️ Ring ${index + 1} no longer in DOM, skipping...`);
      return;
    }

    // Store reference and mark as being processed
    const currentRing = ring;

    // Remove any existing tooltip-related attributes to start fresh
    currentRing.removeAttribute("data-tooltip-fixed");

    // Ensure tooltip data exists
    if (!currentRing.hasAttribute("data-tooltip")) {
      const percentage =
        currentRing.querySelector(".progress-percentage")?.textContent || "0%";
      const categoryId =
        currentRing.getAttribute("data-category-id") || `category-${index + 1}`;
      const categoryTitle = currentRing
        .closest(".category-header")
        ?.querySelector(".category-title")?.textContent;

      let tooltipContent = `Progress: ${percentage}`;
      if (categoryTitle) {
        tooltipContent = `${categoryTitle}: ${percentage} complete`;
      } else if (categoryId && categoryId !== `category-${index + 1}`) {
        tooltipContent = `${categoryId}: ${percentage} complete`;
      }

      currentRing.setAttribute("data-tooltip", tooltipContent);
      console.log(`   ✅ Added tooltip data: "${tooltipContent}"`);
    }

    // Ensure accessibility attributes
    if (!currentRing.hasAttribute("role")) {
      currentRing.setAttribute("role", "button");
    }
    if (!currentRing.hasAttribute("tabindex")) {
      currentRing.setAttribute("tabindex", "0");
    }
    if (!currentRing.hasAttribute("aria-label")) {
      const tooltipContent = currentRing.getAttribute("data-tooltip");
      currentRing.setAttribute(
        "aria-label",
        `Category progress: ${tooltipContent}`,
      );
    }

    // Create robust event handlers
    const createTooltip = (content, rect) => {
      // Remove existing tooltips
      document
        .querySelectorAll(".progress-ring-tooltip, .manual-fix-tooltip")
        .forEach((el) => el.remove());

      const tooltip = document.createElement("div");
      tooltip.className = "progress-ring-tooltip visible manual-fix-tooltip";
      tooltip.textContent = content;
      tooltip.style.cssText = `
                position: fixed !important;
                top: ${rect.top - 50}px !important;
                left: ${rect.left + rect.width / 2}px !important;
                transform: translateX(-50%) !important;
                z-index: 1300 !important;
                background: #1f2937 !important;
                color: white !important;
                padding: 12px 16px !important;
                border-radius: 6px !important;
                font-size: 14px !important;
                opacity: 1 !important;
                display: block !important;
                visibility: visible !important;
                max-width: 300px !important;
                min-width: 200px !important;
                text-align: center !important;
                line-height: 1.5 !important;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
                border: 1px solid #374151 !important;
                pointer-events: none !important;
            `;

      // Ensure tooltip doesn't go off screen
      if (rect.top - 50 < 0) {
        tooltip.style.top = `${rect.bottom + 8}px !important`;
      }

      document.body.appendChild(tooltip);
      return tooltip;
    };

    const showTooltip = () => {
      const rect = currentRing.getBoundingClientRect();
      const content = currentRing.getAttribute("data-tooltip");
      const tooltip = createTooltip(content, rect);
      currentRing._currentTooltip = tooltip;

      console.log(`   🎯 Tooltip shown for ring ${index + 1}`);
    };

    const hideTooltip = () => {
      if (currentRing._currentTooltip) {
        currentRing._currentTooltip.remove();
        currentRing._currentTooltip = null;
      }
      // Also remove any orphaned tooltips
      document
        .querySelectorAll(".manual-fix-tooltip")
        .forEach((el) => el.remove());
    };

    const handleTouch = (e) => {
      e.preventDefault();
      showTooltip(e);
      setTimeout(hideTooltip, 3000); // Auto-hide after 3 seconds on mobile
    };

    const handleClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if ("ontouchstart" in window) {
        // Mobile: toggle tooltip
        if (currentRing._currentTooltip) {
          hideTooltip();
        } else {
          showTooltip(e);
          setTimeout(hideTooltip, 3000);
        }
      }
    };

    const handleKeydown = (e) => {
      if (["Enter", " ", "Escape"].includes(e.key)) {
        e.preventDefault();
        if (e.key === "Escape") {
          hideTooltip();
        } else {
          showTooltip(e);
          setTimeout(hideTooltip, 3000);
        }
      }
    };

    // Attach new event listeners
    currentRing.addEventListener("mouseenter", showTooltip);
    currentRing.addEventListener("mouseleave", hideTooltip);
    currentRing.addEventListener("touchstart", handleTouch, { passive: false });
    currentRing.addEventListener("click", handleClick);
    currentRing.addEventListener("keydown", handleKeydown);

    // Mark as fixed
    currentRing.setAttribute("data-tooltip-fixed", "true");
    fixedRings++;

    console.log(`   ✅ Ring ${index + 1} fixed and ready`);
  });

  // Step 3: Test the first ring
  if (rings.length > 0) {
    console.log("\n🧪 Testing first ring...");

    const testRing = rings[0];
    const testEvent = new MouseEvent("mouseenter", {
      bubbles: true,
      cancelable: true,
      view: window,
    });

    testRing.dispatchEvent(testEvent);

    setTimeout(() => {
      const tooltip = document.querySelector(".manual-fix-tooltip");
      if (tooltip) {
        console.log("✅ Test successful - tooltip is working!");
        tooltip.remove();
      } else {
        console.log("⚠️ Test failed - tooltip not created");
      }
    }, 100);
  }

  // Step 4: Summary
  console.log(`\n🎉 Tooltip Fix Complete!`);
  console.log(`   Fixed: ${fixedRings}/${totalRings} progress rings`);
  console.log(
    `   Status: ${fixedRings === totalRings ? "✅ All rings fixed" : "⚠️ Some rings may need manual attention"}`,
  );
  console.log(`\n💡 How to test:`);
  console.log(`   1. Hover over any progress ring`);
  console.log(`   2. On mobile: tap a progress ring`);
  console.log(`   3. Use keyboard: Tab to ring, then press Enter or Space`);

  // Step 5: Set up global function for easy re-running and auto-reattachment
  window.fixTooltips = () => {
    console.log("🔄 Re-running tooltip fix...");
    fixCategoryHeaderTooltips();
  };

  // Step 6: Set up automatic reattachment on view changes
  const setupViewChangeMonitoring = () => {
    // Monitor for view changes by watching data-view attribute changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-view"
        ) {
          console.log("🔍 View change detected, reapplying tooltip fix...");
          setTimeout(() => {
            fixCategoryHeaderTooltips();
          }, 500); // Delay to ensure view transition is complete
        }
      });
    });

    // Observe all scenarios-grid elements for data-view changes
    document.querySelectorAll(".scenarios-grid").forEach((grid) => {
      observer.observe(grid, {
        attributes: true,
        attributeFilter: ["data-view"],
      });
    });

    // Also set up periodic check for new progress rings
    setInterval(() => {
      const unfixedRings = document.querySelectorAll(
        '.category-progress-ring:not([data-tooltip-fixed="true"])',
      );
      if (unfixedRings.length > 0) {
        console.log(
          `🔧 Found ${unfixedRings.length} unfixed progress rings, applying fix...`,
        );
        fixCategoryHeaderTooltips();
      }
    }, 5000); // Check every 5 seconds

    console.log("👁️ Set up view change monitoring and periodic checks");
  };

  setupViewChangeMonitoring();

  console.log(`\n🛠️ Enhanced Features:`);
  console.log(`   • Auto-reattachment on view changes`);
  console.log(`   • Periodic checks for new rings`);
  console.log(`   • To manually re-run: fixTooltips()`);
  console.log(`   • Current view: ${currentView}`);

  return {
    totalRings,
    fixedRings,
    success: fixedRings === totalRings,
  };
})();
