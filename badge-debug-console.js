// Badge System Debug Console Test
// Copy and paste this entire script into the browser console while on the main SimulateAI app

console.log("🚀 Badge System Debug Started");

// Function to log with timestamp
function debugLog(message, type = "info") {
  const timestamp = new Date().toLocaleTimeString();
  const typeIcon = {
    info: "ℹ️",
    success: "✅",
    error: "❌",
    warning: "⚠️",
  };
  console.log(`[${timestamp}] ${typeIcon[type]} ${message}`);
}

// Test 1: Check if main components exist
debugLog("Testing component availability...", "info");

const app = window.app;
const badgeManager = window.simulateaiBadgeManager || window.app?.badgeManager;
const mainGrid = window.app?.categoryGrid;

if (app) {
  debugLog("✅ window.app found", "success");
} else {
  debugLog("❌ window.app not found", "error");
}

if (badgeManager) {
  debugLog("✅ Badge Manager found", "success");
} else {
  debugLog("❌ Badge Manager not found", "error");
}

if (mainGrid) {
  debugLog("✅ Main Grid found", "success");
} else {
  debugLog("❌ Main Grid not found", "error");
}

// Test 2: Check event listeners
if (mainGrid) {
  debugLog("Checking main grid event listeners...", "info");

  if (mainGrid.modalClosedHandler) {
    debugLog("✅ modalClosedHandler exists", "success");
  } else {
    debugLog("❌ modalClosedHandler missing", "error");
  }

  if (mainGrid.scenarioReflectionCompletedHandler) {
    debugLog("✅ scenarioReflectionCompletedHandler exists", "success");
  } else {
    debugLog("❌ scenarioReflectionCompletedHandler missing", "error");
  }

  // Check if deferredBadges exists
  if (mainGrid.deferredBadges) {
    debugLog(
      `✅ deferredBadges Map exists with ${mainGrid.deferredBadges.size} entries`,
      "success",
    );
  } else {
    debugLog("❌ deferredBadges Map missing", "error");
  }
}

// Test 3: Test badge generation manually
if (badgeManager) {
  debugLog("Testing badge generation...", "info");

  window.testBadgeGeneration = async function () {
    try {
      const categoryId = "ai-black-box";
      const scenarioId = "insurance-claim-blackbox";

      debugLog(`Testing badges for ${categoryId}:${scenarioId}`, "info");

      // Refresh category progress first
      await badgeManager.refreshCategoryProgress();
      debugLog("Category progress refreshed", "success");

      // Check for new badges
      const newBadges = await badgeManager.updateScenarioCompletion(
        categoryId,
        scenarioId,
      );

      if (newBadges && newBadges.length > 0) {
        debugLog(`🎉 Found ${newBadges.length} badges!`, "success");
        newBadges.forEach((badge, index) => {
          debugLog(
            `Badge ${index + 1}: ${badge.title} (Tier ${badge.tier})`,
            "success",
          );
        });
      } else {
        debugLog("No badges earned for this scenario", "warning");
      }

      return newBadges;
    } catch (error) {
      debugLog(`Error: ${error.message}`, "error");
      console.error("Badge generation test error:", error);
    }
  };

  debugLog("Run window.testBadgeGeneration() to test badge generation", "info");
}

// Test 4: Test manual badge deferral
if (mainGrid) {
  window.testBadgeDeferral = async function () {
    try {
      const categoryId = "ai-black-box";
      const scenarioId = "insurance-claim-blackbox";

      debugLog(
        `Testing badge deferral for ${categoryId}:${scenarioId}`,
        "info",
      );

      await mainGrid.deferBadgesForReflection(categoryId, scenarioId);

      // Check if badges were deferred
      const deferredBadges = mainGrid.deferredBadges?.get(scenarioId);
      if (deferredBadges) {
        debugLog(
          `✅ Badges deferred: ${deferredBadges.badges.length}`,
          "success",
        );
        debugLog(`Deferred data: ${JSON.stringify(deferredBadges)}`, "info");
      } else {
        debugLog("❌ No badges were deferred", "error");
      }

      return deferredBadges;
    } catch (error) {
      debugLog(`Error: ${error.message}`, "error");
      console.error("Badge deferral test error:", error);
    }
  };

  debugLog("Run window.testBadgeDeferral() to test badge deferral", "info");
}

// Test 5: Add global event listeners to monitor events
debugLog("Adding global event listeners...", "info");

document.addEventListener("scenario-modal-closed", function (event) {
  debugLog(
    `🎯 GLOBAL: scenario-modal-closed event: ${JSON.stringify(event.detail)}`,
    "success",
  );
});

document.addEventListener("scenarioReflectionCompleted", function (event) {
  debugLog(
    `🏁 GLOBAL: scenarioReflectionCompleted event: ${JSON.stringify(event.detail)}`,
    "success",
  );
});

debugLog("✅ Badge System Debug Setup Complete", "success");
debugLog("Available test functions:", "info");
debugLog("- window.testBadgeGeneration()", "info");
debugLog("- window.testBadgeDeferral()", "info");
debugLog("- window.debugBadgeLogic()", "info");
debugLog("- window.testWithDifferentScenario()", "info");
debugLog("- window.checkCurrentBadgeState()", "info");
debugLog("", "info");
debugLog("🎯 Now complete a scenario and watch for event logs!", "info");

// Test 7: Test with a different scenario
window.testWithDifferentScenario = async function () {
  debugLog("🧪 Testing with different scenarios...", "info");

  // Get available scenarios for ai-black-box
  const categoryProgressKey = "simulateai_category_progress";
  const categoryProgressData = localStorage.getItem(categoryProgressKey);
  const allProgress = JSON.parse(categoryProgressData);
  const categoryProgress = allProgress["ai-black-box"] || {};

  debugLog(
    `All completed scenarios in ai-black-box: ${JSON.stringify(Object.keys(categoryProgress))}`,
    "info",
  );

  // Try a different scenario that might not be completed
  const testScenarios = [
    "facial-recognition-bias",
    "ai-loan-decisions",
    "predictive-policing",
    "automated-content-moderation",
    "ai-hiring-algorithm",
  ];

  for (const scenarioId of testScenarios) {
    if (!categoryProgress[scenarioId]) {
      debugLog(`✅ Found uncompeted scenario: ${scenarioId}`, "success");
      debugLog(`Testing badge generation for: ${scenarioId}`, "info");

      try {
        const newBadges = await badgeManager.updateScenarioCompletion(
          "ai-black-box",
          scenarioId,
        );
        if (newBadges && newBadges.length > 0) {
          debugLog(
            `🎉 SUCCESS! Found ${newBadges.length} badges for ${scenarioId}!`,
            "success",
          );
          newBadges.forEach((badge, index) => {
            debugLog(
              `Badge ${index + 1}: ${badge.title} (Tier ${badge.tier})`,
              "success",
            );
          });
          return newBadges;
        } else {
          debugLog(
            `No new badges for ${scenarioId} (might need more total completions)`,
            "warning",
          );
        }
      } catch (error) {
        debugLog(`Error testing ${scenarioId}: ${error.message}`, "error");
      }
      break;
    }
  }

  debugLog(
    "Analysis: insurance-claim-blackbox is already completed!",
    "warning",
  );
  debugLog(
    "Badge system working correctly - you already earned available badges!",
    "success",
  );
};

// Test 8: Check current badge state after any changes
window.checkCurrentBadgeState = async function () {
  debugLog("🔍 Checking current badge state after changes...", "info");

  try {
    const categoryId = "ai-black-box";

    // Get current completion count
    const completionCount =
      await badgeManager.getCategoryCompletionCount(categoryId);
    debugLog(`Current completion count: ${completionCount}`, "info");

    // Get current progress
    const categoryProgressData = localStorage.getItem(
      "simulateai_category_progress",
    );
    const allProgress = JSON.parse(categoryProgressData);
    const categoryProgress = allProgress[categoryId] || {};
    debugLog(
      `All completed scenarios: ${JSON.stringify(Object.keys(categoryProgress))}`,
      "info",
    );

    // Get badge state
    const badgeStateData = localStorage.getItem("simulateai_badge_progress");
    const badgeState = JSON.parse(badgeStateData);
    const categoryBadges = badgeState[categoryId];
    debugLog(`Current badge state: ${JSON.stringify(categoryBadges)}`, "info");

    // Show what you need for next badge
    const nextTier = categoryBadges?.badges?.tier3;
    if (nextTier && !nextTier.unlocked) {
      const needed = nextTier.requirement - completionCount;
      debugLog(
        `🎯 Next badge (Tier 3): Need ${needed} more scenarios (${nextTier.requirement} total required)`,
        "info",
      );
    }

    // Test if completing more scenarios would work
    debugLog(
      "Testing if completing one more scenario would earn a badge...",
      "info",
    );
    const testBadges = await badgeManager.updateScenarioCompletion(
      categoryId,
      "test-scenario-" + Date.now(),
    );
    if (testBadges && testBadges.length > 0) {
      debugLog(
        `🎉 Would earn ${testBadges.length} badges with one more completion!`,
        "success",
      );
    } else {
      debugLog("Still need more completions for next badge", "warning");
    }
  } catch (error) {
    debugLog(`Error checking badge state: ${error.message}`, "error");
  }
};

// Test 6: Debug badge calculation logic
window.debugBadgeLogic = async function () {
  debugLog("🔍 Debugging badge calculation logic...", "info");

  try {
    const categoryId = "ai-black-box";
    const scenarioId = "insurance-claim-blackbox";

    // First, let's see what methods the badge manager actually has
    debugLog("Available badge manager methods:", "info");
    const methods = Object.getOwnPropertyNames(
      Object.getPrototypeOf(badgeManager),
    ).filter(
      (name) =>
        typeof badgeManager[name] === "function" && name !== "constructor",
    );
    debugLog(`Methods: ${JSON.stringify(methods)}`, "info");

    // Also check direct properties
    const props = Object.keys(badgeManager);
    debugLog(`Properties: ${JSON.stringify(props)}`, "info");

    // Try to get localStorage data directly
    const categoryProgressKey = "simulateai_category_progress";
    const categoryProgressData = localStorage.getItem(categoryProgressKey);
    if (categoryProgressData) {
      const allProgress = JSON.parse(categoryProgressData);
      const progress = allProgress[categoryId];
      debugLog(
        `Current progress for ${categoryId}: ${JSON.stringify(progress)}`,
        "info",
      );

      // Check if scenario is already completed
      const completedScenarios = progress?.completedScenarios || [];
      if (completedScenarios.includes(scenarioId)) {
        debugLog(`⚠️ Scenario ${scenarioId} already completed!`, "warning");
        debugLog(
          `Completed scenarios: ${JSON.stringify(completedScenarios)}`,
          "info",
        );
      } else {
        debugLog(`✅ Scenario ${scenarioId} not yet completed`, "success");
      }

      // Check tier calculation
      const scenarioCount = completedScenarios.length;
      debugLog(`Current scenario count: ${scenarioCount}`, "info");
    } else {
      debugLog("No category progress data found in localStorage", "warning");
    }

    // Check badge state from localStorage
    const badgeStateKey = "simulateai_badge_progress";
    const badgeStateData = localStorage.getItem(badgeStateKey);
    if (badgeStateData) {
      const badgeState = JSON.parse(badgeStateData);
      const categoryBadges = badgeState[categoryId];
      debugLog(
        `Current badge state for ${categoryId}: ${JSON.stringify(categoryBadges)}`,
        "info",
      );
    } else {
      debugLog("No badge state data found in localStorage", "warning");
    }

    // Try to call some badge manager methods if they exist
    if (badgeManager.refreshCategoryProgress) {
      debugLog("Calling refreshCategoryProgress...", "info");
      await badgeManager.refreshCategoryProgress();
      debugLog("Category progress refreshed", "success");
    }
  } catch (error) {
    debugLog(`Error debugging badge logic: ${error.message}`, "error");
    console.error("Badge logic debug error:", error);
  }
};
