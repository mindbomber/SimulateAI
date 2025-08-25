/**
 * MISSING SCENARIOS DIAGNOSTIC TOOL
 * Investigates why certain scenarios are not showing up in the UI
 */

// List of scenarios that should be visible but aren't showing
const MISSING_SCENARIOS = {
  "experience-machine": ["virtual-reality-life"],
  "moral-luck": [
    "algorithmic-bias-discovery",
    "autonomous-vehicle-weather",
    "research-funding-breakthrough",
  ],
  "sorites-paradox": [
    "ai-consciousness-threshold",
    "human-ai-hybrid-identity",
    "autonomous-weapon-accountability",
  ],
};

async function diagnoseMissingScenarios() {
  console.log("🔍 MISSING SCENARIOS DIAGNOSTIC");
  console.log("=".repeat(50));

  const results = {
    dataFileChecks: {},
    metadataChecks: {},
    filteringIssues: {},
    loadingIssues: {},
  };

  // Check 1: Verify scenarios exist in data files
  console.log("\n📂 DATA FILE VERIFICATION");
  for (const [categoryId, scenarioIds] of Object.entries(MISSING_SCENARIOS)) {
    console.log(`\nCategory: ${categoryId}`);

    try {
      // Try to import the scenario file directly
      const module = await import(
        `./src/js/data/scenarios/${categoryId}-scenarios.js`
      );
      const scenarios = module.default;

      results.dataFileChecks[categoryId] = {};

      for (const scenarioId of scenarioIds) {
        const exists = scenarios && scenarios[scenarioId];
        results.dataFileChecks[categoryId][scenarioId] = exists;

        if (exists) {
          console.log(`  ✅ ${scenarioId} - EXISTS in data file`);
          console.log(`     Title: "${scenarios[scenarioId].title}"`);
        } else {
          console.log(`  ❌ ${scenarioId} - MISSING from data file`);
        }
      }
    } catch (error) {
      console.log(
        `  ❌ Failed to load ${categoryId} data file:`,
        error.message,
      );
      results.dataFileChecks[categoryId] = { error: error.message };
    }
  }

  // Check 2: Verify scenarios in simulation-info.js
  console.log("\n📋 SIMULATION-INFO.JS VERIFICATION");
  try {
    const infoModule = await import("./src/js/data/simulation-info.js");
    const simulationInfo = infoModule.default;

    for (const [categoryId, scenarioIds] of Object.entries(MISSING_SCENARIOS)) {
      results.metadataChecks[categoryId] = {};

      for (const scenarioId of scenarioIds) {
        const hasMetadata = simulationInfo && simulationInfo[scenarioId];
        results.metadataChecks[categoryId][scenarioId] = hasMetadata;

        if (hasMetadata) {
          console.log(
            `  ✅ ${scenarioId} - Has metadata in simulation-info.js`,
          );
          console.log(
            `     Category: ${simulationInfo[scenarioId].category || "undefined"}`,
          );
        } else {
          console.log(
            `  ❌ ${scenarioId} - Missing metadata in simulation-info.js`,
          );
        }
      }
    }
  } catch (error) {
    console.log("  ❌ Failed to load simulation-info.js:", error.message);
    results.metadataChecks.error = error.message;
  }

  // Check 3: Test scenario loading through ScenarioDataManager
  console.log("\n🔄 SCENARIO DATA MANAGER TEST");
  try {
    // Check if ScenarioDataManager is available
    if (window.scenarioDataManager) {
      for (const [categoryId, scenarioIds] of Object.entries(
        MISSING_SCENARIOS,
      )) {
        try {
          const categoryScenarios =
            await window.scenarioDataManager.loadCategoryScenarios(categoryId);
          results.loadingIssues[categoryId] = {};

          for (const scenarioId of scenarioIds) {
            const loadedScenario = categoryScenarios[scenarioId];
            results.loadingIssues[categoryId][scenarioId] = !!loadedScenario;

            if (loadedScenario) {
              console.log(
                `  ✅ ${scenarioId} - Loads correctly through ScenarioDataManager`,
              );
            } else {
              console.log(
                `  ❌ ${scenarioId} - NOT loaded by ScenarioDataManager`,
              );
            }
          }
        } catch (error) {
          console.log(
            `  ❌ Error loading ${categoryId} through ScenarioDataManager:`,
            error.message,
          );
          results.loadingIssues[categoryId] = { error: error.message };
        }
      }
    } else {
      console.log("  ⚠️  ScenarioDataManager not available on window object");
      results.loadingIssues.error = "ScenarioDataManager not available";
    }
  } catch (error) {
    console.log("  ❌ Error testing ScenarioDataManager:", error.message);
    results.loadingIssues.error = error.message;
  }

  // Check 4: Test filtering and UI display
  console.log("\n🎛️ UI FILTERING TEST");
  try {
    // Check if scenarios are in the DOM
    for (const [categoryId, scenarioIds] of Object.entries(MISSING_SCENARIOS)) {
      results.filteringIssues[categoryId] = {};

      for (const scenarioId of scenarioIds) {
        // Look for scenario card in DOM
        const scenarioCard = document.querySelector(
          `[data-scenario-id="${scenarioId}"]`,
        );
        const inDOM = !!scenarioCard;
        results.filteringIssues[categoryId][scenarioId] = {
          inDOM,
          visible: inDOM ? scenarioCard.style.display !== "none" : false,
          hidden: inDOM
            ? scenarioCard.hasAttribute("data-filtered-out")
            : false,
        };

        if (inDOM) {
          const isVisible = scenarioCard.style.display !== "none";
          console.log(
            `  ${isVisible ? "✅" : "⚠️"} ${scenarioId} - In DOM ${isVisible ? "(visible)" : "(hidden)"}`,
          );
        } else {
          console.log(`  ❌ ${scenarioId} - NOT in DOM`);
        }
      }
    }
  } catch (error) {
    console.log("  ❌ Error checking DOM:", error.message);
    results.filteringIssues.error = error.message;
  }

  // Summary Report
  console.log("\n📊 DIAGNOSTIC SUMMARY");
  console.log("=".repeat(50));

  let totalIssues = 0;
  for (const [categoryId, scenarioIds] of Object.entries(MISSING_SCENARIOS)) {
    console.log(`\n🔍 ${categoryId.toUpperCase()}`);

    for (const scenarioId of scenarioIds) {
      let hasIssues = false;
      const issues = [];

      // Check data file
      if (!results.dataFileChecks[categoryId]?.[scenarioId]) {
        issues.push("Missing from data file");
        hasIssues = true;
      }

      // Check metadata
      if (!results.metadataChecks[categoryId]?.[scenarioId]) {
        issues.push("Missing metadata");
        hasIssues = true;
      }

      // Check loading
      if (!results.loadingIssues[categoryId]?.[scenarioId]) {
        issues.push("Loading failure");
        hasIssues = true;
      }

      // Check DOM
      if (!results.filteringIssues[categoryId]?.[scenarioId]?.inDOM) {
        issues.push("Not in DOM");
        hasIssues = true;
      } else if (!results.filteringIssues[categoryId]?.[scenarioId]?.visible) {
        issues.push("Hidden in UI");
        hasIssues = true;
      }

      if (hasIssues) {
        console.log(`  ❌ ${scenarioId}: ${issues.join(", ")}`);
        totalIssues++;
      } else {
        console.log(`  ✅ ${scenarioId}: All systems operational`);
      }
    }
  }

  console.log(`\n🎯 FOUND ${totalIssues} ISSUES TO INVESTIGATE`);

  if (totalIssues === 0) {
    console.log(
      "✅ All scenarios should be visible - check UI filters and view settings",
    );
  } else {
    console.log("⚠️  Issues detected - see individual scenario reports above");
  }

  // Return detailed results for programmatic analysis
  return results;
}

// Auto-run if script is loaded directly
if (typeof window !== "undefined") {
  // Make function globally available
  window.diagnoseMissingScenarios = diagnoseMissingScenarios;

  // Auto-run after a short delay to ensure other scripts are loaded
  setTimeout(() => {
    console.log("🚀 Starting missing scenarios diagnostic...");
    diagnoseMissingScenarios()
      .then((results) => {
        console.log("\n📋 Full diagnostic results available in:", results);
        window.diagnosticResults = results;
      })
      .catch((error) => {
        console.error("❌ Diagnostic failed:", error);
      });
  }, 2000);
}

export default diagnoseMissingScenarios;
