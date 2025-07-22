// Debug script to inject into app.html for container debugging
console.log("🔍 Starting container debug...");

function debugLog(message, type = "info") {
  const colors = {
    info: "color: #0066cc",
    success: "color: #00aa00",
    error: "color: #cc0000",
    warning: "color: #ff8800",
  };
  console.log(`%c${message}`, colors[type] || colors.info);
}

// Wait for DOM to be ready
function runDebugChecks() {
  debugLog("=== CONTAINER DEBUG START ===");

  // Test 1: Check if main grid container exists
  const mainGridContainer = document.querySelector("#main-grid");
  if (mainGridContainer) {
    debugLog("✅ Main grid container found: #main-grid", "success");
  } else {
    debugLog("❌ Main grid container NOT found: #main-grid", "error");
  }

  // Test 2: Check for scenarios-grid
  const scenariosGrid = document.querySelector(
    '.scenarios-grid[data-view="scenario"]',
  );
  if (scenariosGrid) {
    debugLog(
      '✅ Scenarios grid found: .scenarios-grid[data-view="scenario"]',
      "success",
    );
    debugLog(`   - Display style: ${scenariosGrid.style.display}`, "info");
    debugLog(`   - Classes: ${scenariosGrid.className}`, "info");
    debugLog(
      `   - Data-view attribute: ${scenariosGrid.getAttribute("data-view")}`,
      "info",
    );
  } else {
    debugLog(
      '❌ Scenarios grid NOT found: .scenarios-grid[data-view="scenario"]',
      "error",
    );
  }

  // Test 3: Check for scenario-controls-toolbar
  const toolbar = document.querySelector(".scenario-controls-toolbar");
  if (toolbar) {
    debugLog(
      "✅ Scenario controls toolbar found: .scenario-controls-toolbar",
      "success",
    );
  } else {
    debugLog(
      "❌ Scenario controls toolbar NOT found: .scenario-controls-toolbar",
      "error",
    );
  }

  // Test 4: Check for filter button
  const filterBtn = document.querySelector(".filter-btn");
  if (filterBtn) {
    debugLog("✅ Filter button found: .filter-btn", "success");
    debugLog(`   - Button text: "${filterBtn.textContent.trim()}"`, "info");
    debugLog(
      `   - Parent container: ${filterBtn.parentElement.className}`,
      "info",
    );

    // Test click handler
    filterBtn.addEventListener("click", function (e) {
      debugLog(
        `🖱️ Filter button clicked! Event propagation working`,
        "success",
      );
    });
  } else {
    debugLog("❌ Filter button NOT found: .filter-btn", "error");
  }

  // Test 5: Check for sort button
  const sortBtn = document.querySelector(".sort-btn");
  if (sortBtn) {
    debugLog("✅ Sort button found: .sort-btn", "success");
    debugLog(`   - Button text: "${sortBtn.textContent.trim()}"`, "info");
    debugLog(
      `   - Parent container: ${sortBtn.parentElement.className}`,
      "info",
    );

    // Test click handler
    sortBtn.addEventListener("click", function (e) {
      debugLog(`🖱️ Sort button clicked! Event propagation working`, "success");
    });
  } else {
    debugLog("❌ Sort button NOT found: .sort-btn", "error");
  }

  // Test 6: Simulate MainGrid container selection logic
  debugLog("=== Simulating MainGrid Selection Logic ===");

  const container = document.querySelector("#main-grid");
  if (container) {
    const categoryContainer = container.querySelector(
      '.categories-grid[data-view="category"]',
    );
    const scenarioContainer = container.querySelector(
      '.scenarios-grid[data-view="scenario"]',
    );

    if (categoryContainer) {
      debugLog("✅ Category container found via MainGrid logic", "success");
    } else {
      debugLog("❌ Category container NOT found via MainGrid logic", "error");
    }

    if (scenarioContainer) {
      debugLog("✅ Scenario container found via MainGrid logic", "success");

      // Test finding buttons within scenario container
      const filterBtnInContainer =
        scenarioContainer.querySelector(".filter-btn");
      const sortBtnInContainer = scenarioContainer.querySelector(".sort-btn");

      if (filterBtnInContainer) {
        debugLog("✅ Filter button found within scenario container", "success");
      } else {
        debugLog(
          "❌ Filter button NOT found within scenario container",
          "error",
        );
      }

      if (sortBtnInContainer) {
        debugLog("✅ Sort button found within scenario container", "success");
      } else {
        debugLog("❌ Sort button NOT found within scenario container", "error");
      }
    } else {
      debugLog("❌ Scenario container NOT found via MainGrid logic", "error");
    }
  }

  debugLog("=== CONTAINER DEBUG END ===");
}

// Run debug when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", runDebugChecks);
} else {
  runDebugChecks();
}

// Also run after a short delay to catch dynamically generated content
setTimeout(runDebugChecks, 2000);
