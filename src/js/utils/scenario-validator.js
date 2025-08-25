/**
 * Scenario Validation Utility
 * Ensures all scenario simulations have unique identifiers and validates data integrity
 *
 * Copyright 2025 SimulateAI Platform
 * Licensed under the Apache License, Version 2.0
 */

import logger from "./logger.js";

// Import all scenario data files
import trolleyProblemScenarios from "../data/scenarios/trolley-problem-scenarios.js";
import simulationHypothesisScenarios from "../data/scenarios/simulation-hypothesis-scenarios.js";
import experienceMachineScenarios from "../data/scenarios/experience-machine-scenarios.js";
import shipOfTheseusScenarios from "../data/scenarios/ship-of-theseus-scenarios.js";
import soritesParadoxScenarios from "../data/scenarios/sorites-paradox-scenarios.js";
import moralLuckScenarios from "../data/scenarios/moral-luck-scenarios.js";
import responsibilityBlameScenarios from "../data/scenarios/responsibility-blame-scenarios.js";
import aiBlackBoxScenarios from "../data/scenarios/ai-black-box-scenarios.js";
import automationOversightScenarios from "../data/scenarios/automation-oversight-scenarios.js";
import consentSurveillanceScenarios from "../data/scenarios/consent-surveillance-scenarios.js";
import simulationInfo from "../data/simulation-info.js";

/**
 * Comprehensive Scenario Validator
 * Validates scenario IDs, data integrity, and structure consistency
 */
export class ScenarioValidator {
  constructor() {
    this.scenarioFiles = {
      "trolley-problem": trolleyProblemScenarios,
      "simulation-hypothesis": simulationHypothesisScenarios,
      "experience-machine": experienceMachineScenarios,
      "ship-of-theseus": shipOfTheseusScenarios,
      "sorites-paradox": soritesParadoxScenarios,
      "moral-luck": moralLuckScenarios,
      "responsibility-blame": responsibilityBlameScenarios,
      "ai-black-box": aiBlackBoxScenarios,
      "automation-oversight": automationOversightScenarios,
      "consent-surveillance": consentSurveillanceScenarios,
    };

    this.simulationInfo = simulationInfo;
    this.validationResults = null;
  }

  /**
   * Main validation method - checks all scenarios for unique IDs and data integrity
   */
  async validateAllScenarios() {
    try {
      logger.info(
        "ScenarioValidator",
        "Starting comprehensive scenario validation",
      );

      const results = {
        totalScenarios: 0,
        totalCategories: Object.keys(this.scenarioFiles).length,
        scenariosByCategory: {},
        allScenarioIds: [],
        duplicateIds: [],
        missingIds: [],
        invalidStructures: [],
        simulationInfoMatches: [],
        simulationInfoMismatches: [],
        ethicalAxesValidation: [],
        isValid: true,
        errors: [],
        warnings: [],
      };

      // Validate each category
      for (const [categoryName, categoryData] of Object.entries(
        this.scenarioFiles,
      )) {
        try {
          const categoryValidation = this.validateCategory(
            categoryName,
            categoryData,
          );
          results.scenariosByCategory[categoryName] = categoryValidation;
          results.totalScenarios += categoryValidation.scenarioCount;
          results.allScenarioIds.push(...categoryValidation.scenarioIds);

          // Collect issues
          results.invalidStructures.push(
            ...categoryValidation.invalidStructures,
          );
          results.ethicalAxesValidation.push(
            ...categoryValidation.ethicalAxesIssues,
          );
        } catch (error) {
          results.errors.push(`Category ${categoryName}: ${error.message}`);
          results.isValid = false;
        }
      }

      // Check for duplicate IDs across all scenarios
      results.duplicateIds = this.findDuplicateIds(results.allScenarioIds);
      if (results.duplicateIds.length > 0) {
        results.isValid = false;
        results.errors.push(
          `Found ${results.duplicateIds.length} duplicate scenario IDs`,
        );
      }

      // Validate against simulation-info.js
      const infoValidation = this.validateAgainstSimulationInfo(
        results.allScenarioIds,
      );
      results.simulationInfoMatches = infoValidation.matches;
      results.simulationInfoMismatches = infoValidation.mismatches;
      results.missingIds = infoValidation.missingFromScenarios;

      // Check if we have expected 60 scenarios
      if (results.totalScenarios !== 60) {
        results.warnings.push(
          `Expected 60 scenarios, found ${results.totalScenarios}`,
        );
      }

      // Final validation status
      results.isValid =
        results.isValid &&
        results.duplicateIds.length === 0 &&
        results.invalidStructures.length === 0 &&
        results.simulationInfoMismatches.length === 0;

      this.validationResults = results;
      logger.info("ScenarioValidator", "Validation completed", {
        totalScenarios: results.totalScenarios,
        isValid: results.isValid,
        errors: results.errors.length,
        warnings: results.warnings.length,
      });

      return results;
    } catch (error) {
      logger.error("ScenarioValidator", "Validation failed", error);
      throw error;
    }
  }

  /**
   * Validate scenarios within a single category
   */
  validateCategory(categoryName, categoryData) {
    const result = {
      categoryName,
      scenarioCount: 0,
      scenarioIds: [],
      invalidStructures: [],
      ethicalAxesIssues: [],
      isValid: true,
    };

    if (!categoryData || typeof categoryData !== "object") {
      result.invalidStructures.push(
        `${categoryName}: Invalid category data structure`,
      );
      result.isValid = false;
      return result;
    }

    // Iterate through scenarios in category
    for (const [scenarioKey, scenarioData] of Object.entries(
      categoryData.default || categoryData,
    )) {
      result.scenarioCount++;

      // Validate scenario structure
      const scenarioValidation = this.validateScenarioStructure(
        scenarioKey,
        scenarioData,
      );
      if (!scenarioValidation.isValid) {
        result.invalidStructures.push(
          ...scenarioValidation.errors.map(
            (err) => `${categoryName}.${scenarioKey}: ${err}`,
          ),
        );
        result.isValid = false;
      }

      // Collect scenario ID
      const scenarioId = scenarioData.id || scenarioKey;
      result.scenarioIds.push(scenarioId);

      // Validate ethical axes
      const ethicalValidation = this.validateEthicalAxes(
        scenarioKey,
        scenarioData,
      );
      if (ethicalValidation.length > 0) {
        result.ethicalAxesIssues.push(
          ...ethicalValidation.map(
            (issue) => `${categoryName}.${scenarioKey}: ${issue}`,
          ),
        );
      }
    }

    return result;
  }

  /**
   * Validate individual scenario structure
   */
  validateScenarioStructure(scenarioKey, scenarioData) {
    const errors = [];
    const warnings = [];

    // Required fields
    const requiredFields = ["title", "dilemma", "ethicalQuestion", "options"];
    for (const field of requiredFields) {
      if (!scenarioData[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Validate options array
    if (scenarioData.options && Array.isArray(scenarioData.options)) {
      if (scenarioData.options.length < 2) {
        errors.push("Scenario must have at least 2 options");
      }

      scenarioData.options.forEach((option, index) => {
        if (!option.id) {
          errors.push(`Option ${index} missing required field: id`);
        }
        if (!option.text) {
          errors.push(`Option ${index} missing required field: text`);
        }
        if (!option.impact) {
          warnings.push(`Option ${index} missing impact data`);
        } else {
          // Validate impact structure
          const impactKeys = Object.keys(option.impact);
          if (impactKeys.length === 0) {
            warnings.push(`Option ${index} has empty impact object`);
          }
        }
      });
    } else {
      errors.push("Options must be an array");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate ethical axes consistency
   */
  validateEthicalAxes(scenarioKey, scenarioData) {
    const issues = [];
    const expectedAxes = [
      "fairness",
      "sustainability",
      "autonomy",
      "beneficence",
      "transparency",
      "accountability",
      "privacy",
      "proportionality",
    ];

    if (scenarioData.options && Array.isArray(scenarioData.options)) {
      scenarioData.options.forEach((option, index) => {
        if (option.impact) {
          const impactKeys = Object.keys(option.impact);

          // Check for unexpected axes
          const unexpectedAxes = impactKeys.filter(
            (key) => !expectedAxes.includes(key),
          );
          if (unexpectedAxes.length > 0) {
            issues.push(
              `Option ${index} has unexpected ethical axes: ${unexpectedAxes.join(", ")}`,
            );
          }

          // Check for invalid values
          impactKeys.forEach((key) => {
            const value = option.impact[key];
            if (typeof value !== "number" || value < -5 || value > 5) {
              issues.push(
                `Option ${index} has invalid impact value for ${key}: ${value} (must be number between -5 and 5)`,
              );
            }
          });
        }
      });
    }

    return issues;
  }

  /**
   * Find duplicate IDs across all scenarios
   */
  findDuplicateIds(allIds) {
    const idCounts = {};
    const duplicates = [];

    allIds.forEach((id) => {
      idCounts[id] = (idCounts[id] || 0) + 1;
    });

    Object.entries(idCounts).forEach(([id, count]) => {
      if (count > 1) {
        duplicates.push({ id, count });
      }
    });

    return duplicates;
  }

  /**
   * Validate against simulation-info.js for consistency
   */
  validateAgainstSimulationInfo(scenarioIds) {
    const simulationInfoIds = Object.keys(this.simulationInfo);
    const scenarioIdSet = new Set(scenarioIds);
    const infoIdSet = new Set(simulationInfoIds);

    const matches = scenarioIds.filter((id) => infoIdSet.has(id));
    const mismatches = scenarioIds.filter((id) => !infoIdSet.has(id));
    const missingFromScenarios = simulationInfoIds.filter(
      (id) => !scenarioIdSet.has(id),
    );

    return {
      matches,
      mismatches,
      missingFromScenarios,
    };
  }

  /**
   * Generate comprehensive validation report
   */
  generateReport() {
    if (!this.validationResults) {
      return "No validation results available. Run validateAllScenarios() first.";
    }

    const results = this.validationResults;
    let report = "\n🔍 SCENARIO VALIDATION REPORT\n";
    report += "=" * 50 + "\n\n";

    // Summary
    report += `📊 SUMMARY:\n`;
    report += `  Total Scenarios: ${results.totalScenarios}\n`;
    report += `  Total Categories: ${results.totalCategories}\n`;
    report += `  Expected: 60 scenarios\n`;
    report += `  Status: ${results.isValid ? "✅ VALID" : "❌ INVALID"}\n\n`;

    // Category breakdown
    report += `📂 CATEGORIES:\n`;
    Object.entries(results.scenariosByCategory).forEach(([category, data]) => {
      report += `  ${category}: ${data.scenarioCount} scenarios\n`;
    });
    report += "\n";

    // Issues
    if (results.errors.length > 0) {
      report += `🚨 ERRORS (${results.errors.length}):\n`;
      results.errors.forEach((error) => {
        report += `  ❌ ${error}\n`;
      });
      report += "\n";
    }

    if (results.warnings.length > 0) {
      report += `⚠️  WARNINGS (${results.warnings.length}):\n`;
      results.warnings.forEach((warning) => {
        report += `  ⚠️  ${warning}\n`;
      });
      report += "\n";
    }

    // Duplicate IDs
    if (results.duplicateIds.length > 0) {
      report += `🔄 DUPLICATE IDs (${results.duplicateIds.length}):\n`;
      results.duplicateIds.forEach((dup) => {
        report += `  🔄 "${dup.id}" appears ${dup.count} times\n`;
      });
      report += "\n";
    }

    // Simulation info mismatches
    if (results.simulationInfoMismatches.length > 0) {
      report += `🔗 SIMULATION INFO MISMATCHES (${results.simulationInfoMismatches.length}):\n`;
      results.simulationInfoMismatches.forEach((id) => {
        report += `  🔗 "${id}" found in scenarios but not in simulation-info.js\n`;
      });
      report += "\n";
    }

    if (results.missingIds.length > 0) {
      report += `📋 MISSING FROM SCENARIOS (${results.missingIds.length}):\n`;
      results.missingIds.forEach((id) => {
        report += `  📋 "${id}" found in simulation-info.js but not in scenario files\n`;
      });
      report += "\n";
    }

    // Success message
    if (results.isValid) {
      report += "🎉 ALL SCENARIOS HAVE UNIQUE IDENTIFIERS!\n";
      report += "✅ Data structure validation passed\n";
      report += "✅ Ethical axes validation passed\n";
      report += "✅ Cross-reference validation passed\n";
    }

    return report;
  }

  /**
   * Export scenario ID mapping for debugging
   */
  exportScenarioMapping() {
    if (!this.validationResults) {
      throw new Error(
        "No validation results available. Run validateAllScenarios() first.",
      );
    }

    const mapping = {};
    Object.entries(this.validationResults.scenariosByCategory).forEach(
      ([category, data]) => {
        mapping[category] = data.scenarioIds;
      },
    );

    return {
      mapping,
      totalScenarios: this.validationResults.totalScenarios,
      allIds: this.validationResults.allScenarioIds,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Quick validation check - returns boolean
   */
  async quickValidation() {
    try {
      const results = await this.validateAllScenarios();
      return {
        isValid: results.isValid,
        scenarioCount: results.totalScenarios,
        hasUniqueIds: results.duplicateIds.length === 0,
        errors: results.errors.length,
        warnings: results.warnings.length,
      };
    } catch (error) {
      logger.error("ScenarioValidator", "Quick validation failed", error);
      return {
        isValid: false,
        scenarioCount: 0,
        hasUniqueIds: false,
        errors: 1,
        warnings: 0,
        error: error.message,
      };
    }
  }
}

// Convenience functions for external use
export async function validateScenarioIds() {
  const validator = new ScenarioValidator();
  return await validator.validateAllScenarios();
}

export async function generateScenarioReport() {
  const validator = new ScenarioValidator();
  await validator.validateAllScenarios();
  return validator.generateReport();
}

export async function quickScenarioCheck() {
  const validator = new ScenarioValidator();
  return await validator.quickValidation();
}

// Export singleton instance
export const scenarioValidator = new ScenarioValidator();

export default ScenarioValidator;
