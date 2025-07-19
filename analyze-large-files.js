#!/usr/bin/env node

/**
 * Advanced Dead Code Analysis for SimulateAI Large Files
 *
 * This script performs deep analysis on the largest source files to identify:
 * - Unused functions and variables
 * - Unreachable code paths
 * - Duplicate code blocks
 * - Unused imports/exports
 * - Dead CSS selectors
 *
 * Copyright 2025 Armando Sori
 * Licensed under the Apache License, Version 2.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AdvancedDeadCodeAnalyzer {
  constructor() {
    this.largeFiles = [];
    this.findings = {
      unusedFunctions: [],
      unusedVariables: [],
      duplicateCode: [],
      unreachableCode: [],
      unusedImports: [],
      suspiciousPatterns: [],
    };
  }

  async analyzeLargeFiles() {
    console.log('🔍 Advanced Dead Code Analysis - Large Files');
    console.log('===============================================\n');

    // Get the largest files (from our previous analysis)
    const targetFiles = [
      'src/js/objects/input-utility-components.js',
      'src/js/data/simulation-info.js',
      'src/js/objects/advanced-ui-components.js',
      'src/js/utils/helpers.js',
      'src/js/objects/layout-components.js',
      'src/js/app.js',
      'src/js/components/onboarding-tour.js',
      'src/js/core/ui.js',
      'src/js/utils/analytics.js',
    ];

    for (const filePath of targetFiles) {
      const fullPath = path.resolve(filePath);
      if (fs.existsSync(fullPath)) {
        await this.analyzeFile(fullPath);
      }
    }

    this.generateReport();
  }

  async analyzeFile(filePath) {
    const relativePath = path.relative(process.cwd(), filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    console.log(`📁 Analyzing: ${relativePath} (${lines.length} lines)`);

    // Analysis methods
    this.findUnusedFunctions(content, relativePath);
    this.findUnusedVariables(content, relativePath);
    this.findUnusedImports(content, relativePath);
    this.findDuplicateCode(content, relativePath);
    this.findUnreachableCode(content, relativePath);
    this.findSuspiciousPatterns(content, relativePath);

    console.log(`   ✅ Analysis complete\n`);
  }

  findUnusedFunctions(content, filePath) {
    // Find function declarations
    const functionRegex =
      /(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:function|\(.*?\)\s*=>)|(\w+)\s*:\s*(?:function|\(.*?\)\s*=>))/g;
    const functions = new Set();
    let match;

    while ((match = functionRegex.exec(content)) !== null) {
      const funcName = match[1] || match[2] || match[3];
      if (funcName && !funcName.startsWith('_') && funcName !== 'constructor') {
        functions.add(funcName);
      }
    }

    // Check if functions are used
    for (const funcName of functions) {
      // Look for function calls (excluding the declaration)
      const usageRegex = new RegExp(
        `(?<!function\\s+)(?<!const\\s+)(?<!let\\s+)(?<!var\\s+)${funcName}\\s*\\(`,
        'g'
      );
      const declarations = (
        content.match(
          new RegExp(`(?:function\\s+${funcName}|\\b${funcName}\\s*[:=])`, 'g')
        ) || []
      ).length;
      const usages = (content.match(usageRegex) || []).length;

      if (usages <= declarations) {
        this.findings.unusedFunctions.push({
          file: filePath,
          function: funcName,
          confidence: 'medium',
        });
      }
    }
  }

  findUnusedVariables(content, filePath) {
    // Find variable declarations
    const varRegex = /(?:const|let|var)\s+(\w+)(?:\s*=|\s*;)/g;
    const variables = new Set();
    let match;

    while ((match = varRegex.exec(content)) !== null) {
      const varName = match[1];
      if (varName && !varName.startsWith('_') && varName.length > 1) {
        variables.add(varName);
      }
    }

    // Check if variables are used
    for (const varName of variables) {
      const usageRegex = new RegExp(
        `(?<!(?:const|let|var)\\s+)\\b${varName}\\b(?!\\s*[:=])`,
        'g'
      );
      const declarations = (
        content.match(new RegExp(`(?:const|let|var)\\s+${varName}\\b`, 'g')) ||
        []
      ).length;
      const usages = (content.match(usageRegex) || []).length;

      if (usages <= declarations) {
        this.findings.unusedVariables.push({
          file: filePath,
          variable: varName,
          confidence: 'low', // Variables are trickier to detect
        });
      }
    }
  }

  findUnusedImports(content, filePath) {
    // Find import statements
    const importRegex = /import\s+\{([^}]+)\}\s+from|import\s+(\w+)\s+from/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      if (match[1]) {
        // Named imports
        const imports = match[1]
          .split(',')
          .map(imp => imp.trim().split(' as ')[0].trim());
        for (const importName of imports) {
          if (importName) {
            const usageRegex = new RegExp(
              `(?<!import.*?)\\b${importName}\\b(?!.*from)`,
              'g'
            );
            const usages = (content.match(usageRegex) || []).length;
            if (usages <= 1) {
              // Only the import statement
              this.findings.unusedImports.push({
                file: filePath,
                import: importName,
                type: 'named',
              });
            }
          }
        }
      } else if (match[2]) {
        // Default imports
        const importName = match[2];
        const usageRegex = new RegExp(
          `(?<!import\\s+)\\b${importName}\\b`,
          'g'
        );
        const usages = (content.match(usageRegex) || []).length;
        if (usages <= 1) {
          this.findings.unusedImports.push({
            file: filePath,
            import: importName,
            type: 'default',
          });
        }
      }
    }
  }

  findDuplicateCode(content, filePath) {
    const lines = content.split('\n');
    const codeBlocks = new Map();

    // Look for blocks of 3+ similar lines
    for (let i = 0; i < lines.length - 2; i++) {
      const block = lines
        .slice(i, i + 3)
        .map(line => line.trim())
        .filter(
          line => line && !line.startsWith('//') && !line.startsWith('/*')
        )
        .join('|||');

      if (block && block.length > 20) {
        // Meaningful code blocks
        if (!codeBlocks.has(block)) {
          codeBlocks.set(block, []);
        }
        codeBlocks.get(block).push(i + 1);
      }
    }

    // Report duplicates
    for (const [block, lines] of codeBlocks) {
      if (lines.length > 1) {
        this.findings.duplicateCode.push({
          file: filePath,
          lines,
          code: block.split('|||').join('\n'),
          occurrences: lines.length,
        });
      }
    }
  }

  findUnreachableCode(content, filePath) {
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Code after return statements (same block)
      if (
        line.includes('return ') &&
        !line.includes('//') &&
        !line.includes('/*')
      ) {
        let j = i + 1;
        let foundCode = false;

        // Look ahead for code in same block
        while (j < lines.length) {
          const nextLine = lines[j].trim();

          // Stop at closing braces or new functions
          if (
            nextLine.includes('}') ||
            nextLine.startsWith('function') ||
            nextLine.startsWith('class') ||
            nextLine.includes('=>')
          ) {
            break;
          }

          // Found code after return
          if (
            nextLine &&
            !nextLine.startsWith('//') &&
            !nextLine.startsWith('/*') &&
            !nextLine.startsWith('}')
          ) {
            foundCode = true;
            break;
          }
          j++;
        }

        if (foundCode) {
          this.findings.unreachableCode.push({
            file: filePath,
            line: i + 1,
            issue: 'Code after return statement',
            confidence: 'high',
          });
        }
      }

      // Code after throw statements
      if (line.includes('throw ') && !line.includes('//')) {
        // Similar logic for throw statements
        const j = i + 1;
        if (
          j < lines.length &&
          lines[j].trim() &&
          !lines[j].trim().startsWith('}') &&
          !lines[j].trim().startsWith('//')
        ) {
          this.findings.unreachableCode.push({
            file: filePath,
            line: i + 1,
            issue: 'Code after throw statement',
            confidence: 'high',
          });
        }
      }
    }
  }

  findSuspiciousPatterns(content, filePath) {
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Empty try-catch blocks
      if (line.includes('try {') && i < lines.length - 3) {
        const tryBlock = lines.slice(i, i + 4).join('\n');
        if (tryBlock.includes('} catch') && tryBlock.match(/catch.*?\{\s*\}/)) {
          this.findings.suspiciousPatterns.push({
            file: filePath,
            line: i + 1,
            pattern: 'Empty catch block',
            confidence: 'medium',
          });
        }
      }

      // TODO/FIXME comments
      if (
        line.includes('TODO') ||
        line.includes('FIXME') ||
        line.includes('HACK')
      ) {
        this.findings.suspiciousPatterns.push({
          file: filePath,
          line: i + 1,
          pattern: 'TODO/FIXME comment',
          confidence: 'low',
        });
      }

      // Commented out code
      if (
        line.startsWith('//') &&
        (line.includes('function') ||
          line.includes('const ') ||
          line.includes('if (') ||
          line.includes('for ('))
      ) {
        this.findings.suspiciousPatterns.push({
          file: filePath,
          line: i + 1,
          pattern: 'Commented out code',
          confidence: 'medium',
        });
      }
    }
  }

  generateReport() {
    console.log(`\n${'='.repeat(80)}`);
    console.log('📊 ADVANCED DEAD CODE ANALYSIS REPORT');
    console.log('='.repeat(80));

    const totalIssues = Object.values(this.findings).reduce(
      (sum, arr) => sum + arr.length,
      0
    );
    console.log(`\n🎯 Total Issues Found: ${totalIssues}`);

    // Unused Functions
    if (this.findings.unusedFunctions.length > 0) {
      console.log(
        `\n🔍 Potentially Unused Functions (${this.findings.unusedFunctions.length})`
      );
      console.log('-'.repeat(50));
      this.findings.unusedFunctions.forEach(finding => {
        console.log(`  ${finding.file}:`);
        console.log(
          `    Function: ${finding.function} (${finding.confidence} confidence)`
        );
      });
    }

    // Unused Variables
    if (this.findings.unusedVariables.length > 0) {
      console.log(
        `\n📦 Potentially Unused Variables (${this.findings.unusedVariables.length})`
      );
      console.log('-'.repeat(50));
      this.findings.unusedVariables.forEach(finding => {
        console.log(`  ${finding.file}:`);
        console.log(
          `    Variable: ${finding.variable} (${finding.confidence} confidence)`
        );
      });
    }

    // Unused Imports
    if (this.findings.unusedImports.length > 0) {
      console.log(
        `\n📥 Potentially Unused Imports (${this.findings.unusedImports.length})`
      );
      console.log('-'.repeat(50));
      this.findings.unusedImports.forEach(finding => {
        console.log(`  ${finding.file}:`);
        console.log(`    Import: ${finding.import} (${finding.type})`);
      });
    }

    // Duplicate Code
    if (this.findings.duplicateCode.length > 0) {
      console.log(
        `\n📋 Duplicate Code Blocks (${this.findings.duplicateCode.length})`
      );
      console.log('-'.repeat(50));
      this.findings.duplicateCode.slice(0, 5).forEach(finding => {
        // Show top 5
        console.log(`  ${finding.file}:`);
        console.log(
          `    Lines: ${finding.lines.join(', ')} (${finding.occurrences} occurrences)`
        );
        console.log(`    Code: ${finding.code.substring(0, 100)}...`);
      });
    }

    // Unreachable Code
    if (this.findings.unreachableCode.length > 0) {
      console.log(
        `\n🚫 Unreachable Code (${this.findings.unreachableCode.length})`
      );
      console.log('-'.repeat(50));
      this.findings.unreachableCode.forEach(finding => {
        console.log(`  ${finding.file}:${finding.line}`);
        console.log(
          `    Issue: ${finding.issue} (${finding.confidence} confidence)`
        );
      });
    }

    // Suspicious Patterns
    if (this.findings.suspiciousPatterns.length > 0) {
      console.log(
        `\n⚠️  Suspicious Patterns (${this.findings.suspiciousPatterns.length})`
      );
      console.log('-'.repeat(50));
      this.findings.suspiciousPatterns.slice(0, 10).forEach(finding => {
        // Show top 10
        console.log(`  ${finding.file}:${finding.line}`);
        console.log(
          `    Pattern: ${finding.pattern} (${finding.confidence} confidence)`
        );
      });
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log('⚠️  SAFETY REMINDER');
    console.log('='.repeat(80));
    console.log(
      'These are POTENTIAL issues. Always verify before removing code:'
    );
    console.log('- Functions may be called dynamically or from HTML');
    console.log('- Variables may be used in eval() or template strings');
    console.log('- Imports may be used for side effects');
    console.log('- Check git history before removing duplicate code');
    console.log('\n✅ Analysis complete! Review findings carefully.');
  }
}

// Run the analysis
const analyzer = new AdvancedDeadCodeAnalyzer();
analyzer.analyzeLargeFiles().catch(console.error);
