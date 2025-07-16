/**
 * Enhanced Metadata Demo
 * Demonstrates the comprehensive metadata system for categories and scenarios
 */

import CategoryMetadataManager from './src/js/utils/category-metadata-manager.js';

// Demo function to showcase the enhanced metadata system
function demonstrateMetadataSystem() {
  console.log('=== SimulateAI Enhanced Metadata System Demo ===\n');

  // 1. Get enhanced categories
  console.log('📂 ENHANCED CATEGORIES:');
  const enhancedCategories = CategoryMetadataManager.getAllEnhancedCategories();

  Object.entries(enhancedCategories).forEach(([id, category]) => {
    console.log(`\n${category.icon} ${category.title} (${id})`);
    console.log(`   Difficulty: ${category.difficulty}`);
    console.log(
      `   Primary Philosophy: ${category.metadata.primaryPhilosophy}`
    );
    console.log(
      `   Approaches: ${category.metadata.philosophicalApproaches.join(', ')}`
    );
    console.log(
      `   Tags: ${category.metadata.tags.slice(0, 5).join(', ')}${category.metadata.tags.length > 5 ? '...' : ''}`
    );
    console.log(`   Scenarios: ${category.scenarios.length}`);
  });

  // 2. Get all scenarios with metadata
  console.log('\n\n🎯 ALL SCENARIOS WITH METADATA:');
  const allScenarios = CategoryMetadataManager.getAllScenariosEnhanced();

  allScenarios.slice(0, 5).forEach(scenario => {
    console.log(`\n• ${scenario.title}`);
    console.log(
      `  Category: ${scenario.category.icon} ${scenario.category.title}`
    );
    console.log(`  Difficulty: ${scenario.difficulty}`);
    console.log(`  Philosophy: ${scenario.metadata.philosophicalLeaning}`);
    console.log(`  Time: ${scenario.metadata.estimatedTime} min`);
    console.log(`  Complexity: ${scenario.metadata.complexity}`);
    console.log(`  Tags: ${scenario.metadata.tags.slice(0, 3).join(', ')}...`);
  });

  // 3. Search functionality demo
  console.log('\n\n🔍 SEARCH DEMONSTRATIONS:');

  // Search by keyword
  const searchResults =
    CategoryMetadataManager.searchScenarios('autonomous vehicle');
  console.log(`\nSearch "autonomous vehicle": ${searchResults.length} results`);
  searchResults.slice(0, 3).forEach(result => {
    console.log(`  • ${result.title}`);
  });

  // Filter by difficulty
  const beginnerScenarios = CategoryMetadataManager.searchScenarios('', {
    difficulty: 'beginner',
  });
  console.log(`\nBeginner difficulty: ${beginnerScenarios.length} scenarios`);

  // Filter by philosophy
  const utilitarianScenarios = CategoryMetadataManager.searchScenarios('', {
    philosophy: 'utilitarian',
  });
  console.log(
    `\nUtilitarian philosophy: ${utilitarianScenarios.length} scenarios`
  );

  // Filter by tags
  const ethicsTagged = CategoryMetadataManager.searchScenarios('', {
    tags: ['ethics', 'autonomy'],
  });
  console.log(`\nEthics + Autonomy tags: ${ethicsTagged.length} scenarios`);

  // 4. Popular tags
  console.log('\n\n🏷️ POPULAR TAGS:');
  const popularTags = CategoryMetadataManager.getPopularTags();
  popularTags.slice(0, 10).forEach(({ tag, count }) => {
    console.log(`  ${tag}: ${count} uses`);
  });

  // 5. Metadata statistics
  console.log('\n\n📊 METADATA STATISTICS:');
  const stats = CategoryMetadataManager.getMetadataStats();
  console.log(`Total Categories: ${stats.totalCategories}`);
  console.log(`Total Scenarios: ${stats.totalScenarios}`);
  console.log(`Average Time: ${stats.averageEstimatedTime} minutes`);

  console.log('\nDifficulty Breakdown:');
  Object.entries(stats.difficultyBreakdown).forEach(([level, count]) => {
    console.log(`  ${level}: ${count} scenarios`);
  });

  console.log('\nPhilosophy Breakdown:');
  Object.entries(stats.philosophyBreakdown).forEach(([approach, count]) => {
    console.log(`  ${approach}: ${count} scenarios`);
  });

  // 6. Category search demo
  console.log('\n\n🗂️ CATEGORY SEARCH DEMO:');
  const categoryResults = CategoryMetadataManager.searchCategories('ethics');
  console.log(
    `\nCategories matching "ethics": ${categoryResults.length} results`
  );
  categoryResults.forEach(category => {
    console.log(`  ${category.icon} ${category.title}`);
  });

  console.log('\n=== Demo Complete ===');
}

// Export for use in other modules
export { demonstrateMetadataSystem };

// Run demo if this file is executed directly
if (typeof window !== 'undefined') {
  window.demonstrateMetadataSystem = demonstrateMetadataSystem;

  // Add demo button to page
  document.addEventListener('DOMContentLoaded', () => {
    const demoButton = document.createElement('button');
    demoButton.textContent = '🧪 Demo Metadata System';
    demoButton.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      padding: 10px 15px;
      background: #007cba;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
    `;
    demoButton.onclick = demonstrateMetadataSystem;
    document.body.appendChild(demoButton);
  });
}
