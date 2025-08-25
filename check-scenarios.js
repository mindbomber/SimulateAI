// Quick scenario checker
import scenarios from "./src/js/data/scenarios/experience-machine-scenarios.js";

console.log("=== Experience Machine Scenarios ===");
console.log("Total scenarios:", Object.keys(scenarios).length);
console.log("\nScenario IDs:");
Object.keys(scenarios).forEach((id, index) => {
  console.log(`${index + 1}. ${id}: "${scenarios[id].title}"`);
});

// Check specifically for missing scenarios
const missingScenarios = [
  "virtual-reality-life",
  "algorithmic-bias-discovery",
  "autonomous-vehicle-weather",
  "research-funding-breakthrough",
  "ai-consciousness-threshold",
  "human-ai-hybrid-identity",
  "autonomous-weapon-accountability",
];

console.log("\n=== Checking Missing Scenarios ===");
missingScenarios.forEach((id) => {
  const exists = Object.prototype.hasOwnProperty.call(scenarios, id);
  console.log(`${id}: ${exists ? "✅ EXISTS" : "❌ MISSING"}`);
  if (exists) {
    console.log(`  Title: "${scenarios[id].title}"`);
  }
});
