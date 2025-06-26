#!/usr/bin/env node

/**
 * Automated Console Statement Replacement Script
 * Replaces console statements with logger calls in specific files
 */

const fs = require('fs');
const path = require('path');

// Define the files to process (high-impact files first)
const targetFiles = [
    'src/js/core/accessibility.js',
    'src/js/core/animation-manager.js', 
    'src/js/core/engine.js',
    'src/js/core/input-manager.js',
    'src/js/core/ui.js',
    'src/js/utils/analytics.js',
    'src/js/utils/canvas-manager.js',
    'src/js/utils/helpers.js',
    'src/js/utils/storage.js',
    'src/js/utils/simple-analytics.js',
    'src/js/utils/simple-storage.js'
];

// Mapping of console methods to logger methods with context
const consoleReplacements = [
    {
        pattern: /console\.error\((.*?)\);/g,
        replacement: (match, args) => `logger.error('${getContextFromFile()}', ${args});`
    },
    {
        pattern: /console\.warn\((.*?)\);/g,
        replacement: (match, args) => `logger.warn('${getContextFromFile()}', ${args});`
    },
    {
        pattern: /console\.log\((.*?)\);/g,
        replacement: (match, args) => `logger.info('${getContextFromFile()}', ${args});`
    },
    {
        pattern: /console\.info\((.*?)\);/g,
        replacement: (match, args) => `logger.info('${getContextFromFile()}', ${args});`
    },
    {
        pattern: /console\.debug\((.*?)\);/g,
        replacement: (match, args) => `logger.debug('${getContextFromFile()}', ${args});`
    }
];

// Context mapping for different files
const contextMap = {
    'accessibility.js': 'Accessibility',
    'animation-manager.js': 'Animation',
    'engine.js': 'Engine',
    'input-manager.js': 'Input',
    'ui.js': 'UI',
    'analytics.js': 'Analytics',
    'canvas-manager.js': 'Canvas',
    'helpers.js': 'Helpers',
    'storage.js': 'Storage',
    'simple-analytics.js': 'SimpleAnalytics',
    'simple-storage.js': 'SimpleStorage'
};

let currentFile = '';

function getContextFromFile() {
    const fileName = path.basename(currentFile);
    return contextMap[fileName] || 'App';
}

function hasLoggerImport(content) {
    return content.includes("import logger from '../utils/logger.js'") ||
           content.includes("import logger from './logger.js'");
}

function addLoggerImport(content, filePath) {
    // Determine the correct import path based on file location
    const relativePath = path.relative(path.dirname(filePath), 'src/js/utils/logger.js');
    const importPath = relativePath.startsWith('.') ? relativePath : './' + relativePath;
    
    // Find the last import statement
    const lines = content.split('\n');
    let lastImportIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import ') && lines[i].includes('from ')) {
            lastImportIndex = i;
        }
    }
    
    if (lastImportIndex >= 0) {
        lines.splice(lastImportIndex + 1, 0, `import logger from '${importPath}';`);
    } else {
        // Add at the beginning if no imports found
        lines.unshift(`import logger from '${importPath}';`);
    }
    
    return lines.join('\n');
}

function processFile(filePath) {
    try {
        console.log(`Processing: ${filePath}`);
        currentFile = filePath;
        
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Check if file has console statements
        if (!content.includes('console.')) {
            console.log(`  No console statements found, skipping.`);
            return;
        }
        
        // Add logger import if not present
        if (!hasLoggerImport(content)) {
            content = addLoggerImport(content, filePath);
            modified = true;
        }
        
        // Apply console replacements
        for (const replacement of consoleReplacements) {
            const originalContent = content;
            content = content.replace(replacement.pattern, replacement.replacement);
            if (content !== originalContent) {
                modified = true;
            }
        }
        
        // Save the file if modified
        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`  ✅ Updated successfully`);
        } else {
            console.log(`  No changes needed`);
        }
        
    } catch (error) {
        console.error(`  ❌ Error processing ${filePath}:`, error.message);
    }
}

// Main execution
console.log('🚀 Starting automated console statement replacement...\n');

for (const file of targetFiles) {
    const fullPath = path.resolve(file);
    if (fs.existsSync(fullPath)) {
        processFile(fullPath);
    } else {
        console.log(`⚠️  File not found: ${file}`);
    }
}

console.log('\n✨ Console statement replacement completed!');
console.log('📝 Run "npm run lint" to check the results.');
