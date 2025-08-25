#!/usr/bin/env node

/**
 * Magic Number Extractor for SimulateAI
 *
 * This script identifies magic numbers in JavaScript files and suggests
 * constant extractions for better code maintainability.
 *
 * Copyright 2025 Armando Sori
 * Licensed under the Apache License, Version 2.0
 */

import fs from 'fs';
import path from 'path';

const MAGIC_NUMBER_PATTERNS = {
  // Timing values (milliseconds)
  timing: /\b(?:setTimeout|setInterval)\s*\(\s*[^,]+,\s*(\d{2,})\s*\)/g,

  // Z-index values
  zIndex: /z-index:\s*(\d{3,})/g,

  // Numeric literals (2+ digits) not in specific contexts
  general: /\b(\d{2,})\b/g,

  // Percentage values
  percentage: /(\d{2,})%/g,

  // Pixel values
  pixels: /(\d{2,})px/g,

  // Version numbers (exclude these)
  version: /v?\d+\.\d+\.\d+/g,

  // URLs (exclude these)
  urls: /https?:\/\/[^\s'"]+/g,
};

const EXCLUDE_PATTERNS = [
  // Common acceptable numbers
  /\b(10|20|24|60|100|255)\b/,

  // Array indices and lengths
  /\[\s*\d+\s*\]/,

  // HTTP status codes
  /\b(200|201|400|401|403|404|500)\b/,

  // Already defined constants
  /const\s+\w+\s*=\s*\d+/,

  // Function parameters with numbers
  /function\s*\([^)]*\d+[^)]*\)/,

  // Comments
  /\/\/.*?\d+.*?$/,
  /\/\*[\s\S]*?\d+[\s\S]*?\*\//,
];

class MagicNumberExtractor {
  constructor() {
    this.findings = [];
    this.suggestions = new Map();
  }

  analyzeFile(filePath) {
    if (!fs.existsSync(filePath) || !filePath.endsWith('.js')) {
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    console.log(`\n🔍 Analyzing: ${path.relative(process.cwd(), filePath)}`);

    lines.forEach((line, index) => {
      this.analyzeLine(line, index + 1, filePath);
    });
  }

  analyzeLine(line, lineNumber, filePath) {
    // Skip if line is a comment or already has constants
    if (this.shouldSkipLine(line)) {
      return;
    }

    // Find timing values (setTimeout/setInterval)
    const timingMatches = [...line.matchAll(MAGIC_NUMBER_PATTERNS.timing)];
    timingMatches.forEach(match => {
      const value = parseInt(match[1]);
      if (value >= 100) {
        // Only flag significant delays
        this.addFinding(
          filePath,
          lineNumber,
          line.trim(),
          value,
          'TIMING',
          this.suggestTimingConstant(value)
        );
      }
    });

    // Find z-index values
    const zIndexMatches = [...line.matchAll(MAGIC_NUMBER_PATTERNS.zIndex)];
    zIndexMatches.forEach(match => {
      const value = parseInt(match[1]);
      this.addFinding(
        filePath,
        lineNumber,
        line.trim(),
        value,
        'Z_INDEX',
        this.suggestZIndexConstant(value)
      );
    });

    // Find general numeric literals
    const generalMatches = [...line.matchAll(MAGIC_NUMBER_PATTERNS.general)];
    generalMatches.forEach(match => {
      const value = parseInt(match[1]);

      // Skip common acceptable numbers
      if (this.isAcceptableNumber(value, line)) {
        return;
      }

      const context = this.inferContext(line, value);
      if (context.type !== 'SKIP') {
        this.addFinding(
          filePath,
          lineNumber,
          line.trim(),
          value,
          context.type,
          context.suggestion
        );
      }
    });
  }

  shouldSkipLine(line) {
    const trimmed = line.trim();
    return (
      trimmed.startsWith('//') ||
      trimmed.startsWith('/*') ||
      trimmed.includes('const ') ||
      trimmed.includes('VITE_') ||
      trimmed.includes('firebase') ||
      /version|url|http/i.test(trimmed)
    );
  }

  isAcceptableNumber(value, line) {
    // Common acceptable numbers
    const acceptable = [0, 1, 2, 10, 20, 24, 60, 100, 255];
    if (acceptable.includes(value)) return true;

    // Array indices
    if (line.includes(`[${value}]`)) return true;

    // HTTP status codes
    if (value >= 200 && value <= 599 && line.includes(value.toString()))
      return true;

    return false;
  }

  inferContext(line, value) {
    // Timing related
    if (
      line.includes('timeout') ||
      line.includes('delay') ||
      line.includes('ms')
    ) {
      return {
        type: 'TIMING',
        suggestion: this.suggestTimingConstant(value),
      };
    }

    // Dimensions
    if (
      line.includes('width') ||
      line.includes('height') ||
      line.includes('size')
    ) {
      return {
        type: 'DIMENSION',
        suggestion: this.suggestDimensionConstant(value, line),
      };
    }

    // Breakpoints
    if (line.includes('innerWidth') || line.includes('breakpoint')) {
      return {
        type: 'BREAKPOINT',
        suggestion: this.suggestBreakpointConstant(value),
      };
    }

    // Limits/thresholds
    if (
      line.includes('max') ||
      line.includes('limit') ||
      line.includes('threshold')
    ) {
      return {
        type: 'LIMIT',
        suggestion: this.suggestLimitConstant(value, line),
      };
    }

    // Skip if no clear context
    return { type: 'SKIP' };
  }

  suggestTimingConstant(value) {
    if (value >= 10000) return `LONG_DELAY_MS = ${value}`;
    if (value >= 1000) return `DELAY_MS = ${value}`;
    if (value >= 100) return `THROTTLE_MS = ${value}`;
    return `TIMING_MS = ${value}`;
  }

  suggestZIndexConstant(value) {
    if (value >= 10000) return `Z_INDEX_MAXIMUM = ${value}`;
    if (value >= 9000) return `Z_INDEX_MODAL = ${value}`;
    if (value >= 1000) return `Z_INDEX_DROPDOWN = ${value}`;
    return `Z_INDEX_BASE = ${value}`;
  }

  suggestDimensionConstant(value, line) {
    if (line.includes('width')) return `WIDTH_${value} = ${value}`;
    if (line.includes('height')) return `HEIGHT_${value} = ${value}`;
    return `DIMENSION_${value} = ${value}`;
  }

  suggestBreakpointConstant(value) {
    if (value <= 480) return `MOBILE_BREAKPOINT = ${value}`;
    if (value <= 768) return `TABLET_BREAKPOINT = ${value}`;
    if (value <= 1024) return `DESKTOP_BREAKPOINT = ${value}`;
    return `LARGE_SCREEN_BREAKPOINT = ${value}`;
  }

  suggestLimitConstant(value, line) {
    const context = line.toLowerCase();
    if (context.includes('hour')) return `MAX_HOURS = ${value}`;
    if (context.includes('day')) return `MAX_DAYS = ${value}`;
    if (context.includes('scenario')) return `MAX_SCENARIOS = ${value}`;
    return `MAX_LIMIT = ${value}`;
  }

  addFinding(filePath, lineNumber, line, value, type, suggestion) {
    this.findings.push({
      file: path.relative(process.cwd(), filePath),
      line: lineNumber,
      code: line,
      value,
      type,
      suggestion,
    });

    console.log(`  📍 Line ${lineNumber}: ${type} = ${value}`);
    console.log(`     💡 Suggest: const ${suggestion}`);
    console.log(`     📝 ${line}`);
  }

  generateReport() {
    const groupedFindings = this.groupByType();

    console.log(`\n${'='.repeat(80)}`);
    console.log('🎯 MAGIC NUMBER EXTRACTION REPORT');
    console.log('='.repeat(80));

    console.log(`\n📊 Summary: ${this.findings.length} magic numbers found`);

    Object.entries(groupedFindings).forEach(([type, findings]) => {
      console.log(`\n📁 ${type} (${findings.length} instances)`);
      console.log('-'.repeat(50));

      findings.forEach(finding => {
        console.log(`${finding.file}:${finding.line}`);
        console.log(`  Value: ${finding.value}`);
        console.log(`  Suggestion: const ${finding.suggestion}`);
        console.log(`  Code: ${finding.code}`);
        console.log('');
      });
    });

    this.generateConstants();
  }

  groupByType() {
    const grouped = {};
    this.findings.forEach(finding => {
      if (!grouped[finding.type]) {
        grouped[finding.type] = [];
      }
      grouped[finding.type].push(finding);
    });
    return grouped;
  }

  generateConstants() {
    console.log(`\n${'='.repeat(80)}`);
    console.log('🛠️  SUGGESTED CONSTANTS FILE');
    console.log('='.repeat(80));

    const constantsContent = this.generateConstantsContent();
    console.log(constantsContent);

    // Write to file
    fs.writeFileSync('MAGIC_NUMBERS_CONSTANTS.js', constantsContent);
    console.log('\n✅ Constants file written to: MAGIC_NUMBERS_CONSTANTS.js');
  }

  generateConstantsContent() {
    const grouped = this.groupByType();
    let content = `/**
 * Magic Number Constants for SimulateAI
 * Generated by Magic Number Extractor
 * 
 * This file contains extracted magic numbers converted to named constants
 * for better code maintainability and readability.
 */

`;

    Object.entries(grouped).forEach(([type, findings]) => {
      content += `// ${type} Constants\n`;

      const uniqueConstants = new Set();
      findings.forEach(finding => {
        uniqueConstants.add(`const ${finding.suggestion};`);
      });

      uniqueConstants.forEach(constant => {
        content += `${constant}\n`;
      });

      content += '\n';
    });

    content += `export {
  // Add your exported constants here
  // Example: THROTTLE_MS, Z_INDEX_MODAL, MOBILE_BREAKPOINT
};
`;

    return content;
  }
}

// Main execution
function main() {
  const extractor = new MagicNumberExtractor();

  // Files to analyze (prioritize the ones with most magic numbers)
  const filesToAnalyze = [
    'src/js/components/shared-navigation.js',
    'src/js/services/pwa-service.js',
    'src/js/enhanced-profile.js',
    'src/js/fcm-main-app.js',
  ];

  console.log('🚀 Starting Magic Number Extraction...');

  filesToAnalyze.forEach(file => {
    extractor.analyzeFile(file);
  });

  extractor.generateReport();

  console.log('\n🎉 Magic number analysis complete!');
  console.log('📋 Review the suggestions and update your code accordingly.');
}

main();
