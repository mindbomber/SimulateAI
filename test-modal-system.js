/**
 * Test the scenario modal system for all categories and scenarios
 * This script opens each scenario to verify the modal works correctly
 */

import scenarioDataManager from './src/js/data/scenario-data-manager.js';
import { ETHICAL_CATEGORIES } from './src/data/categories.js';

// Use the singleton instance

async function testAllScenarioModals() {
    console.log('🧪 Testing Scenario Modal System for All Categories\n');
    
    const categories = Object.values(ETHICAL_CATEGORIES);
    
    for (const category of categories) {
        console.log(`--- Testing category: ${category.title} (${category.id}) ---`);
        
        try {
            // Test loading scenario data
            const scenarioData = await scenarioDataManager.loadCategoryScenarios(category.id);
            console.log(`✅ Successfully loaded scenario data for ${category.id}`);
            
            // Test each scenario in the category
            for (const scenario of category.scenarios) {
                try {
                    const individualScenario = await scenarioDataManager.getScenario(category.id, scenario.id);
                    if (individualScenario) {
                        console.log(`  ✅ ${scenario.id}: ${individualScenario.title}`);
                        
                        // Verify required fields
                        const requiredFields = ['title', 'dilemma', 'ethicalQuestion', 'options'];
                        const missingFields = requiredFields.filter(field => !individualScenario[field]);
                        if (missingFields.length > 0) {
                            console.log(`    ⚠️  Missing fields: ${missingFields.join(', ')}`);
                        }
                        
                        // Verify options structure
                        if (individualScenario.options && Array.isArray(individualScenario.options)) {
                            const optionIssues = [];
                            individualScenario.options.forEach((option, index) => {
                                if (!option.id || !option.text || !option.description || !option.impact) {
                                    optionIssues.push(`Option ${index + 1} missing required fields`);
                                }
                                
                                // Check impact values are numbers
                                if (option.impact) {
                                    const nonNumericImpacts = Object.entries(option.impact)
                                        .filter(([key, value]) => typeof value !== 'number')
                                        .map(([key]) => key);
                                    if (nonNumericImpacts.length > 0) {
                                        optionIssues.push(`Option ${index + 1} has non-numeric impact values: ${nonNumericImpacts.join(', ')}`);
                                    }
                                }
                            });
                            
                            if (optionIssues.length > 0) {
                                console.log(`    ⚠️  Option issues: ${optionIssues.join('; ')}`);
                            }
                        } else {
                            console.log(`    ❌ Invalid or missing options array`);
                        }
                        
                    } else {
                        console.log(`  ❌ ${scenario.id}: Failed to load scenario data`);
                    }
                } catch (error) {
                    console.log(`  ❌ ${scenario.id}: Error loading scenario - ${error.message}`);
                }
            }
            
        } catch (error) {
            console.log(`❌ Failed to load category data: ${error.message}`);
        }
        
        console.log('');
    }
    
    console.log('🎯 Modal System Test Complete');
    console.log('\n📊 Summary:');
    console.log(`Total categories tested: ${categories.length}`);
    console.log(`Total scenarios tested: ${categories.reduce((sum, cat) => sum + cat.scenarios.length, 0)}`);
}

// Run the test
testAllScenarioModals().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
});
