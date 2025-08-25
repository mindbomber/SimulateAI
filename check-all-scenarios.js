// Comprehensive scenario checker
import aiBlackBoxScenarios from "./src/js/data/scenarios/ai-black-box-scenarios.js";
import automationOversightScenarios from "./src/js/data/scenarios/automation-oversight-scenarios.js";
import consentSurveillanceScenarios from "./src/js/data/scenarios/consent-surveillance-scenarios.js";
import experienceMachineScenarios from "./src/js/data/scenarios/experience-machine-scenarios.js";
import moralLuckScenarios from "./src/js/data/scenarios/moral-luck-scenarios.js";
import responsibilityBlameScenarios from "./src/js/data/scenarios/responsibility-blame-scenarios.js";
import shipOfTheseusScenarios from "./src/js/data/scenarios/ship-of-theseus-scenarios.js";
import simulationHypothesisScenarios from "./src/js/data/scenarios/simulation-hypothesis-scenarios.js";
import soritesParadoxScenarios from "./src/js/data/scenarios/sorites-paradox-scenarios.js";
import trolleyProblemScenarios from "./src/js/data/scenarios/trolley-problem-scenarios.js";

const allScenarios = {
  "ai-black-box": aiBlackBoxScenarios,
  "automation-oversight": automationOversightScenarios,
  "consent-surveillance": consentSurveillanceScenarios,
  "experience-machine": experienceMachineScenarios,
  "moral-luck": moralLuckScenarios,
  "responsibility-blame": responsibilityBlameScenarios,
  "ship-of-theseus": shipOfTheseusScenarios,
  "simulation-hypothesis": simulationHypothesisScenarios,
  "sorites-paradox": soritesParadoxScenarios,
  "trolley-problem": trolleyProblemScenarios,
};

// List of scenarios reported as missing from UI
const missingScenarios = [
  "virtual-reality-life",
  "algorithmic-bias-discovery",
  "autonomous-vehicle-weather",
  "research-funding-breakthrough",
  "ai-consciousness-threshold",
  "human-ai-hybrid-identity",
  "autonomous-weapon-accountability",
];

console.log("=== COMPREHENSIVE SCENARIO ANALYSIS ===\n");

// Count all scenarios
let totalScenarios = 0;
Object.keys(allScenarios).forEach((categoryName) => {
  const scenarios = allScenarios[categoryName];
  const count = Object.keys(scenarios).length;
  totalScenarios += count;
  console.log(`${categoryName}: ${count} scenarios`);
});

console.log(`\nTotal scenarios across all files: ${totalScenarios}\n`);

// Search for missing scenarios across all files
console.log("=== SEARCHING FOR MISSING SCENARIOS ===\n");

missingScenarios.forEach((missingId) => {
  console.log(`Searching for: ${missingId}`);
  let found = false;

  Object.keys(allScenarios).forEach((categoryName) => {
    const scenarios = allScenarios[categoryName];
    if (Object.prototype.hasOwnProperty.call(scenarios, missingId)) {
      console.log(
        `  ✅ FOUND in ${categoryName}: "${scenarios[missingId].title}"`,
      );
      found = true;
    }
  });

  if (!found) {
    console.log(`  ❌ NOT FOUND in any scenario file`);

    // Try fuzzy search for similar names
    Object.keys(allScenarios).forEach((categoryName) => {
      const scenarios = allScenarios[categoryName];
      Object.keys(scenarios).forEach((scenarioId) => {
        if (
          scenarioId.includes(missingId.split("-")[0]) ||
          missingId.includes(scenarioId.split("-")[0]) ||
          scenarios[scenarioId].title
            .toLowerCase()
            .includes(missingId.replace(/-/g, " "))
        ) {
          console.log(
            `    🔍 Similar: ${scenarioId} in ${categoryName}: "${scenarios[scenarioId].title}"`,
          );
        }
      });
    });
  }
  console.log("");
});

// List all scenario IDs for reference
console.log("=== ALL SCENARIO IDS BY CATEGORY ===\n");
Object.keys(allScenarios).forEach((categoryName) => {
  const scenarios = allScenarios[categoryName];
  console.log(`${categoryName.toUpperCase()}:`);
  Object.keys(scenarios).forEach((id, index) => {
    console.log(`  ${index + 1}. ${id}: "${scenarios[id].title}"`);
  });
  console.log("");
});
