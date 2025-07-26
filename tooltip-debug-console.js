// Progress Ring Tooltip Debug Script
// Paste this into the browser console to test tooltip functionality

console.log("🔍 Starting Progress Ring Tooltip Debug...");

// 1. Find all progress rings
const progressRings = document.querySelectorAll(".category-progress-ring");
console.log(`Found ${progressRings.length} progress rings`);

progressRings.forEach((ring, index) => {
  console.log(`Ring ${index + 1}:`, {
    hasTooltip: ring.hasAttribute("data-tooltip"),
    tooltipContent: ring.getAttribute("data-tooltip"),
    categoryId: ring.getAttribute("data-category-id"),
    hasEventListeners: ring._events ? "Yes" : "Unknown",
  });
});

// 2. Test manual tooltip creation
function createTestTooltip(text = "Test tooltip - Z-index 1300") {
  // Remove existing test tooltips
  document.querySelectorAll(".debug-test-tooltip").forEach((el) => el.remove());

  const tooltip = document.createElement("div");
  tooltip.className = "progress-ring-tooltip visible debug-test-tooltip";
  tooltip.textContent = text;
  tooltip.style.cssText = `
    position: fixed !important;
    top: 100px !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    z-index: 1300 !important;
    background: #1f2937 !important;
    color: white !important;
    padding: 12px 16px !important;
    border-radius: 6px !important;
    font-size: 14px !important;
    border: 2px solid yellow !important;
    opacity: 1 !important;
    display: block !important;
    visibility: visible !important;
  `;

  document.body.appendChild(tooltip);
  console.log("✅ Test tooltip created with high z-index");

  // Auto-remove after 3 seconds
  setTimeout(() => {
    tooltip.remove();
    console.log("Test tooltip auto-removed");
  }, 3000);

  return tooltip;
}

// 3. Test hover simulation
function simulateHover(ringIndex = 0) {
  if (progressRings.length === 0) {
    console.log("❌ No progress rings found to test");
    return;
  }

  const ring = progressRings[ringIndex];
  console.log(`🎯 Simulating hover on ring ${ringIndex}`);

  // Dispatch mouseenter event
  const enterEvent = new MouseEvent("mouseenter", {
    bubbles: true,
    cancelable: true,
    view: window,
  });

  ring.dispatchEvent(enterEvent);
  console.log("✅ Mouseenter event dispatched");

  // Check for tooltip after a short delay
  setTimeout(() => {
    const tooltips = document.querySelectorAll(".progress-ring-tooltip");
    console.log(`Found ${tooltips.length} tooltips after hover simulation`);

    tooltips.forEach((tooltip, i) => {
      const style = getComputedStyle(tooltip);
      console.log(`Tooltip ${i + 1}:`, {
        visible: tooltip.classList.contains("visible"),
        opacity: style.opacity,
        zIndex: style.zIndex,
        position: style.position,
        top: style.top,
        left: style.left,
        content: tooltip.textContent,
      });
    });

    // Simulate mouseleave after 2 seconds
    setTimeout(() => {
      const leaveEvent = new MouseEvent("mouseleave", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      ring.dispatchEvent(leaveEvent);
      console.log("✅ Mouseleave event dispatched");
    }, 2000);
  }, 100);
}

// 4. Check for CSS conflicts
function checkCSSConflicts() {
  console.log("🔍 Checking for CSS conflicts...");

  // Create test element
  const testEl = document.createElement("div");
  testEl.className = "progress-ring-tooltip";
  testEl.style.position = "fixed";
  testEl.style.top = "-1000px"; // Hide it
  document.body.appendChild(testEl);

  const computed = getComputedStyle(testEl);
  console.log("CSS computed values:", {
    zIndex: computed.zIndex,
    position: computed.position,
    display: computed.display,
    visibility: computed.visibility,
    opacity: computed.opacity,
  });

  testEl.remove();
}

// 5. Import and test CategoryHeader directly
async function testCategoryHeader() {
  try {
    console.log("📦 Testing CategoryHeader import...");

    const { default: CategoryHeader } = await import(
      "./src/js/components/category-header.js"
    );
    console.log("✅ CategoryHeader imported");

    const instance = new CategoryHeader();
    console.log("✅ CategoryHeader instance created");

    const config = await instance.getConfig();
    console.log("✅ Config loaded:", {
      tooltipZIndex: config.tooltip?.zIndex,
      hasSelectors: !!config.selectors,
    });

    return instance;
  } catch (error) {
    console.log("❌ CategoryHeader test failed:", error);
  }
}

// Run tests
console.log("🚀 Running debug tests...");

// Test 1: Check CSS
checkCSSConflicts();

// Test 2: Create test tooltip
createTestTooltip("Debug tooltip - Should be visible with yellow border!");

// Test 3: Try hover simulation (if rings exist)
if (progressRings.length > 0) {
  setTimeout(() => simulateHover(0), 1000);
}

// Test 4: Import test
testCategoryHeader();

console.log("✅ Debug script complete. Check results above.");
console.log('💡 To create a test tooltip: createTestTooltip("Your text here")');
console.log("💡 To simulate hover: simulateHover(0)");
