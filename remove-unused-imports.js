#!/usr/bin/env node

/**
 * Safe Dead Code Removal - Phase 1: Unused Imports
 * 
 * This script safely removes unused imports that were identified
 * by our advanced analysis with high confidence.
 * 
 * Copyright 2025 Armando Sori
 * Licensed under the Apache License, Version 2.0
 */

import fs from 'fs';
import path from 'path';

class SafeDeadCodeRemover {
  constructor() {
    this.removedCount = 0;
    this.backupCreated = false;
  }

  createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = `backup-before-dead-code-cleanup-${timestamp}`;
    
    // Create backup directory
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Copy key files to backup
    const filesToBackup = [
      'src/js/app.js',
      'src/js/components/onboarding-tour.js'
    ];

    for (const file of filesToBackup) {
      if (fs.existsSync(file)) {
        const backupPath = path.join(backupDir, file);
        const backupDirPath = path.dirname(backupPath);
        
        if (!fs.existsSync(backupDirPath)) {
          fs.mkdirSync(backupDirPath, { recursive: true });
        }
        
        fs.copyFileSync(file, backupPath);
        console.log(`✅ Backed up: ${file} -> ${backupPath}`);
      }
    }

    this.backupCreated = true;
    console.log(`📦 Backup created in: ${backupDir}\n`);
  }

  removeUnusedImports() {
    console.log('🔍 Phase 1: Removing Unused Imports (High Confidence)');
    console.log('='.repeat(60));

    if (!this.backupCreated) {
      this.createBackup();
    }

    // Remove unused imports from app.js
    this.cleanAppJsImports();
    
    // Remove unused imports from onboarding-tour.js  
    this.cleanOnboardingTourImports();

    console.log(`\n✅ Phase 1 Complete: ${this.removedCount} unused imports removed`);
    console.log('🧪 Testing build after import cleanup...\n');
  }

  cleanAppJsImports() {
    const filePath = 'src/js/app.js';
    console.log(`📁 Cleaning unused imports in: ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    let removed = 0;

    // List of definitely unused imports based on our analysis
    const unusedImports = [
      'import EthicsSimulation from \\'./core/simulation.js\\';',
      'import AccessibilityManager from \\'./core/accessibility.js\\';', 
      'import AnimationManager from \\'./core/animation-manager.js\\';',
      'import EducatorToolkit from \\'./core/educator-toolkit.js\\';',
      'import DigitalScienceLab from \\'./core/digital-science-lab.js\\';',
      'import ScenarioGenerator from \\'./core/scenario-generator.js\\';',
      'import focusManager from \\'./utils/focus-manager.js\\';',
      'import PreLaunchModal from \\'./components/pre-launch-modal.js\\';',
      'import { EnhancedSimulationModal } from \\'./components/enhanced-simulation-modal.js\\';',
      'import { PostSimulationModal } from \\'./components/post-simulation-modal.js\\';',
      'import ModalFooterManager from \\'./components/modal-footer-manager.js\\';',
      'import RadarChart from \\'./components/radar-chart.js\\';',
      'import MCPIntegrationManager from \\'./integrations/mcp-integration-manager.js\\';'
    ];

    // Remove commented import too
    const commentedImports = [
      '// import { EthicsMeter, InteractiveButton, InteractiveSlider } from \\'./objects/enhanced-objects.js\\';',
      '// import AuthService from \\'./services/auth-service.js\\'; // Now handled by ServiceManager'
    ];

    // Remove each unused import
    for (const importLine of unusedImports) {
      if (content.includes(importLine)) {
        content = content.replace(importLine + '\\n', '');
        removed++;
        console.log(`  ❌ Removed: ${importLine.substring(0, 50)}...`);
      }
    }

    // Remove commented imports
    for (const commentLine of commentedImports) {
      if (content.includes(commentLine)) {
        content = content.replace(commentLine + '\\n', '');
        removed++;
        console.log(`  ❌ Removed comment: ${commentLine.substring(0, 50)}...`);
      }
    }

    // Write cleaned content
    fs.writeFileSync(filePath, content);
    this.removedCount += removed;
    console.log(`  ✅ Removed ${removed} unused imports from app.js`);
  }

  cleanOnboardingTourImports() {
    const filePath = 'src/js/components/onboarding-tour.js';
    console.log(`\\n📁 Cleaning unused imports in: ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    let removed = 0;

    // Unused imports in onboarding-tour.js
    const unusedImports = [
      'import focusManager from \\'../utils/focus-manager.js\\';',
      'import scrollManager from \\'../utils/scroll-manager.js\\';'
    ];

    // Remove each unused import
    for (const importLine of unusedImports) {
      if (content.includes(importLine)) {
        content = content.replace(importLine + '\\n', '');
        removed++;
        console.log(`  ❌ Removed: ${importLine}`);
      }
    }

    // Write cleaned content
    fs.writeFileSync(filePath, content);
    this.removedCount += removed;
    console.log(`  ✅ Removed ${removed} unused imports from onboarding-tour.js`);
  }
}

// Run the cleanup
const remover = new SafeDeadCodeRemover();
remover.removeUnusedImports();

console.log('\\n🔄 Next: Run build test to verify nothing broke');
console.log('npm run build');
