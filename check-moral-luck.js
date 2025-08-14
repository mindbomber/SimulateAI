// Check missing scenarios in moral-luck
import scenarios from "./src/js/data/scenarios/moral-luck-scenarios.js";

console.log("=== MORAL-LUCK SCENARIOS ===");
console.log("All scenario IDs in moral-luck-scenarios.js:");
Object.keys(scenarios).forEach((id, i) => {
  console.log(`${i + 1}. ${id}: ${scenarios[id].title}`);
});

console.log("\n=== CHECKING MISSING ===");
const missing = [
  "algorithmic-bias-discovery",
  "autonomous-vehicle-weather",
  "research-funding-breakthrough",
];
missing.forEach((id) => {
  if (scenarios[id]) {
    console.log(`✅ ${id}: ${scenarios[id].title}`);
  } else {
    console.log(`❌ ${id}: NOT FOUND`);
  }
});
