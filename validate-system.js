#!/usr/bin/env node

/**
 * SimulateAI Comprehensive Validation Script
 * Tests core functionality, module integration, and system stability
 */

const fs = require('fs');
const path = require('path');

class ValidationSuite {
    constructor() {
        this.testResults = [];
        this.projectRoot = process.cwd();
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const result = { timestamp, message, type };
        this.testResults.push(result);
        
        const colors = {
            success: '\x1b[32m',
            error: '\x1b[31m',
            warning: '\x1b[33m',
            info: '\x1b[36m',
            reset: '\x1b[0m'
        };
        
        console.log(`${colors[type]}[${type.toUpperCase()}] ${message}${colors.reset}`);
    }

    fileExists(filePath) {
        const fullPath = path.join(this.projectRoot, filePath);
        return fs.existsSync(fullPath);
    }

    readFile(filePath) {
        const fullPath = path.join(this.projectRoot, filePath);
        try {
            return fs.readFileSync(fullPath, 'utf8');
        } catch (error) {
            return null;
        }
    }

    testProjectStructure() {
        this.log('Testing project structure...', 'info');
        
        const requiredFiles = [
            'package.json',
            'index.html',
            'vite.config.js',
            'src/js/app.js',
            'src/js/core/educator-toolkit.js',
            'src/js/core/digital-science-lab.js',
            'src/js/core/scenario-generator.js',
            'src/js/simulations/bias-fairness-v2.js',
            'src/styles/main.css'
        ];

        const requiredDirectories = [
            'src/js/core',
            'src/js/components',
            'src/js/simulations',
            'src/js/renderers',
            'src/js/objects',
            'src/js/utils',
            'src/styles',
            'public'
        ];

        let structureValid = true;

        // Test files
        for (const file of requiredFiles) {
            if (this.fileExists(file)) {
                this.log(`✓ Required file exists: ${file}`, 'success');
            } else {
                this.log(`✗ Missing required file: ${file}`, 'error');
                structureValid = false;
            }
        }

        // Test directories
        for (const dir of requiredDirectories) {
            if (this.fileExists(dir)) {
                this.log(`✓ Required directory exists: ${dir}`, 'success');
            } else {
                this.log(`✗ Missing required directory: ${dir}`, 'error');
                structureValid = false;
            }
        }

        return structureValid;
    }

    testPackageConfiguration() {
        this.log('Testing package configuration...', 'info');
        
        const packageJson = this.readFile('package.json');
        if (!packageJson) {
            this.log('✗ Cannot read package.json', 'error');
            return false;
        }

        try {
            const pkg = JSON.parse(packageJson);
            
            // Test required scripts
            const requiredScripts = ['dev', 'build', 'preview', 'lint'];
            for (const script of requiredScripts) {
                if (pkg.scripts && pkg.scripts[script]) {
                    this.log(`✓ Script exists: ${script}`, 'success');
                } else {
                    this.log(`✗ Missing script: ${script}`, 'warning');
                }
            }

            // Test dependencies
            if (pkg.dependencies) {
                this.log(`✓ Dependencies found: ${Object.keys(pkg.dependencies).length}`, 'success');
            }

            if (pkg.devDependencies) {
                this.log(`✓ DevDependencies found: ${Object.keys(pkg.devDependencies).length}`, 'success');
            }

            return true;
        } catch (error) {
            this.log(`✗ Invalid package.json: ${error.message}`, 'error');
            return false;
        }
    }

    testCoreModuleIntegration() {
        this.log('Testing core module integration...', 'info');
        
        // Test EducatorToolkit
        const educatorToolkit = this.readFile('src/js/core/educator-toolkit.js');
        if (educatorToolkit) {
            if (educatorToolkit.includes('getScenarioTitle')) {
                this.log('✓ EducatorToolkit has getScenarioTitle method', 'success');
            } else {
                this.log('✗ EducatorToolkit missing getScenarioTitle method', 'error');
            }

            if (educatorToolkit.includes('generateLessonPlan')) {
                this.log('✓ EducatorToolkit has generateLessonPlan method', 'success');
            } else {
                this.log('✗ EducatorToolkit missing generateLessonPlan method', 'error');
            }
        }

        // Test app.js integration
        const appJs = this.readFile('src/js/app.js');
        if (appJs) {
            const coreModules = ['EducatorToolkit', 'DigitalScienceLab', 'ScenarioGenerator'];
            for (const module of coreModules) {
                if (appJs.includes(module)) {
                    this.log(`✓ ${module} imported in app.js`, 'success');
                } else {
                    this.log(`✗ ${module} not imported in app.js`, 'warning');
                }
            }
        }

        // Test BiasExplorerSimulation integration
        const biasSimulation = this.readFile('src/js/simulations/bias-fairness-v2.js');
        if (biasSimulation) {
            const requiredIntegrations = ['educatorToolkit', 'digitalScienceLab', 'scenarioGenerator'];
            for (const integration of requiredIntegrations) {
                if (biasSimulation.includes(integration)) {
                    this.log(`✓ BiasExplorerSimulation has ${integration} integration`, 'success');
                } else {
                    this.log(`✗ BiasExplorerSimulation missing ${integration} integration`, 'warning');
                }
            }
        }

        return true;
    }

    testCSSArchitecture() {
        this.log('Testing CSS architecture...', 'info');
        
        const cssFiles = [
            'src/styles/main.css',
            'src/styles/accessibility.css',
            'src/styles/advanced-ui-components.css',
            'src/styles/simulations.css'
        ];

        for (const cssFile of cssFiles) {
            if (this.fileExists(cssFile)) {
                this.log(`✓ CSS file exists: ${cssFile}`, 'success');
                
                const content = this.readFile(cssFile);
                if (content) {
                    // Basic CSS validation
                    const braceCount = (content.match(/\{/g) || []).length;
                    const closeBraceCount = (content.match(/\}/g) || []).length;
                    
                    if (braceCount === closeBraceCount) {
                        this.log(`✓ CSS syntax valid: ${cssFile}`, 'success');
                    } else {
                        this.log(`✗ CSS syntax issues: ${cssFile} (mismatched braces)`, 'error');
                    }
                }
            } else {
                this.log(`✗ Missing CSS file: ${cssFile}`, 'error');
            }
        }

        return true;
    }

    testConfigurationFiles() {
        this.log('Testing configuration files...', 'info');
        
        const configFiles = [
            { file: 'vite.config.js', required: true },
            { file: '.eslintrc.json', required: true },
            { file: '.prettierrc.json', required: false },
            { file: '.gitignore', required: false }
        ];

        for (const { file, required } of configFiles) {
            if (this.fileExists(file)) {
                this.log(`✓ Configuration file exists: ${file}`, 'success');
            } else if (required) {
                this.log(`✗ Missing required configuration: ${file}`, 'error');
            } else {
                this.log(`⚠ Optional configuration missing: ${file}`, 'warning');
            }
        }

        return true;
    }

    generateReport() {
        this.log('Generating validation report...', 'info');
        
        const successCount = this.testResults.filter(r => r.type === 'success').length;
        const errorCount = this.testResults.filter(r => r.type === 'error').length;
        const warningCount = this.testResults.filter(r => r.type === 'warning').length;
        const totalTests = this.testResults.length;

        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                total: totalTests,
                success: successCount,
                errors: errorCount,
                warnings: warningCount,
                successRate: Math.round((successCount / totalTests) * 100)
            },
            details: this.testResults
        };

        // Write report to file
        const reportPath = path.join(this.projectRoot, 'validation-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        this.log(`📊 Validation Summary:`, 'info');
        this.log(`   Total tests: ${totalTests}`, 'info');
        this.log(`   Successes: ${successCount}`, 'success');
        this.log(`   Errors: ${errorCount}`, errorCount > 0 ? 'error' : 'info');
        this.log(`   Warnings: ${warningCount}`, warningCount > 0 ? 'warning' : 'info');
        this.log(`   Success rate: ${report.summary.successRate}%`, 'info');
        this.log(`📁 Report saved to: validation-report.json`, 'info');

        return report;
    }

    async run() {
        this.log('🚀 Starting SimulateAI Validation Suite', 'info');
        this.log('==========================================', 'info');

        try {
            // Run all validation tests
            this.testProjectStructure();
            this.testPackageConfiguration();
            this.testCoreModuleIntegration();
            this.testCSSArchitecture();
            this.testConfigurationFiles();

            // Generate final report
            const report = this.generateReport();

            this.log('==========================================', 'info');
            if (report.summary.errors === 0) {
                this.log('🎉 All validation tests passed!', 'success');
                return 0;
            } else {
                this.log(`⚠️  Validation completed with ${report.summary.errors} errors`, 'warning');
                return 1;
            }

        } catch (error) {
            this.log(`💥 Validation suite failed: ${error.message}`, 'error');
            console.error(error);
            return 1;
        }
    }
}

// Run validation suite if called directly
if (require.main === module) {
    const validator = new ValidationSuite();
    validator.run().then(exitCode => {
        process.exit(exitCode);
    });
}

module.exports = ValidationSuite;
