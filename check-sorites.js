// Check missing scenarios in sorites-paradox
import scenarios from "./src/js/data/scenarios/sorites-paradox-scenarios.js";

console.log("=== SORITES-PARADOX SCENARIOS ===");
console.log("All scenario IDs in sorites-paradox-scenarios.js:");
Object.keys(scenarios).forEach((id, i) => {
  console.log(`${i + 1}. ${id}: ${scenarios[id].title}`);
});

console.log("\n=== CHECKING MISSING ===");
const missing = [
  "ai-consciousness-threshold",
  "human-ai-hybrid-identity",
  "autonomous-weapon-accountability",
];
missing.forEach((id) => {
  if (scenarios[id]) {
    console.log(`✅ ${id}: ${scenarios[id].title}`);
  } else {
    console.log(`❌ ${id}: NOT FOUND`);
  }
});
