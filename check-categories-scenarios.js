// Check categories.js scenarios
import { ETHICAL_CATEGORIES } from "./src/data/categories.js";

console.log("Categories with scenarios:");
Object.keys(ETHICAL_CATEGORIES).forEach((categoryId) => {
  const category = ETHICAL_CATEGORIES[categoryId];
  if (category.scenarios && category.scenarios.length > 0) {
    console.log(`\n${categoryId}:`);
    category.scenarios.forEach((scenario, i) => {
      console.log(`  ${i + 1}. ${scenario.id}: ${scenario.title}`);
    });
  } else {
    console.log(`\n${categoryId}: NO SCENARIOS DEFINED`);
  }
});

console.log("\n=== Summary ===");
const totalCategories = Object.keys(ETHICAL_CATEGORIES).length;
const categoriesWithScenarios = Object.keys(ETHICAL_CATEGORIES).filter(
  (id) =>
    ETHICAL_CATEGORIES[id].scenarios &&
    ETHICAL_CATEGORIES[id].scenarios.length > 0,
).length;

console.log(`Total categories: ${totalCategories}`);
console.log(`Categories with scenarios: ${categoriesWithScenarios}`);

const totalScenariosInCategories = Object.values(ETHICAL_CATEGORIES).reduce(
  (total, category) => total + (category.scenarios?.length || 0),
  0,
);

console.log(`Total scenarios in categories.js: ${totalScenariosInCategories}`);
