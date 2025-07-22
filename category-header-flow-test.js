// CategoryHeader Flow Test - Run this in browser console after page loads
(async function testCategoryHeaderFlow() {
  console.log("🔍 CategoryHeader Flow Test");
  console.log("============================");

  try {
    // Step 1: Check if CategoryHeader exists in MainGrid
    if (!window.mainGrid || !window.mainGrid.categoryHeader) {
      console.error("❌ MainGrid or CategoryHeader not found in window");
      return;
    }

    const categoryHeader = window.mainGrid.categoryHeader;
    console.log("✅ CategoryHeader instance found");

    // Step 2: Check configuration loading
    const config = await categoryHeader.getConfig();
    console.log("✅ Configuration loaded:", config ? "Yes" : "No");

    if (!config) {
      console.error("❌ Configuration failed to load");
      return;
    }

    // Step 3: Check selectors
    const selectors = config.selectors;
    console.log("✅ Selectors:", selectors);

    // Step 4: Check if progress rings exist in DOM
    const progressRingsWithTooltip = document.querySelectorAll(
      selectors.progressRing,
    );
    const allProgressRings = document.querySelectorAll(
      selectors.allProgressRings,
    );

    console.log(
      `📊 Progress rings with tooltip: ${progressRingsWithTooltip.length}`,
    );
    console.log(`📊 All progress rings: ${allProgressRings.length}`);

    // Step 5: Check each progress ring
    allProgressRings.forEach((ring, index) => {
      console.log(`\n🎯 Ring ${index + 1}:`);
      console.log("   Has data-tooltip:", ring.hasAttribute("data-tooltip"));
      console.log("   Tooltip content:", ring.getAttribute("data-tooltip"));
      console.log("   Category ID:", ring.getAttribute("data-category-id"));

      // Check for event listeners
      const events = ["mouseenter", "mouseleave", "click", "touchstart"];
      events.forEach((eventType) => {
        // Create a test event
        const testEvent = new MouseEvent(eventType, { bubbles: true });

        // Try to dispatch and see if anything happens
        console.log(`   Testing ${eventType}...`);
        ring.dispatchEvent(testEvent);
      });
    });

    // Step 6: Manually test attachEventListeners
    console.log("\n🔧 Testing manual attachEventListeners...");

    const container = document.body;
    await categoryHeader.attachEventListeners(container);

    console.log("✅ Manual attachEventListeners completed");

    // Step 7: Check bound events
    console.log("\n📋 Bound events check:");
    console.log("   Bound events map size:", categoryHeader.boundEvents.size);

    categoryHeader.boundEvents.forEach((handlers, ring) => {
      console.log("   Ring has bound handlers:", Object.keys(handlers));
    });

    // Step 8: Test tooltip creation manually
    if (allProgressRings.length > 0) {
      console.log("\n🧪 Testing manual tooltip creation...");

      const firstRing = allProgressRings[0];
      const mockEvent = {
        currentTarget: firstRing,
        preventDefault: () => {},
        stopPropagation: () => {},
      };

      try {
        await categoryHeader.showTooltip(mockEvent);
        console.log("✅ Manual tooltip creation successful");

        // Check if tooltip was created
        const tooltips = document.querySelectorAll(".progress-ring-tooltip");
        console.log(`   Tooltips found: ${tooltips.length}`);

        // Clean up
        setTimeout(() => {
          categoryHeader.hideTooltip();
          console.log("🧹 Test tooltip cleaned up");
        }, 2000);
      } catch (error) {
        console.error("❌ Manual tooltip creation failed:", error);
      }
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
})();
