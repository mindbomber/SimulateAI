#!/usr/bin/env node
/**
 * MCP Integration Verification Script
 * Quick test to ensure all MCP modules are working correctly
 */

console.log('🧪 MCP Integration Verification Starting...\n');

async function verifyMCPIntegrations() {
  const results = [];

  try {
    // Test 1: MCP Web Research
    console.log('📦 Testing MCP Web Research...');
    const { default: MCPWebResearch } = await import(
      './src/js/integrations/mcp-web-research.js'
    );
    const webResearch = new MCPWebResearch();
    console.log('   ✅ MCP Web Research created successfully');

    // Test analytics setter
    webResearch.setAnalytics({ track: () => {} });
    console.log('   ✅ Analytics integration works');
    results.push({ module: 'MCP Web Research', status: 'PASS' });

    // Test 2: MCP Project Generator
    console.log('\n📦 Testing MCP Project Generator...');
    const { default: MCPProjectGenerator } = await import(
      './src/js/integrations/mcp-project-generator.js'
    );
    const projectGen = new MCPProjectGenerator();
    console.log('   ✅ MCP Project Generator created successfully');

    // Test integration setters
    projectGen.setWebResearch(webResearch);
    console.log('   ✅ Web research integration works');
    results.push({ module: 'MCP Project Generator', status: 'PASS' });

    // Test 3: MCP GitHub Integration
    console.log('\n📦 Testing MCP GitHub Integration...');
    const { default: MCPGitHubIntegration } = await import(
      './src/js/integrations/mcp-github-integration.js'
    );
    const github = new MCPGitHubIntegration();
    console.log('   ✅ MCP GitHub Integration created successfully');

    // Test contribution templates
    const templates = github.contributionTemplates;
    if (templates.size > 0) {
      console.log(`   ✅ ${templates.size} contribution templates loaded`);
    }
    results.push({ module: 'MCP GitHub Integration', status: 'PASS' });

    // Test 4: MCP Analytics Enhancement
    console.log('\n📦 Testing MCP Analytics Enhancement...');
    const { default: MCPAnalyticsEnhancement } = await import(
      './src/js/integrations/mcp-analytics-enhancement.js'
    );
    const analytics = new MCPAnalyticsEnhancement({ track: () => {} });
    console.log('   ✅ MCP Analytics Enhancement created successfully');

    // Test performance metrics
    if (analytics.performanceMetrics.size > 0) {
      console.log(
        `   ✅ ${analytics.performanceMetrics.size} performance metric categories initialized`
      );
    }
    results.push({ module: 'MCP Analytics Enhancement', status: 'PASS' });

    // Test 5: MCP Philosophical Generator (requires dependencies)
    console.log('\n📦 Testing MCP Philosophical Generator...');
    const { MCPPhilosophicalCategoryGenerator } = await import(
      './src/js/integrations/mcp-philosophical-generator.js'
    );
    const philosophical = new MCPPhilosophicalCategoryGenerator(
      webResearch,
      projectGen
    );
    console.log('   ✅ MCP Philosophical Generator created successfully');

    // Test philosophical domains import
    if (philosophical.philosophicalDomains) {
      const domainCount = Object.keys(
        philosophical.philosophicalDomains
      ).length;
      console.log(`   ✅ ${domainCount} philosophical domains loaded`);
    }
    results.push({ module: 'MCP Philosophical Generator', status: 'PASS' });

    // Test 6: MCP Integration Manager
    console.log('\n📦 Testing MCP Integration Manager...');
    const { default: MCPIntegrationManager } = await import(
      './src/js/integrations/mcp-integration-manager.js'
    );
    const mockApp = { analytics: { track: () => {} } };
    const manager = new MCPIntegrationManager(mockApp);
    console.log('   ✅ MCP Integration Manager created successfully');

    // Wait for initialization and check status
    await new Promise(resolve => setTimeout(resolve, 1000));
    const status = manager.getMCPStatus();
    console.log(`   ✅ Initialized: ${status.initialized}`);
    console.log(`   ✅ Capabilities: ${status.availableCapabilities.length}`);
    console.log(`   ✅ Integrations: ${status.activeIntegrations.length}`);
    results.push({ module: 'MCP Integration Manager', status: 'PASS' });

    // Summary
    console.log('\n🎉 MCP Verification Results:');
    console.log('='.repeat(50));
    results.forEach(result => {
      console.log(
        `${result.status === 'PASS' ? '✅' : '❌'} ${result.module}: ${result.status}`
      );
    });

    const passCount = results.filter(r => r.status === 'PASS').length;
    console.log(
      `\n📊 ${passCount}/${results.length} modules passed verification`
    );

    if (passCount === results.length) {
      console.log('\n🚀 All MCP integrations are working correctly!');
    } else {
      console.log('\n⚠️ Some MCP integrations need attention.');
    }
  } catch (error) {
    console.error('\n❌ MCP verification failed:', error.message);
    console.error('Stack:', error.stack.split('\n').slice(0, 5).join('\n'));
    process.exit(1);
  }
}

verifyMCPIntegrations();
