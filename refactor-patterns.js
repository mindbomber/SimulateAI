#!/usr/bin/env node

/**
 * Refactoring Script - Phase 2: Replace Duplicate Patterns
 *
 * This script identifies and replaces duplicate validation patterns
 * with calls to our new consolidated utility modules.
 *
 * Copyright 2025 Armando Sori
 * Licensed under the Apache License, Version 2.0
 */

import fs from 'fs';
import path from 'path';

class PatternRefactorer {
  constructor() {
    this.refactoredCount = 0;
    this.patternsFound = [];
  }

  async refactorValidationPatterns() {
    console.log('🔄 Phase 2: Refactoring Duplicate Validation Patterns');
    console.log('='.repeat(60));

    // Target files with the most duplication
    const targetFiles = [
      'src/js/utils/helpers.js',
      'src/js/objects/input-utility-components.js',
      'src/js/objects/advanced-ui-components.js',
    ];

    for (const filePath of targetFiles) {
      if (fs.existsSync(filePath)) {
        await this.refactorFile(filePath);
      }
    }

    this.generateRefactoringReport();
  }

  async refactorFile(filePath) {
    console.log(`\\n📁 Refactoring patterns in: ${filePath}`);

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Pattern 1: Array validation pattern
    content = this.refactorArrayValidation(content, filePath);

    // Pattern 2: String validation pattern
    content = this.refactorStringValidation(content, filePath);

    // Pattern 3: Object property safety pattern
    content = this.refactorObjectAccess(content, filePath);

    // Pattern 4: Canvas context patterns (if applicable)
    if (filePath.includes('input-utility-components')) {
      content = this.refactorCanvasPatterns(content, filePath);
    }

    // Only write if changes were made
    if (content !== originalContent) {
      // Add import for new utilities at the top
      content = this.addUtilityImports(content, filePath);

      fs.writeFileSync(filePath, content);
      console.log(`  ✅ Refactored patterns in ${filePath}`);
    } else {
      console.log(`  ℹ️  No patterns to refactor in ${filePath}`);
    }
  }

  refactorArrayValidation(content, filePath) {
    let refactored = content;

    // Pattern: if (!Array.isArray(array) || array.length === 0) return default;
    const arrayValidationPattern =
      /if\s*\(\s*!\s*Array\.isArray\s*\(\s*(\w+)\s*\)\s*\|\|\s*\1\.length\s*===\s*0\s*\)\s*return\s*([^;]+);/g;

    refactored = refactored.replace(
      arrayValidationPattern,
      (match, arrayName, defaultValue) => {
        this.patternsFound.push({
          file: filePath,
          pattern: 'Array validation',
          original: match,
          replacement: `const ${arrayName}Validation = ValidationUtils.validateArray(${arrayName}, { allowEmpty: false });\\n    if (!${arrayName}Validation.isValid) return ${defaultValue};\\n    const ${arrayName} = ${arrayName}Validation.value;`,
        });

        return `const ${arrayName}Validation = ValidationUtils.validateArray(${arrayName}, { allowEmpty: false });
    if (!${arrayName}Validation.isValid) return ${defaultValue};`;
      }
    );

    return refactored;
  }

  refactorStringValidation(content, filePath) {
    let refactored = content;

    // Pattern: typeof value !== 'string' checks
    const stringTypePattern =
      /if\s*\(\s*typeof\s+(\w+)\s*!==\s*['"']string['"']\s*\)\s*return\s*([^;]+);/g;

    refactored = refactored.replace(
      stringTypePattern,
      (match, varName, defaultValue) => {
        this.patternsFound.push({
          file: filePath,
          pattern: 'String type validation',
          original: match,
          replacement: `const ${varName}Validation = ValidationUtils.validateString(${varName});\\n    if (!${varName}Validation.isValid) return ${defaultValue};`,
        });

        return `const ${varName}Validation = ValidationUtils.validateString(${varName});
    if (!${varName}Validation.isValid) return ${defaultValue};`;
      }
    );

    return refactored;
  }

  refactorObjectAccess(content, filePath) {
    let refactored = content;

    // Pattern: obj && obj.property && obj.property.subProperty
    const safeAccessPattern = /(\w+)\s*&&\s*\1\.(\w+)\s*&&\s*\1\.\2\.(\w+)/g;

    refactored = refactored.replace(
      safeAccessPattern,
      (match, objName, prop1, prop2) => {
        this.patternsFound.push({
          file: filePath,
          pattern: 'Safe object access',
          original: match,
          replacement: `TypeUtils.safeGet(${objName}, '${prop1}.${prop2}')`,
        });

        return `TypeUtils.safeGet(${objName}, '${prop1}.${prop2}')`;
      }
    );

    return refactored;
  }

  refactorCanvasPatterns(content, filePath) {
    let refactored = content;

    // Pattern: ctx.fillStyle = ComponentTheme.getColor(...)
    const canvasStylePattern =
      /(\w+)\.fillStyle\s*=\s*ComponentTheme\.getColor\s*\(\s*['"']([^'"']+)['"']\s*,\s*([^)]+)\s*\);/g;

    refactored = refactored.replace(
      canvasStylePattern,
      (match, ctxName, colorKey, themeVar) => {
        this.patternsFound.push({
          file: filePath,
          pattern: 'Canvas theme styling',
          original: match,
          replacement: `CanvasRenderer.applyThemeStyles(${ctxName}, ${themeVar}, { fillColor: '${colorKey}' });`,
        });

        return `CanvasRenderer.applyThemeStyles(${ctxName}, ${themeVar}, { fillColor: '${colorKey}' });`;
      }
    );

    return refactored;
  }

  addUtilityImports(content, filePath) {
    // Check what utilities we need to import
    const needsValidation =
      content.includes('ValidationUtils') || content.includes('TypeUtils');
    const needsCanvas = content.includes('CanvasRenderer');

    if (!needsValidation && !needsCanvas) {
      return content;
    }

    let imports = '';

    if (needsValidation) {
      imports +=
        "import { ValidationUtils, TypeUtils } from '../utils/validation-utils.js';\\n";
    }

    if (needsCanvas) {
      imports += "import CanvasRenderer from '../utils/canvas-renderer.js';\\n";
    }

    // Find the last import statement and add our imports after it
    const importRegex = /^import.*?;$/gm;
    const importMatches = [...content.matchAll(importRegex)];

    if (importMatches.length > 0) {
      const lastImport = importMatches[importMatches.length - 1];
      const insertPoint = lastImport.index + lastImport[0].length;

      return `${content.slice(0, insertPoint)}\\n${imports}${content.slice(insertPoint)}`;
    } else {
      // No existing imports, add at the top after license header
      const licenseEndPattern = /\*\//;
      const licenseMatch = content.match(licenseEndPattern);

      if (licenseMatch) {
        const insertPoint = licenseMatch.index + licenseMatch[0].length;
        return `${content.slice(0, insertPoint)}\\n\\n${imports}${content.slice(insertPoint)}`;
      } else {
        return `${imports}\\n${content}`;
      }
    }
  }

  generateRefactoringReport() {
    console.log(`\\n${'='.repeat(80)}`);
    console.log('📊 REFACTORING REPORT - PHASE 2');
    console.log('='.repeat(80));

    console.log(`\\n🎯 Patterns Refactored: ${this.patternsFound.length}`);

    // Group by pattern type
    const patternGroups = {};
    this.patternsFound.forEach(pattern => {
      if (!patternGroups[pattern.pattern]) {
        patternGroups[pattern.pattern] = [];
      }
      patternGroups[pattern.pattern].push(pattern);
    });

    Object.entries(patternGroups).forEach(([patternType, instances]) => {
      console.log(`\\n🔧 ${patternType} (${instances.length} instances)`);
      console.log('-'.repeat(50));

      instances.slice(0, 3).forEach(instance => {
        // Show first 3 examples
        console.log(`  File: ${instance.file}`);
        console.log(`  Before: ${instance.original.substring(0, 80)}...`);
        console.log(`  After:  ${instance.replacement.substring(0, 80)}...`);
        console.log('');
      });

      if (instances.length > 3) {
        console.log(`  ... and ${instances.length - 3} more instances`);
      }
    });

    console.log(`\\n${'='.repeat(80)}`);
    console.log('✅ PHASE 2 COMPLETE');
    console.log('='.repeat(80));
    console.log('\\n🎯 BENEFITS:');
    console.log('- Reduced code duplication');
    console.log('- Improved maintainability');
    console.log('- Standardized validation patterns');
    console.log('- Better error handling consistency');
    console.log(
      '\\n🔄 NEXT: Test application to ensure all refactored patterns work correctly'
    );
  }
}

// Run the refactoring
const refactorer = new PatternRefactorer();
refactorer.refactorValidationPatterns().catch(console.error);
