#!/usr/bin/env node

/**
 * SimulateAI Component Verification Script
 * Verifies all components are properly implemented and registered
 * Updated to reflect NO HTML GENERATION POLICY
 */

const fs = require('fs');
const path = require('path');

// Component categories and their expected components
const COMPONENT_CATEGORIES = {
    'Interactive Objects': {
        file: 'src/js/objects/interactive-objects.js',
        components: ['Button', 'Slider', 'Meter', 'Label']
    },
    'Enhanced Objects': {
        file: 'src/js/objects/enhanced-objects.js',
        components: ['InteractiveObject', 'EthicsMeter', 'InteractiveButton', 'InteractiveSlider']
    },
    'Advanced UI Components': {
        file: 'src/js/objects/advanced-ui-components.js',
        components: ['ModalDialog', 'NavigationMenu', 'Chart', 'FormField', 'Tooltip']
    },
    'Priority Components': {
        file: 'src/js/objects/priority-components.js',
        components: ['DataTable', 'NotificationToast', 'LoadingSpinner']
    },
    'Layout Components': {
        file: 'src/js/objects/layout-components.js',
        components: ['TabContainer', 'ProgressStepper', 'SplitPane', 'TreeView', 'FileUpload']
    },
    'Input & Utility Components': {
        file: 'src/js/objects/input-utility-components.js',
        components: ['ColorPicker', 'Accordion', 'DateTimePicker', 'NumberInput', 'Drawer', 'SearchBox']
    }
};

// Expected core files
const CORE_FILES = [
    'src/js/core/visual-engine.js',
    'README.md',
    'package.json',
    'NO_HTML_GENERATION_POLICY.md',
    'docs/DEVELOPER_GUIDE.md'
];

// Demo and test files (JavaScript only - no HTML generation)
const DEMO_TEST_FILES = [
    'src/js/demos/visual-engine-demo.js',
    'src/js/demos/advanced-ui-demo.js',
    'src/js/demos/priority-components-demo.js',
    'src/js/demos/layout-components-demo.js',
    'src/js/demos/input-utility-demo.js',
    'tests/ui-components-test.js',
    'tests/priority-components-test.js',
    'tests/layout-components-test.js',
    'tests/input-utility-components-test.js'
];

// CSS files
const CSS_FILES = [
    'src/styles/advanced-ui-components.css',
    'src/styles/priority-components.css',
    'src/styles/layout-components.css',
    'src/styles/input-utility-components.css'
];

// Existing HTML files (legacy - no new ones should be created)
const LEGACY_HTML_FILES = [
    'demo.html',
    'index.html',
    'advanced-ui-demo.html',
    'layout-components-demo.html',
    'input-utility-demo.html'
];

console.log('🔍 SimulateAI Component Verification');
console.log('=====================================\n');

// Check policy compliance
console.log('📋 Policy Compliance Check');
console.log('---------------------------');
checkPolicyCompliance();

// Verify core files
console.log('\n📁 Core Files Verification');
console.log('---------------------------');
checkCoreFiles();

// Verify component implementations
console.log('\n🧩 Component Implementation Check');
console.log('----------------------------------');
checkComponentImplementations();

// Verify demos and tests (JavaScript only)
console.log('\n🎮 Demo & Test Files Check');
console.log('---------------------------');
checkDemoTestFiles();

// Verify CSS files
console.log('\n🎨 CSS Files Check');
console.log('------------------');
checkCSSFiles();

// Verify legacy HTML files (should exist but no new ones)
console.log('\n📄 Legacy HTML Files Check');
console.log('---------------------------');
checkLegacyHTMLFiles();

// Registry verification
console.log('\n🗂️  Component Registry Check');
console.log('-----------------------------');
checkComponentRegistry();

// Summary and policy reminder
console.log('\n✅ Verification Complete!');
console.log('=========================');
console.log('📋 IMPORTANT POLICY REMINDER:');
console.log('   ❌ NO new HTML demo files should be created');
console.log('   ❌ NO new HTML test files should be created');
console.log('   ✅ Create JavaScript demos integrated with existing systems');
console.log('   ✅ Create JavaScript test suites');
console.log('   ✅ Update existing HTML demos if needed');
console.log('\n📖 See NO_HTML_GENERATION_POLICY.md for complete details');
console.log('🛠️  See docs/DEVELOPER_GUIDE.md for development workflow');

function checkPolicyCompliance() {
    const policyFile = 'NO_HTML_GENERATION_POLICY.md';
    const developerGuide = 'docs/DEVELOPER_GUIDE.md';
    
    if (fs.existsSync(policyFile)) {
        console.log('✅ Policy document exists');
    } else {
        console.log('❌ Policy document missing');
    }
    
    if (fs.existsSync(developerGuide)) {
        console.log('✅ Developer guide exists');
    } else {
        console.log('❌ Developer guide missing');
    }
}

function checkCoreFiles() {
    CORE_FILES.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`✅ ${file}`);
        } else {
            console.log(`❌ ${file}`);
        }
    });
}

function checkComponentImplementations() {
    Object.entries(COMPONENT_CATEGORIES).forEach(([category, config]) => {
        console.log(`\n${category}:`);
        
        if (fs.existsSync(config.file)) {
            console.log(`  ✅ Implementation file: ${config.file}`);
            
            const content = fs.readFileSync(config.file, 'utf8');
            config.components.forEach(component => {
                if (content.includes(`class ${component}`) || content.includes(`export class ${component}`)) {
                    console.log(`    ✅ ${component} class found`);
                } else {
                    console.log(`    ❌ ${component} class missing`);
                }
            });
        } else {
            console.log(`  ❌ Implementation file missing: ${config.file}`);
        }
    });
}

function checkDemoTestFiles() {
    console.log('JavaScript Demo & Test Files:');
    DEMO_TEST_FILES.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`  ✅ ${file}`);
        } else {
            console.log(`  ❌ ${file}`);
        }
    });
}

function checkCSSFiles() {
    CSS_FILES.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`✅ ${file}`);
        } else {
            console.log(`❌ ${file}`);
        }
    });
}

function checkLegacyHTMLFiles() {
    console.log('Legacy HTML Files (should exist but no new ones created):');
    LEGACY_HTML_FILES.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`  ✅ ${file} (legacy)`);
        } else {
            console.log(`  ⚠️  ${file} (legacy file missing)`);
        }
    });
}

function checkComponentRegistry() {
    const engineFile = 'src/js/core/visual-engine.js';
    
    if (fs.existsSync(engineFile)) {
        console.log('✅ Visual Engine file exists');
        
        const content = fs.readFileSync(engineFile, 'utf8');
        
        // Check for registry-related code
        if (content.includes('registerComponent') && content.includes('createComponent')) {
            console.log('✅ Component registry methods found');
        } else {
            console.log('❌ Component registry methods missing');
        }
        
        // Check for component imports
        const expectedImports = [
            'advanced-ui-components',
            'priority-components', 
            'layout-components',
            'input-utility-components'
        ];
        
        expectedImports.forEach(importName => {
            if (content.includes(importName)) {
                console.log(`✅ ${importName} import found`);
            } else {
                console.log(`❌ ${importName} import missing`);
            }
        });
    } else {
        console.log('❌ Visual Engine file missing');
    }
}
