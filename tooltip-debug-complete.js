// Debug CategoryHeader Tooltip Issue
// Run this in the browser console on the main app

(function debugCategoryHeaderTooltips() {
  console.log("🔍 Debugging CategoryHeader Tooltip Issue");
  console.log("==========================================");

  // Step 1: Check if progress rings exist
  const rings = document.querySelectorAll(".category-progress-ring");
  console.log(`📊 Found ${rings.length} progress rings`);

  if (rings.length === 0) {
    console.log("❌ No progress rings found. Possible causes:");
    console.log("   - CategoryHeader not rendered yet");
    console.log("   - Different view active (not category view)");
    console.log("   - CSS not loaded properly");
    console.log("   - JavaScript errors preventing rendering");

    // Check if we're in category view
    const categoryView = document.querySelector('[data-view="category"]');
    const scenarioView = document.querySelector('[data-view="scenario"]');
    console.log(
      "   Current view - Category:",
      !!categoryView,
      "Scenario:",
      !!scenarioView,
    );

    return;
  }

  // Step 2: Check each progress ring in detail
  rings.forEach((ring, index) => {
    console.log(`\n🎯 Progress Ring ${index + 1}:`);
    console.log("   Element:", ring);
    console.log("   Has data-tooltip:", ring.hasAttribute("data-tooltip"));
    console.log("   Tooltip content:", ring.getAttribute("data-tooltip"));
    console.log("   Category ID:", ring.getAttribute("data-category-id"));
    console.log("   Has aria-label:", ring.hasAttribute("aria-label"));
    console.log("   ARIA label:", ring.getAttribute("aria-label"));
    console.log("   Classes:", Array.from(ring.classList));
    console.log("   Visible:", ring.offsetWidth > 0 && ring.offsetHeight > 0);

    // Check computed styles
    const styles = getComputedStyle(ring);
    console.log("   Cursor:", styles.cursor);
    console.log("   Position:", styles.position);
    console.log("   Display:", styles.display);

    // Check if it has event listeners by testing
    const originalFunction = ring.onmouseenter;
    console.log("   Has onmouseenter:", !!originalFunction);
  });

  // Step 3: Test manual event attachment
  console.log("\n🧪 Testing manual event attachment:");

  const firstRing = rings[0];
  if (firstRing) {
    console.log("Testing first ring manual event...");

    let testEventFired = false;

    const testHandler = (e) => {
      testEventFired = true;
      console.log("✅ Manual mouseenter event fired!", {
        target: e.target,
        currentTarget: e.currentTarget,
        timestamp: new Date().toISOString(),
      });

      // Create test tooltip manually
      const existingTooltip = document.querySelector(".debug-test-tooltip");
      if (existingTooltip) existingTooltip.remove();

      const tooltip = document.createElement("div");
      tooltip.className = "progress-ring-tooltip visible debug-test-tooltip";
      tooltip.textContent = "DEBUG: Manual tooltip created successfully!";
      tooltip.style.cssText = `
            position: fixed !important;
            top: 100px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            z-index: 9999 !important;
            background: #dc2626 !important;
            color: white !important;
            padding: 12px 16px !important;
            border-radius: 6px !important;
            border: 3px solid yellow !important;
            font-weight: bold !important;
        `;

      document.body.appendChild(tooltip);

      // Auto-remove after 3 seconds
      setTimeout(() => {
        if (tooltip.parentNode) {
          tooltip.remove();
          console.log("Debug tooltip auto-removed");
        }
      }, 3000);

      // Remove event listener after first use
      firstRing.removeEventListener("mouseenter", testHandler);
    };

    firstRing.addEventListener("mouseenter", testHandler);
    console.log("✅ Test event listener added");
    console.log("💡 Hover over the first progress ring to test...");

    // Test programmatic trigger after 2 seconds
    setTimeout(() => {
      if (!testEventFired) {
        console.log(
          "⚠️ Manual hover not detected, testing programmatic trigger...",
        );

        const syntheticEvent = new MouseEvent("mouseenter", {
          bubbles: true,
          cancelable: true,
          view: window,
        });

        firstRing.dispatchEvent(syntheticEvent);

        setTimeout(() => {
          if (!testEventFired) {
            console.log("❌ Programmatic event also failed - possible issues:");
            console.log("   - Event listeners not properly attached");
            console.log("   - Event propagation blocked");
            console.log("   - JavaScript errors in event handlers");
          } else {
            console.log("✅ Programmatic event worked");
          }
        }, 500);
      }
    }, 2000);
  }

  // Step 4: Check if CategoryHeader is available and working
  console.log("\n🏗️ Checking CategoryHeader:");

  // Try to find CategoryHeader instance in common locations
  const possibleInstances = [
    window.categoryHeaderInstance,
    window.mainGrid?.categoryHeader,
    window.appState?.categoryHeader,
    window.components?.categoryHeader,
  ];

  let categoryHeaderFound = false;

  possibleInstances.forEach((instance, index) => {
    if (instance) {
      console.log(`✅ Found CategoryHeader instance at location ${index}`);
      console.log(
        "   Bound events count:",
        instance.boundEvents?.size || "Unknown",
      );
      console.log("   Has config:", !!instance.configPromise);
      categoryHeaderFound = true;

      // Test the showTooltip method if available
      if (instance.showTooltip && firstRing) {
        console.log("🧪 Testing CategoryHeader.showTooltip method...");

        const mockEvent = {
          currentTarget: firstRing,
          preventDefault: () => {},
          stopPropagation: () => {},
        };

        try {
          instance.showTooltip(mockEvent);
          console.log("✅ showTooltip method called successfully");

          // Check for tooltips after a delay
          setTimeout(() => {
            const tooltips = document.querySelectorAll(
              ".progress-ring-tooltip",
            );
            console.log(
              `Found ${tooltips.length} tooltips after showTooltip call`,
            );

            if (tooltips.length > 0) {
              console.log("✅ Tooltip created by CategoryHeader.showTooltip");
              tooltips.forEach((tooltip) => {
                const styles = getComputedStyle(tooltip);
                console.log("   Tooltip styles:", {
                  display: styles.display,
                  visibility: styles.visibility,
                  opacity: styles.opacity,
                  zIndex: styles.zIndex,
                  position: styles.position,
                });
              });
            }
          }, 100);
        } catch (error) {
          console.log("❌ Error calling showTooltip:", error.message);
        }
      }

      return;
    }
  });

  if (!categoryHeaderFound) {
    console.log("❌ No CategoryHeader instance found");
    console.log("   This might indicate the component hasn't been initialized");
  }

  // Step 5: Check CSS loading
  console.log("\n📋 Checking CSS:");

  const stylesheets = Array.from(document.styleSheets);
  const categoryHeaderCSS = stylesheets.find(
    (sheet) => sheet.href && sheet.href.includes("category-header.css"),
  );

  console.log("CategoryHeader CSS loaded:", !!categoryHeaderCSS);
  if (categoryHeaderCSS) {
    console.log("   CSS href:", categoryHeaderCSS.href);
  }

  // Check if tooltip styles are accessible
  const testElement = document.createElement("div");
  testElement.className = "progress-ring-tooltip";
  testElement.style.position = "fixed";
  testElement.style.top = "-1000px";
  document.body.appendChild(testElement);

  const computedStyles = getComputedStyle(testElement);
  console.log("Tooltip CSS computed styles:", {
    background: computedStyles.backgroundColor,
    color: computedStyles.color,
    zIndex: computedStyles.zIndex,
    position: computedStyles.position,
    display: computedStyles.display,
    opacity: computedStyles.opacity,
  });

  testElement.remove();

  console.log(
    "\n💡 Debug complete. If manual test worked but component tooltips don't:",
  );
  console.log("   1. Check if CategoryHeader.attachEventListeners was called");
  console.log("   2. Verify boundEvents.size > 0");
  console.log("   3. Check for JavaScript errors in console");
  console.log("   4. Verify the correct view is active (category vs scenario)");
})();
