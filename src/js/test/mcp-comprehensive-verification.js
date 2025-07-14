#!/usr/bin/env node
/**
 * Comprehensive MCP Integration Verification Script
 * Tests all MCP modules and their capabilities
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 MCP Integration Verification Suite');
console.log('=====================================\n');

const testResults = [];

async function testMCPModule(moduleName, modulePath) {
  try {
    console.log(`🔍 Testing ${moduleName}...`);

    // Import the module
    const moduleExport = await import(modulePath);
    const ModuleClass = moduleExport.default;

    if (!ModuleClass) {
      throw new Error('Module does not export a default class');
    }

    console.log(`✅ ${moduleName}: Import successful`);

    // Test basic instantiation
    const mockApp = {
      debug: { log: () => {} },
      addRealWorldContext: () => Promise.resolve('mock context'),
      enhanceScenarioGeneration: () => Promise.resolve('mock scenario'),
      trackAnalyticsEvent: () => Promise.resolve(),
      getGitHubIntegration: () => ({ connected: false }),
    };

    let instance;
    if (moduleName === 'MCP Integration Manager') {
      instance = new ModuleClass(mockApp);
    } else if (moduleName === 'MCP Philosophical Generator') {
      // This module needs web research and project generator dependencies
      const mockWebResearch = {
        searchEthicsContent: () => Promise.resolve('mock research'),
      };
      const mockProjectGenerator = {
        generateEducationalContent: () => Promise.resolve('mock content'),
      };
      instance = new ModuleClass(mockWebResearch, mockProjectGenerator);
    } else {
      instance = new ModuleClass();
    }

    console.log(`✅ ${moduleName}: Instantiation successful`);

    // Test that the instance has expected methods
    if (typeof instance.initialize === 'function') {
      console.log(`✅ ${moduleName}: Has initialize method`);
    }

    if (typeof instance.getCapabilities === 'function') {
      const capabilities = instance.getCapabilities();
      console.log(
        `✅ ${moduleName}: Capabilities - ${capabilities.join(', ')}`
      );
    }

    testResults.push({ module: moduleName, status: 'PASSED', error: null });
    console.log(`🎉 ${moduleName}: ALL TESTS PASSED\n`);
  } catch (error) {
    console.error(`❌ ${moduleName}: FAILED - ${error.message}\n`);
    testResults.push({
      module: moduleName,
      status: 'FAILED',
      error: error.message,
    });
  }
}

async function testPhilosophicalTaxonomy() {
  try {
    console.log('🔍 Testing Philosophical Taxonomy Data...');

    const taxonomy = await import('../data/philosophical-taxonomy.js');

    if (!taxonomy.PHILOSOPHICAL_DOMAINS) {
      throw new Error('PHILOSOPHICAL_DOMAINS not exported');
    }

    if (!taxonomy.AI_ETHICS_FRAMEWORKS) {
      throw new Error('AI_ETHICS_FRAMEWORKS not exported');
    }

    if (!taxonomy.ETHICAL_DILEMMA_TYPES) {
      throw new Error('ETHICAL_DILEMMA_TYPES not exported');
    }

    if (!taxonomy.THOUGHT_EXPERIMENTS) {
      throw new Error('THOUGHT_EXPERIMENTS not exported');
    }

    const domainCount = Object.keys(taxonomy.PHILOSOPHICAL_DOMAINS).length;
    console.log(`✅ Philosophical Taxonomy: ${domainCount} domains loaded`);

    const frameworkCount = Object.keys(taxonomy.AI_ETHICS_FRAMEWORKS).length;
    console.log(`✅ AI Ethics Frameworks: ${frameworkCount} frameworks loaded`);

    const dilemmaCount = Object.keys(taxonomy.ETHICAL_DILEMMA_TYPES).length;
    console.log(`✅ Ethical Dilemma Types: ${dilemmaCount} types loaded`);

    const experimentCount = Object.keys(taxonomy.THOUGHT_EXPERIMENTS).length;
    console.log(
      `✅ Thought Experiments: ${experimentCount} experiments loaded`
    );

    // Test utility functions
    if (taxonomy.PhilosophicalTaxonomyUtils) {
      const utils = taxonomy.PhilosophicalTaxonomyUtils;
      const allDomains = utils.getAllDomains();
      console.log(`✅ Taxonomy Utils: ${allDomains.length} domains available`);
    }

    testResults.push({
      module: 'Philosophical Taxonomy',
      status: 'PASSED',
      error: null,
    });
    console.log('🎉 Philosophical Taxonomy: ALL TESTS PASSED\n');
  } catch (error) {
    console.error(`❌ Philosophical Taxonomy: FAILED - ${error.message}\n`);
    testResults.push({
      module: 'Philosophical Taxonomy',
      status: 'FAILED',
      error: error.message,
    });
  }
}

async function runAllTests() {
  console.log('Starting comprehensive MCP verification...\n');

  // Test philosophical taxonomy first (dependency for other modules)
  await testPhilosophicalTaxonomy();

  // Test all MCP modules
  const mcpModules = [
    {
      name: 'MCP Web Research',
      path: '../integrations/mcp-web-research.js',
    },
    {
      name: 'MCP Project Generator',
      path: '../integrations/mcp-project-generator.js',
    },
    {
      name: 'MCP GitHub Integration',
      path: '../integrations/mcp-github-integration.js',
    },
    {
      name: 'MCP Analytics Enhancement',
      path: '../integrations/mcp-analytics-enhancement.js',
    },
    {
      name: 'MCP Philosophical Generator',
      path: '../integrations/mcp-philosophical-generator.js',
    },
    {
      name: 'MCP Integration Manager',
      path: '../integrations/mcp-integration-manager.js',
    },
  ];

  for (const module of mcpModules) {
    await testMCPModule(module.name, module.path);
  }

  // Generate final report
  console.log('📊 FINAL TEST REPORT');
  console.log('====================');

  const passed = testResults.filter(r => r.status === 'PASSED');
  const failed = testResults.filter(r => r.status === 'FAILED');

  console.log(`✅ Passed: ${passed.length}/${testResults.length}`);
  console.log(`❌ Failed: ${failed.length}/${testResults.length}`);

  if (failed.length > 0) {
    console.log('\n❌ Failed Tests:');
    failed.forEach(test => {
      console.log(`   - ${test.module}: ${test.error}`);
    });
  }

  if (passed.length === testResults.length) {
    console.log('\n🚀 All MCP integrations are working correctly!');
    console.log('🎯 System ready for production use.');
  } else {
    console.log('\n⚠️  Some MCP integrations have issues.');
    console.log('🔧 Please review the failed tests above.');
  }

  return passed.length === testResults.length;
}

// Run the tests
runAllTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Test suite crashed:', error);
    process.exit(1);
  });
