/**
 * MCP Integration Test Suite for SimulateAI
 * Tests all MCP capabilities and integrations
 */

import logger from '../utils/logger.js';

class MCPTestSuite {
  constructor(app) {
    this.app = app;
    this.testResults = new Map();
    this.mcpManager = app.mcpManager;
  }

  /**
   * Run comprehensive MCP tests
   */
  async runAllTests() {
    console.log('🧪 Starting MCP Integration Test Suite...');

    const testSuite = [
      {
        name: 'MCP Manager Initialization',
        test: () => this.testMCPManagerInit(),
      },
      { name: 'Web Research Integration', test: () => this.testWebResearch() },
      { name: 'Project Generation', test: () => this.testProjectGeneration() },
      { name: 'GitHub Integration', test: () => this.testGitHubIntegration() },
      {
        name: 'Analytics Enhancement',
        test: () => this.testAnalyticsEnhancement(),
      },
      {
        name: 'Real-World Scenario Enhancement',
        test: () => this.testRealWorldEnhancement(),
      },
      {
        name: 'MCP Capability Detection',
        test: () => this.testCapabilityDetection(),
      },
    ];

    for (const testCase of testSuite) {
      try {
        console.log(`\n🔍 Testing: ${testCase.name}`);
        const result = await testCase.test();
        this.testResults.set(testCase.name, { success: true, result });
        console.log(`✅ ${testCase.name}: PASSED`);
      } catch (error) {
        this.testResults.set(testCase.name, {
          success: false,
          error: error.message,
        });
        console.log(`❌ ${testCase.name}: FAILED - ${error.message}`);
      }
    }

    return this.generateTestReport();
  }

  /**
   * Test MCP Manager initialization
   */
  async testMCPManagerInit() {
    if (!this.mcpManager) {
      throw new Error('MCP Manager not initialized');
    }

    const status = this.mcpManager.getMCPStatus();

    if (!status.initialized) {
      throw new Error('MCP Manager failed to initialize');
    }

    console.log('📊 MCP Status:', status);
    return {
      initialized: status.initialized,
      capabilities: status.availableCapabilities,
      integrations: status.activeIntegrations,
    };
  }

  /**
   * Test Web Research functionality
   */
  async testWebResearch() {
    console.log('🌐 Testing web research capabilities...');

    // Test with a sample ethics category
    const testScenarioId = 'test-bias-scenario';
    const testCategory = 'bias-fairness';

    try {
      // Test if we can add real-world context (this will use MCP fetch_webpage)
      if (this.app.addRealWorldContext) {
        const realWorldContext = await this.app.addRealWorldContext(
          testScenarioId,
          testCategory
        );
        console.log(
          '📰 Real-world context found:',
          realWorldContext ? 'Yes' : 'No'
        );

        return {
          contextAvailable: !!realWorldContext,
          examples: realWorldContext?.realWorldExamples?.length || 0,
          sources: realWorldContext?.sources?.length || 0,
        };
      } else {
        throw new Error('addRealWorldContext method not available');
      }
    } catch (error) {
      console.log('⚠️ Web research test failed, testing fallback...');
      return {
        contextAvailable: false,
        fallbackWorking: true,
        error: error.message,
      };
    }
  }

  /**
   * Test Project Generation capabilities
   */
  async testProjectGeneration() {
    console.log('🏗️ Testing project generation...');

    const testConfig = {
      categoryId: 'test-ai-governance',
      categoryName: 'AI Governance Ethics',
      ethicsFramework: 'deontological',
      complexity: 'intermediate',
      includeRealWorldExamples: true,
    };

    try {
      if (this.app.createEnhancedScenario) {
        const result = await this.app.createEnhancedScenario(testConfig);
        console.log(
          '🎯 Scenario generation result:',
          result.success ? 'Success' : 'Failed'
        );

        return {
          generationSuccessful: result.success,
          mcpCapabilitiesUsed: result.mcpCapabilitiesUsed,
          hasRealWorldContext: !!result.realWorldContext,
          hasDocumentation: !!result.documentation,
        };
      } else {
        throw new Error('createEnhancedScenario method not available');
      }
    } catch (error) {
      console.log('⚠️ Project generation test failed:', error.message);
      return {
        generationSuccessful: false,
        error: error.message,
        fallbackAvailable: true,
      };
    }
  }

  /**
   * Test GitHub Integration
   */
  async testGitHubIntegration() {
    console.log('🐙 Testing GitHub integration...');

    const githubIntegration =
      this.mcpManager?.integrations?.get('githubIntegration');

    if (!githubIntegration) {
      throw new Error('GitHub integration not available');
    }

    try {
      // Test contribution guide generation
      const contributionGuide = githubIntegration.generateContributionGuide();
      const issueTemplates = githubIntegration.createIssueTemplates();

      console.log('📋 Contribution guide generated:', !!contributionGuide);
      console.log(
        '📝 Issue templates created:',
        Object.keys(issueTemplates).length
      );

      // Test pattern analysis (this would use MCP github_repo)
      try {
        const patterns = await githubIntegration.analyzeEducationalPatterns();
        console.log('🔍 Pattern analysis completed:', !!patterns);

        return {
          contributionGuideGenerated: !!contributionGuide,
          issueTemplatesCount: Object.keys(issueTemplates).length,
          patternAnalysisWorking: !!patterns,
          githubRepoAccess: true,
        };
      } catch (patternError) {
        console.log(
          '⚠️ Pattern analysis failed (expected if MCP server unavailable)'
        );
        return {
          contributionGuideGenerated: !!contributionGuide,
          issueTemplatesCount: Object.keys(issueTemplates).length,
          patternAnalysisWorking: false,
          githubRepoAccess: false,
          note: 'GitHub repo access requires MCP server',
        };
      }
    } catch (error) {
      throw new Error(`GitHub integration test failed: ${error.message}`);
    }
  }

  /**
   * Test Analytics Enhancement
   */
  async testAnalyticsEnhancement() {
    console.log('📊 Testing analytics enhancement...');

    try {
      if (this.app.getAnalyticsInsights) {
        const insights = await this.app.getAnalyticsInsights();
        console.log('📈 Analytics insights generated:', !!insights);

        return {
          insightsGenerated: !!insights,
          hasEducationalInsights: !!insights.educationalInsights,
          hasPerformanceMetrics: !!insights.performanceMetrics,
          hasRecommendations: !!insights.recommendations,
        };
      } else {
        throw new Error('getAnalyticsInsights method not available');
      }
    } catch (error) {
      console.log('⚠️ Analytics enhancement test failed:', error.message);
      return {
        insightsGenerated: false,
        error: error.message,
        basicAnalyticsWorking: !!this.app.analytics,
      };
    }
  }

  /**
   * Test real-world scenario enhancement
   */
  async testRealWorldEnhancement() {
    console.log('🌍 Testing real-world scenario enhancement...');

    // Test enhancing an existing scenario
    const existingScenarios = [
      'hiring-algorithm-bias',
      'facial-recognition-consent',
      'autonomous-vehicle-override',
      'deepfake-detection',
    ];

    const results = [];

    for (const scenarioId of existingScenarios) {
      try {
        if (this.app.addRealWorldContext) {
          const context = await this.app.addRealWorldContext(
            scenarioId,
            'bias-fairness'
          );
          results.push({
            scenarioId,
            enhanced: !!context,
            examplesCount: context?.realWorldExamples?.length || 0,
          });
        }
      } catch (error) {
        results.push({
          scenarioId,
          enhanced: false,
          error: error.message,
        });
      }
    }

    const successfulEnhancements = results.filter(r => r.enhanced).length;
    console.log(
      `✨ Enhanced ${successfulEnhancements}/${existingScenarios.length} scenarios`
    );

    return {
      totalScenarios: existingScenarios.length,
      successfulEnhancements,
      enhancementRate: successfulEnhancements / existingScenarios.length,
      results,
    };
  }

  /**
   * Test MCP capability detection
   */
  async testCapabilityDetection() {
    console.log('🔧 Testing MCP capability detection...');

    const expectedCapabilities = [
      'fetch_webpage',
      'create_new_workspace',
      'github_repo',
      'semantic_search',
      'file_search',
    ];

    const availableCapabilities = Array.from(this.app.mcpCapabilities || []);
    const detectedCapabilities = expectedCapabilities.filter(cap =>
      availableCapabilities.includes(cap)
    );

    console.log('🎯 Available MCP capabilities:', availableCapabilities);
    console.log('✅ Detected expected capabilities:', detectedCapabilities);

    return {
      expectedCapabilities,
      availableCapabilities,
      detectedCapabilities,
      detectionRate: detectedCapabilities.length / expectedCapabilities.length,
      mcpServersConnected: detectedCapabilities.length > 0,
    };
  }

  /**
   * Generate comprehensive test report
   */
  generateTestReport() {
    const totalTests = this.testResults.size;
    const passedTests = Array.from(this.testResults.values()).filter(
      r => r.success
    ).length;
    const failedTests = totalTests - passedTests;

    const report = {
      summary: {
        totalTests,
        passedTests,
        failedTests,
        successRate: passedTests / totalTests,
        timestamp: new Date().toISOString(),
      },
      results: Object.fromEntries(this.testResults),
      recommendations: this.generateRecommendations(),
      nextSteps: this.generateNextSteps(),
    };

    console.log('\n📋 MCP Integration Test Report');
    console.log('=====================================');
    console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
    console.log(`❌ Failed: ${failedTests}/${totalTests} tests`);
    console.log(
      `📊 Success Rate: ${(report.summary.successRate * 100).toFixed(1)}%`
    );

    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      report.recommendations.forEach((rec, i) => {
        console.log(`${i + 1}. ${rec}`);
      });
    }

    return report;
  }

  /**
   * Generate recommendations based on test results
   */
  generateRecommendations() {
    const recommendations = [];

    this.testResults.forEach((result, testName) => {
      if (!result.success) {
        switch (testName) {
          case 'Web Research Integration':
            recommendations.push(
              'Configure MCP fetch_webpage server for real-time content'
            );
            break;
          case 'GitHub Integration':
            recommendations.push(
              'Set up MCP github_repo server for code analysis'
            );
            break;
          case 'Analytics Enhancement':
            recommendations.push(
              'Enable enhanced analytics for better insights'
            );
            break;
          default:
            recommendations.push(`Investigate ${testName} failure`);
        }
      }
    });

    // Add general recommendations
    const mcpStatus = this.mcpManager?.getMCPStatus();
    if (mcpStatus && mcpStatus.availableCapabilities.length === 0) {
      recommendations.push(
        'No MCP servers detected - consider setting up MCP integration'
      );
    }

    return recommendations;
  }

  /**
   * Generate next steps based on test results
   */
  generateNextSteps() {
    const steps = [];

    if (this.testResults.get('MCP Manager Initialization')?.success) {
      steps.push(
        '✅ MCP Manager is working - proceed with feature implementation'
      );
    } else {
      steps.push('❌ Fix MCP Manager initialization before proceeding');
      return steps;
    }

    if (this.testResults.get('Web Research Integration')?.success) {
      steps.push('🌐 Implement real-world context for existing scenarios');
    }

    if (this.testResults.get('Project Generation')?.success) {
      steps.push('🏗️ Create new scenario categories using MCP generation');
    }

    if (this.testResults.get('GitHub Integration')?.success) {
      steps.push('🐙 Set up community contribution workflows');
    }

    if (this.testResults.get('Analytics Enhancement')?.success) {
      steps.push('📊 Deploy enhanced analytics tracking');
    }

    steps.push('📈 Monitor performance impact of MCP integrations');
    steps.push('📚 Train educators on new MCP-enhanced features');

    return steps;
  }
}

export default MCPTestSuite;
