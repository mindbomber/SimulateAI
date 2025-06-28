/**
 * Test script to validate scenario data loading
 */

import scenarioDataManager from './src/js/data/scenario-data-manager.js';
import { getAllCategories } from './src/data/categories.js';

async function testScenarioLoading() {
    console.log('Testing scenario data loading...\n');
    
    const categories = getAllCategories();
    console.log(`Found ${categories.length} categories`);
    
    for (const category of categories) {
        console.log(`\n--- Testing category: ${category.title} (${category.id}) ---`);
        
        try {
            const scenarios = await scenarioDataManager.loadCategoryScenarios(category.id);
            const scenarioCount = Object.keys(scenarios).length;
            console.log(`✅ Loaded ${scenarioCount} scenarios for ${category.id}`);
            
            // Test individual scenarios
            for (const scenarioMeta of category.scenarios) {
                const scenarioData = await scenarioDataManager.getScenario(category.id, scenarioMeta.id);
                if (scenarioData) {
                    console.log(`  ✅ ${scenarioMeta.id}: ${scenarioData.title}`);
                } else {
                    console.log(`  ❌ ${scenarioMeta.id}: Not found in scenario data`);
                }
            }
            
        } catch (error) {
            console.log(`❌ Failed to load scenarios for ${category.id}: ${error.message}`);
        }
    }
    
    console.log('\n--- Test Complete ---');
}

// Run test
testScenarioLoading().catch(console.error);
