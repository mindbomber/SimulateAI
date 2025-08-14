/**
 * Scenario Validation Test Script
 * Run this to validate all 60 scenario simulations and check for unique IDs
 *
 * Usage: node validate-scenarios.js
 */

// Simple Node.js compatible version for testing
import fs from "fs";
import path from "path";

// Mock logger for Node.js environment
const logger = {
  info: (component, message, data) =>
    console.log(`[INFO] ${component}: ${message}`, data || ""),
  error: (component, message, error) =>
    console.error(`[ERROR] ${component}: ${message}`, error || ""),
  warn: (component, message, data) =>
    console.warn(`[WARN] ${component}: ${message}`, data || ""),
};

class ScenarioValidatorTest {
  constructor() {
    this.scenarioFiles = [];
    this.simulationInfo = null;
    this.basePath = process.cwd();
  }

  async loadScenarioFiles() {
    try {
      const scenarioDir = path.join(
        this.basePath,
        "src",
        "js",
        "data",
        "scenarios",
      );
      const files = fs.readdirSync(scenarioDir);

      console.log(`Found ${files.length} scenario files:`);
      files.forEach((file) => console.log(`  - ${file}`));

      return files.filter((file) => file.endsWith(".js"));
    } catch (error) {
      console.error("Error loading scenario files:", error.message);
      return [];
    }
  }

  async loadSimulationInfo() {
    try {
      const infoPath = path.join(
        this.basePath,
        "src",
        "js",
        "data",
        "simulation-info.js",
      );
      if (fs.existsSync(infoPath)) {
        console.log("✅ Found simulation-info.js");
        return true;
      } else {
        console.log("❌ simulation-info.js not found");
        return false;
      }
    } catch (error) {
      console.error("Error checking simulation-info.js:", error.message);
      return false;
    }
  }

  async countScenariosInFiles() {
    const scenarioFiles = await this.loadScenarioFiles();
    let totalCount = 0;
    const counts = {};

    for (const file of scenarioFiles) {
      try {
        const filePath = path.join(
          this.basePath,
          "src",
          "js",
          "data",
          "scenarios",
          file,
        );
        const content = fs.readFileSync(filePath, "utf8");

        // Count export default objects (scenarios)
        const exportMatches = content.match(/export\s+default\s+{[^}]*}/gs);
        const objectMatches = content.match(
          /{[\s\S]*?title:\s*['"][^'"]*['"][\s\S]*?}/g,
        );

        // More accurate: count scenario objects by looking for title fields
        const titleMatches = content.match(
          /['"][\w-]+['"]:\s*{[\s\S]*?title:/g,
        );
        const scenarioCount = titleMatches ? titleMatches.length : 0;

        counts[file] = scenarioCount;
        totalCount += scenarioCount;

        console.log(`${file}: ${scenarioCount} scenarios`);
      } catch (error) {
        console.error(`Error reading ${file}:`, error.message);
        counts[file] = 0;
      }
    }

    return { totalCount, counts };
  }

  async validateUniqueIds() {
    const scenarioFiles = await this.loadScenarioFiles();
    const allIds = [];
    const idsByFile = {};

    for (const file of scenarioFiles) {
      try {
        const filePath = path.join(
          this.basePath,
          "src",
          "js",
          "data",
          "scenarios",
          file,
        );
        const content = fs.readFileSync(filePath, "utf8");

        // Extract scenario IDs (object keys in export default)
        const idMatches = content.match(
          /['"]([a-z0-9-]+)['"]:\s*{[\s\S]*?title:/g,
        );
        const fileIds = idMatches
          ? idMatches
              .map((match) => {
                const idMatch = match.match(/['"]([a-z0-9-]+)['"]/);
                return idMatch ? idMatch[1] : null;
              })
              .filter(Boolean)
          : [];

        idsByFile[file] = fileIds;
        allIds.push(...fileIds);
      } catch (error) {
        console.error(`Error extracting IDs from ${file}:`, error.message);
        idsByFile[file] = [];
      }
    }

    // Check for duplicates
    const idCounts = {};
    allIds.forEach((id) => {
      idCounts[id] = (idCounts[id] || 0) + 1;
    });

    const duplicates = Object.entries(idCounts)
      .filter(([id, count]) => count > 1)
      .map(([id, count]) => ({ id, count }));

    return {
      totalIds: allIds.length,
      uniqueIds: Object.keys(idCounts).length,
      duplicates,
      idsByFile,
      allIds,
    };
  }

  async runFullValidation() {
    console.log("\n🔍 SCENARIO VALIDATION REPORT");
    console.log("=".repeat(50));

    // Check file structure
    console.log("\n📂 FILE STRUCTURE:");
    const scenarioFiles = await this.loadScenarioFiles();
    const hasSimulationInfo = await this.loadSimulationInfo();

    // Count scenarios
    console.log("\n📊 SCENARIO COUNT:");
    const { totalCount, counts } = await this.countScenariosInFiles();
    console.log(`Total scenarios found: ${totalCount}`);
    console.log(`Expected: 60 scenarios`);
    console.log(`Status: ${totalCount === 60 ? "✅ CORRECT" : "❌ INCORRECT"}`);

    // Validate unique IDs
    console.log("\n🔑 ID VALIDATION:");
    const idValidation = await this.validateUniqueIds();
    console.log(`Total IDs: ${idValidation.totalIds}`);
    console.log(`Unique IDs: ${idValidation.uniqueIds}`);
    console.log(`Duplicates: ${idValidation.duplicates.length}`);

    if (idValidation.duplicates.length > 0) {
      console.log("\n🚨 DUPLICATE IDs FOUND:");
      idValidation.duplicates.forEach((dup) => {
        console.log(`  ❌ "${dup.id}" appears ${dup.count} times`);
      });
    }

    // Summary
    console.log("\n📋 SUMMARY:");
    const allUnique = idValidation.duplicates.length === 0;
    const correctCount = totalCount === 60;
    const isValid = allUnique && correctCount && hasSimulationInfo;

    console.log(`Files found: ${scenarioFiles.length}/10 expected`);
    console.log(
      `Scenario count: ${correctCount ? "✅" : "❌"} ${totalCount}/60`,
    );
    console.log(
      `Unique IDs: ${allUnique ? "✅" : "❌"} ${idValidation.uniqueIds} unique`,
    );
    console.log(
      `Data structure: ${hasSimulationInfo ? "✅" : "❌"} simulation-info.js`,
    );
    console.log(`Overall status: ${isValid ? "✅ VALID" : "❌ INVALID"}`);

    // Detailed ID mapping
    if (process.argv.includes("--detailed")) {
      console.log("\n📄 DETAILED ID MAPPING:");
      Object.entries(idValidation.idsByFile).forEach(([file, ids]) => {
        console.log(`\n${file} (${ids.length} scenarios):`);
        ids.forEach((id) => console.log(`  - ${id}`));
      });
    }

    return {
      isValid,
      totalScenarios: totalCount,
      uniqueIds: idValidation.uniqueIds,
      duplicates: idValidation.duplicates,
      files: scenarioFiles.length,
    };
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new ScenarioValidatorTest();
  validator
    .runFullValidation()
    .then((results) => {
      process.exit(results.isValid ? 0 : 1);
    })
    .catch((error) => {
      console.error("Validation failed:", error);
      process.exit(1);
    });
}

export default ScenarioValidatorTest;
